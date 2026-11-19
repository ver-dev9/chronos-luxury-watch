import { useEffect, useRef } from 'react';
import { Section } from './Section';
import { COLLECTIONS } from '../../data/watches';
import { useChapterTimeline } from '../../animations/scroll/useChapterTimeline';
import { useExperience } from '../../store/useExperience';
import { pauseScroll, scrollToChapter } from '../../animations/scroll/lenis';
import { CHAPTERS } from '../../data/chapters';

const ROMAN = ['I', 'II', 'III', 'IV'];

/** Scroll to a given collection panel inside the horizontal gallery. */
export function scrollToCollection(i: number) {
  const len = CHAPTERS.find((c) => c.id === 'collections')!.length - 1;
  scrollToChapter('collections', (i / (COLLECTIONS.length - 1)) * len);
}

function Showcase() {
  const open = useExperience((s) => s.showcaseOpen);
  const i = useExperience((s) => s.activeCollection);
  const setShowcase = useExperience((s) => s.setShowcase);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    pauseScroll(open);
    if (open) closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowcase(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setShowcase]);
  const c = COLLECTIONS[i];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${c.name} showcase`}
      aria-hidden={!open}
      className={`absolute inset-y-0 right-0 z-20 flex w-full flex-col justify-end p-6 transition-all duration-700 md:w-[42vw] md:justify-center md:p-14 ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none translate-x-10 opacity-0'}`}
    >
      <div className="glass-panel p-8 md:p-10">
        <div className="eyebrow">Collection {ROMAN[i]} · Showcase</div>
        <h3 className="display mt-4 text-5xl text-ivory md:text-6xl">{c.name}</h3>
        <p className="display mt-2 text-xl italic text-gold-light">{c.subtitle}</p>
        <div className="rule my-6" />
        <p className="text-sm leading-relaxed text-muted">{c.description}</p>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.2em]">
          {[
            ['Case', `${c.spec.caseShape} · ${c.spec.caseMaterial.replace('roseGold', 'rose gold')}`],
            ['Bezel', c.spec.bezel],
            ['Dial', `${c.spec.dial} · ${c.spec.dialColor}`],
            ['Hands', c.spec.hands],
            ['Strap', c.spec.strap.replace(/([A-Z])/g, ' $1')],
            ['Complication', c.spec.tourbillon ? 'Tourbillon' : c.spec.subdials ? 'Registers' : 'Time only'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-gold/80">{k}</dt>
              <dd className="mt-1 text-ivory/90">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-muted/70">
          Drag the watch to inspect it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            ref={closeRef}
            className="btn-luxe"
            onClick={() => setShowcase(false)}
            tabIndex={open ? 0 : -1}
          >
            Return to gallery
          </button>
          <button
            className="chip"
            tabIndex={open ? 0 : -1}
            onClick={() => useExperience.getState().setActiveCollection((i + 1) % COLLECTIONS.length)}
          >
            Next piece →
          </button>
        </div>
      </div>
    </div>
  );
}

export function CollectionsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const showcase = useExperience((s) => s.showcaseOpen);
  const setShowcase = useExperience((s) => s.setShowcase);
  useChapterTimeline(
    ref,
    (tl, q) => {
      tl.fromTo(q('[data-head]'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.06 }, 0)
        .to(
          q('[data-track]'),
          { xPercent: -((COLLECTIONS.length - 1) / COLLECTIONS.length) * 100, ease: 'none', duration: 1 },
          0,
        )
        .to(q('[data-head]'), { opacity: 0, duration: 0.06 }, 0.94);
    },
    { scrub: 0.15 },
  );

  return (
    <Section id="collections" label="The Collection" ref={ref}>
      <div
        data-head
        className={`absolute left-6 top-24 transition-opacity duration-500 md:left-12 md:top-28 ${showcase ? 'opacity-0' : ''}`}
      >
        <div className="eyebrow">02 — The Collection</div>
        <h2 className="display mt-3 text-4xl text-ivory md:text-6xl">Four houses of time</h2>
      </div>
      <div
        data-track
        className={`absolute inset-y-0 left-0 flex transition-opacity duration-500 ${showcase ? 'opacity-0' : 'opacity-100'}`}
        style={{ width: `${COLLECTIONS.length * 100}vw` }}
      >
        {COLLECTIONS.map((c, i) => (
          <article key={c.id} className="relative h-full w-screen" aria-label={c.name}>
            <div className="absolute bottom-24 left-6 max-w-[88vw] md:bottom-[14vh] md:left-12 md:max-w-[360px]">
              <div className="display text-7xl text-gold/25 md:text-8xl">{ROMAN[i]}</div>
              <h3 className="display -mt-6 text-4xl text-ivory md:text-5xl">{c.name}</h3>
              <p className="display mt-1 text-lg italic text-gold-light">{c.subtitle}</p>
              <p className="mt-4 hidden text-xs leading-relaxed text-muted md:block">{c.description}</p>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.22em] text-ivory/70">
                {c.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                className="btn-luxe mt-7"
                onClick={() => {
                  useExperience.getState().setActiveCollection(i);
                  setShowcase(true);
                }}
              >
                Explore Collection <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        ))}
      </div>
      <div
        className={`absolute bottom-10 right-6 hidden items-center gap-3 md:right-14 md:flex ${showcase ? 'opacity-0' : ''}`}
      >
        {COLLECTIONS.map((c, i) => (
          <button
            key={c.id}
            className="pointer-events-auto text-[10px] tracking-[0.3em] text-muted hover:text-ivory"
            onClick={() => scrollToCollection(i)}
            aria-label={`Go to ${c.name}`}
          >
            {ROMAN[i]}
          </button>
        ))}
      </div>
      <Showcase />
    </Section>
  );
}
