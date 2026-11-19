import { useEffect } from 'react';
import { useExperience } from '../store/useExperience';

/** Mirrors prefers-reduced-motion into the store (live). */
export function useReducedMotionSync() {
  const set = useExperience((s) => s.setReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => set(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [set]);
}
