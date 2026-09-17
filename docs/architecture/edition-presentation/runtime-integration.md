# Runtime Integration

This document defines the first implementation seam for the Edition Presentation System (EPS) without changing database authority.

## Current public contract limitation

`wnph_public_library_v1` currently exposes public release/library facts including `public_slug`, release sequence/time, render hashes, bibliographic Work identity, chapter/media counts, and representative media. It does not yet expose a canonical Edition identifier or Edition Presentation Package (EPP) reference.

That means the public frontend cannot truthfully derive Edition identity from the existing library payload.

## V1 integration rule

Until a canonical Edition/EPP read seam exists, the public site may use a **derived presentation locator**:

```text
public_slug
  -> canonical editionId
  -> current approved EPP
```

The locator is generated from publication-owned package records. `public_slug` is only a lookup key because it is already present in the public release contract. It does not become Edition identity and it does not authorize creation of Edition facts in the frontend.

## Runtime modules

- `lib/edition-presentation.ts`
  - TypeScript runtime contract for EPP v1.
  - Validation of package identity, physical consistency, approved-package completeness, construction-specific requirements, and asset references.
- `lib/edition-presentation-index.ts`
  - Builds a read-only lookup from public slug to exactly one approved current EPP locator.
  - Rejects duplicate locators, invalid packages, and edition/package identity mismatches.
- `lib/library-epp-adapter.ts`
  - Converts a library book plus an approved EPP locator into consumer-safe presentation assets.
  - Returns `null` when there is no approved package rather than inventing a book.

These modules do not mutate publication state, do not create Edition identity, and do not change the public RPC contract.

## Artifact-first package layout

Publication packages may initially be represented as repository or object-storage artifacts following the convention documented at `edition-presentations/README.md`.

Large binary artwork/mockups do not need to be committed to this application repository. The EPP manifest stores durable asset references and hashes; the package index only points consumers to approved packages.

## Consumer transition

The current spatial-library prototype still uses procedural/fake volumes. It is intentionally unchanged in this slice.

The migration path is:

```text
current
wnph_public_library_v1
  -> procedural LibraryVolume prototype

next consumer slice
wnph_public_library_v1
  + approved EPP index
  -> library EPP adapter
  -> approved shelfSpine / detailMockup
  -> spatial interaction only
```

A consumer without an approved EPP must use a neutral non-physical fallback or omit physical rendering. It must not fall back to invented binding, jacket, dimensions, or generated cover identity for a released edition.

## Future canonical seam

A later publication/database change may expose one of these equivalent relationships:

```text
public release -> editionId -> currentPresentationPackage
```

or

```text
public release -> current approved EPP descriptor
```

When that exists, replace the temporary `public_slug` locator. The EPP manifest, validator, package lifecycle, and consumer adapter contract should remain unchanged.

## Stop condition for this slice

This implementation slice is complete when:

1. EPP v1 can be represented and validated in TypeScript;
2. only approved valid packages can enter the derived index;
3. the public-library adapter can resolve approved presentation assets without guessing;
4. the architecture documents and three fixture packages are present;
5. no Supabase schema/RPC, production release, or spatial-shelf behavior has changed.

Deployment remains a separate operation.
