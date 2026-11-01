import { Home, MessagesSquare, Radar, Route } from 'lucide-react';

export type AppTab = 'home' | 'route' | 'chat' | 'gps';

const TABS: { id: AppTab; label: string; fullLabel: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Főmenü', fullLabel: 'Főmenü', icon: Home },
  { id: 'route', label: 'Tervező', fullLabel: 'Sítervező & Térkép', icon: Route },
  { id: 'chat', label: 'Chat', fullLabel: 'Családi Chat', icon: MessagesSquare },
  { id: 'gps', label: 'GPS', fullLabel: 'GPS & Statisztika', icon: Radar },
];

interface SubNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

export default function SubNav({ active, onChange }: SubNavProps) {
  return (
    <nav aria-label="Almenü" className="border-t border-slate-200 bg-white px-2">
      <ul className="grid grid-cols-4 gap-1 py-2">
        {TABS.map(({ id, label, fullLabel, icon: Icon }) => {
          const isActive = id === active;
          return (
            <li key={id} className="min-w-0">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-label={fullLabel}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition duration-200 min-[400px]:text-xs ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-sky-300' : 'text-sky-700'}`} aria-hidden="true" />
                <span className="w-full truncate text-center">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
