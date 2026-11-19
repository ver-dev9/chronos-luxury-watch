import { useRef } from 'react';
import { Section } from './Section';
import { useChapterTimeline } from '../../animations/scroll/useChapterTimeline';

const LINES = ['Time is not', 'just measured.', 'It is crafted.'];

export function TimeSection() {
  const ref = useRef<HTMLDivElement>(null);
  useChapterTimeline(ref, (tl, q) => {
    tl.fromTo(q('[data-eyebrow]'), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.02);
    q('[data-word]').forEach((w, i) => {
      tl.fromTo(
        w,
        { opacity: 0, yPercent: 60, filter: 'blur(10px)' },
        { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.08 },
        0.08 + i * 0.07,
      );
    });
    tl.to(q('[data-quote]'), { opacity: 0, scale: 1.06, duration: 0.1 }, 0.9);
  });
  return (
    <Section id="time" label="The Art of Time" ref={ref}>
      <div data-quote className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <div data-eyebrow className="eyebrow mb-6">
          06 — The Art of Time
        </div>
        <blockquote className="display text-[11vw] uppercase leading-[0.95] text-ivory md:text-[6.4vw]">
          {LINES.map((line, li) => (
            <span key={li} className={`block ${li === 2 ? 'italic text-gold-light' : ''}`}>
              {line.split(' ').map((w, wi) => (
                <span key={wi} className="inline-block overflow-hidden align-bottom">
                  <span data-word className="inline-block">
                    {w}&nbsp;
                  </span>
                </span>
              ))}
            </span>
          ))}
        </blockquote>
      </div>
    </Section>
  );
}
