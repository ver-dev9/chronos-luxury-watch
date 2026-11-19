export interface MaterialStory {
  key: 'gold' | 'titanium' | 'steel' | 'sapphire' | 'ceramic' | 'carbon' | 'leather' | 'gem';
  name: string;
  line: string;
  stat: string;
}

export const MATERIAL_STORIES: MaterialStory[] = [
  { key: 'gold', name: '18K-Style Gold', line: 'Warm, dense, mirror-polished. The oldest language of luxury.', stat: 'Metalness 1.0 · Roughness 0.18' },
  { key: 'titanium', name: 'Titanium', line: 'Grey, cool, almost weightless — brushed to a soft satin.', stat: 'Metalness 1.0 · Roughness 0.42' },
  { key: 'steel', name: 'Stainless Steel', line: 'Bright and precise. Alternating polished and brushed facets.', stat: 'Metalness 1.0 · Roughness 0.24' },
  { key: 'sapphire', name: 'Sapphire Crystal', line: 'Transparent armour. Light bends through it without a trace.', stat: 'Transmission 1.0 · IOR 1.77' },
  { key: 'ceramic', name: 'Ceramic', line: 'Deep black, scratch-proof, with a liquid lacquered gloss.', stat: 'Dielectric · Clearcoat 1.0' },
  { key: 'carbon', name: 'Carbon Composite', line: 'Woven fibre under resin. Every case is unique.', stat: 'Anisotropic weave · Clearcoat' },
  { key: 'leather', name: 'Leather', line: 'Supple grain, hand-stitched, edge-painted in seven layers.', stat: 'Sheen 0.6 · Roughness 0.75' },
  { key: 'gem', name: 'Precious Stones', line: 'Faceted to return light. Brilliance measured in fractions of a degree.', stat: 'Transmission · Dispersion · IOR 2.4' },
];

export const CRAFT_STEPS = [
  { title: 'Precision Machining', text: 'Cases begin as solid bar stock, milled to tolerances finer than a human hair.' },
  { title: 'Gear Cutting', text: 'Wheels are stamped, then each tooth is shaped and polished for minimal friction.' },
  { title: 'Polishing', text: 'Bevels are hand-polished on rotating wheels, edge by edge, until they hold a line of light.' },
  { title: 'Assembly', text: 'More than two hundred parts placed with tweezers under magnification, one breath at a time.' },
  { title: 'Dial Finishing', text: 'Sunburst brushing, guilloché engine-turning and hand-applied indices.' },
  { title: 'Final Inspection', text: 'Rate tested in six positions over days before a single piece leaves the atelier.' },
];
