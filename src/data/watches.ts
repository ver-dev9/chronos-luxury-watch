/**
 * Every watch in CHRONOS is described by a WatchSpec. The procedural
 * WatchModel turns a spec into real geometry, so each collection piece
 * differs in case, bezel, dial, hands, strap and mechanics — not only text.
 */
export type CaseMaterial = 'gold' | 'roseGold' | 'steel' | 'titanium' | 'ceramic' | 'carbon' | 'platinum';
export type CaseShape = 'round' | 'cushion' | 'octagon';
export type BezelStyle = 'smooth' | 'fluted' | 'tachymeter' | 'gem' | 'screwed';
export type DialStyle = 'sunburst' | 'guilloche' | 'skeleton' | 'enamel' | 'carbon';
export type DialColor = 'obsidian' | 'champagne' | 'ivory' | 'midnight' | 'emerald' | 'smoke';
export type HandStyle = 'dauphine' | 'baton' | 'leaf' | 'sword';
export type StrapStyle = 'leatherBlack' | 'leatherBrown' | 'bracelet' | 'titaniumLink' | 'rubber';
export type MarkerStyle = 'gold' | 'silver' | 'minimal' | 'roman' | 'gem';

export interface WatchSpec {
  caseMaterial: CaseMaterial;
  caseShape: CaseShape;
  bezel: BezelStyle;
  dial: DialStyle;
  dialColor: DialColor;
  hands: HandStyle;
  strap: StrapStyle;
  markers: MarkerStyle;
  subdials?: boolean;
  /** shows the open-worked movement through the dial */
  skeleton?: boolean;
  /** exposed tourbillon cage at 6 o'clock */
  tourbillon?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  facts: string[];
  spec: WatchSpec;
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'imperial',
    name: 'Chronos Imperial',
    subtitle: 'The Sovereign of Hours',
    description:
      'A fluted 18K-style gold bezel crowns a champagne sunburst dial. Roman numerals, dauphine hands and a cognac alligator-grain strap — ceremony, rendered in metal.',
    facts: ['40 mm round case', 'Fluted bezel', 'Champagne sunburst', 'Small seconds'],
    spec: {
      caseMaterial: 'gold',
      caseShape: 'round',
      bezel: 'fluted',
      dial: 'sunburst',
      dialColor: 'champagne',
      hands: 'dauphine',
      strap: 'leatherBrown',
      markers: 'roman',
      subdials: true,
    },
  },
  {
    id: 'noir',
    name: 'Chronos Noir',
    subtitle: 'Midnight, Machined',
    description:
      'An octagonal black ceramic case with a tachymeter scale, a carbon composite dial and luminous sword hands. Built for the hours most people never see.',
    facts: ['42 mm octagonal ceramic', 'Tachymeter bezel', 'Carbon dial', 'Chronograph registers'],
    spec: {
      caseMaterial: 'ceramic',
      caseShape: 'octagon',
      bezel: 'tachymeter',
      dial: 'carbon',
      dialColor: 'obsidian',
      hands: 'sword',
      strap: 'rubber',
      markers: 'silver',
      subdials: true,
    },
  },
  {
    id: 'skeleton',
    name: 'Chronos Skeleton',
    subtitle: 'Nothing Hidden',
    description:
      'Grade-5 titanium around an open-worked dial. Every wheel, bridge and the tourbillon cage at six o’clock is left visible — the movement becomes the face.',
    facts: ['41 mm titanium', 'Screwed bezel', 'Open-worked dial', 'Visible tourbillon'],
    spec: {
      caseMaterial: 'titanium',
      caseShape: 'round',
      bezel: 'screwed',
      dial: 'skeleton',
      dialColor: 'smoke',
      hands: 'baton',
      strap: 'titaniumLink',
      markers: 'minimal',
      skeleton: true,
      tourbillon: true,
    },
  },
  {
    id: 'aurelia',
    name: 'Chronos Aurelia',
    subtitle: 'Light, Set in Gold',
    description:
      'A cushion-shaped rose-gold case with a gem-set bezel and a guilloché ivory dial. Leaf hands trace hours like brushstrokes across mother-of-light.',
    facts: ['38 mm cushion case', 'Gem-set bezel', 'Guilloché ivory', 'Leaf hands'],
    spec: {
      caseMaterial: 'roseGold',
      caseShape: 'cushion',
      bezel: 'gem',
      dial: 'guilloche',
      dialColor: 'ivory',
      hands: 'leaf',
      strap: 'leatherBlack',
      markers: 'gem',
    },
  },
];

