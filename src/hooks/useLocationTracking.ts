import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { distanceMeters } from '@/lib/geo';
import type { MemberId } from '@/data/family';

export type TrackingStatus = 'searching' | 'active' | 'denied' | 'unsupported' | 'unavailable';

export interface TrackingStats {
  distanceM: number;
  maxSpeedKmh: number;
  speedKmh: number;
}

const SYNC_INTERVAL_MS = 10000;
const MAX_ACCURACY_M = 50;
const MAX_SANE_SPEED_KMH = 120;

interface Snapshot {
  lat: number;
  lng: number;
  speedKmh: number;
  maxSpeedKmh: number;
  distanceM: number;
}

export function useLocationTracking(memberId: MemberId) {
  const [status, setStatus] = useState<TrackingStatus>('searching');
  const [stats, setStats] = useState<TrackingStats>({ distanceM: 0, maxSpeedKmh: 0, speedKmh: 0 });
  const [syncFailed, setSyncFailed] = useState(false);
  const totalsRef = useRef({ distanceM: 0, maxSpeedKmh: 0 });
  const lastFixRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const snapshotRef = useRef<Snapshot | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy, speed } = position.coords;
        const time = position.timestamp;
        setStatus('active');
        if (accuracy > MAX_ACCURACY_M) return;

        const previous = lastFixRef.current;
        let speedKmh = speed !== null && speed >= 0 ? speed * 3.6 : 0;

        if (previous && time > previous.time) {
          const stepM = distanceMeters(previous.lat, previous.lng, lat, lng);
          totalsRef.current.distanceM += stepM;
          if (speed === null) {
            speedKmh = (stepM / ((time - previous.time) / 1000)) * 3.6;
          }
        }

        speedKmh = Math.min(speedKmh, MAX_SANE_SPEED_KMH);
        totalsRef.current.maxSpeedKmh = Math.max(totalsRef.current.maxSpeedKmh, speedKmh);
        lastFixRef.current = { lat, lng, time };

        const { distanceM, maxSpeedKmh } = totalsRef.current;
        snapshotRef.current = { lat, lng, speedKmh, maxSpeedKmh, distanceM };
        setStats({ distanceM, maxSpeedKmh, speedKmh });
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const sync = async () => {
      const snapshot = snapshotRef.current;
      if (!snapshot) return;
      const { error } = await supabase.from('member_locations').upsert(
        {
          member_id: memberId,
          lat: snapshot.lat,
          lng: snapshot.lng,
          speed_kmh: snapshot.speedKmh,
          max_speed_kmh: snapshot.maxSpeedKmh,
          distance_m: snapshot.distanceM,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'member_id' },
      );
      setSyncFailed(Boolean(error));
    };

    const intervalId = window.setInterval(sync, SYNC_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [memberId]);

  return { status, stats, syncFailed };
}
