/**
 * One ScrollTrigger per chapter. Each writes its 0..1 progress into the
 * non-reactive scrollState (read by the 3D scenes every frame) and flips the
 * active chapter in Zustand only when the chapter actually changes.
 */
import { useEffect } from 'react';
import { CHAPTERS } from '../../data/chapters';
import { scrollState } from '../../store/scrollState';
import { useExperience } from '../../store/useExperience';
import { ScrollTrigger } from './lenis';

export function useChapterTriggers(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const setChapter = useExperience.getState().setChapter;
    const triggers = CHAPTERS.flatMap((c) => {
      const el = document.getElementById(`chapter-${c.id}`);
      if (!el) return [];
      const progress = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          scrollState.progress[c.id] = self.progress;
        },
        onLeave: () => (scrollState.progress[c.id] = 1),
        onLeaveBack: () => (scrollState.progress[c.id] = 0),
      });
      const active = ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) setChapter(c.id);
        },
      });
      const stage = el.querySelector<HTMLElement>('[data-stage]');
      const pin =
        stage && c.length > 1
          ? ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', pin: stage, pinSpacing: false })
          : null;
      return [progress, active, ...(pin ? [pin] : [])];
    });
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);
    ScrollTrigger.refresh();
    return () => {
      window.removeEventListener('resize', onResize);
      triggers.forEach((t) => t.kill());
    };
  }, [enabled]);
}
