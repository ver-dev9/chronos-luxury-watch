import type { Configuration } from '../../store/useExperience';
import type { WatchSpec } from '../../data/watches';

/** Maps atelier choices onto the procedural WatchSpec. */
export function specFromConfig(c: Configuration): WatchSpec {
  return {
    caseMaterial: c.caseMaterial === 'silver' ? 'steel' : c.caseMaterial,
    caseShape: 'round',
    bezel: c.caseMaterial === 'ceramic' ? 'tachymeter' : 'smooth',
    dial: 'sunburst',
    dialColor: c.dial,
    hands: 'dauphine',
    strap: c.strap,
    markers: c.markers,
  };
}

export const CONFIG_LABELS = {
  caseMaterial: { gold: 'Gold', silver: 'Silver', titanium: 'Titanium', ceramic: 'Black Ceramic' },
  dial: { obsidian: 'Obsidian Black', champagne: 'Champagne', ivory: 'Ivory', midnight: 'Midnight Blue' },
  strap: {
    leatherBlack: 'Black Leather',
    leatherBrown: 'Brown Leather',
    bracelet: 'Metallic Bracelet',
    titaniumLink: 'Dark Titanium',
  },
  markers: { gold: 'Gold Markers', silver: 'Silver Markers', minimal: 'Minimal Markers' },
} as const;
