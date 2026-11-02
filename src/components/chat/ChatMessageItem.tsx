import type { ReactNode } from 'react';
import { CableCar, Clock3, Flag, Gauge, Route } from 'lucide-react';
import { findMember } from '@/data/family';
import type { Difficulty } from '@/data/skiArea';
import { formatClock, formatKm, formatMinutes } from '@/lib/format';
import type { RouteStep } from '@/lib/routeCalculator';
import MemberBadge from '@/components/ui/MemberBadge';
import type { ChatMessage } from '@/types/database';

const PISTE_COLORS: Record<Difficulty, { bg: string; text: string }> = {
  green: { bg: '#22c55e', text: '#052e16' },
  blue: { bg: '#2563eb', text: '#ffffff' },
  red: { bg: '#dc2626', text: '#ffffff' },
  black: { bg: '#1e293b', text: '#ffffff' },
};

const LIFT_COLOR = { bg: '#fef3c7', text: '#92400e' };
const FALLBACK_PISTE_COLOR = { bg: '#64748b', text: '#ffffff' };

interface ChatMessageItemProps {
  message: ChatMessage;
}

export default function ChatMessageItem({ message }: ChatMessageItemProps) {
  const member = findMember(message.member_id);
  const time = formatClock(new Date(message.created_at));
  const accent = member?.color ?? '#94a3b8';

  return (
    <article
      className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sky-100 transition hover:shadow-md"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <header className="flex items-center justify-between gap-2">
        {member ? <MemberBadge member={member} size="sm" /> : <span className="text-xs text-slate-500">Ismeretlen</span>}
        <time dateTime={message.created_at} className="text-xs tabular-nums text-slate-500">
          {time}
        </time>
      </header>
      {message.body && <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">{message.body}</p>}
      {message.route && <RouteCard route={message.route} accent={accent} />}
    </article>
  );
}

interface RouteCardProps {
  route: NonNullable<ChatMessage['route']>;
  accent: string;
}

function RouteCard({ route, accent }: RouteCardProps) {
  const arrival = formatClock(new Date(route.arrivalAt));
  return (
    <div className="mt-1 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-sky-50 to-white p-3 ring-1 ring-sky-100">
      <ol className="flex flex-wrap items-center gap-1.5">
        {route.steps.map((step, index) => (
          <li key={`${step.kind}-${step.id}-${index}`} className="flex items-center gap-1.5">
            <RouteStepChip step={step} />
            {index < route.steps.length - 1 && <span aria-hidden className="text-xs text-slate-300">›</span>}
          </li>
        ))}
      </ol>
      <dl className="flex flex-wrap gap-2 text-xs">
        <Stat icon={<Route className="h-3.5 w-3.5" />} label="Táv" value={formatKm(route.distanceKm)} accent={accent} />
        <Stat icon={<Clock3 className="h-3.5 w-3.5" />} label="Idő" value={formatMinutes(route.totalMinutes)} accent={accent} />
        <Stat icon={<Flag className="h-3.5 w-3.5" />} label="Érkezés" value={arrival} accent={accent} />
        <Stat icon={<Gauge className="h-3.5 w-3.5" />} label="Szint" value={`${route.verticalDropM} m`} accent={accent} />
      </dl>
    </div>
  );
}

interface RouteStepChipProps {
  step: RouteStep;
}

function RouteStepChip({ step }: RouteStepChipProps) {
  if (step.kind === 'lift') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ backgroundColor: LIFT_COLOR.bg, color: LIFT_COLOR.text }}
      >
        <CableCar className="h-3.5 w-3.5" aria-hidden />
        {step.label}
      </span>
    );
  }

  const color = PISTE_COLORS[step.difficulty] ?? FALLBACK_PISTE_COLOR;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {step.label}
    </span>
  );
}

interface StatProps {
  icon: ReactNode;
  label: string;
  value: string;
  accent: string;
}

function Stat({ icon, label, value, accent }: StatProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
      <span style={{ color: accent }}>{icon}</span>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
