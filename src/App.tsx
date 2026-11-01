import { useCallback, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import MemberSelect from '@/components/welcome/MemberSelect';
import PasswordGate from '@/components/welcome/PasswordGate';
import { AppProvider } from '@/context/AppContext';
import { findMember, type FamilyMember } from '@/data/family';

const SESSION_KEY = 'folgari-member';

type LoginStage = 'select' | 'password';

function readStoredMember(): FamilyMember | null {
  return findMember(sessionStorage.getItem(SESSION_KEY)) ?? null;
}

export default function App() {
  const [member, setMember] = useState<FamilyMember | null>(readStoredMember);
  const [stage, setStage] = useState<LoginStage>('select');
  const [pending, setPending] = useState<FamilyMember | null>(null);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setMember(null);
    setPending(null);
    setStage('select');
  }, []);

  if (member) {
    return (
      <AppProvider member={member} onLogout={handleLogout}>
        <AppShell />
      </AppProvider>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-white text-slate-900">
      <div className="flex w-full max-w-[480px] flex-col bg-white">
        {stage === 'select' && (
          <MemberSelect
            onSelect={(selected) => {
              setPending(selected);
              setStage('password');
            }}
          />
        )}

        {stage === 'password' && pending && (
          <PasswordGate
            member={pending}
            onSuccess={() => {
              sessionStorage.setItem(SESSION_KEY, pending.id);
              setMember(pending);
            }}
            onBack={() => {
              setPending(null);
              setStage('select');
            }}
          />
        )}
      </div>
    </div>
  );
}
