import { Mountain } from 'lucide-react';
import { SKI_NETWORKS, SKI_SECTORS, type SectorId } from '@/data/skiArea';

interface SectorCardsProps {
  selected?: SectorId;
  onSelect: (sector: SectorId) => void;
}

export default function SectorCards({ selected, onSelect }: SectorCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {SKI_SECTORS.map((sector) => {
        const network = SKI_NETWORKS[sector.id];
        const isActive = selected === sector.id;
        return (
          <button
            key={sector.id}
            type="button"
            onClick={() => onSelect(sector.id)}
            aria-pressed={isActive}
            className={`flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition duration-200 active:scale-[0.98] ${
              isActive
                ? 'border-sky-600 bg-sky-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md'
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isActive ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-700'
              }`}
            >
              <Mountain className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-bold text-slate-900">{sector.name}</span>
            <span className="text-xs leading-snug text-slate-600">
              {network ? `${network.pistes.length} pálya · ${network.lifts.length} felvonó` : 'A pályatérkép hamarosan'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
