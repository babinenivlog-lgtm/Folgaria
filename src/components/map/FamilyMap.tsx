import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { findMember } from '@/data/family';
import type { MemberLocation } from '@/types/database';

const MAP_CENTER: L.LatLngTuple = [45.906, 11.21];
const MAP_ZOOM = 13;

interface FamilyMapProps {
  locations: MemberLocation[];
}

function createMemberIcon(color: string, emoji: string) {
  return L.divIcon({
    className: 'folgari-member-marker',
    html: `<div style="background:${color}" class="flex h-9 w-9 items-center justify-center rounded-full text-lg shadow-lg shadow-slate-900/30 ring-2 ring-white">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export default function FamilyMap({ locations }: FamilyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, { zoomControl: false }).setView(MAP_CENTER, MAP_ZOOM);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;
    const markers = markersRef.current;
    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      window.clearTimeout(resizeTimer);
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;
    const seen = new Set<string>();

    locations.forEach((location) => {
      const member = findMember(location.member_id);
      if (!member) return;
      seen.add(member.id);
      const latLng = L.latLng(location.lat, location.lng);
      const existing = markers.get(member.id);
      if (existing) {
        existing.setLatLng(latLng);
        return;
      }
      const marker = L.marker(latLng, { icon: createMemberIcon(member.color, member.emoji), title: member.name })
        .bindTooltip(member.name, { permanent: true, direction: 'bottom', offset: [0, 18], className: 'folgari-tooltip' })
        .addTo(map);
      markers.set(member.id, marker);
    });

    markers.forEach((marker, memberId) => {
      if (seen.has(memberId)) return;
      marker.remove();
      markers.delete(memberId);
    });
  }, [locations]);

  return <div ref={containerRef} className="h-[340px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm" />;
}
