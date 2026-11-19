import { useEffect } from 'react';
import { scrollState } from '../store/scrollState';
import { useExperience } from '../store/useExperience';
import type { ChapterId } from '../data/chapters';

const DRAGGABLE: ChapterId[] = ['intro', 'collections', 'exploded', 'configurator', 'signature'];

/**
 * Global drag-to-rotate. Pointer-downs that land on the WebGL canvas (the
 * DOM overlay is pointer-events:none except for controls) rotate the active
 * scene's hero object. Horizontal touch drags rotate; vertical ones scroll.
 */
export function useGlobalDrag() {
  useEffect(() => {
    let last: { x: number; y: number } | null = null;
    let decided = false;
    let rotating = false;
    const down = (e: PointerEvent) => {
      if (!(e.target instanceof HTMLCanvasElement)) return;
      if (!DRAGGABLE.includes(useExperience.getState().displayed)) return;
      last = { x: e.clientX, y: e.clientY };
      decided = e.pointerType !== 'touch';
      rotating = decided;
      if (rotating) document.body.dataset.dragging = 'true';
    };
    const move = (e: PointerEvent) => {
      if (!last) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      if (!decided) {
        if (Math.abs(dx) + Math.abs(dy) < 6) return;
        decided = true;
        rotating = Math.abs(dx) > Math.abs(dy);
      }
      if (!rotating) return;
      scrollState.drag.y += dx * 0.008;
      scrollState.drag.x = Math.max(-1.1, Math.min(1.1, scrollState.drag.x + dy * 0.006));
      last = { x: e.clientX, y: e.clientY };
    };
    const up = () => {
      last = null;
      rotating = false;
      delete document.body.dataset.dragging;
    };
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);
}

/** Nudge rotation from buttons/keyboard (accessible alternative to dragging). */
export function nudgeRotation(dy: number, dx = 0) {
  scrollState.drag.y += dy;
  scrollState.drag.x = Math.max(-1.1, Math.min(1.1, scrollState.drag.x + dx));
}
