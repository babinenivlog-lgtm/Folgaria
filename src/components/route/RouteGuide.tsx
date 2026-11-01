import { Trash2 } from 'lucide-react';
import { DIFFICULTY_META } from '@/data/skiArea';
import { describeStep, type RouteStep } from '@/lib/routeCalculator';

interface RouteGuideProps {
  steps: RouteStep[];
  onRemoveFrom: (index: number) => void;
}

export default function RouteGuide({ steps, onRemoveFrom }: RouteGuideProps) {
  if (steps.length === 0) return null;

  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, index) => {
        const { action, target } = describeStep(step);
        return (
          <li
            key={`${step.id}-${index}`}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {index + 1}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-sky-700">{index + 1}. lépés</span>
              <span className="text-sm text-slate-600">{action}</span>
              <span className="break-words text-base font-bold leading-snug text-slate-900">{target}</span>
              {step.kind === 'piste' && (
                <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: DIFFICULTY_META[step.difficulty].color }}
                    aria-hidden="true"
                  />
                  {DIFFICULTY_META[step.difficulty].label}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => onRemoveFrom(index)}
              aria-label={`${index + 1}. lépés és a utána következők eltávolítása`}
              title="Eltávolítás innentől"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
