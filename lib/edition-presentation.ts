export type EditionPresentationStatus = 'draft' | 'approved' | 'superseded';
export type EditionBinding = 'paperback' | 'hardcover' | 'unknown';
export type EditionConstruction =
  | 'paperback-wrap'
  | 'cloth-case'
  | 'printed-casewrap'
  | 'dust-jacket'
  | 'unknown';
export type EditionSurfaceFinish =
  | 'matte'
  | 'gloss'
  | 'soft-touch'
  | 'cloth'
  | 'uncoated'
  | 'unknown';

export type EditionPresentationAsset = {
  uri: string;
  mediaType: string;
  widthPx?: number;
  heightPx?: number;
  sha256?: string;
  sourceAssetIds?: string[];
};

export type EditionPresentationPackage = {
  schemaVersion: 1;
  editionId: string;
  packageVersion: number;
  status: EditionPresentationStatus;
  createdAt: string;
  approvedAt?: string | null;
  supersedesPackageVersion?: number | null;
  physical: {
    binding: EditionBinding;
    construction: EditionConstruction;
    trim?: { widthIn: number; heightIn: number };
    pageCount?: number;
    spineWidthIn?: number;
    coverStock?: string | null;
    caseMaterial?: string | null;
    jacketStock?: string | null;
    pageStock?: string | null;
    surfaceFinish?: EditionSurfaceFinish;
    foilOrStamping?: string | null;
  };
  artwork: {
    frontCover?: EditionPresentationAsset;
    backCover?: EditionPresentationAsset;
    spine?: EditionPresentationAsset;
    fullWrap?: EditionPresentationAsset;
    jacketSpread?: EditionPresentationAsset;
    caseFront?: EditionPresentationAsset;
    caseSpine?: EditionPresentationAsset;
    caseBack?: EditionPresentationAsset;
  };
  presentation: {
    shelfSpine?: EditionPresentationAsset;
    frontCover?: EditionPresentationAsset;
    threeQuarterMockup?: EditionPresentationAsset;
    detailMockup?: EditionPresentationAsset;
    jacketOffMockup?: EditionPresentationAsset;
  };
  materialProfile?: {
    cover?: string | null;
    case?: string | null;
    jacket?: string | null;
    pages?: string | null;
  };
  provenance?: Array<{
    assetUri: string;
    kind: 'source-artwork' | 'generated-presentation' | 'manual-presentation';
    createdAt: string;
    generator?: string | null;
    generatorVersion?: string | null;
    sourceAssetUris?: string[];
  }>;
};

export type EditionPresentationValidation = {
  ok: boolean;
  errors: string[];
};

