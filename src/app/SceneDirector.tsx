/**
 * Mounts exactly one chapter scene at a time (lazy, code-split), so the ten
 * scenes never render simultaneously. Chapter swaps are hidden behind either
 * the liquid-gold veil or a short black dip, then the previous scene unmounts
 * and its GPU resources are released.
 */
import { lazy, Suspense, useEffect, type ComponentType, type LazyExoticComponent } from 'react';
import { useExperience } from '../store/useExperience';
import type { ChapterId } from '../data/chapters';
import { gsap } from '../animations/scroll/lenis';
import { veil } from '../shaders/gold/LiquidGold';
import { resetDrag } from '../store/scrollState';

const SCENES: Record<ChapterId, LazyExoticComponent<ComponentType>> = {
  intro: lazy(() => import('../scenes/intro/IntroScene')),
  collections: lazy(() => import('../scenes/collections/CollectionsScene')),
  exploded: lazy(() => import('../scenes/exploded-watch/ExplodedScene')),
  movement: lazy(() => import('../scenes/movement/MovementScene')),
  materials: lazy(() => import('../scenes/materials/MaterialsScene')),
  time: lazy(() => import('../scenes/time/TimeScene')),
  configurator: lazy(() => import('../scenes/configurator/ConfiguratorScene')),
  signature: lazy(() => import('../scenes/signature/SignatureScene')),
  craftsmanship: lazy(() => import('../scenes/craftsmanship/CraftsmanshipScene')),
  finale: lazy(() => import('../scenes/finale/FinaleScene')),
};

/** Boundaries that use the liquid-gold transition (art-directed, not everywhere). */
const GOLD = new Set(['materials>time', 'time>materials', 'craftsmanship>finale', 'finale>craftsmanship', 'intro>collections', 'collections>intro']);

/** Preload neighbouring chapter chunks so swaps never wait on the network. */
const ORDER: ChapterId[] = ['intro', 'collections', 'exploded', 'movement', 'materials', 'time', 'configurator', 'signature', 'craftsmanship', 'finale'];
const loaders: Record<ChapterId, () => Promise<unknown>> = {
  intro: () => import('../scenes/intro/IntroScene'),
  collections: () => import('../scenes/collections/CollectionsScene'),
  exploded: () => import('../scenes/exploded-watch/ExplodedScene'),
  movement: () => import('../scenes/movement/MovementScene'),
  materials: () => import('../scenes/materials/MaterialsScene'),
  time: () => import('../scenes/time/TimeScene'),
  configurator: () => import('../scenes/configurator/ConfiguratorScene'),
  signature: () => import('../scenes/signature/SignatureScene'),
  craftsmanship: () => import('../scenes/craftsmanship/CraftsmanshipScene'),
  finale: () => import('../scenes/finale/FinaleScene'),
};

export function SceneDirector() {
  const chapter = useExperience((s) => s.chapter);
  const displayed = useExperience((s) => s.displayed);
  const setDisplayed = useExperience((s) => s.setDisplayed);
  const reduced = useExperience((s) => s.reducedMotion);

  useEffect(() => {
    const i = ORDER.indexOf(chapter);
    [ORDER[i - 1], ORDER[i + 1]].forEach((c) => c && loaders[c]());
  }, [chapter]);

  useEffect(() => {
    if (chapter === displayed) return;
    const dip = document.getElementById('transition-dip');
    const swap = () => {
      resetDrag();
      setDisplayed(chapter);
    };
    if (reduced) {
      swap();
      return;
    }
    if (GOLD.has(`${displayed}>${chapter}`)) {
      const tl = gsap.timeline();
      veil.current = 0;
      tl.to(veil, { current: 0.5, duration: 0.55, ease: 'power2.in', onComplete: swap }).to(veil, { current: 1, duration: 0.7, ease: 'power2.out' }).set(veil, { current: 0 });
      return () => {
        tl.progress(1).kill();
      };
    }
    const tl = gsap.timeline();
    tl.to(dip, { opacity: 1, duration: 0.28, ease: 'power2.in', onComplete: swap }).to(dip, { opacity: 0, duration: 0.5, ease: 'power2.out', delay: 0.05 });
    return () => {
      tl.progress(1).kill();
    };
  }, [chapter, displayed, reduced, setDisplayed]);

  const Scene = SCENES[displayed];
  return (
    <Suspense fallback={null}>
      <Scene key={displayed} />
    </Suspense>
  );
}
