/** Custom desktop cursor: a gold point and a lagging ring that reacts to context. */
import { useEffect, useRef } from 'react';

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.body.classList.add('has-cursor');
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const lag = { ...pos };
    let raf = 0;
    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const t = e.target as HTMLElement;
      const interactive = !!t.closest('button, a, input, [role="button"], .part-label');
      document.body.dataset.hover = interactive ? 'true' : '';
    };
    const loop = () => {
      lag.x += (pos.x - lag.x) * 0.16;
      lag.y += (pos.y - lag.y) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) {
        const b = document.body.dataset;
        const s = b.dragging ? 0.6 : b.hover || b.cursor ? 1.8 : 1;
        ring.current.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0) scale(${s})`;
        ring.current.dataset.label = b.dragging ? '' : b.cursor === 'inspect' ? 'Inspect' : '';
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.body.classList.remove('has-cursor');
    };
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200] hidden [@media(pointer:fine)]:block">
      <div ref={dot} className="absolute -ml-[2px] -mt-[2px] h-1 w-1 rounded-full bg-gold-light" />
      <div ref={ring} className="absolute -ml-5 -mt-5 h-10 w-10 rounded-full border border-gold/60 transition-[width,height] duration-300" />
    </div>
  );
}
