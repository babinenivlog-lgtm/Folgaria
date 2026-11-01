import { useState, type FormEvent } from 'react';
import { ChevronLeft, Lock } from 'lucide-react';
import { FAMILY_PASSWORD, type FamilyMember } from '@/data/family';
import MemberBadge from '@/components/ui/MemberBadge';

interface PasswordGateProps {
  member: FamilyMember;
  onSuccess: () => void;
  onBack: () => void;
}

export default function PasswordGate({ member, onSuccess, onBack }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === FAMILY_PASSWORD) {
      onSuccess();
      return;
    }
    setError('Hibás jelszó, próbáld újra.');
    setShake(true);
    setPassword('');
    window.setTimeout(() => setShake(false), 400);
  };

  return (
    <div className="flex min-h-screen flex-col gap-8 px-6 py-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1 rounded-lg py-2 pr-3 text-sm font-medium text-slate-700 transition hover:text-slate-900"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Másik profil
      </button>

      <div className="space-y-4">
        <MemberBadge member={member} />
        <h2 className="text-3xl font-bold text-slate-900">Add meg a jelszót</h2>
        <p className="text-sm text-slate-600">A belépéshez a családi jelszó szükséges.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Jelszó</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              className={`h-14 w-full rounded-2xl border bg-white pl-12 pr-4 text-lg tracking-[0.3em] text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 ${
                error ? 'border-rose-600 focus:ring-rose-500/30' : 'border-slate-300 focus:border-sky-600 focus:ring-sky-600/20'
              } ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
              placeholder="••"
            />
          </div>
          {error && (
            <span role="alert" className="text-sm font-medium text-rose-700">
              {error}
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={password.length === 0}
          className="flex h-14 items-center justify-center rounded-2xl bg-slate-900 text-base font-semibold text-white transition duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          Belépés
        </button>
      </form>
    </div>
  );
}
