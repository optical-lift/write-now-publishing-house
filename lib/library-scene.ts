import type { WnphPublicLibraryBook } from './wnph-public';

export type VolumeBinding = 'hardcover' | 'paperback' | 'unknown';

export type LibraryVolume = {
  publicSlug: string;
  workKey: string;
  title: string;
  creator: string;
  workType: string;
  chapterCount: number;
  mediaCount: number;
  representativeImageUrl: string | null;
  width: number;
  height: number;
  depth: number;
  lean: number;
  spineColor: string;
  bandColor: string;
  inkColor: string;
  binding: VolumeBinding;
  jacket?: boolean;
  demo?: boolean;
};

const palettes = [
  { spine: '#45352b', band: '#b78d57', ink: '#f3ead8' },
  { spine: '#5d302c', band: '#d1a764', ink: '#f7efdf' },
  { spine: '#243f3b', band: '#c29d62', ink: '#f6eedc' },
  { spine: '#38445a', band: '#b9a16e', ink: '#f3ecdc' },
  { spine: '#725b3b', band: '#d0b276', ink: '#f8f0df' },
  { spine: '#4d3d52', band: '#b8936f', ink: '#f5ecdf' },
  { spine: '#6a4936', band: '#c6a06e', ink: '#f7efe1' },
  { spine: '#303c32', band: '#c0a168', ink: '#f5eddc' },
] as const;

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function signedSlice(hash: number, shift: number, magnitude: number) {
  const byte = (hash >>> shift) & 0xff;
  return ((byte / 255) * 2 - 1) * magnitude;
}

export function projectLibraryBookToVolume(book: WnphPublicLibraryBook): LibraryVolume {
  const seed = stableHash(`${book.bibliographic.work_key}:${book.public_slug}`);
  const palette = palettes[seed % palettes.length];
  const creator = book.bibliographic.creators.find((item) => item.role === 'author')?.label
    ?? book.bibliographic.creators[0]?.label
    ?? 'Unknown creator';

  const chapterWeight = Math.min(book.chapter_count, 24) * 1.7;
  const mediaWeight = Math.min(book.media_count, 18) * 0.45;

  return {
    publicSlug: book.public_slug,
    workKey: book.bibliographic.work_key,
    title: book.bibliographic.title,
    creator,
    workType: book.bibliographic.work_type,
    chapterCount: book.chapter_count,
    mediaCount: book.media_count,
    representativeImageUrl: book.representative_image?.url ?? null,
    width: Math.round(28 + Math.min(46, chapterWeight + mediaWeight)),
    height: Math.round(278 + ((seed >>> 8) % 48)),
    depth: Math.round(20 + ((seed >>> 16) % 12)),
    lean: Number(signedSlice(seed, 0, 2.8).toFixed(2)),
    spineColor: palette.spine,
    bandColor: palette.band,
    inkColor: palette.ink,
    binding: 'unknown',
  };
}

export const DEMO_BINDING_VOLUMES: LibraryVolume[] = [
  {
    publicSlug: 'demo-field-notes-for-rain',
    workKey: 'demo-field-notes-for-rain',
    title: 'Field Notes for Rain',
    creator: 'Mira Vale',
    workType: 'demo paperback',
    chapterCount: 11,
    mediaCount: 0,
    representativeImageUrl: null,
    width: 31,
    height: 276,
    depth: 17,
    lean: -3.4,
    spineColor: '#8a4d38',
    bandColor: '#d0a36e',
    inkColor: '#fff4e6',
    binding: 'paperback',
    demo: true,
  },
  {
    publicSlug: 'demo-orchard-clock',
    workKey: 'demo-orchard-clock',
    title: 'The Orchard Clock',
    creator: 'Elias North',
    workType: 'demo cloth hardcover',
    chapterCount: 18,
    mediaCount: 4,
    representativeImageUrl: null,
    width: 48,
    height: 307,
    depth: 29,
    lean: 0.7,
    spineColor: '#30433d',
    bandColor: '#b99a62',
    inkColor: '#f3ead8',
    binding: 'hardcover',
    jacket: false,
    demo: true,
  },
  {
    publicSlug: 'demo-glass-lantern',
    workKey: 'demo-glass-lantern',
    title: 'The Glass Lantern',
    creator: 'Nora Bell',
    workType: 'demo jacketed hardcover',
    chapterCount: 22,
    mediaCount: 12,
    representativeImageUrl: null,
    width: 43,
    height: 318,
    depth: 31,
    lean: 1.8,
    spineColor: '#5b3b55',
    bandColor: '#d5b58a',
    inkColor: '#f9f0df',
    binding: 'hardcover',
    jacket: true,
    demo: true,
  },
];
