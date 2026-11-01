import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Maximize2, Minus, Plus } from 'lucide-react';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const BUTTON_ZOOM_STEP = 1.5;
const WHEEL_SENSITIVITY = 0.0015;

interface ZoomableMapProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface View {
  zoom: number;
  x: number;
  y: number;
}

interface Pinch {
  distance: number;
  zoom: number;
  contentX: number;
  contentY: number;
}

interface Point {
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const MapImage = memo(function MapImage({ src, alt, width, height }: ZoomableMapProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      draggable={false}
      decoding="async"
      className="block h-full w-full select-none"
    />
  );
});

export default function ZoomableMap({ src, alt, width, height }: ZoomableMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef(1);
  const viewRef = useRef<View>({ zoom: MIN_ZOOM, x: 0, y: 0 });
  const pointersRef = useRef(new Map<number, Point>());
  const dragRef = useRef<{ start: Point; view: Point } | null>(null);
  const pinchRef = useRef<Pinch | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);

  // Moves the layer with a single transform; React state is only updated when the zoom level changes.
  const applyView = useCallback(
    (next: View) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const { width: viewportWidth, height: viewportHeight } = viewport.getBoundingClientRect();
      const zoomValue = clamp(next.zoom, MIN_ZOOM, MAX_ZOOM);
      const scale = fitRef.current * zoomValue;
      const displayWidth = width * scale;
      const displayHeight = height * scale;
      const x = displayWidth <= viewportWidth ? (viewportWidth - displayWidth) / 2 : clamp(next.x, viewportWidth - displayWidth, 0);
      const y = displayHeight <= viewportHeight ? (viewportHeight - displayHeight) / 2 : clamp(next.y, viewportHeight - displayHeight, 0);
      viewRef.current = { zoom: zoomValue, x, y };
      if (layerRef.current) {
        layerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      }
      setZoom(zoomValue);
    },
    [width, height],
  );

  const zoomAround = useCallback(
    (factor: number, centerX: number, centerY: number) => {
      const view = viewRef.current;
      const nextZoom = clamp(view.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      const ratio = nextZoom / view.zoom;
      applyView({ zoom: nextZoom, x: centerX - (centerX - view.x) * ratio, y: centerY - (centerY - view.y) * ratio });
    },
    [applyView],
  );

  const fitToViewport = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const { width: viewportWidth, height: viewportHeight } = viewport.getBoundingClientRect();
    fitRef.current = Math.min(viewportWidth / width, viewportHeight / height);
    applyView(viewRef.current);
  }, [width, height, applyView]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    fitToViewport();
    const observer = new ResizeObserver(fitToViewport);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [fitToViewport]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      zoomAround(Math.exp(-event.deltaY * WHEEL_SENSITIVITY), event.clientX - rect.left, event.clientY - rect.top);
    };
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [zoomAround]);

  const zoomByButton = (factor: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const { width: viewportWidth, height: viewportHeight } = viewport.getBoundingClientRect();
    zoomAround(factor, viewportWidth / 2, viewportHeight / 2);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.setPointerCapture(event.pointerId);
    const pointers = pointersRef.current;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 1) {
      dragRef.current = { start: { x: event.clientX, y: event.clientY }, view: { x: viewRef.current.x, y: viewRef.current.y } };
      return;
    }
    if (pointers.size === 2) {
      const [first, second] = [...pointers.values()];
      const rect = viewport.getBoundingClientRect();
      const view = viewRef.current;
      const scale = fitRef.current * view.zoom;
      const midX = (first.x + second.x) / 2 - rect.left;
      const midY = (first.y + second.y) / 2 - rect.top;
      pinchRef.current = {
        distance: Math.hypot(first.x - second.x, first.y - second.y),
        zoom: view.zoom,
        contentX: (midX - view.x) / scale,
        contentY: (midY - view.y) / scale,
      };
      dragRef.current = null;
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const viewport = viewportRef.current;
    if (!viewport) return;

    const pinch = pinchRef.current;
    if (pinch && pointers.size >= 2) {
      const [first, second] = [...pointers.values()];
      const rect = viewport.getBoundingClientRect();
      const nextZoom = clamp(pinch.zoom * (Math.hypot(first.x - second.x, first.y - second.y) / pinch.distance), MIN_ZOOM, MAX_ZOOM);
      const scale = fitRef.current * nextZoom;
      const midX = (first.x + second.x) / 2 - rect.left;
      const midY = (first.y + second.y) / 2 - rect.top;
      applyView({ zoom: nextZoom, x: midX - pinch.contentX * scale, y: midY - pinch.contentY * scale });
      return;
    }

    const drag = dragRef.current;
    if (drag) {
      applyView({
        zoom: viewRef.current.zoom,
        x: drag.view.x + event.clientX - drag.start.x,
        y: drag.view.y + event.clientY - drag.start.y,
      });
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    pointers.delete(event.pointerId);
    pinchRef.current = null;
    const [remaining] = [...pointers.values()];
    dragRef.current = remaining
      ? { start: { x: remaining.x, y: remaining.y }, view: { x: viewRef.current.x, y: viewRef.current.y } }
      : null;
  };

  const handleDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAround(BUTTON_ZOOM_STEP, event.clientX - rect.left, event.clientY - rect.top);
  };

  const controlClass =
    'flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-slate-900 shadow-md ring-1 ring-slate-300 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400';

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-100">
      <div
        ref={viewportRef}
        className="relative h-full w-full touch-none cursor-grab select-none overflow-hidden active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onDoubleClick={handleDoubleClick}
      >
        <div
          ref={layerRef}
          className="absolute left-0 top-0"
          style={{ width, height, transformOrigin: '0 0', willChange: 'transform' }}
        >
          <MapImage src={src} alt={alt} width={width} height={height} />
        </div>
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
        <button type="button" onClick={() => zoomByButton(BUTTON_ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Nagyítás" title="Nagyítás" className={controlClass}>
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => zoomByButton(1 / BUTTON_ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Kicsinyítés" title="Kicsinyítés" className={controlClass}>
          <Minus className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => applyView({ zoom: MIN_ZOOM, x: 0, y: 0 })} aria-label="Teljes térkép" title="Teljes térkép" className={controlClass}>
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
