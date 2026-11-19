import { useEffect, useRef, useState } from 'react';
import { Section } from './Section';
import { useExperience, type Configuration } from '../../store/useExperience';
import { CONFIG_LABELS } from '../../scenes/configurator/specFromConfig';
import { nudgeRotation } from '../../hooks/useDrag';
import { resetDrag } from '../../store/scrollState';
import { pauseScroll } from '../../animations/scroll/lenis';

const SWATCH: Record<string, string> = {
  gold: '#e9b964', silver: '#c8ccd2', titanium: '#8d9096', ceramic: '#111113',
  obsidian: '#0b0b0c', champagne: '#b99a62', ivory: '#ece4d2', midnight: '#0d1a33',
  leatherBlack: '#141210', leatherBrown: '#5a3420', bracelet: '#c8ccd2', titaniumLink: '#55585e',
  minimal: '#6d665a',
};

function Group<K extends keyof Configuration>({ k, title }: { k: K; title: string }) {
  const value = useExperience((s) => s.config[k]);
  const set = useExperience((s) => s.setConfig);
  const options = CONFIG_LABELS[k] as Record<string, string>;
  return (
    <fieldset className="mt-4">
      <legend className="eyebrow mb-2">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {Object.entries(options).map(([v, label]) => (
          <button key={v} className="chip flex items-center gap-2" aria-pressed={value === v} onClick={() => set(k, v as Configuration[K])}>
            <span className="h-2.5 w-2.5 rounded-full border border-white/20" style={{ background: SWATCH[v] ?? (k === 'markers' ? (v === 'gold' ? '#e9b964' : '#c8ccd2') : '#888') }} />
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function ConfiguratorSection() {
  const config = useExperience((s) => s.config);
  const reset = useExperience((s) => s.resetConfig);
  const revealing = useExperience((s) => s.revealing);
  const setRevealing = useExperience((s) => s.setRevealing);
  const viewer = useExperience((s) => s.viewer);
  const setViewer = useExperience((s) => s.setViewer);
  const [collapsed, setCollapsed] = useState(false);
  const timer = useRef<number>();

  const reveal = () => {
    setRevealing(true);
    pauseScroll(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setRevealing(false);
      pauseScroll(false);
    }, 6200);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const toggleFullscreen = async () => {
    const entering = !viewer;
    setViewer(entering);
    pauseScroll(entering);
    try {
      if (entering && !document.fullscreenElement) await document.documentElement.requestFullscreen?.();
      if (!entering && document.fullscreenElement) await document.exitFullscreen?.();
    } catch {
      /* fullscreen API may be unavailable (iOS); the immersive viewer still works */
    }
  };
  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement && useExperience.getState().viewer) {
        setViewer(false);
        pauseScroll(false);
      }
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, [setViewer]);

  const summary = `${CONFIG_LABELS.caseMaterial[config.caseMaterial]} case · ${CONFIG_LABELS.dial[config.dial]} dial · ${CONFIG_LABELS.strap[config.strap]} · ${CONFIG_LABELS.markers[config.markers]}`;

  return (
    <Section id="configurator" label="The Watch Configurator">
      <div className={`fixed inset-0 z-[70] flex flex-col items-center justify-end pb-[12vh] text-center transition-opacity duration-1000 ${revealing ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-live="polite">
        {revealing && (
          <>
            <div className="eyebrow">Your Creation</div>
            <div className="display mt-3 text-5xl text-ivory md:text-7xl">Chronos Atelier</div>
            <p className="mt-3 max-w-xl px-6 text-xs uppercase tracking-[0.25em] text-muted">{summary}</p>
          </>
        )}
      </div>

      <div className={`${viewer ? 'fixed z-[70]' : 'absolute'} bottom-6 right-6 flex gap-2 md:bottom-10 md:right-14 ${revealing ? 'opacity-0' : ''} pointer-events-auto`} role="group" aria-label="Rotate watch">
        <button className="chip" onClick={() => nudgeRotation(-0.5)} aria-label="Rotate left">←</button>
        <button className="chip" onClick={() => nudgeRotation(0, -0.3)} aria-label="Tilt up">↑</button>
        <button className="chip" onClick={() => nudgeRotation(0, 0.3)} aria-label="Tilt down">↓</button>
        <button className="chip" onClick={() => nudgeRotation(0.5)} aria-label="Rotate right">→</button>
        <button className="chip" onClick={() => resetDrag()} aria-label="Reset view">Center</button>
        <button className="chip" onClick={toggleFullscreen} aria-pressed={viewer}>{viewer ? 'Exit full view' : 'Fullscreen'}</button>
      </div>

      {!viewer && (
        <div className={`pointer-events-auto absolute left-0 right-0 bottom-0 max-h-[52svh] overflow-y-auto p-5 transition-opacity duration-500 md:left-12 md:right-auto md:top-1/2 md:bottom-auto md:max-h-[84vh] md:w-[420px] md:-translate-y-1/2 md:p-0 ${revealing ? 'opacity-0' : ''}`}>
          <div className="glass-panel p-6 md:p-7">
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow">07 — The Atelier</div>
                <h2 className="display mt-2 text-3xl text-ivory md:text-4xl">Compose your piece</h2>
              </div>
              <button className="chip md:hidden" onClick={() => setCollapsed((c) => !c)} aria-expanded={!collapsed}>
                {collapsed ? 'Edit' : 'Hide'}
              </button>
            </div>
            <div className={collapsed ? 'hidden' : ''}>
              <Group k="caseMaterial" title="Case Material" />
              <Group k="dial" title="Dial" />
              <Group k="strap" title="Strap" />
              <Group k="markers" title="Details" />
              <div className="rule my-5" />
              <div className="eyebrow mb-2">Configuration</div>
              <p className="text-xs leading-relaxed text-ivory/80">{summary}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted/70">A creative study — not available to order.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="btn-luxe" onClick={reveal} disabled={revealing}>
                  Reveal your creation
                </button>
                <button className="chip" onClick={() => { reset(); resetDrag(); }}>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
