/**
 * Mutable, non-reactive scroll + pointer state.
 * Written by GSAP ScrollTrigger callbacks and pointer listeners,
 * read inside useFrame loops. Never triggers React renders.
 */
import type { ChapterId } from '../data/chapters';

export const scrollState = {
  /** 0..1 progress of each chapter's pinned timeline */
  progress: {
    intro: 0,
    collections: 0,
    exploded: 0,
    movement: 0,
    materials: 0,
    time: 0,
    configurator: 0,
    signature: 0,
    craftsmanship: 0,
    finale: 0,
  } as Record<ChapterId, number>,
  /** 0..1 progress of the whole document */
  global: 0,
  /** scroll velocity (px/frame, smoothed) used for subtle motion blur / dust drift */
  velocity: 0,
  /** normalized pointer, -1..1 */
  pointer: { x: 0, y: 0 },
  /** user drag rotation offsets accumulated by the DragSurface (radians) */
  drag: { x: 0, y: 0 },
};

export function resetDrag() {
  scrollState.drag.x = 0;
  scrollState.drag.y = 0;
}
