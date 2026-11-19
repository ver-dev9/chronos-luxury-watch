export type ChapterId =
  | 'intro'
  | 'collections'
  | 'exploded'
  | 'movement'
  | 'materials'
  | 'time'
  | 'configurator'
  | 'signature'
  | 'craftsmanship'
  | 'finale';

export interface Chapter {
  id: ChapterId;
  index: string;
  title: string;
  /** scroll length of the pinned chapter, in viewport heights */
  length: number;
}

export const CHAPTERS: Chapter[] = [
  { id: 'intro', index: '01', title: 'The Awakening', length: 2.2 },
  { id: 'collections', index: '02', title: 'The Collection', length: 4 },
  { id: 'exploded', index: '03', title: 'The Exploded Watch', length: 4.5 },
  { id: 'movement', index: '04', title: 'Inside the Movement', length: 3.5 },
  { id: 'materials', index: '05', title: 'The Art of Materials', length: 4.5 },
  { id: 'time', index: '06', title: 'The Art of Time', length: 3 },
  { id: 'configurator', index: '07', title: 'The Atelier', length: 1 },
  { id: 'signature', index: '08', title: 'Signature Collection', length: 4 },
  { id: 'craftsmanship', index: '09', title: 'The Craftsmanship', length: 4 },
  { id: 'finale', index: '10', title: 'Finale', length: 2.5 },
];

export const NAV_LINKS: { label: string; target: ChapterId }[] = [
  { label: 'Collections', target: 'collections' },
  { label: 'Movement', target: 'movement' },
  { label: 'Craftsmanship', target: 'craftsmanship' },
  { label: 'Configurator', target: 'configurator' },
];
