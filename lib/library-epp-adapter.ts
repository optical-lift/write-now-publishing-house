import type { WnphPublicLibraryBook } from './wnph-public';
import type { EditionPresentationIndex } from './edition-presentation-index';
import { lookupEditionPresentation } from './edition-presentation-index';

export type LibraryEditionPresentation = {
  editionId: string;
  packageVersion: number;
  binding: 'paperback' | 'hardcover' | 'unknown';
  construction:
    | 'paperback-wrap'
    | 'cloth-case'
    | 'printed-casewrap'
    | 'dust-jacket'
    | 'unknown';
  trim: { widthIn: number; heightIn: number } | null;
  pageCount: number | null;
  spineWidthIn: number | null;
  shelfSpineUrl: string;
  frontCoverUrl: string | null;
  detailMockupUrl: string | null;
  threeQuarterMockupUrl: string | null;
  jacketOffMockupUrl: string | null;
};

/**
 * Temporary public-web seam.
 *
 * `wnph_public_library_v1` does not currently expose canonical edition identity,
 * so v1 presentation lookup may join by the already-canonical public slug.
 * The slug is only a locator; it does not become Edition authority.
 */
export function resolveLibraryEditionPresentation(
  book: WnphPublicLibraryBook,
  index: EditionPresentationIndex,
): LibraryEditionPresentation | null {
  const locator = lookupEditionPresentation(index, book.public_slug);
  if (!locator) return null;

  const pkg = locator.package;
  const shelfSpine = pkg.presentation.shelfSpine;
  if (!shelfSpine) return null;

  return {
    editionId: locator.editionId,
    packageVersion: pkg.packageVersion,
    binding: pkg.physical.binding,
    construction: pkg.physical.construction,
    trim: pkg.physical.trim ?? null,
    pageCount: pkg.physical.pageCount ?? null,
    spineWidthIn: pkg.physical.spineWidthIn ?? null,
    shelfSpineUrl: shelfSpine.uri,
    frontCoverUrl: pkg.presentation.frontCover?.uri ?? null,
    detailMockupUrl: pkg.presentation.detailMockup?.uri ?? null,
    threeQuarterMockupUrl: pkg.presentation.threeQuarterMockup?.uri ?? null,
    jacketOffMockupUrl: pkg.presentation.jacketOffMockup?.uri ?? null,
  };
}
