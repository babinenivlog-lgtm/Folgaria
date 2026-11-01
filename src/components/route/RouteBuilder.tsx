import { useState } from 'react';
import { AlertTriangle, Plus, Send } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Difficulty, SkiNetwork } from '@/data/skiArea';
import { sendChatMessage } from '@/hooks/useChatMessages';
import {
  LIFT_WAIT_LABELS,
  SKILL_LABELS,
  calculateRouteSummary,
  describeStep,
  appendRouteOption,
  getNextPisteOptions,
  getStartRun,
  isRoutablePiste,
  toPisteStep,
  type LiftWait,
  type RouteStep,
  type SkillLevel,
} from '@/lib/routeCalculator';
import { formatClock, formatMinutes } from '@/lib/format';
import PisteSelect, { type PisteOption } from '@/components/route/PisteSelect';
import RouteGuide from '@/components/route/RouteGuide';
import RouteSummaryCard from '@/components/route/RouteSummaryCard';

interface RouteBuilderProps {
  network: SkiNetwork;
  onSent: () => void;
}

const SKILL_OPTIONS: SkillLevel[] = ['beginner', 'intermediate', 'advanced'];
const WAIT_OPTIONS: LiftWait[] = ['low', 'medium', 'high'];
const WAIT_SHORT: Record<LiftWait, string> = { low: 'Alacsony', medium: 'Közepes', high: 'Magas' };

const isDemandingPiste = (difficulty: Difficulty | undefined) => difficulty === 'red' || difficulty === 'black';

const segmentClass = (active: boolean) =>
  `h-10 rounded-lg px-1 text-xs font-semibold transition sm:text-sm ${
    active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-white hover:text-slate-900'
  }`;

export default function RouteBuilder({ network, onSent }: RouteBuilderProps) {
  const { member } = useApp();
  const [skill, setSkill] = useState<SkillLevel>('intermediate');
  const [wait, setWait] = useState<LiftWait>('medium');
  const [steps, setSteps] = useState<RouteStep[]>([]);
  const [choice, setChoice] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const nextOptions = getNextPisteOptions(network, steps);
  const selectedOption = nextOptions.find((option) => option.piste.id === choice);
  const lastStep = steps[steps.length - 1];
  const openPisteId = lastStep?.kind === 'piste' ? lastStep.id : undefined;
  const currentNode = lastStep ? network.nodes.find((node) => node.id === lastStep.to) : undefined;
  const currentJunction = currentNode?.kind === 'junction' ? currentNode : undefined;
  const junctionPistes = currentJunction
    ? network.pistes.filter((piste) => currentJunction.pisteIds.includes(piste.id)).map((piste) => piste.label)
    : [];
  const chainHasDemandingPiste = steps.some((step) => step.kind === 'piste' && isDemandingPiste(step.difficulty));
  const showBeginnerWarning =
    skill === 'beginner' && (isDemandingPiste(selectedOption?.piste.difficulty) || chainHasDemandingPiste);

  const summary = calculateRouteSummary(steps, skill, wait);

  const handleStartChange = (pisteId: string) => {
    const piste = network.pistes.find((item) => item.id === pisteId);
    const run = piste ? getStartRun(network, piste) : null;
    setSteps(piste && run ? [toPisteStep(piste, run.fromNodeId, run.toNodeId)] : []);
    setChoice('');
    setSendError(null);
  };

  const handleAddStep = () => {
    const option = nextOptions.find((item) => item.piste.id === choice);
    if (!option) return;
    setSteps((current) => appendRouteOption(current, option));
    setChoice('');
    setSendError(null);
  };

  const handleRemoveFrom = (index: number) => {
    setSteps((current) => current.slice(0, index));
    setSendError(null);
  };

  const handleSend = async () => {
    if (steps.length === 0 || sending) return;
    setSending(true);
    setSendError(null);

    const arrival = new Date(Date.now() + summary.totalMinutes * 60000);
    const routeText = steps
      .map((step, index) => {
        const { action, target } = describeStep(step);
        return `${index + 1}. ${action}: ${target}`;
      })
      .join(' → ');
    const body = `Útvonal (${SKILL_LABELS[skill]}): ${routeText}. Várható érkezési idő: ${formatClock(arrival)} (${formatMinutes(summary.totalMinutes)})`;

    const sent = await sendChatMessage({
      memberId: member.id,
      body,
      route: { ...summary, arrivalAt: arrival.toISOString(), skill, wait },
    });

    setSending(false);
    if (!sent) {
      setSendError('Az útvonal küldése nem sikerült. Próbáld újra.');
      return;
    }
    onSent();
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <PisteSelect
          label="Kezdő pálya"
          emptyLabel="Válassz kezdő pályát"
          value={steps[0]?.id ?? ''}
          onChange={handleStartChange}
          options={network.pistes.map((piste) => {
            const routable = isRoutablePiste(piste);
            return {
              id: piste.id,
              name: piste.name,
              difficulty: piste.difficulty,
              disabled: !routable,
              note: routable ? undefined : '(nincs ismert kapcsolat)',
            };
          })}
        />
      </section>

      {showBeginnerWarning && (
        <div role="alert" className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" />
          <p className="text-sm font-medium leading-relaxed text-rose-900">
            Figyelem! Kezdő szinten a piros (haladó) és fekete (profi) pályák túl nehezek lehetnek. Válassz zöld vagy kék pályát, vagy fokozottan óvatosan haladj.
          </p>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Útmutató</h3>

        {steps.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-700">
            Válassz kezdő pályát, hogy elkezdhesd az útvonal összeállítását.
          </p>
        )}

        <RouteGuide steps={steps} onRemoveFrom={handleRemoveFrom} />

        {currentJunction && (
          <div className="flex flex-col gap-2 rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">Elágazás: {currentJunction.name}</span>
            <ul className="flex flex-col gap-1 text-sm text-slate-900">
              {junctionPistes.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>
        )}

        {steps.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <PisteSelect
              label="Következő lépés"
              emptyLabel="Válassz sípályát"
              value={choice}
              onChange={setChoice}
              options={nextOptions.map<PisteOption>((option) => ({
                id: option.piste.id,
                name: option.piste.name,
                difficulty: option.piste.difficulty,
                note: option.piste.id === openPisteId ? '(folytatás)' : undefined,
              }))}
            />

            {nextOptions.length === 0 && (
              <p className="text-xs font-medium text-amber-800">
                Innen nincs további út. Töröld az utolsó lépést, vagy válassz másik kiindulópontot.
              </p>
            )}

            <button
              type="button"
              onClick={handleAddStep}
              disabled={!choice}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Hozzáadás az útmutatóhoz
            </button>
          </div>
        )}
      </section>

      {steps.length > 0 && (
        <>
          <RouteSummaryCard summary={summary} />

          {sendError && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {sendError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-sky-600 text-base font-semibold text-white shadow-lg shadow-sky-600/25 transition duration-200 hover:bg-sky-700 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            {sending ? 'Küldés...' : 'Útvonal küldése a családi chatbe'}
          </button>
        </>
      )}

      <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-300 bg-slate-50 p-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-800">Síelési szint</span>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-200 p-1">
            {SKILL_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSkill(option)}
                aria-pressed={skill === option}
                className={segmentClass(skill === option)}
              >
                {SKILL_LABELS[option]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-800">Felvonónál várakozás</span>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-200 p-1">
            {WAIT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setWait(option)}
                aria-pressed={wait === option}
                title={LIFT_WAIT_LABELS[option]}
                className={segmentClass(wait === option)}
              >
                {WAIT_SHORT[option]}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
