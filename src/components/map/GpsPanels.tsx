import { AlertTriangle, CheckCircle2, Loader2, MapPinOff } from 'lucide-react';
import { FAMILY_MEMBERS } from '@/data/family';
import type { useLocationTracking } from '@/hooks/useLocationTracking';
import { formatKm, formatRelativeTime } from '@/lib/format';
import MemberBadge from '@/components/ui/MemberBadge';
import type { MemberLocation } from '@/types/database';

type Tracking = ReturnType<typeof useLocationTracking>;

const TRACKING_MESSAGES: Record<Tracking['status'], { text: string; tone: 'ok' | 'pending' | 'error' }> = {
  searching: { text: 'Helymeghatározás folyamatban...', tone: 'pending' },
  active: { text: 'Aktív: a helyzeted megosztva a családdal.', tone: 'ok' },
  denied: { text: 'A helymeghatározás tiltva van. Engedélyezd a böngészőben a helyzet megosztásához.', tone: 'error' },
  unsupported: { text: 'Ez az eszköz nem támogatja a helymeghatározást.', tone: 'error' },
  unavailable: { text: 'Most nem érhető el a GPS jel. Próbáld meg szabad területen.', tone: 'error' },
};

const TONE_CLASS = {
  ok: 'text-emerald-800',
  pending: 'text-sky-800',
  error: 'text-rose-800',
} as const;

interface TrackingStatusProps {
  tracking: Tracking;
}

export function TrackingStatus({ tracking }: TrackingStatusProps) {
  const { status, stats, syncFailed } = tracking;
  const message = TRACKING_MESSAGES[status];
  const Icon = message.tone === 'ok' ? CheckCircle2 : message.tone === 'pending' ? Loader2 : MapPinOff;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`flex items-start gap-2 text-sm font-semibold ${TONE_CLASS[message.tone]}`}>
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${message.tone === 'pending' ? 'animate-spin' : ''}`} aria-hidden="true" />
        <span>{message.text}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Sebesség" value={`${Math.round(stats.speedKmh)} km/h`} />
        <Stat label="Megtett táv" value={formatKm(stats.distanceM / 1000)} />
        <Stat label="Csúcssebesség" value={`${Math.round(stats.maxSpeedKmh)} km/h`} />
      </div>

      {syncFailed && (
        <p className="flex items-center gap-2 text-xs font-medium text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          A helyzet szinkronizálása most nem sikerült, újrapróbáljuk.
        </p>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-600">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

interface MemberStatsProps {
  locations: MemberLocation[];
  status: 'loading' | 'ready' | 'error';
}

export function MemberStats({ locations, status }: MemberStatsProps) {
  if (status === 'loading') {
    return <p className="text-sm text-slate-600">Statisztikák betöltése...</p>;
  }
  if (status === 'error') {
    return <p className="text-sm font-medium text-rose-700">Nem sikerült betölteni a statisztikákat.</p>;
  }

  const totalDistanceM = locations.reduce((sum, item) => sum + item.distance_m, 0);
  const topSpeed = locations.reduce((max, item) => Math.max(max, item.max_speed_kmh), 0);

  return (
    <section className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Családi össz. táv" value={formatKm(totalDistanceM / 1000)} />
        <Stat label="Legnagyobb sebesség" value={`${Math.round(topSpeed)} km/h`} />
      </div>

      <ul className="flex flex-col gap-2">
        {FAMILY_MEMBERS.map((member) => {
          const location = locations.find((item) => item.member_id === member.id);
          return (
            <li key={member.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <MemberBadge member={member} />
                <span className="text-xs text-slate-600">
                  {location ? formatRelativeTime(location.updated_at) : 'Még nincs adat'}
                </span>
              </div>
              {location && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Táv" value={formatKm(location.distance_m / 1000)} />
                  <MiniStat label="Max" value={`${Math.round(location.max_speed_kmh)} km/h`} />
                  <MiniStat label="Most" value={`${Math.round(location.speed_kmh)} km/h`} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-600">{label}</p>
      <p className="text-xs font-semibold text-slate-900">{value}</p>
    </div>
  );
}
