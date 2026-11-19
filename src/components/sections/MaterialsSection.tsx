import { useRef } from 'react';
import { Section, useIndexFrom } from './Section';
import { MATERIAL_STORIES } from '../../data/materials';
import { scrollState } from '../../store/scrollState';
import { useChapterTimeline } from '../../animations/scroll/useChapterTimeline';

export function MaterialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const n = MATERIAL_STORIES.length;
  const i = useIndexFrom(() =>
    Math.max(0, Math.min(n - 1, Math.round(scrollState.progress.materials * n - 0.5))),
  );
  const m = MATERIAL_STORIES[i];
  useChapterTimeline(ref, (tl, q) => {
    tl.fromTo(
      q('[data-head] > *'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.02, duration: 0.05 },
      0,
    ).set({}, {}, 1);
  });
  return (
    <Section id="materials" label="The Art of Materials" ref={ref}>
      <div data-head className="absolute left-6 top-24 md:left-12 md:top-28">
        <div className="eyebrow">05 — The Art of Materials</div>
        <h2 className="display mt-3 text-4xl text-ivory md:text-6xl">Matter, mastered</h2>
      </div>
      <ol
        className="absolute left-12 top-1/2 hidden -translate-y-1/2 space-y-3 md:block"
        aria-label="Materials"
      >
        {MATERIAL_STORIES.map((s, k) => (
          <li
            key={s.key}
            className={`flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 ${k === i ? 'translate-x-2 text-gold-light' : 'text-muted/50'}`}
            aria-current={k === i ? 'true' : undefined}
          >
            <span
              className={`h-px transition-all duration-500 ${k === i ? 'w-10 bg-gold-light' : 'w-4 bg-muted/40'}`}
            />
            {s.name}
          </li>
        ))}
      </ol>
      <div
        key={m.key}
        className="absolute bottom-24 right-6 max-w-sm animate-[fadeUp_0.8s_ease_both] text-right md:bottom-[14vh] md:right-16"
        aria-live="polite"
      >
        <div className="eyebrow">{String(i + 1).padStart(2, '0')} / 08</div>
        <h3 className="display mt-2 text-5xl text-ivory md:text-7xl">{m.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{m.line}</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-gold/80">{m.stat}</p>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}`}</style>
    </Section>
  );
}
