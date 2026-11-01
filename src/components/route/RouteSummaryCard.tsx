import { formatClock, formatKm, formatMinutes, formatMeters } from '@/lib/format';
import type { RouteSummary } from '@/lib/routeCalculator';

interface RouteSummaryCardProps {
  summary: RouteSummary;
}

export default function RouteSummaryCard({ summary }: RouteSummaryCardProps) {
  const arrival = formatClock(new Date(Date.now() + summary.totalMinutes * 60000));
  const rows: { label: string; value: string }[] = [
    { label: 'Lejtés ideje', value: formatMinutes(summary.descentMinutes) },
    { label: 'Felvonózás', value: formatMinutes(summary.liftRideMinutes) },
    { label: 'Várakozás a felvonónál', value: formatMinutes(summary.liftQueueMinutes) },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">Összegzés</h3>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
          Ha most indulsz: {arrival}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-600">Távolság</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{formatKm(summary.distanceKm)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-600">Szintkülönbség</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{formatMeters(summary.verticalDropM)}</p>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-slate-100">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between py-2 text-sm">
            <span className="text-slate-700">{row.label}</span>
            <span className="font-semibold text-slate-900">{row.value}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-xl bg-sky-50 px-4 py-3 ring-1 ring-sky-200">
        <span className="font-semibold text-sky-900">Összesen</span>
        <span className="text-lg font-bold text-slate-900">{formatMinutes(summary.totalMinutes)}</span>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">
        A távolság, a szintkülönbség és a felvonók menetideje becsült érték, amíg a pontos pályaadatok nincsenek megadva.
      </p>
    </div>
  );
}
