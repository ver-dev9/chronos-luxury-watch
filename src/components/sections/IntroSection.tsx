import { useEffect, useRef } from 'react';
import { Section, Split } from './Section';
import { useChapterTimeline } from '../../animations/scroll/useChapterTimeline';
import { gsap } from '../../animations/scroll/lenis';
import { introState } from '../../animations/intro/introState';
import { useExperience } from '../../store/useExperience';

export function IntroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useExperience((s) => s.loaded);
  const reduced = useExperience((s) => s.reducedMotion);

  // opening sequence: black → light → dust → silhouette → approach → reflections → title
  useEffect(() => {
    if (!loaded || !ref.current) return;
    const q = gsap.utils.selector(ref.current);
    if (reduced) {
      Object.assign(introState, { light: 1, dust: 1, silhouette: 1, reveal: 1, approach: 1, done: true });
      gsap.set(q('.char, [data-intro]'), { opacity: 1, y: 0 });
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.set(q('.char'), { opacity: 0, y: 60 })
      .set(q('[data-intro]'), { opacity: 0, y: 20 })
      .to(introState, { light: 1, duration: 1.4 }, 0.3)
      .to(introState, { dust: 1, duration: 2.4 }, 1.0)
      .to(introState, { silhouette: 1, duration: 1.8 }, 1.8)
      .to(introState, { approach: 1, duration: 4.2, ease: 'power3.inOut' }, 1.6)
      .to(introState, { reveal: 1, duration: 2.2 }, 3.2)
      .to(q('.char'), { opacity: 1, y: 0, duration: 1.4, stagger: 0.07, ease: 'expo.out' }, 4.6)
      .to(q('[data-intro]'), { opacity: 1, y: 0, duration: 1.2, stagger: 0.18, ease: 'power3.out' }, 5.2)
      .add(() => void (introState.done = true));
    return () => void tl.kill();
  }, [loaded, reduced]);

  useChapterTimeline(ref, (tl, q) => {
    tl.to(q('[data-title]'), { yPercent: -40, opacity: 0, ease: 'none' }, 0.1)
      .to(q('[data-cue]'), { opacity: 0, ease: 'none' }, 0)
      .to(q('[data-aside]'), { opacity: 0, y: -30, ease: 'none' }, 0.2);
  });

  return (
    <Section id="intro" label="Introduction" ref={ref}>
      <div
        data-title
        className="absolute inset-x-0 bottom-[16vh] flex flex-col items-center text-center md:bottom-[13vh]"
      >
        <h1 className="display text-[19vw] leading-none tracking-[0.18em] text-ivory md:text-[11vw]">
          <Split text="CHRONOS" />
        </h1>
        <p data-intro className="eyebrow mt-4 md:mt-6">
          The Art of Time
        </p>
        <p data-intro className="display mt-4 text-lg italic text-ivory/80 md:text-2xl">
          Every second is a masterpiece.
        </p>
      </div>
      <div
        data-aside
        data-intro
        className="absolute left-6 top-[22vh] hidden max-w-[220px] md:left-12 md:block"
      >
        <div className="eyebrow mb-3">Haute Horlogerie</div>
        <p className="text-xs leading-relaxed text-muted">
          A fictional maison, rendered entirely in real-time 3D. Drag to turn the watch. Scroll to begin.
        </p>
      </div>
      <div data-cue data-intro className="absolute bottom-8 right-6 flex items-center gap-4 md:right-12">
        <span className="eyebrow text-muted">Scroll</span>
        <span className="scroll-cue relative h-10 w-px overflow-hidden bg-gold/20" />
      </div>
    </Section>
  );
}
