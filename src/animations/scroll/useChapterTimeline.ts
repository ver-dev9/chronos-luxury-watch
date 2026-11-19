/**
 * Builds a scrubbed GSAP timeline bound to a chapter section. Timelines are
 * created inside gsap.context so they revert cleanly on unmount/refresh and
 * play in reverse naturally when scrolling back.
 */
import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from './lenis';
import { useExperience } from '../../store/useExperience';

export function useChapterTimeline(
  scope: RefObject<HTMLElement>,
  build: (tl: gsap.core.Timeline, q: (sel: string) => Element[]) => void,
  opts: { start?: string; end?: string; scrub?: number | boolean } = {},
) {
  const loaded = useExperience((s) => s.loaded);
  const reduced = useExperience((s) => s.reducedMotion);
  useLayoutEffect(() => {
    if (!scope.current || !loaded) return;
    const section = scope.current.closest('section') ?? scope.current;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(scope.current);
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: section,
          start: opts.start ?? 'top top',
          end: opts.end ?? 'bottom bottom',
          scrub: reduced ? true : (opts.scrub ?? 0.2),
        },
      });
      build(tl, q);
    }, scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, reduced]);
}
