/**
 * Educational copy for the exploded view. The procedural movement is an
 * artistic, simplified interpretation — not a functional calibre.
 */
export type ComponentId =
  | 'crystal'
  | 'bezel'
  | 'case'
  | 'dial'
  | 'markers'
  | 'hands'
  | 'motionWorks'
  | 'gearTrain'
  | 'balance'
  | 'hairspring'
  | 'escapement'
  | 'barrel'
  | 'plates'
  | 'screws'
  | 'caseback'
  | 'strap'
  | 'buckle';

export interface ComponentInfo {
  id: ComponentId;
  name: string;
  role: string;
  text: string;
}

export const COMPONENTS: Record<ComponentId, ComponentInfo> = {
  crystal: {
    id: 'crystal',
    name: 'Sapphire Crystal',
    role: 'Protection & clarity',
    text: 'Synthetic sapphire is second only to diamond in hardness. Anti-reflective coating on the underside lets the dial read cleanly under any light.',
  },
  bezel: {
    id: 'bezel',
    name: 'Bezel',
    role: 'Frames and secures the crystal',
    text: 'The ring that holds the crystal to the case. On sport pieces it carries a scale; on dress pieces it is polished to draw light around the dial.',
  },
  case: {
    id: 'case',
    name: 'Middle Case',
    role: 'Houses the movement',
    text: 'The structural heart of the watch. Lugs are machined from the same block, then brushed and polished on alternating facets.',
  },
  dial: {
    id: 'dial',
    name: 'Dial',
    role: 'The face of time',
    text: 'A thin brass disc finished with sunburst, guilloché or enamel. Its texture is what turns reflected light into character.',
  },
  markers: {
    id: 'markers',
    name: 'Hour Markers',
    role: 'Index the hours',
    text: 'Applied by hand, each index is riveted through tiny holes in the dial. Facets are polished so they flash as the wrist turns.',
  },
  hands: {
    id: 'hands',
    name: 'Hands',
    role: 'Indicate hours, minutes, seconds',
    text: 'Pressed onto concentric pinions. Their lengths and balance are tuned so the seconds hand sweeps without disturbing the train.',
  },
  motionWorks: {
    id: 'motionWorks',
    name: 'Hour & Minute Wheels',
    role: 'Motion works, 12:1 reduction',
    text: 'The cannon pinion, minute wheel and hour wheel step the minute hand’s rotation down twelve-to-one so the hour hand keeps pace.',
  },
  gearTrain: {
    id: 'gearTrain',
    name: 'Gear Train',
    role: 'Transmits energy',
    text: 'Centre, third and fourth wheels carry power from the barrel to the escapement, multiplying speed at each stage.',
  },
  balance: {
    id: 'balance',
    name: 'Balance Wheel',
    role: 'The regulator',
    text: 'The beating heart. Oscillating back and forth at a precise rate — typically 4 Hz — it divides time into equal parts.',
  },
  hairspring: {
    id: 'hairspring',
    name: 'Balance Spring',
    role: 'Restoring force',
    text: 'A hair-thin spiral that returns the balance to centre. Its length and elasticity set the rate of the entire watch.',
  },
  escapement: {
    id: 'escapement',
    name: 'Escapement',
    role: 'Releases energy in steps',
    text: 'The pallet fork locks and releases the escape wheel one tooth at a time, giving the balance a tiny impulse — the source of the tick.',
  },
  barrel: {
    id: 'barrel',
    name: 'Mainspring Barrel',
    role: 'Stores energy',
    text: 'A coiled mainspring inside a toothed drum. As it unwinds over roughly two days it drives the entire gear train.',
  },
  plates: {
    id: 'plates',
    name: 'Mainplate & Bridges',
    role: 'The architecture',
    text: 'The mainplate and bridges hold every pivot in perfect alignment. Ruby jewels at each bearing reduce friction to almost nothing.',
  },
  screws: {
    id: 'screws',
    name: 'Screws',
    role: 'Assembly',
    text: 'Some screws in a fine movement are under a millimetre wide. Their heads are polished and often heat-blued by hand.',
  },
  caseback: {
    id: 'caseback',
    name: 'Case Back',
    role: 'Seals the watch',
    text: 'A sapphire display back screwed into the case, sealed by a gasket, revealing the movement from beneath.',
  },
  strap: {
    id: 'strap',
    name: 'Strap',
    role: 'Wearability',
    text: 'Fixed to the lugs by spring bars. Hand-stitched leather is cut, skived and edge-painted in layers.',
  },
  buckle: {
    id: 'buckle',
    name: 'Buckle',
    role: 'Closure',
    text: 'A solid tang buckle machined from the same alloy as the case and finished to match.',
  },
};
