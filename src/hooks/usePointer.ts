import { useEffect } from 'react';
import { scrollState } from '../store/scrollState';

/** Global normalized pointer, written to the non-reactive store. */
export function usePointerSync() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      scrollState.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      scrollState.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
}
