import { useEffect, useState } from 'react';
import { NAV_LINKS } from '../../data/chapters';
import { scrollToChapter } from '../../animations/scroll/lenis';
import { useExperience, type Quality } from '../../store/useExperience';
import { sound } from '../../audio/SoundEngine';

function SoundToggle() {
  const on = useExperience((s) => s.sound);
  const toggle = useExperience((s) => s.toggleSound);
  useEffect(() => {
    if (on) void sound.enable();
    else sound.disable();
  }, [on]);
  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Mute sound' : 'Enable sound'}
      className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted transition-colors hover:text-ivory"
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        {[0.5, 1, 0.7, 0.9].map((h, i) => (
          <span
            key={i}
            className="w-[2px] bg-gold transition-all duration-500"
            style={{
              height: on ? `${h * 100}%` : '15%',
              animation: on ? `pulse ${0.6 + i * 0.15}s ease-in-out infinite alternate` : 'none',
            }}
          />
        ))}
      </span>
      <span className="hidden sm:inline">Sound {on ? 'On' : 'Off'}</span>
    </button>
  );
}

function QualityToggle() {
  const q = useExperience((s) => s.quality);
  const auto = useExperience((s) => s.autoQuality);
  const set = useExperience((s) => s.setQuality);
  const levels: Quality[] = ['high', 'medium', 'low'];
  return (
    <div className="hidden items-center gap-2 lg:flex" role="group" aria-label="Rendering quality">
      <span className="text-[9px] uppercase tracking-[0.3em] text-muted/70">{auto ? 'Auto' : 'Quality'}</span>
      {levels.map((l) => (
        <button
          key={l}
          onClick={() => set(l, false)}
          aria-pressed={q === l}
          className={`text-[9px] uppercase tracking-[0.25em] transition-colors ${q === l ? 'text-gold-light' : 'text-muted/60 hover:text-ivory'}`}
        >
          {l[0]}
        </button>
      ))}
    </div>
  );
}

export function Nav() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const viewer = useExperience((s) => s.viewer);
  useEffect(() => {
    const on = () => setCompact(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  if (viewer) return null;
  const go = (id: Parameters<typeof scrollToChapter>[0]) => {
    setOpen(false);
    scrollToChapter(id);
  };
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${compact ? 'py-4' : 'py-7'}`}>
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-b from-ink/80 to-transparent transition-opacity duration-700 ${compact ? 'opacity-100' : 'opacity-0'}`}
      />
      <nav
        className="mx-auto flex max-w-[1800px] items-center justify-between px-6 md:px-12"
        aria-label="Primary"
      >
        <button
          onClick={() => go('top')}
          className="display text-xl tracking-[0.45em] text-ivory md:text-2xl"
          aria-label="CHRONOS — back to the beginning"
        >
          CHRONOS
        </button>
        <ul className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.target}>
              <button
                onClick={() => go(l.target)}
                className="group relative text-[10px] uppercase tracking-[0.34em] text-muted transition-colors hover:text-ivory"
              >
                {l.label}
                <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-6">
          <QualityToggle />
          <SoundToggle />
          <button
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`block h-px w-6 bg-ivory transition-transform ${open ? 'translate-y-[3px] rotate-45' : ''}`}
            />
            <span
              className={`mt-[6px] block h-px w-6 bg-ivory transition-transform ${open ? '-translate-y-[4px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </nav>
      <div
        id="mobile-menu"
        className={`fixed inset-0 -z-10 flex flex-col items-center justify-center gap-8 bg-ink/95 transition-opacity duration-500 md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        {NAV_LINKS.map((l, i) => (
          <button
            key={l.target}
            onClick={() => go(l.target)}
            className="display text-4xl text-ivory"
            tabIndex={open ? 0 : -1}
          >
            <span className="mr-4 align-middle text-xs tracking-[0.3em] text-gold">0{i + 1}</span>
            {l.label}
          </button>
        ))}
      </div>
      <style>{`@keyframes pulse{from{transform:scaleY(.4)}to{transform:scaleY(1)}}`}</style>
    </header>
  );
}
