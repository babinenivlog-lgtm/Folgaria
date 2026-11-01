import { useState } from 'react';
import { Hand, LogOut, Mountain } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { SectorId } from '@/data/skiArea';
import SubNav, { type AppTab } from '@/components/layout/SubNav';
import Dashboard from '@/components/dashboard/Dashboard';
import RoutePlanner from '@/components/route/RoutePlanner';
import FamilyChat from '@/components/chat/FamilyChat';
import GpsView from '@/components/map/GpsView';
import MemberBadge from '@/components/ui/MemberBadge';
import { useLocationTracking } from '@/hooks/useLocationTracking';

export default function AppShell() {
  const { member, logout, gloveMode, toggleGloveMode } = useApp();
  const [tab, setTab] = useState<AppTab>('home');
  const [sector, setSector] = useState<SectorId>('folgaria');
  const tracking = useLocationTracking(member.id);

  const openPlannerFor = (next: SectorId) => {
    setSector(next);
    setTab('route');
  };

  return (
    <div className="flex min-h-screen justify-center bg-white">
      <div
        className={`relative flex min-h-screen w-full max-w-[480px] flex-col bg-white text-slate-900 shadow-xl shadow-slate-900/10 ${
          gloveMode ? '[&_button]:min-h-14 [&_button]:text-lg [&_input]:min-h-14 [&_input]:text-lg [&_select]:min-h-14 [&_select]:text-lg' : ''
        }`}
      >
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-2 px-3 min-[400px]:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 ring-1 ring-sky-200">
                <Mountain className="h-4 w-4 text-sky-700" aria-hidden="true" />
              </div>
              <span className="truncate text-base font-bold tracking-tight text-slate-900">FolgariAPP</span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <MemberBadge member={member} size="sm" />
              <button
                type="button"
                onClick={toggleGloveMode}
                aria-pressed={gloveMode}
                aria-label="Kesztyű mód"
                title="Kesztyű mód"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                  gloveMode
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Hand className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={logout}
                title="Kijelentkezés"
                aria-label="Kijelentkezés"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <SubNav active={tab} onChange={setTab} />
        </header>

        <main className="flex flex-1 flex-col">
          {tab === 'home' && <Dashboard onNavigate={setTab} onSelectSector={openPlannerFor} />}
          {tab === 'route' && (
            <RoutePlanner sector={sector} onSectorChange={setSector} onSent={() => setTab('chat')} />
          )}
          {tab === 'chat' && <FamilyChat />}
          {tab === 'gps' && <GpsView tracking={tracking} />}
        </main>
      </div>
    </div>
  );
}
