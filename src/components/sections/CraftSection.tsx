import { useRef } from 'react';
import { Section, useIndexFrom } from './Section';
import { CRAFT_STEPS } from '../../data/materials';
import { scrollState } from '../../store/scrollState';
import { useChapterTimeline } from '../../animations/scroll/useChapterTimeline';

export function CraftSection() {
  const ref = useRef<HTMLDivElement>(null);
  const n = CRAFT_STEPS.length;
  const i = useIndexFrom(() => Math.max(0, Math.min(n - 1, Math.round(scrollState.progress.craftsmanship * (n - 1)))));
  const s = CRAFT_STEPS[i];
  useChapterTimeline(ref, (tl, q) => {
    tl.fromTo(q('[data-head] > *'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.02, duration: 0.05 }, 0).set({}, {}, 1);
  });
  return (
    <Section id="craftsmanship" label="The Craftsmanship" ref={ref}>
      <div data-head className="absolute left-6 top-24 md:left-12 md:top-28">
        <div className="eyebrow">09 — The Craftsmanship</div>
        <h2 className="display mt-3 text-4xl text-ivory md:text-6xl">Made by hand, by patience</h2>
        <p className="mt-3 max-w-sm text-[10px] uppercase tracking-[0.22em] text-muted/70">Fictional atelier vignettes, rendered in real time</p>
      </div>
      <div key={i} className="absolute bottom-24 right-6 max-w-sm animate-[fadeUp_0.8s_ease_both] text-right md:bottom-[14vh] md:right-16" aria-live="polite">
        <div className="eyebrow">Step {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</div>
        <h3 className="display mt-2 text-5xl text-ivory md:text-6xl">{s.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{s.text}</p>
      </div>
      <ol className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 gap-6 md:flex" aria-hidden="true">
        {CRAFT_STEPS.map((c, k) => (
          <li key={c.title} className={`text-[9px] uppercase tracking-[0.25em] transition-colors ${k === i ? 'text-gold-light' : 'text-muted/40'}`}>
            {c.title}
          </li>
        ))}
      </ol>
    </Section>
  );
}
