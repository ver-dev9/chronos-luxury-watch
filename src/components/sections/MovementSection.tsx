import { useRef } from 'react';
import { Section } from './Section';
import { useChapterTimeline } from '../../animations/scroll/useChapterTimeline';

const CAPTIONS = [
  { k: 'Mainspring barrel', t: 'Energy for roughly two days, released one beat at a time.', at: 0.22 },
  { k: 'Gear train', t: 'Centre, third and fourth wheels turn in coordinated ratios.', at: 0.4 },
  {
    k: 'Jewel bearings',
    t: 'Synthetic rubies at the pivots — almost no friction, almost no wear.',
    at: 0.52,
  },
  { k: 'Escapement', t: 'The pallet fork locks and releases the escape wheel: the tick.', at: 0.66 },
  { k: 'Balance wheel', t: 'Swinging back and forth, it divides time into equal parts.', at: 0.84 },
];

export function MovementSection() {
  const ref = useRef<HTMLDivElement>(null);
  useChapterTimeline(ref, (tl, q) => {
    tl.fromTo(
      q('[data-head] > *'),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.02, duration: 0.06 },
      0,
    ).to(q('[data-head]'), { opacity: 0, y: -40, duration: 0.06 }, 0.14);
    q('[data-cap]').forEach((el, i) => {
      const at = CAPTIONS[i].at;
      tl.fromTo(
        el,
        { opacity: 0, y: 30, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.05 },
        at - 0.06,
      ).to(el, { opacity: 0, y: -20, duration: 0.05 }, at + 0.08);
    });
    tl.set({}, {}, 1);
  });
  return (
    <Section id="movement" label="Inside the Movement" ref={ref}>
      <div data-head className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
        <div className="eyebrow">04 — Inside the Movement</div>
        <h2 className="display mt-4 text-5xl text-ivory md:text-8xl">A miniature universe</h2>
      </div>
      {CAPTIONS.map((c, i) => (
        <div
          key={c.k}
          data-cap
          className={`absolute bottom-[18vh] max-w-xs opacity-0 ${i % 2 ? 'right-6 text-right md:right-16' : 'left-6 md:left-16'}`}
        >
          <div className="eyebrow">{String(i + 1).padStart(2, '0')} · Macro</div>
          <h3 className="display mt-2 text-3xl text-ivory md:text-4xl">{c.k}</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted">{c.t}</p>
        </div>
      ))}
    </Section>
  );
}
