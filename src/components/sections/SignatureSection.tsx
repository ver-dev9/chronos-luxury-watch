import { useRef } from 'react';
import { Section } from './Section';
import { SIGNATURE } from '../../data/watches';
import { useExperience } from '../../store/useExperience';
import { useChapterTimeline } from '../../animations/scroll/useChapterTimeline';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

export function SignatureSection() {
  const ref = useRef<HTMLDivElement>(null);
  const i = useExperience((s) => s.activeSignature);
  const w = SIGNATURE[i];
  const right = i % 2 === 1;
  useChapterTimeline(ref, (tl, q) => {
    tl.fromTo(
      q('[data-head] > *'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.02, duration: 0.05 },
      0,
    ).set({}, {}, 1);
  });
  return (
    <Section id="signature" label="Signature Collection" ref={ref}>
      <div data-head className="absolute left-6 top-24 md:left-12 md:top-28">
        <div className="eyebrow">08 — Signature Collection</div>
        <h2 className="display mt-3 text-4xl text-ivory md:text-6xl">The exhibition</h2>
      </div>
      <article
        key={w.id}
        aria-live="polite"
        className={`absolute bottom-24 max-w-sm animate-[fadeUp_0.9s_ease_both] md:bottom-[14vh] ${right ? 'left-6 md:left-auto md:right-16 md:text-right' : 'left-6 md:left-16'}`}
      >
        <div className="display text-[7rem] leading-none text-gold/15 md:text-[10rem]">{ROMAN[i]}</div>
        <div className="eyebrow -mt-8">{w.subtitle}</div>
        <h3 className="display mt-2 text-5xl text-ivory md:text-6xl">{w.name}</h3>
        <p className="mt-4 text-sm leading-relaxed text-muted">{w.description}</p>
        <ul
          className={`mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[10px] uppercase tracking-[0.22em] text-gold-light/80 ${right ? 'md:justify-end' : ''}`}
        >
          {w.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p className="mt-5 text-[10px] uppercase tracking-[0.25em] text-muted/60">Drag to inspect</p>
      </article>
      <div className="absolute right-6 top-28 flex gap-2 md:right-14" aria-hidden="true">
        {SIGNATURE.map((s, k) => (
          <span
            key={s.id}
            className={`h-px transition-all duration-500 ${k === i ? 'w-10 bg-gold-light' : 'w-4 bg-gold/30'}`}
          />
        ))}
      </div>
    </Section>
  );
}
