import type { Difficulty, Lift, Piste, SkiNetwork, SkiNode } from '@/data/skiArea';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type LiftWait = 'low' | 'medium' | 'high';

interface RouteStepBase {
  id: string;
  label: string;
  from: string;
  to: string;
}

export interface PisteStep extends RouteStepBase {
  kind: 'piste';
  difficulty: Difficulty;
  lengthKm: number;
  verticalM: number;
}

export interface LiftStep extends RouteStepBase {
  kind: 'lift';
  rideMinutes: number;
}

export type RouteStep = PisteStep | LiftStep;

export interface RouteSummary {
  steps: RouteStep[];
  distanceKm: number;
  verticalDropM: number;
  descentMinutes: number;
  liftRideMinutes: number;
  liftQueueMinutes: number;
  totalMinutes: number;
}

export interface PisteRun {
  piste: Piste;
  fromNodeId: string;
  toNodeId: string;
}

export interface NextPisteOption extends PisteRun {
  lifts: Lift[];
}

export const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Kezdő',
  intermediate: 'Középhaladó',
  advanced: 'Profi/Haladó',
};

export const LIFT_WAIT_LABELS: Record<LiftWait, string> = {
  low: 'Alacsony (kb. 2 perc)',
  medium: 'Közepes (kb. 6 perc)',
  high: 'Magas (kb. 15 perc)',
};

const DESCENT_SPEED_KMH: Record<SkillLevel, number> = {
  beginner: 12,
  intermediate: 22,
  advanced: 35,
};

const DIFFICULTY_SPEED_FACTOR: Record<Difficulty, number> = {
  green: 1,
  blue: 0.9,
  red: 0.75,
  black: 0.6,
};

const QUEUE_MINUTES: Record<LiftWait, number> = {
  low: 2,
  medium: 6,
  high: 15,
};

export function isRoutablePiste(piste: Piste): boolean {
  return piste.nodeIds.length >= 2;
}

// Lift stations and shared or branching junctions are where a skier can stop and choose.
function isStopNode(node: SkiNode): boolean {
  return node.kind !== 'junction' || node.pisteIds.length > 1;
}

// Runs a piste from a node on it down to the next stop (or its last node).
export function pisteRun(network: SkiNetwork, piste: Piste, fromNodeId: string): PisteRun | null {
  const index = piste.nodeIds.indexOf(fromNodeId);
  const lastIndex = piste.nodeIds.length - 1;
  if (index === -1 || index >= lastIndex) return null;

  let stopIndex = index + 1;
  while (stopIndex < lastIndex) {
    const node = network.nodes.find((item) => item.id === piste.nodeIds[stopIndex]);
    if (!node || isStopNode(node)) break;
    stopIndex += 1;
  }
  return { piste, fromNodeId, toNodeId: piste.nodeIds[stopIndex] };
}

export function getStartRun(network: SkiNetwork, piste: Piste): PisteRun | null {
  return isRoutablePiste(piste) ? pisteRun(network, piste, piste.nodeIds[0]) : null;
}

export function getPisteRunsFrom(network: SkiNetwork, nodeId: string): PisteRun[] {
  return network.pistes.flatMap((piste) => {
    const run = pisteRun(network, piste, nodeId);
    return run ? [run] : [];
  });
}

export function getLiftsFrom(network: SkiNetwork, nodeId: string): Lift[] {
  return network.lifts.filter((lift) => lift.from === nodeId);
}

