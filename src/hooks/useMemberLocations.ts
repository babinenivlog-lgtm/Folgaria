import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MemberLocation } from '@/types/database';

export type LocationsStatus = 'loading' | 'ready' | 'error';

export function useMemberLocations() {
  const [locations, setLocations] = useState<MemberLocation[]>([]);
  const [status, setStatus] = useState<LocationsStatus>('loading');

  useEffect(() => {
    let active = true;

    const upsertLocation = (incoming: MemberLocation) => {
      setLocations((current) => [
        ...current.filter((item) => item.member_id !== incoming.member_id),
        incoming,
      ]);
    };

    supabase
      .from('member_locations')
      .select('member_id, lat, lng, speed_kmh, max_speed_kmh, distance_m, updated_at')
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !Array.isArray(data)) {
          setStatus('error');
          return;
        }
        setLocations(data as MemberLocation[]);
        setStatus('ready');
      });

    const channel = supabase
      .channel('member-locations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'member_locations' },
        (payload) => {
          if (payload.eventType === 'DELETE') return;
          upsertLocation(payload.new as MemberLocation);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { locations, status };
}
