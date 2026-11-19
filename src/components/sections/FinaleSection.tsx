import { useRef } from 'react';
import { Section, Split } from './Section';
import { useChapterTimeline } from '../../animations/scroll/useChapterTimeline';
import { scrollToChapter } from '../../animations/scroll/lenis';
import { COLLECTIONS } from '../../data/watches';
import { scrollToCollection } from './CollectionsSection';

export function FinaleSection() {
  const ref = useRef<HTMLDivElement>(null);
  useChapterTimeline(ref, (tl, q) => {
    tl.fromTo(q('.char'), { opacity: 0, yPercent: 80 }, { opacity: 1, yPercent: 0, stagger: 0.02, duration: 0.12, ease: 'expo.out' }, 0.45)
      .fromTo(q('[data-sub]'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.08 }, 0.62)
      .fromTo(q('[data-foot]'), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.8)
      .set({}, {}, 1);
  });
  return (
    <Section id="finale" label="Finale" ref={ref}>
      <div className="absolute inset-x-0 top-[16vh] flex flex-col items-center px-6 text-center">
        <h2 className="display text-[18vw] leading-none tracking-[0.16em] text-ivory md:text-[10vw]">
          <Split text="CHRONOS" />
        </h2>
        <p data-sub className="eyebrow mt-4">The Art of Time.</p>
        <p data-sub className="display mt-3 text-xl italic text-ivory/80 md:text-2xl">Every second is a masterpiece.</p>
        <div data-sub className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-3">
          <button className="btn-luxe" onClick={() => scrollToChapter('top')}>Explore again ↺</button>
          <button className="chip" onClick={() => scrollToChapter('configurator')}>Atelier</button>
        </div>
      </div>
      <footer data-foot className="pointer-events-auto absolute inset-x-0 bottom-0 border-t border-gold/15 bg-ink/70 px-6 py-6 text-[10px] uppercase tracking-[0.22em] text-muted md:px-12">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <nav aria-label="Collections">
            <div className="mb-2 text-gold">Collections</div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {COLLECTIONS.map((c, i) => (
                <li key={c.id}>
                  <button className="hover:text-ivory" onClick={() => scrollToCollection(i)}>{c.name}</button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="max-w-md normal-case tracking-normal md:text-right">
            <div className="mb-1 uppercase tracking-[0.22em] text-gold">Credits</div>
            <p className="text-[11px] leading-relaxed text-muted/80">
              Concept, design & development: Dev Lawaniya. All watches, movements and materials are procedurally generated in Three.js — no third-party models.
              Built with React, TypeScript, Vite, React Three Fiber, Drei, GSAP ScrollTrigger, Lenis, postprocessing, Zustand & Tailwind CSS. Typefaces: Cormorant Garamond & Inter.
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted/60">© {new Date().getFullYear()} Chronos is a fictional brand — a creative portfolio study. Nothing here is for sale.</p>
          </div>
        </div>
      </footer>
    </Section>
  );
}
