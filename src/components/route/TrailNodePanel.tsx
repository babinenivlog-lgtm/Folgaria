import { useState } from 'react';
import { GitBranch, TrainFront } from 'lucide-react';
import type { SkiNetwork, SkiNode } from '@/data/skiArea';
import { getLiftsFrom, getPisteRunsFrom } from '@/lib/routeCalculator';

interface TrailNodePanelProps {
  network: SkiNetwork;
}

function NodeButton({ node, active, onSelect }: { node: SkiNode; active: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      aria-pressed={active}
      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition duration-200 ${
        active ? 'border-sky-600 bg-sky-50 text-slate-900' : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400'
      }`}
    >
      <span className="font-medium">{node.name}</span>
      <span className="shrink-0 font-mono text-xs text-slate-700">{node.id}</span>
    </button>
  );
}

function NodeDetails({ network, node }: { network: SkiNetwork; node: SkiNode }) {
  const nameOf = (nodeId: string) => network.nodes.find((item) => item.id === nodeId)?.name ?? nodeId;
  const runs = getPisteRunsFrom(network, node.id);
  const lifts = getLiftsFrom(network, node.id);
  const touchingPistes = network.pistes.filter((piste) => node.pisteIds.includes(piste.id));

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4">
      <div className="flex flex-col gap-1">
        <h4 className="text-base font-semibold text-slate-900">{node.name}</h4>
        <p className="font-mono text-xs text-slate-700">Azonosító: {node.id}</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Érintett pályák</span>
        {touchingPistes.length === 0 && <p className="text-sm text-slate-700">Nincs érintett sípálya.</p>}
        <ul className="flex flex-col gap-1 text-sm text-slate-900">
          {touchingPistes.map((piste) => (
            <li key={piste.id}>{piste.label}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Továbbhaladás</span>
        {runs.length === 0 && <p className="text-sm text-slate-700">Innen nincs továbbhaladási irány.</p>}
        <ul className="flex flex-col gap-1 text-sm text-slate-900">
          {runs.map((run) => (
            <li key={run.piste.id} className="flex gap-2">
              <span className="font-medium">{run.piste.label}</span>
              <span className="text-slate-700">→ {nameOf(run.toNodeId)}</span>
            </li>
          ))}
        </ul>
      </div>

      {lifts.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Felvonók innen</span>
          <ul className="flex flex-col gap-1 text-sm text-slate-900">
            {lifts.map((lift) => (
              <li key={lift.id} className="flex items-center gap-2">
                <TrainFront className="h-4 w-4 text-slate-700" aria-hidden="true" />
                {lift.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function TrailNodePanel({ network }: TrailNodePanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = network.nodes.find((node) => node.id === selectedId);
  const junctions = network.nodes.filter((node) => node.kind === 'junction');
  const stations = network.nodes.filter((node) => node.kind !== 'junction');

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-5 rounded-2xl bg-white p-4 text-slate-900 sm:p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">Csomópontok a térképen</h3>
        <p className="text-sm text-slate-700">Válassz egy csomópontot a továbbhaladási irányok és a felvonók megtekintéséhez.</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <GitBranch className="h-4 w-4" aria-hidden="true" />
          Elágazások és közös szakaszok
        </span>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {junctions.map((node) => (
            <NodeButton key={node.id} node={node} active={node.id === selectedId} onSelect={setSelectedId} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <TrainFront className="h-4 w-4" aria-hidden="true" />
          Felvonók állomásai
        </span>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {stations.map((node) => (
            <NodeButton key={node.id} node={node} active={node.id === selectedId} onSelect={setSelectedId} />
          ))}
        </div>
      </div>

      {selected && <NodeDetails network={network} node={selected} />}
    </section>
  );
}
