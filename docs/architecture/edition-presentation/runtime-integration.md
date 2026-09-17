# Runtime Integration

This document defines the first implementation seam for the Edition Presentation System (EPS) without changing database authority.

## WNPH identity mapping

Database inspection established that WNPH already owns concrete publication-form identity through `wnph.manifestations`. EPS therefore does not need a second Edition table or frontend-created edition identifier.

Within WNPH:

```text
Work
  -> publication Expression
      -> Manifestation
          -> Edition Presentation Package
```

EPP v1 `editionId` maps to the Manifestation canonical key. See ADR-0002.

For the first real package:

```text
Expression:    wish-fairy-dewy-dear:wnph-publication-e1
Manifestation: wish-fairy-dewy-dear:wnph-paperback-v1
EPP editionId: wish-fairy-dewy-dear:wnph-paperback-v1
```

## Current public contract limitation

`wnph_public_library_v1` currently exposes public release/library facts including `public_slug`, release sequence/time, render hashes, bibliographic Work identity, chapter/media counts, and representative media. It does not expose the owning physical Manifestation or an EPP reference.

The frontend therefore cannot derive Manifestation identity from the public payload alone.

## V1 integration rule

Until a canonical Manifestation/EPP public read seam exists, the public site may use a **derived presentation locator**:

```text
public_slug
  -> canonical Manifestation key
  -> current approved EPP
```

`public_slug` is only a lookup key. It never becomes Manifestation identity and never authorizes the frontend to create physical-book facts.

## Runtime modules

- `lib/edition-presentation.ts`
  - TypeScript runtime contract for EPP v1.
  - Validates physical consistency and approval completeness.
- `lib/edition-presentation-index.ts`
  - Builds a read-only lookup from public slug to one approved EPP.
  - Rejects draft/invalid packages, duplicates, and identity mismatches.
- `lib/library-epp-adapter.ts`
  - Converts a public library book plus an approved EPP locator into consumer-safe presentation assets.
  - Returns `null` instead of inventing a book when no approved package exists.

These modules do not mutate publication state and do not change the public RPC contract.

## Artifact-first packages

Packages may initially be repository/object-storage artifacts using `edition-presentations/`. Large binary artwork and mockups may live in immutable object storage; manifests retain durable references and hashes.

A draft package may also contain `references/` and `proposals/`. Those directories are publication-workspace material and are invisible to public consumers. See `proposal-workflow.md`.

## First real package

The first real draft is owned by the already-existing planned paperback Manifestation for *The Wish Fairy and Dewy Dear*.

Known authoritative facts admitted to the draft manifest:

- Manifestation canonical key: `wish-fairy-dewy-dear:wnph-paperback-v1`;
- binding: paperback;
- construction: paperback wrap.

The active paperback render profile is `wnph:render:paperback:v2`, whose contract states that physical geometry belongs to the Manifestation. The latest planned derivation is reproducible-build-ready from the current publication Expression snapshot.

Unknown physical facts remain absent: trim, final print page count, spine width, stocks/finish, and cover art.

## Consumer transition

The spatial-library prototype remains unchanged while the first package is draft.

```text
current
wnph_public_library_v1
  -> procedural development prototype

future
wnph_public_library_v1
  + approved EPP locator
  -> library EPP adapter
  -> approved shelfSpine / detailMockup
  -> spatial interaction only
```

A draft EPP cannot enter the public index.

## Future canonical seam

The publication/database layer should eventually expose the relationship already present in canonical data, for example:

```text
public release
  -> publication Expression
      -> current physical Manifestation(s)
          -> current approved EPP descriptor
```

When that read seam exists, replace the temporary slug locator. The EPP manifest/lifecycle/consumer contract should remain stable.

## Deployment boundary

EPP creation, EPP approval, branch movement, preview deployment, and production deployment are separate operations. None authorizes another.
