import { CalendarRange, ChevronRight, MessagesSquare, Radar } from 'lucide-react';
import type { AppTab } from '@/components/layout/SubNav';
import SectorCards from '@/components/route/SectorCards';
import { useApp } from '@/context/AppContext';
import { FAMILY_MEMBERS } from '@/data/family';
import type { SectorId } from '@/data/skiArea';
import { useMemberLocations } from '@/hooks/useMemberLocations';
import { formatRelativeTime } from '@/lib/format';
import MemberBadge from '@/components/ui/MemberBadge';

const ACTIVE_WINDOW_MS = 30 * 60 * 1000;

interface DashboardProps {
  onNavigate: (tab: AppTab) => void;
  onSelectSector: (sector: SectorId) => void;
}

const SHORTCUTS: { tab: AppTab; title: string; description: string; icon: typeof CalendarRange }[] = [
  {
    tab: 'route',
    title: 'Sítervező & Térkép',
    description: 'Útvonal összeállítása lépésről lépésre',
    icon: CalendarRange,
  },
  {
    tab: 'chat',
    title: 'Családi Chat',
    description: 'Üzenetek és érkezési idők a családnak',
    icon: MessagesSquare,
  },
  {
    tab: 'gps',
    title: 'GPS & Statisztika',
    description: 'Élő helyzet a térképen és a teljesítmények',
    icon: Radar,
  },
];

export default function Dashboard({ onNavigate, onSelectSector }: DashboardProps) {
  const { member } = useApp();
  const { locations, status } = useMemberLocations();

  const now = Date.now();
  const activeIds = new Set(
    locations
      .filter((location) => now - new Date(location.updated_at).getTime() < ACTIVE_WINDOW_MS)
      .map((location) => location.member_id),
  );
  const activeMembers = FAMILY_MEMBERS.filter((item) => activeIds.has(item.id));

  return (
    <div className="flex flex-col gap-6 p-4 pb-10">
      <section className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
        <p className="text-sm text-slate-600">Üdv újra,</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold text-slate-900">Szia, {member.name}!</h1>
          <span className="text-4xl" aria-hidden="true">
            {member.emoji}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          Készen állsz a következő lejtőre? Válaszd ki a területet, tervezz útvonalat, és küldd el a családnak.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600">Terület</h2>
        <SectorCards onSelect={onSelectSector} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600">Gyors elérés</h2>
        {SHORTCUTS.map(({ tab, title, description, icon: Icon }) => (
          <button
            key={tab}
            type="button"
            onClick={() => onNavigate(tab)}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:border-sky-300 hover:shadow-md active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-200">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-slate-900">{title}</span>
              <span className="block text-sm text-slate-600">{description}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-sky-700" aria-hidden="true" />
          </button>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600">Most a pályán</h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {status === 'loading' && <p className="text-sm text-slate-600">Helyzetek betöltése...</p>}
          {status === 'error' && (
            <p className="text-sm font-medium text-rose-700">Nem sikerült betölteni a családtagok helyzetét.</p>
          )}
          {status === 'ready' && activeMembers.length === 0 && (
            <p className="text-sm text-slate-600">Jelenleg senki nem jelentkezett be a pályán.</p>
          )}
          {status === 'ready' && activeMembers.length > 0 && (
            <ul className="flex flex-col gap-3">
              {activeMembers.map((item) => {
                const location = locations.find((entry) => entry.member_id === item.id);
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <MemberBadge member={item} />
                    <span className="text-xs text-slate-600">
                      {location ? formatRelativeTime(location.updated_at) : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
