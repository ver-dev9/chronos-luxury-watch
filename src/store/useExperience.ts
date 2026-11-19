import { create } from 'zustand';
import type { ChapterId } from '../data/chapters';
import type { ComponentId } from '../data/components';

export type Quality = 'high' | 'medium' | 'low';

export type ConfigCase = 'gold' | 'silver' | 'titanium' | 'ceramic';
export type ConfigDial = 'obsidian' | 'champagne' | 'ivory' | 'midnight';
export type ConfigStrap = 'leatherBlack' | 'leatherBrown' | 'bracelet' | 'titaniumLink';
export type ConfigMarkers = 'gold' | 'silver' | 'minimal';

export interface Configuration {
  caseMaterial: ConfigCase;
  dial: ConfigDial;
  strap: ConfigStrap;
  markers: ConfigMarkers;
}

export const DEFAULT_CONFIG: Configuration = {
  caseMaterial: 'gold',
  dial: 'obsidian',
  strap: 'leatherBlack',
  markers: 'gold',
};

interface ExperienceState {
  loaded: boolean;
  chapter: ChapterId;
  /** the chapter whose 3D scene is currently mounted (lags `chapter` during transitions) */
  displayed: ChapterId;
  quality: Quality;
  autoQuality: boolean;
  sound: boolean;
  reducedMotion: boolean;
  activeCollection: number;
  showcaseOpen: boolean;
  selectedComponent: ComponentId | null;
  /** null = scroll controls separation; number = user-overridden explode amount */
  explodeOverride: number | null;
  config: Configuration;
  revealing: boolean;
  viewer: boolean;
  activeSignature: number;
  setLoaded: () => void;
  setChapter: (c: ChapterId) => void;
  setDisplayed: (c: ChapterId) => void;
  setQuality: (q: Quality, auto?: boolean) => void;
  toggleSound: () => void;
  setReducedMotion: (v: boolean) => void;
  setActiveCollection: (i: number) => void;
  setShowcase: (open: boolean) => void;
  selectComponent: (c: ComponentId | null) => void;
  setExplodeOverride: (v: number | null) => void;
  setConfig: <K extends keyof Configuration>(k: K, v: Configuration[K]) => void;
  resetConfig: () => void;
  setRevealing: (v: boolean) => void;
  setViewer: (v: boolean) => void;
  setActiveSignature: (i: number) => void;
}

function initialQuality(): Quality {
  if (typeof window === 'undefined') return 'high';
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (w < 768 || cores <= 4) return 'low';
  if (cores >= 12 && w >= 1280) return 'high';
  return 'medium';
}

export const useExperience = create<ExperienceState>((set) => ({
  loaded: false,
  chapter: 'intro',
  displayed: 'intro',
  quality: initialQuality(),
  autoQuality: true,
  sound: false,
  reducedMotion: false,
  activeCollection: 0,
  showcaseOpen: false,
  selectedComponent: null,
  explodeOverride: null,
  config: DEFAULT_CONFIG,
  revealing: false,
  viewer: false,
  activeSignature: 0,
  setLoaded: () => set({ loaded: true }),
  setChapter: (chapter) => set((s) => (s.chapter === chapter ? s : { chapter })),
  setDisplayed: (displayed) => set({ displayed }),
  setQuality: (quality, auto = false) => set({ quality, autoQuality: auto }),
  toggleSound: () => set((s) => ({ sound: !s.sound })),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setActiveCollection: (activeCollection) =>
    set((s) => (s.activeCollection === activeCollection ? s : { activeCollection })),
  setShowcase: (showcaseOpen) => set({ showcaseOpen }),
  selectComponent: (selectedComponent) => set({ selectedComponent }),
  setExplodeOverride: (explodeOverride) => set({ explodeOverride }),
  setConfig: (k, v) => set((s) => ({ config: { ...s.config, [k]: v } })),
  resetConfig: () => set({ config: DEFAULT_CONFIG }),
  setRevealing: (revealing) => set({ revealing }),
  setViewer: (viewer) => set({ viewer }),
  setActiveSignature: (activeSignature) =>
    set((s) => (s.activeSignature === activeSignature ? s : { activeSignature })),
}));
