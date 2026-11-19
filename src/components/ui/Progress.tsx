/** Scroll progress rail + chapter indicator (DOM, updated without React renders). */
import { useEffect, useRef } from 'react';
import { CHAPTERS } from '../../data/chapters';
import { useExperience } from '../../store/useExperience';
import { scrollState } from '../../store/scrollState';
import { scrollToChapter } from '../../animations/scroll/lenis';

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const viewer = useExperience((s) => s.viewer);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const g =
        scrollState.global ||
        window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
      if (bar.current) bar.current.style.transform = `scaleY(${g})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  if (viewer) return null;
  return (
    <div
      className="fixed right-5 top-1/2 z-40 hidden h-[38vh] w-px -translate-y-1/2 bg-gold/15 md:block"
      aria-hidden="true"
    >
      <div ref={bar} className="h-full w-full origin-top bg-gold-light" style={{ transform: 'scaleY(0)' }} />
    </div>
  );
}

export function ChapterIndicator() {
  const chapter = useExperience((s) => s.chapter);
  const viewer = useExperience((s) => s.viewer);
  const c = CHAPTERS.find((x) => x.id === chapter)!;
  if (viewer || chapter === 'configurator' || chapter === 'finale') return null;
  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-4 md:bottom-10 md:left-12">
      <div className="hidden flex-col gap-1.5 md:flex" role="navigation" aria-label="Chapters">
        {CHAPTERS.map((x) => (
          <button
            key={x.id}
            onClick={() => scrollToChapter(x.id)}
            aria-label={`Chapter ${x.index}: ${x.title}`}
            aria-current={x.id === chapter ? 'step' : undefined}
            className="group flex items-center gap-2"
          >
            <span
              className={`block h-px transition-all duration-500 ${x.id === chapter ? 'w-8 bg-gold-light' : 'w-3 bg-gold/30 group-hover:w-5 group-hover:bg-gold/70'}`}
            />
          </button>
        ))}
      </div>
      <div aria-live="polite">
        <div className="eyebrow">{c.index} / 10</div>
        <div className="display mt-1 text-lg text-ivory/90">{c.title}</div>
      </div>
    </div>
  );
}
