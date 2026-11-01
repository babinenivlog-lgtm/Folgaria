import { useEffect, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import type { SkiNetwork } from '@/data/skiArea';
import TrailNodePanel from '@/components/route/TrailNodePanel';
import ZoomableMap from '@/components/route/ZoomableMap';

const MAP_SRC = '/folgaria.jpg';
const MAP_WIDTH = 2746;
const MAP_HEIGHT = 1937;
const MAP_ALT = 'Folgaria síterep';

interface TrailMapViewerProps {
  network: SkiNetwork;
}

export default function TrailMapViewer({ network }: TrailMapViewerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 hover:shadow-md active:scale-[0.99]"
        aria-label="Síterep megnyitása"
      >
        <img
          src={MAP_SRC}
          alt={MAP_ALT}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition group-hover:bg-slate-800">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Teljes térkép
        </span>
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Síterep" className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-bold text-slate-900">Síterep</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Bezárás"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition hover:bg-slate-200"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="h-[55dvh] min-h-[300px] shrink-0 p-2">
            <ZoomableMap src={MAP_SRC} alt={MAP_ALT} width={MAP_WIDTH} height={MAP_HEIGHT} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <TrailNodePanel network={network} />
          </div>
        </div>
      )}
    </>
  );
}