const bindings = new Set<EditionBinding>(['paperback', 'hardcover', 'unknown']);
const constructions = new Set<EditionConstruction>([
  'paperback-wrap',
  'cloth-case',
  'printed-casewrap',
  'dust-jacket',
  'unknown',
]);
const statuses = new Set<EditionPresentationStatus>(['draft', 'approved', 'superseded']);
const finishes = new Set<EditionSurfaceFinish>([
  'matte',
  'gloss',
  'soft-touch',
  'cloth',
  'uncoated',
  'unknown',
]);
const artworkKeys = new Set([
  'frontCover',
  'backCover',
  'spine',
  'fullWrap',
  'jacketSpread',
  'caseFront',
  'caseSpine',
  'caseBack',
]);
const presentationKeys = new Set([
  'shelfSpine',
  'frontCover',
  'threeQuarterMockup',
  'detailMockup',
  'jacketOffMockup',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isTimestamp(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

function validateAsset(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return;
  }
  if (!isNonEmptyString(value.uri)) errors.push(`${path}.uri is required`);
  if (!isNonEmptyString(value.mediaType)) errors.push(`${path}.mediaType is required`);
  if (value.widthPx !== undefined && !isPositiveInteger(value.widthPx)) {
    errors.push(`${path}.widthPx must be a positive integer`);
  }
  if (value.heightPx !== undefined && !isPositiveInteger(value.heightPx)) {
    errors.push(`${path}.heightPx must be a positive integer`);
  }
  if (value.sha256 !== undefined && (typeof value.sha256 !== 'string' || !/^[A-Fa-f0-9]{64}$/.test(value.sha256))) {
    errors.push(`${path}.sha256 must be a 64-character hexadecimal digest`);
  }
}

function validateAssets(
  record: Record<string, unknown>,
  path: string,
  allowedKeys: Set<string>,
  errors: string[],
): void {
  for (const [key, value] of Object.entries(record)) {
    if (!allowedKeys.has(key)) {
      errors.push(`${path}.${key} is not part of EPP v1`);
      continue;
    }
    if (value !== undefined) validateAsset(value, `${path}.${key}`, errors);
  }
}

function hasPaperbackArtwork(artwork: Record<string, unknown>): boolean {
  return Boolean(
    artwork.fullWrap ||
      (artwork.frontCover && artwork.spine && artwork.backCover),
  );
}

function hasCasewrapArtwork(artwork: Record<string, unknown>): boolean {
  return Boolean(
    artwork.fullWrap ||
      (artwork.caseFront && artwork.caseSpine && artwork.caseBack),
  );
}

export function validateEditionPresentationPackage(value: unknown): EditionPresentationValidation {
  const errors: string[] = [];

  if (!isRecord(value)) return { ok: false, errors: ['package must be an object'] };

  if (value.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!isNonEmptyString(value.editionId)) errors.push('editionId is required');
  if (!isPositiveInteger(value.packageVersion)) errors.push('packageVersion must be a positive integer');
  if (!statuses.has(value.status as EditionPresentationStatus)) errors.push('status is invalid');
  if (!isTimestamp(value.createdAt)) errors.push('createdAt must be a valid timestamp');

  if (!isRecord(value.physical)) errors.push('physical is required');
  if (!isRecord(value.artwork)) errors.push('artwork is required');
  if (!isRecord(value.presentation)) errors.push('presentation is required');

  if (isRecord(value.physical)) {
    const physical = value.physical;
    if (!bindings.has(physical.binding as EditionBinding)) errors.push('physical.binding is invalid');
    if (!constructions.has(physical.construction as EditionConstruction)) {
      errors.push('physical.construction is invalid');
    }
    if (physical.surfaceFinish !== undefined && !finishes.has(physical.surfaceFinish as EditionSurfaceFinish)) {
      errors.push('physical.surfaceFinish is invalid');
    }
    if (physical.trim !== undefined) {
      if (!isRecord(physical.trim) || !isPositiveNumber(physical.trim.widthIn) || !isPositiveNumber(physical.trim.heightIn)) {
        errors.push('physical.trim must contain positive widthIn and heightIn');
      }
    }
    if (physical.pageCount !== undefined && !isPositiveInteger(physical.pageCount)) {
      errors.push('physical.pageCount must be a positive integer');
    }
    if (physical.spineWidthIn !== undefined && !isPositiveNumber(physical.spineWidthIn)) {
      errors.push('physical.spineWidthIn must be positive');
    }

    if (physical.construction === 'paperback-wrap' && physical.binding !== 'paperback') {
      errors.push('paperback-wrap requires binding paperback');
    }
    if (
      ['cloth-case', 'printed-casewrap', 'dust-jacket'].includes(String(physical.construction)) &&
      physical.binding !== 'hardcover'
    ) {
      errors.push(`${String(physical.construction)} requires binding hardcover`);
    }
  }

  if (isRecord(value.artwork)) validateAssets(value.artwork, 'artwork', artworkKeys, errors);
  if (isRecord(value.presentation)) validateAssets(value.presentation, 'presentation', presentationKeys, errors);

  if (value.status === 'approved') {
    if (!isTimestamp(value.approvedAt)) errors.push('approved package requires approvedAt');

    if (isRecord(value.physical) && isRecord(value.artwork) && isRecord(value.presentation)) {
      const physical = value.physical;
      const artwork = value.artwork;
      const presentation = value.presentation;

      if (physical.binding === 'unknown') errors.push('approved package requires known binding');
      if (physical.construction === 'unknown') errors.push('approved package requires known construction');
      if (!isRecord(physical.trim) || !isPositiveNumber(physical.trim.widthIn) || !isPositiveNumber(physical.trim.heightIn)) {
        errors.push('approved package requires authoritative trim');
      }
      if (!presentation.shelfSpine) errors.push('approved package requires presentation.shelfSpine');
      if (!presentation.frontCover && !presentation.detailMockup) {
        errors.push('approved package requires presentation.frontCover or presentation.detailMockup');
      }

      switch (physical.construction) {
        case 'paperback-wrap':
          if (!hasPaperbackArtwork(artwork)) {
            errors.push('approved paperback requires fullWrap or frontCover + spine + backCover artwork');
          }
          break;
        case 'cloth-case':
          if (!isNonEmptyString(physical.caseMaterial)) errors.push('approved cloth case requires caseMaterial');
          if (!artwork.caseFront && !artwork.caseSpine && !isNonEmptyString(physical.foilOrStamping)) {
            errors.push('approved cloth case requires explicit case artwork or foil/stamping treatment');
          }
          break;
        case 'printed-casewrap':
          if (!hasCasewrapArtwork(artwork)) {
            errors.push('approved printed casewrap requires fullWrap or caseFront + caseSpine + caseBack artwork');
          }
          break;
        case 'dust-jacket':
          if (!artwork.jacketSpread) errors.push('approved dust jacket requires artwork.jacketSpread');
          if (!isNonEmptyString(physical.caseMaterial)) errors.push('approved dust jacket requires underlying caseMaterial');
          if (!isNonEmptyString(physical.jacketStock)) errors.push('approved dust jacket requires jacketStock');
          break;
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function isApprovedEditionPresentationPackage(
  value: unknown,
): value is EditionPresentationPackage & { status: 'approved'; approvedAt: string } {
  if (!isRecord(value) || value.status !== 'approved') return false;
  return validateEditionPresentationPackage(value).ok;
}
