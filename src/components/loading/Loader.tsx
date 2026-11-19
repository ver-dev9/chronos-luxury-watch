/**
 * Intro loader: an engraved ring that fills as real steps complete
 * (fonts → WebGL context → first scene compiled), then dissolves.
 */
import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../animations/scroll/lenis';

export function Loader({ progress, done }: { progress: number; done: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const shown = useRef({ v: 0 });
  const [label, setLabel] = useState(0);

  useEffect(() => {
    const t = gsap.to(shown.current, {
      v: progress,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => setLabel(Math.round(shown.current.v)),
    });
    return () => void t.kill();
  }, [progress]);

  useEffect(() => {
    if (!done || !root.current) return;
    const tl = gsap.timeline({ delay: 0.5, onComplete: () => setGone(true) });
    tl.to(root.current.querySelector('[data-ring]'), {
      scale: 0.6,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.in',
    }).to(root.current, { opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3');
    return () => void tl.kill();
  }, [done]);

  if (gone) return null;
  const C = 2 * Math.PI * 46;
  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] grid place-items-center bg-ink"
      role="status"
      aria-live="polite"
      aria-label={`Loading CHRONOS ${label}%`}
    >
      <div data-ring className="flex flex-col items-center gap-8">
        <svg width="120" height="120" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(199,167,107,0.15)" strokeWidth="0.6" />
          {Array.from({ length: 60 }, (_, i) => (
            <line
              key={i}
              x1="50"
              y1="6"
              x2="50"
              y2={i % 5 ? 8 : 10}
              stroke="#c7a76b"
              strokeWidth={i % 5 ? 0.3 : 0.6}
              transform={`rotate(${i * 6} 50 50)`}
              opacity={i / 60 <= label / 100 ? 1 : 0.2}
            />
          ))}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#e4c88d"
            strokeWidth="0.8"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - label / 100)}
            transform="rotate(-90 50 50)"
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="20"
            stroke="#e4c88d"
            strokeWidth="0.8"
            transform={`rotate(${label * 3.6} 50 50)`}
          />
        </svg>
        <div className="text-center">
          <div className="display text-3xl tracking-[0.5em] text-ivory">CHRONOS</div>
          <div className="eyebrow mt-3 text-muted">{String(label).padStart(3, '0')} · Calibrating</div>
        </div>
      </div>
    </div>
  );
}