export const SIGNATURE: Collection[] = [
  {
    id: 'meridian',
    name: 'Meridian Perpetual',
    subtitle: 'Opus I',
    description:
      'Platinum and midnight enamel. A dial that feels like a night sky held still, with a fluted bezel catching the last light of evening.',
    facts: ['Platinum-style alloy', 'Grand feu enamel look', 'Fluted bezel'],
    spec: {
      caseMaterial: 'platinum',
      caseShape: 'round',
      bezel: 'fluted',
      dial: 'enamel',
      dialColor: 'midnight',
      hands: 'leaf',
      strap: 'leatherBlack',
      markers: 'gold',
    },
  },
  {
    id: 'eclipse',
    name: 'Eclipse Tourbillon',
    subtitle: 'Opus II',
    description:
      'A carbon composite case around a skeletonised movement. The tourbillon turns once a minute in a cage of blackened steel.',
    facts: ['Carbon composite', 'Flying tourbillon', 'Rubber strap'],
    spec: {
      caseMaterial: 'carbon',
      caseShape: 'round',
      bezel: 'screwed',
      dial: 'skeleton',
      dialColor: 'obsidian',
      hands: 'sword',
      strap: 'rubber',
      markers: 'minimal',
      skeleton: true,
      tourbillon: true,
    },
  },
  {
    id: 'verdant',
    name: 'Verdant Heritage',
    subtitle: 'Opus III',
    description:
      'An emerald sunburst dial in a cushion case of polished steel. Heritage proportions, reconsidered with a contemporary hand.',
    facts: ['Stainless steel', 'Emerald sunburst', 'Integrated bracelet'],
    spec: {
      caseMaterial: 'steel',
      caseShape: 'cushion',
      bezel: 'smooth',
      dial: 'sunburst',
      dialColor: 'emerald',
      hands: 'baton',
      strap: 'bracelet',
      markers: 'silver',
    },
  },
  {
    id: 'solstice',
    name: 'Solstice Chronograph',
    subtitle: 'Opus IV',
    description:
      'Gold octagon, ivory guilloché and three registers. The precise geometry of a sun dial, brought to the wrist.',
    facts: ['Gold octagon', 'Tri-compax registers', 'Tachymeter'],
    spec: {
      caseMaterial: 'gold',
      caseShape: 'octagon',
      bezel: 'tachymeter',
      dial: 'guilloche',
      dialColor: 'ivory',
      hands: 'dauphine',
      strap: 'leatherBrown',
      markers: 'gold',
      subdials: true,
    },
  },
  {
    id: 'astra',
    name: 'Astra Joaillerie',
    subtitle: 'Opus V',
    description:
      'Rose gold, an obsidian dial and a bezel set with brilliant stones. A watch that understands the theatre of light.',
    facts: ['Rose gold', 'Gem-set bezel', 'Gem indices'],
    spec: {
      caseMaterial: 'roseGold',
      caseShape: 'round',
      bezel: 'gem',
      dial: 'sunburst',
      dialColor: 'obsidian',
      hands: 'leaf',
      strap: 'leatherBlack',
      markers: 'gem',
    },
  },
];

export const HERO_SPEC: WatchSpec = {
  caseMaterial: 'gold',
  caseShape: 'round',
  bezel: 'smooth',
  dial: 'sunburst',
  dialColor: 'obsidian',
  hands: 'dauphine',
  strap: 'leatherBlack',
  markers: 'gold',
  subdials: true,
};

/** The exploded / finale watch: a gold case with a skeleton dial so the movement reads. */
export const EXPLODED_SPEC: WatchSpec = {
  caseMaterial: 'gold',
  caseShape: 'round',
  bezel: 'smooth',
  dial: 'sunburst',
  dialColor: 'obsidian',
  hands: 'dauphine',
  strap: 'leatherBlack',
  markers: 'gold',
};
