import { SKI_NETWORKS, SKI_SECTORS, type SectorId } from '@/data/skiArea';
import RouteBuilder from '@/components/route/RouteBuilder';
import SectorCards from '@/components/route/SectorCards';
import TrailMapViewer from '@/components/route/TrailMapViewer';

interface RoutePlannerProps {
  sector: SectorId;
  onSectorChange: (sector: SectorId) => void;
  onSent: () => void;
}

export default function RoutePlanner({ sector, onSectorChange, onSent }: RoutePlannerProps) {
  const network = SKI_NETWORKS[sector];
  const sectorName = SKI_SECTORS.find((item) => item.id === sector)?.name ?? '';

  return (
    <div className="flex flex-col gap-6 p-4 pb-10">
      {sector === 'folgaria' && network ? (
        <TrailMapViewer key={sector} network={network} />
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-relaxed text-slate-700">
          A {sectorName} síterep térképe még nincs feltöltve. Addig a pályákat és csomópontokat a lenti választóban találod.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sítervező</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            Válassz területet, majd állítsd össze lépésről lépésre a felvonók és pályák sorrendjét.
          </p>
        </div>
        <SectorCards selected={sector} onSelect={onSectorChange} />
      </section>

      {network ? (
        <RouteBuilder key={sector} network={network} onSent={onSent} />
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm leading-relaxed text-slate-700">
          A {sectorName} pályatérképe még nincs feltöltve. Amint megvan, itt tervezheted az útvonalakat.
        </p>
      )}
    </div>
  );
}
