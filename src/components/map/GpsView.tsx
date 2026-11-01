import { useMemberLocations } from '@/hooks/useMemberLocations';
import type { useLocationTracking } from '@/hooks/useLocationTracking';
import FamilyMap from '@/components/map/FamilyMap';
import { MemberStats, TrackingStatus } from '@/components/map/GpsPanels';

interface GpsViewProps {
  tracking: ReturnType<typeof useLocationTracking>;
}

export default function GpsView({ tracking }: GpsViewProps) {
  const { locations, status } = useMemberLocations();

  return (
    <div className="flex flex-col gap-6 p-4 pb-10">
      <section className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-900">GPS & Statisztika</h2>
        <p className="text-sm text-slate-600">A családtagok élő helyzete a pályatérképen.</p>
      </section>

      {status === 'error' ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
          Nem sikerült betölteni a térképes helyzeteket. Frissíts rá az oldalra.
        </p>
      ) : (
        <FamilyMap locations={locations} />
      )}

      <TrackingStatus tracking={tracking} />

      <MemberStats locations={locations} status={status} />
    </div>
  );
}
