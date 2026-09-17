import {
  isApprovedEditionPresentationPackage,
  type EditionPresentationPackage,
} from './edition-presentation';

export type EditionPresentationLocator = {
  publicSlug: string;
  editionId: string;
  package: EditionPresentationPackage;
};

export type EditionPresentationIndex = ReadonlyMap<string, EditionPresentationLocator>;

export type EditionPresentationIndexBuild = {
  index: EditionPresentationIndex;
  errors: string[];
};

export function buildEditionPresentationIndex(
  entries: EditionPresentationLocator[],
): EditionPresentationIndexBuild {
  const map = new Map<string, EditionPresentationLocator>();
  const errors: string[] = [];

  for (const entry of entries) {
    const slug = entry.publicSlug.trim();
    const editionId = entry.editionId.trim();

    if (!slug) {
      errors.push('presentation locator requires publicSlug');
      continue;
    }
    if (!editionId) {
      errors.push(`${slug}: presentation locator requires editionId`);
      continue;
    }
    if (map.has(slug)) {
      errors.push(`${slug}: duplicate current presentation locator`);
      continue;
    }
    if (!isApprovedEditionPresentationPackage(entry.package)) {
      errors.push(`${slug}: package is not approved and valid`);
      continue;
    }
    if (entry.package.editionId !== editionId) {
      errors.push(`${slug}: locator editionId does not match package editionId`);
      continue;
    }

    map.set(slug, {
      publicSlug: slug,
      editionId,
      package: entry.package,
    });
  }

  return { index: map, errors };
}

export function lookupEditionPresentation(
  index: EditionPresentationIndex,
  publicSlug: string,
): EditionPresentationLocator | null {
  return index.get(publicSlug) ?? null;
}

export function serializeEditionPresentationIndex(
  index: EditionPresentationIndex,
): Array<{ publicSlug: string; editionId: string; packageVersion: number }> {
  return [...index.values()]
    .map((entry) => ({
      publicSlug: entry.publicSlug,
      editionId: entry.editionId,
      packageVersion: entry.package.packageVersion,
    }))
    .sort((left, right) => left.publicSlug.localeCompare(right.publicSlug));
}
