import { useRef } from 'react';
import { Section } from './Section';
import { useChapterTimeline } from '../../animations/scroll/useChapterTimeline';
import { useExperience } from '../../store/useExperience';
import { COMPONENTS, type ComponentId } from '../../data/components';
import { gsap } from '../../animations/scroll/lenis';

const ORDER: ComponentId[] = ['crystal', 'bezel', 'hands', 'markers', 'dial', 'motionWorks', 'case', 'plates', 'barrel', 'gearTrain', 'escapement', 'balance', 'hairspring', 'screws', 'caseback', 'strap', 'buckle'];

function Controls() {
  const override = useExperience((s) => s.explodeOverride);
  const set = useExperience((s) => s.setExplodeOverride);
  const proxy = useRef({ v: 0 });
  const animateTo = (v: number) => {
    const from = override ?? 0.5;
    proxy.current.v = from;
    gsap.to(proxy.current, { v, duration: 1.6, ease: 'power3.inOut', onUpdate: () => set(proxy.current.v) });
  };
  return (
    <div className="pointer-events-auto flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Exploded view controls">
        <button className="chip" onClick={() => animateTo(1)} aria-pressed={override === 1}>
          Disassemble
        </button>
        <button className="chip" onClick={() => animateTo(0)} aria-pressed={override === 0}>
          Reassemble
        </button>
        <button className="chip" onClick={() => set(null)} aria-pressed={override === null}>
          Follow scroll
        </button>
      </div>
      <label className="flex items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-muted">
        <span>Separation</span>
        <input
          className="luxe w-44"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={override ?? 0.5}
          onChange={(e) => set(parseFloat(e.target.value))}
          aria-label="Separation amount"
        />
      </label>
    </div>
  );
}

function InfoPanel() {
  const id = useExperience((s) => s.selectedComponent);
  const select = useExperience((s) => s.selectComponent);
  const c = id ? COMPONENTS[id] : null;
  return (
    <div aria-live="polite" className={`absolute right-6 top-28 w-[min(340px,86vw)] transition-all duration-500 md:right-14 md:top-1/2 md:-translate-y-1/2 ${c ? 'pointer-events-auto opacity-100' : 'pointer-events-none translate-x-6 opacity-0'}`}>
      {c && (
        <div className="glass-panel p-7">
          <div className="eyebrow">Component {String(ORDER.indexOf(c.id) + 1).padStart(2, '0')}</div>
          <h3 className="display mt-3 text-4xl text-ivory">{c.name}</h3>
          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-gold-light">{c.role}</p>
          <div className="rule my-5" />
          <p className="text-sm leading-relaxed text-muted">{c.text}</p>
          <button className="chip mt-6" onClick={() => select(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export function ExplodedSection() {
  const ref = useRef<HTMLDivElement>(null);
  const selected = useExperience((s) => s.selectedComponent);
  const select = useExperience((s) => s.selectComponent);
  useChapterTimeline(ref, (tl, q) => {
    tl.fromTo(q('[data-head] > *'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.03, duration: 0.1 }, 0)
      .fromTo(q('[data-steps] li'), { opacity: 0.25 }, { opacity: 1, stagger: 0.08, duration: 0.05 }, 0.12)
      .fromTo(q('[data-ui]'), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.5);
  });
  return (
    <Section id="exploded" label="The Exploded Watch" ref={ref}>
      <div data-head className="absolute left-6 top-24 max-w-md md:left-12 md:top-28">
        <div className="eyebrow">03 — The Exploded Watch</div>
        <h2 className="display mt-3 text-4xl text-ivory md:text-6xl">Anatomy of a second</h2>
        <p className="mt-4 hidden text-xs leading-relaxed text-muted md:block">
          Scroll to separate more than two hundred ideas into seventeen components. Select any part — in 3D or below — to learn what it does. This movement is an artistic interpretation, not a functional calibre.
        </p>
      </div>
      <ol data-steps className="absolute left-12 top-1/2 hidden -translate-y-1/2 space-y-2 text-[10px] uppercase tracking-[0.25em] text-muted lg:block" aria-hidden="true">
        {['Crystal', 'Bezel', 'Hands', 'Dial', 'Movement', 'Balance', 'Case back'].map((s, i) => (
          <li key={s}>
            <span className="mr-3 text-gold">{String(i + 1).padStart(2, '0')}</span>
            {s}
          </li>
        ))}
      </ol>
      <div data-ui className="absolute bottom-24 left-6 right-6 flex flex-col gap-5 md:bottom-12 md:left-auto md:right-14 md:items-end">
        <Controls />
        <div className="pointer-events-auto flex max-w-[640px] flex-wrap gap-1.5 md:justify-end" role="group" aria-label="Inspect a component">
          {ORDER.map((id) => (
            <button key={id} className="chip !px-2 !py-1 !text-[9px]" aria-pressed={selected === id} onClick={() => select(selected === id ? null : id)}>
              {COMPONENTS[id].name}
            </button>
          ))}
        </div>
      </div>
      <InfoPanel />
    </Section>
  );
}
