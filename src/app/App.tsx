import { useCallback, useEffect, useState } from 'react';
import { Experience } from './Experience';
import { Loader } from '../components/loading/Loader';
import { Nav } from '../components/navigation/Nav';
import { Cursor } from '../components/cursor/Cursor';
import { ChapterIndicator, ScrollProgress } from '../components/ui/Progress';
import { IntroSection } from '../components/sections/IntroSection';
import { CollectionsSection } from '../components/sections/CollectionsSection';
import { ExplodedSection } from '../components/sections/ExplodedSection';
import { MovementSection } from '../components/sections/MovementSection';
import { MaterialsSection } from '../components/sections/MaterialsSection';
import { TimeSection } from '../components/sections/TimeSection';
import { ConfiguratorSection } from '../components/sections/ConfiguratorSection';
import { SignatureSection } from '../components/sections/SignatureSection';
import { CraftSection } from '../components/sections/CraftSection';
import { FinaleSection } from '../components/sections/FinaleSection';
import { useExperience } from '../store/useExperience';
import { useReducedMotionSync } from '../hooks/useReducedMotion';
import { usePointerSync } from '../hooks/usePointer';
import { useGlobalDrag } from '../hooks/useDrag';
import { startLenis } from '../animations/scroll/lenis';
import { useChapterTriggers } from '../animations/scroll/useChapterTriggers';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function App() {
  const [progress, setProgress] = useState(5);
  const [fontsReady, setFontsReady] = useState(false);
  const [webgl] = useState(hasWebGL);
  const loaded = useExperience((s) => s.loaded);
  const setLoaded = useExperience((s) => s.setLoaded);
  const reduced = useExperience((s) => s.reducedMotion);
  const viewer = useExperience((s) => s.viewer);

  useReducedMotionSync();
  usePointerSync();
  useGlobalDrag();

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const fonts = Promise.all([
      document.fonts.load('300 40px "Cormorant Garamond"'),
      document.fonts.load('500 40px "Cormorant Garamond"'),
      document.fonts.load('400 12px Inter'),
    ]).catch(() => undefined);
    const timeout = new Promise((r) => setTimeout(r, 3500));
    Promise.race([fonts, timeout]).then(() => {
      setFontsReady(true);
      setProgress(45);
    });
  }, []);

  const onReady = useCallback(() => {
    setProgress(100);
    setTimeout(setLoaded, 700);
  }, [setLoaded]);

  useEffect(() => {
    if (!loaded) return;
    return startLenis(reduced);
  }, [loaded, reduced]);
  useChapterTriggers(loaded);

  useEffect(() => {
    document.body.style.overflow = loaded ? '' : 'hidden';
  }, [loaded]);

  return (
    <>
      <a
        href="#chapter-collections"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:bg-ink focus:p-3 focus:text-gold"
      >
        Skip the introduction
      </a>
      <Loader progress={webgl ? progress : 100} done={loaded || !webgl} />
      {webgl && fontsReady && <Experience onReady={onReady} />}
      {!webgl && <NoWebGL onReady={setLoaded} />}
      <div className="vignette-css pointer-events-none fixed inset-0 z-[1]" aria-hidden="true" />
      <div
        id="transition-dip"
        className="pointer-events-none fixed inset-0 z-[2] bg-ink opacity-0"
        aria-hidden="true"
      />
      <Nav />
      <Cursor />
      <ScrollProgress />
      <ChapterIndicator />
      <main className={`pointer-events-none relative z-10 ${viewer ? 'invisible' : ''}`}>
        <IntroSection />
        <CollectionsSection />
        <ExplodedSection />
        <MovementSection />
        <MaterialsSection />
        <TimeSection />
        <ConfiguratorSection />
        <SignatureSection />
        <CraftSection />
        <FinaleSection />
      </main>
    </>
  );
}

function NoWebGL({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return (
    <div className="fixed inset-0 z-0 grid place-items-center bg-ink p-8 text-center">
      <p className="max-w-md text-sm text-muted">
        This exhibition is rendered in WebGL, which isn’t available in this browser. The story and text remain
        fully readable as you scroll.
      </p>
    </div>
  );
}
