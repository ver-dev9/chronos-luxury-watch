/**
 * Lenis smooth scrolling, synchronised with GSAP ScrollTrigger through the
 * GSAP ticker so there is exactly one RAF driving scroll + triggers.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollState } from '../../store/scrollState';
import type { ChapterId } from '../../data/chapters';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let tick: ((t: number) => void) | null = null;

export function startLenis(reducedMotion: boolean) {
  stopLenis();
  if (reducedMotion) {
    const onScroll = () => {
      scrollState.global = window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
  lenis.on('scroll', (l: Lenis) => {
    scrollState.velocity = l.velocity;
    scrollState.global = l.progress;
    ScrollTrigger.update();
  });
  tick = (t: number) => lenis?.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return stopLenis;
}

export function stopLenis() {
  if (tick) gsap.ticker.remove(tick);
  tick = null;
  lenis?.destroy();
  lenis = null;
}

export function pauseScroll(paused: boolean) {
  if (!lenis) {
    document.documentElement.style.overflow = paused ? 'hidden' : '';
    return;
  }
  if (paused) lenis.stop();
  else lenis.start();
}

export function scrollToChapter(id: ChapterId | 'top', offsetVh = 0) {
  const el = id === 'top' ? document.body : document.getElementById(`chapter-${id}`);
  if (!el) return;
  const y = id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY + offsetVh * innerHeight;
  if (lenis) lenis.scrollTo(y, { duration: 2.2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: 'auto' });
}

export { gsap, ScrollTrigger };
