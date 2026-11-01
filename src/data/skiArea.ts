import folgariaNetwork from '@/data/folgariaPisteNetwork.json';
import lavaroneNetwork from '@/data/lavaronePisteNetwork.json';
import { FOLGARIA_OFFICIAL_PISTES, type OfficialPiste } from '@/data/folgariaOfficialPistes';

export type SectorId = 'folgaria' | 'lavarone';

export type Difficulty = 'green' | 'blue' | 'red' | 'black';

export type NodeKind = 'top' | 'junction' | 'bottom';

export interface SkiSector {
  id: SectorId;
  name: string;
}

export interface SkiNode {
  id: string;
  name: string;
  kind: NodeKind;
  pisteIds: string[];
}

export interface Piste {
  id: string;
  name: string;
  label: string;
  difficulty: Difficulty;
  nodeIds: string[];
  lengthKm: number;
  verticalM: number;
}

// A stretch of ground between two neighbouring nodes. Pistes that share it reference the same segment.
export interface PisteSegment {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  pisteIds: string[];
}

export interface Lift {
  id: string;
  name: string;
  from: string;
  to: string;
  rideMinutes: number;
  onlyPisteIds?: string[];
}

export interface SkiNetwork {
  nodes: SkiNode[];
  pistes: Piste[];
  segments: PisteSegment[];
  lifts: Lift[];
  blockedTurns: BlockedTurn[];
}

// Placeholder values until the real piste lengths, drop heights and lift ride times are provided.
const ESTIMATED_PISTE_LENGTH_KM = 2;
const ESTIMATED_PISTE_VERTICAL_M = 250;
const ESTIMATED_LIFT_RIDE_MINUTES = 6;

interface RawNode {
  id: string;
  name: string;
  type: string;
}

interface RawPiste {
  id: string;
  name: string;
  type: string;
  nodes: string[];
}

// A piste that cannot be continued onto another piste at a given node (e.g. one-way connections).
export interface BlockedTurn {
  from: string;
  to: string;
  atNodeId: string;
}

interface RawLift {
  id: string;
  name: string;
  from: string;
  to: string;
  onlyPisteIds?: string[];
}

interface RawNetwork {
  nodes: RawNode[];
  pistes: RawPiste[];
  blockedTurns?: BlockedTurn[];
  extraLifts?: RawLift[];
}

export const SKI_SECTORS: SkiSector[] = [
  { id: 'folgaria', name: 'Folgaria' },
  { id: 'lavarone', name: 'Lavarone' },
];

export const DIFFICULTY_META: Record<Difficulty, { label: string; colourWord: string; color: string }> = {
  green: { label: 'Zöld (kezdő)', colourWord: 'zöld', color: '#35B65A' },
  blue: { label: 'Kék (középhaladó)', colourWord: 'kék', color: '#159DDE' },
  red: { label: 'Piros (haladó)', colourWord: 'piros', color: '#E32636' },
  black: { label: 'Fekete (profi)', colourWord: 'fekete', color: '#171717' },
};

const NODE_KINDS: Record<string, NodeKind> = {
  lift_top: 'top',
  junction: 'junction',
  special_junction: 'junction',
  lift_bottom: 'bottom',
};

const isDifficulty = (value: string): value is Difficulty => value in DIFFICULTY_META;

function pisteLabel(id: string, name: string, difficulty: Difficulty): string {
  return `${id} – ${name} (${DIFFICULTY_META[difficulty].colourWord} pálya)`;
}

function liftPlaceName(nodeName: string): string {
  const base = nodeName.replace(/ (alj|teteje)$/, '');
  const place = base.match(/\((.+)\)$/)?.[1];
  return place ? `${place} felvonó` : base;
}

function buildLifts(raw: RawNetwork, rawNodeIds: Set<string>): { lifts: Lift[]; liftNameByNodeId: Map<string, string> } {
  const liftNameByNodeId = new Map<string, string>();
  const lifts: Lift[] = [];

  raw.nodes.forEach((node) => {
    if (node.type !== 'lift_bottom') return;
    const base = node.id.replace(/_start$/, '');
    const topId = `${base}_end`;
    if (!rawNodeIds.has(topId)) return;
    const name = liftPlaceName(node.name);
    liftNameByNodeId.set(node.id, name);
    liftNameByNodeId.set(topId, name);
    lifts.push({
      id: `lift_${base}`,
      name,
      from: node.id,
      to: topId,
      rideMinutes: ESTIMATED_LIFT_RIDE_MINUTES,
    });
  });

  (raw.extraLifts ?? []).forEach((lift) => {
    lifts.push({ ...lift, rideMinutes: ESTIMATED_LIFT_RIDE_MINUTES });
  });

  return { lifts, liftNameByNodeId };
}

