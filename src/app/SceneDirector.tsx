/**
 * Mounts exactly one chapter scene at a time (lazy, code-split), so the ten
 * scenes never render simultaneously. Chapter swaps are hidden behind either
 * the liquid-gold veil or a short black dip, then the previous scene unmounts
 * and its GPU resources are released.
 */
import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react';
import { useThree } from '@react-three/fiber';
import type * as THREE from 'three';
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
const GOLD = new Set([
  'materials>time',
  'time>materials',
  'craftsmanship>finale',
  'finale>craftsmanship',
  'intro>collections',
  'collections>intro',
]);

/** Preload neighbouring chapter chunks so swaps never wait on the network. */
const ORDER: ChapterId[] = [
  'intro',
  'collections',
  'exploded',
  'movement',
  'materials',
  'time',
  'configurator',
  'signature',
  'craftsmanship',
  'finale',
];
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

/**
 * Hides a freshly mounted scene's drawables on a layer the camera ignores,
 * compiles their shaders asynchronously (KHR_parallel_shader_compile where
 * available), then reveals them, so a chapter swap never freezes a frame.
 * Lights stay on layer 0 so programs compile with the final light setup.
 */
function Warm({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { gl, camera, scene } = useThree();
  useLayoutEffect(() => {
    const g = group.current;
    if (!g) return;
    const hidden: THREE.Object3D[] = [];
    g.traverse((o) => {
      const d = o as THREE.Mesh;
      if (d.isMesh || (o as THREE.Points).isPoints || (o as THREE.Line).isLine) {
        o.layers.set(31);
        hidden.push(o);
      }
    });
    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      hidden.forEach((o) => o.layers.set(0));
    };
    gl.compileAsync(g, camera, scene).then(show, show);
    const t = window.setTimeout(show, 1500);
    return () => {
      window.clearTimeout(t);
      show();
    };
  }, [gl, camera, scene]);
  return <group ref={group}>{children}</group>;
}

export function SceneDirector() {
  const chapter = useExperience((s) => s.chapter);
  const displayed = useExperience((s) => s.displayed);
  const setDisplayed = useExperience((s) => s.setDisplayed);
  const reduced = useExperience((s) => s.reducedMotion);

  // Once the page is idle, fetch every chapter chunk so later swaps never wait on the network.
  useEffect(() => {
    const warm = () => ORDER.forEach((c) => loaders[c]());
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const id = ric ? ric(warm) : window.setTimeout(warm, 2500);
    return () => {
      if (!ric) window.clearTimeout(id);
    };
  }, []);

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
      tl.to(veil, { current: 0.5, duration: 0.55, ease: 'power2.in', onComplete: swap })
        .to(veil, { current: 1, duration: 0.7, ease: 'power2.out' })
        .set(veil, { current: 0 });
      return () => {
        tl.progress(1).kill();
      };
    }
    const tl = gsap.timeline();
    tl.to(dip, { opacity: 1, duration: 0.28, ease: 'power2.in', onComplete: swap }).to(dip, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.05,
    });
    return () => {
      tl.progress(1).kill();
    };
  }, [chapter, displayed, reduced, setDisplayed]);

  const Scene = SCENES[displayed];
  return (
    <Suspense fallback={null}>
      <Warm key={displayed}>
        <Scene />
      </Warm>
    </Suspense>
  );
}
