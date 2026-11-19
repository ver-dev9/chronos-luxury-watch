import { forwardRef, useEffect, useState, type ReactNode } from 'react';
import { CHAPTERS, type ChapterId } from '../../data/chapters';

/** A chapter: a tall scroll track with a pinned, full-viewport stage. */
export const Section = forwardRef<
  HTMLDivElement,
  { id: ChapterId; label: string; children: ReactNode; className?: string }
>(function Section({ id, label, children, className = '' }, ref) {
  const c = CHAPTERS.find((x) => x.id === id)!;
  return (
    <section
      id={`chapter-${id}`}
      aria-label={label}
      className="relative"
      style={{ height: `${c.length * 100}vh` }}
    >
      <div
        ref={ref}
        data-stage
        className={`pointer-events-none relative h-[100svh] w-full overflow-hidden ${className}`}
      >
        {children}
      </div>
    </section>
  );
});

/** Splits text into per-character spans for typographic reveals. */
export function Split({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((ch, i) => (
        <span key={i} className="char" aria-hidden="true">
          {ch === ' ' ? '\u00a0' : ch}
        </span>
      ))}
    </span>
  );
}

/** Subscribes to a mutable value via rAF and re-renders only when the integer index changes. */
export function useIndexFrom(read: () => number) {
  const [i, setI] = useState(() => read());
  useEffect(() => {
    let raf = 0;
    let last = i;
    const loop = () => {
      const v = read();
      if (v !== last) {
        last = v;
        setI(v);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return i;
}