function validatePistes(raw: RawNetwork, nodeIds: Set<string>, official?: OfficialPiste[]): void {
  if (!official) return;
  const officialById = new Map(official.map((entry) => [entry.id, entry]));
  const rawIds = new Set(raw.pistes.map((piste) => piste.id));
  if (rawIds.size !== raw.pistes.length) {
    console.warn('[sípálya-ellenőrzés] Duplikált pályaszám az adatbázisban.');
  }

  raw.pistes.forEach((piste) => {
    const expected = officialById.get(piste.id);
    if (!expected) {
      console.warn(`[sípálya-ellenőrzés] Nem engedélyezett pálya, kihagyva: ${piste.id}`);
      return;
    }
    if (expected.name !== piste.name || expected.color !== piste.type) {
      console.warn(`[sípálya-ellenőrzés] A ${piste.id} pálya neve vagy színe eltér az eredeti listától.`);
    }
    piste.nodes.filter((nodeId) => !nodeIds.has(nodeId)).forEach((nodeId) => {
      console.warn(`[sípálya-ellenőrzés] A ${piste.id} pálya ismeretlen csomópontra hivatkozik: ${nodeId}`);
    });
    if (piste.nodes.length < 2) {
      console.warn(`[sípálya-ellenőrzés] A ${piste.id} pályának nincs ismert kapcsolata, nem tervezhető.`);
    }
  });

  official.filter((entry) => !rawIds.has(entry.id)).forEach((entry) => {
    console.warn(`[sípálya-ellenőrzés] Hiányzik az eredeti listából: ${entry.id} (${entry.name})`);
  });
  if (raw.pistes.length !== official.length) {
    console.warn(`[sípálya-ellenőrzés] ${raw.pistes.length} pálya szerepel, ${official.length} lenne az eredeti lista szerint.`);
  }
}

function buildSegments(pistes: Piste[]): PisteSegment[] {
  const segmentsById = new Map<string, PisteSegment>();
  pistes.forEach((piste) => {
    piste.nodeIds.slice(0, -1).forEach((fromNodeId, index) => {
      const toNodeId = piste.nodeIds[index + 1];
      const id = `${fromNodeId}>${toNodeId}`;
      const existing = segmentsById.get(id);
      if (existing) {
        existing.pisteIds.push(piste.id);
        return;
      }
      segmentsById.set(id, { id, fromNodeId, toNodeId, pisteIds: [piste.id] });
    });
  });
  return [...segmentsById.values()];
}

function buildNetwork(raw: RawNetwork, official?: OfficialPiste[]): SkiNetwork {
  const rawNodeIds = new Set(raw.nodes.map((node) => node.id));
  const { lifts, liftNameByNodeId } = buildLifts(raw, rawNodeIds);
  validatePistes(raw, rawNodeIds, official);
  const officialIds = official ? new Set(official.map((entry) => entry.id)) : undefined;

  const pistes: Piste[] = raw.pistes.flatMap((piste) => {
    if (!isDifficulty(piste.type)) return [];
    if (officialIds && !officialIds.has(piste.id)) return [];
    return [
      {
        id: piste.id,
        name: piste.name,
        label: pisteLabel(piste.id, piste.name, piste.type),
        difficulty: piste.type,
        nodeIds: piste.nodes,
        lengthKm: ESTIMATED_PISTE_LENGTH_KM,
        verticalM: ESTIMATED_PISTE_VERTICAL_M,
      },
    ];
  });

  const nodes: SkiNode[] = raw.nodes.flatMap((node) => {
    const kind = NODE_KINDS[node.type];
    if (!kind) return [];
    const liftName = liftNameByNodeId.get(node.id);
    const name =
      liftName && kind === 'top'
        ? `${liftName} felső állomása`
        : liftName && kind === 'bottom'
          ? `${liftName} alsó állomása`
          : node.name;
    const pisteIds = pistes.filter((piste) => piste.nodeIds.includes(node.id)).map((piste) => piste.id);
    return [{ id: node.id, name, kind, pisteIds }];
  });

  return { nodes, pistes, segments: buildSegments(pistes), lifts, blockedTurns: raw.blockedTurns ?? [] };
}

export const SKI_NETWORKS: Record<SectorId, SkiNetwork | null> = {
  folgaria: buildNetwork(folgariaNetwork as RawNetwork, FOLGARIA_OFFICIAL_PISTES),
  lavarone: buildNetwork(lavaroneNetwork as RawNetwork),
};
