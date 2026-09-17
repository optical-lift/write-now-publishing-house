import type { WnphPublicLibraryBook } from './wnph-public';

export type VolumeBinding = 'hardcover' | 'paperback' | 'unknown';
export type VolumeFinish = 'cloth' | 'matte' | 'gloss' | 'unknown';
export type VolumeArtworkMode = 'none' | 'front-image' | 'printed-wrap' | 'cloth-stamp' | 'dust-jacket';

export type LibraryVolume = {
  publicSlug: string;
  workKey: string;
  title: string;
  creator: string;
  workType: string;
  chapterCount: number;
  mediaCount: number;
  representativeImageUrl: string | null;
  coverArtUrl?: string | null;
  width: number;
  height: number;
  depth: number;
  lean: number;
  spineColor: string;
  bandColor: string;
  inkColor: string;
  binding: VolumeBinding;
  finish?: VolumeFinish;
  artworkMode?: VolumeArtworkMode;
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

const WISH_FAIRY_RECOVERED_COVER = '/recovered-covers/the-wish-fairy-and-dewy-dear/front-cover-restored.jpg';

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

function svgCover(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const fieldNotesCover = svgCover(`
  <svg xmlns="http://www.w3.org/2000/svg" width="720" height="1080" viewBox="0 0 720 1080">
    <rect width="720" height="1080" fill="#9b513d"/>
    <g opacity=".28" stroke="#f6e7cf" stroke-width="4">
      <path d="M45 120L210 0M10 280L390 0M0 470L590 0M0 670L720 80M0 860L720 270M80 1080L720 510M300 1080L720 700"/>
    </g>
    <rect x="52" y="54" width="616" height="972" fill="none" stroke="#e7bd86" stroke-width="3"/>
    <text x="78" y="170" fill="#fff4e6" font-family="Georgia, serif" font-size="72">FIELD NOTES</text>
    <text x="78" y="250" fill="#fff4e6" font-family="Georgia, serif" font-size="72">FOR RAIN</text>
    <text x="80" y="920" fill="#f4d3ad" font-family="Arial, sans-serif" font-size="30" letter-spacing="8">MIRA VALE</text>
  </svg>
`);

const glassLanternCover = svgCover(`
  <svg xmlns="http://www.w3.org/2000/svg" width="720" height="1080" viewBox="0 0 720 1080">
    <defs>
      <radialGradient id="g" cx="50%" cy="48%" r="52%">
        <stop offset="0" stop-color="#f3cf91" stop-opacity=".92"/>
        <stop offset=".26" stop-color="#a66877" stop-opacity=".7"/>
        <stop offset="1" stop-color="#412f4b" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="720" height="1080" fill="#55364f"/>
    <circle cx="360" cy="520" r="315" fill="url(#g)"/>
    <g fill="none" stroke="#e6c79d" stroke-width="7">
      <path d="M285 290h150l45 390H240z"/>
      <path d="M315 290v-70h90v70M270 680h180v85H270z"/>
      <path d="M314 360h92l26 235H288z"/>
    </g>
    <text x="64" y="138" fill="#fbf1df" font-family="Georgia, serif" font-size="64">THE GLASS</text>
    <text x="64" y="208" fill="#fbf1df" font-family="Georgia, serif" font-size="64">LANTERN</text>
    <text x="68" y="970" fill="#dec4a2" font-family="Arial, sans-serif" font-size="28" letter-spacing="7">NORA BELL</text>
  </svg>
`);

/**
 * Temporary interaction fallback while the corrected restored-hardcover EPP is
 * still draft. The gray cloth / green-ink direction is grounded in the
 * historical restoration target, but these pixel dimensions and the live CSS
 * geometry are not publication authority. Remove this fallback once an
 * approved EPP supplies shelf/detail presentation assets.
 */
function projectWishFairyProvisionalRestoredHardcover(base: LibraryVolume): LibraryVolume {
  return {
    ...base,
    coverArtUrl: WISH_FAIRY_RECOVERED_COVER,
    width: 36,
    height: 304,
    depth: 26,
    lean: -0.9,
    spineColor: '#766d5b',
    bandColor: '#766d5b',
    inkColor: '#294335',
    binding: 'hardcover',
    finish: 'cloth',
    artworkMode: 'front-image',
    jacket: false,
  };
}

export function projectLibraryBookToVolume(book: WnphPublicLibraryBook): LibraryVolume {
  const seed = stableHash(`${book.bibliographic.work_key}:${book.public_slug}`);
  const palette = palettes[seed % palettes.length];
  const creator = book.bibliographic.creators.find((item) => item.role === 'author')?.label
    ?? book.bibliographic.creators[0]?.label
    ?? 'Unknown creator';

  const chapterWeight = Math.min(book.chapter_count, 24) * 1.7;
  const mediaWeight = Math.min(book.media_count, 18) * 0.45;
  const imageUrl = book.representative_image?.url ?? null;

  const base: LibraryVolume = {
    publicSlug: book.public_slug,
    workKey: book.bibliographic.work_key,
    title: book.bibliographic.title,
    creator,
    workType: book.bibliographic.work_type,
    chapterCount: book.chapter_count,
    mediaCount: book.media_count,
    representativeImageUrl: imageUrl,
    coverArtUrl: imageUrl,
    width: Math.round(28 + Math.min(46, chapterWeight + mediaWeight)),
    height: Math.round(278 + ((seed >>> 8) % 48)),
    depth: Math.round(20 + ((seed >>> 16) % 12)),
    lean: Number(signedSlice(seed, 0, 2.8).toFixed(2)),
    spineColor: palette.spine,
    bandColor: palette.band,
    inkColor: palette.ink,
    binding: 'unknown',
    finish: 'unknown',
    artworkMode: imageUrl ? 'front-image' : 'none',
  };

  if (book.bibliographic.work_key === 'wish-fairy-and-dewy-dear') {
    return projectWishFairyProvisionalRestoredHardcover(base);
  }

  return base;
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
    coverArtUrl: fieldNotesCover,
    width: 31,
    height: 276,
    depth: 17,
    lean: -3.4,
    spineColor: '#8a4d38',
    bandColor: '#d0a36e',
    inkColor: '#fff4e6',
    binding: 'paperback',
    finish: 'matte',
    artworkMode: 'printed-wrap',
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
    coverArtUrl: null,
    width: 48,
    height: 307,
    depth: 29,
    lean: 0.7,
    spineColor: '#30433d',
    bandColor: '#b99a62',
    inkColor: '#f3ead8',
    binding: 'hardcover',
    finish: 'cloth',
    artworkMode: 'cloth-stamp',
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
    coverArtUrl: glassLanternCover,
    width: 43,
    height: 318,
    depth: 31,
    lean: 1.8,
    spineColor: '#5b3b55',
    bandColor: '#d5b58a',
    inkColor: '#f9f0df',
    binding: 'hardcover',
    finish: 'gloss',
    artworkMode: 'dust-jacket',
    jacket: true,
    demo: true,
  },
];