// Pistes are offered once per route. The piste currently being skied may be continued at its next stop.
export function getNextPisteOptions(network: SkiNetwork, steps: RouteStep[]): NextPisteOption[] {
  const nodeId = getCurrentNodeId(steps);
  if (!nodeId) return [];

  const lastStep = steps[steps.length - 1];
  const openPisteId = lastStep.kind === 'piste' ? lastStep.id : undefined;
  const usedPisteIds = new Set(steps.flatMap((step) => (step.kind === 'piste' ? [step.id] : [])));

  const optionsByPisteId = new Map<string, NextPisteOption>();
  const visited = new Set<string>([nodeId]);
  let frontier: { nodeId: string; lifts: Lift[] }[] = [{ nodeId, lifts: [] }];

  while (frontier.length > 0) {
    const following: { nodeId: string; lifts: Lift[] }[] = [];
    frontier.forEach((current) => {
      const atCurrentNode = current.lifts.length === 0;
      const liftRestriction = current.lifts.find((lift) => lift.onlyPisteIds)?.onlyPisteIds;
      getPisteRunsFrom(network, current.nodeId).forEach((run) => {
        if (optionsByPisteId.has(run.piste.id)) return;
        if (liftRestriction && !liftRestriction.includes(run.piste.id)) return;
        const continuesOpenPiste = atCurrentNode && run.piste.id === openPisteId;
        if (usedPisteIds.has(run.piste.id) && !continuesOpenPiste) return;
        const turnBlocked =
          atCurrentNode &&
          network.blockedTurns.some(
            (turn) => turn.from === openPisteId && turn.to === run.piste.id && turn.atNodeId === current.nodeId,
          );
        if (turnBlocked) return;
        optionsByPisteId.set(run.piste.id, { ...run, lifts: current.lifts });
      });
      getLiftsFrom(network, current.nodeId).forEach((lift) => {
        if (visited.has(lift.to)) return;
        visited.add(lift.to);
        following.push({ nodeId: lift.to, lifts: [...current.lifts, lift] });
      });
    });
    frontier = following;
  }

  return [...optionsByPisteId.values()];
}

export function appendRouteOption(steps: RouteStep[], option: NextPisteOption): RouteStep[] {
  const lastStep = steps[steps.length - 1];
  if (lastStep?.kind === 'piste' && lastStep.id === option.piste.id && option.lifts.length === 0) {
    return [...steps.slice(0, -1), { ...lastStep, to: option.toNodeId }];
  }
  return [
    ...steps,
    ...option.lifts.map(toLiftStep),
    toPisteStep(option.piste, option.fromNodeId, option.toNodeId),
  ];
}

export function getCurrentNodeId(steps: RouteStep[]): string | undefined {
  return steps.length > 0 ? steps[steps.length - 1].to : undefined;
}

export function describeStep(step: RouteStep): { action: string; target: string } {
  return step.kind === 'lift'
    ? { action: 'Ülj fel', target: step.label }
    : { action: 'Síelj le', target: step.label };
}

export function calculateRouteSummary(steps: RouteStep[], skill: SkillLevel, wait: LiftWait): RouteSummary {
  const pisteSteps = steps.filter((step): step is PisteStep => step.kind === 'piste');
  const liftSteps = steps.filter((step): step is LiftStep => step.kind === 'lift');

  const distanceKm = pisteSteps.reduce((sum, step) => sum + step.lengthKm, 0);
  const verticalDropM = pisteSteps.reduce((sum, step) => sum + step.verticalM, 0);
  const descentMinutes = pisteSteps.reduce(
    (sum, step) => sum + (step.lengthKm / (DESCENT_SPEED_KMH[skill] * DIFFICULTY_SPEED_FACTOR[step.difficulty])) * 60,
    0,
  );
  const liftRideMinutes = liftSteps.reduce((sum, step) => sum + step.rideMinutes, 0);
  const liftQueueMinutes = liftSteps.length * QUEUE_MINUTES[wait];

  return {
    steps,
    distanceKm,
    verticalDropM,
    descentMinutes,
    liftRideMinutes,
    liftQueueMinutes,
    totalMinutes: descentMinutes + liftRideMinutes + liftQueueMinutes,
  };
}

export function toPisteStep(piste: Piste, fromNodeId: string, toNodeId: string): PisteStep {
  return {
    kind: 'piste',
    id: piste.id,
    label: piste.label,
    from: fromNodeId,
    to: toNodeId,
    difficulty: piste.difficulty,
    lengthKm: piste.lengthKm,
    verticalM: piste.verticalM,
  };
}

export function toLiftStep(lift: Lift): LiftStep {
  return { kind: 'lift', id: lift.id, label: lift.name, from: lift.from, to: lift.to, rideMinutes: lift.rideMinutes };
}
