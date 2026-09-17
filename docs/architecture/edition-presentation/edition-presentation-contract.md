# Edition Presentation Contract

This document defines the semantic contract for an Edition Presentation Package (EPP). The JSON schema is authoritative for machine validation; this document explains the intended meaning and boundary of each field.

## Identity

Every package is scoped to one edition and one package version.

Required identity fields:

- `editionId`: canonical edition identifier supplied by the publication domain.
- `packageVersion`: monotonically increasing presentation-package version for that edition.
- `status`: `draft`, `approved`, or `superseded`.
- `createdAt`: package creation timestamp.
- `approvedAt`: required when status is `approved`.

The package must never create or redefine Work or Edition identity.

## Physical specification

`physical` describes facts about the manufactured edition, not frontend preferences.

Required when a physical book is being represented:

- `binding`: `paperback`, `hardcover`, or `unknown`.
- `construction`: one of `paperback-wrap`, `cloth-case`, `printed-casewrap`, `dust-jacket`, or `unknown`.
- `trim.widthIn` and `trim.heightIn` when known.
- `pageCount` when authoritative.
- `spineWidthIn` when authoritative or deterministically calculated by an approved print specification.

Optional material fields describe actual manufacture:

- `coverStock`
- `caseMaterial`
- `jacketStock`
- `pageStock`
- `surfaceFinish`
- `foilOrStamping`

No consumer may derive a missing physical fact from unrelated values.

## Artwork

`artwork` identifies approved design surfaces for the edition.

Possible assets:

- `frontCover`
- `backCover`
- `spine`
- `fullWrap`
- `jacketSpread`
- `caseFront`
- `caseSpine`
- `caseBack`

A full-wrap or jacket-spread asset may be preferred when continuous print alignment across back/spine/front matters. Separate face assets may coexist for downstream consumers.

Each asset reference must resolve to a durable asset controlled by the publishing workflow and should carry enough metadata to establish file type, dimensions, and provenance.

## Presentation assets

`presentation` contains approved render outputs derived from the physical specification and artwork package. These are presentation artifacts, not replacement source artwork.

Supported v1 roles:

- `shelfSpine`: shelf-optimized spine rendering.
- `frontCover`: front-facing cover rendering.
- `threeQuarterMockup`: realistic 3/4 physical mockup.
- `detailMockup`: high-quality selected-book view for interactive surfaces.
- `jacketOffMockup`: optional view of a jacketed hardcover with the jacket removed.

Consumers should prefer presentation assets where available rather than procedurally reconstructing final production appearance.

## Material profile

`materialProfile` describes how a renderer should understand the physical surfaces when a live render is required. This exists to preserve the distinction between the printed design and the object receiving it.

Examples:

- cloth case: woven matte textile over rigid board;
- paperback: flexible printed cover stock wrapped flush around page block;
- dust jacket: printed paper skin surrounding a separate hardcover case;
- page block: warm paper with layered/rough edge behavior.

Material profiles may identify reusable renderer presets, but the preset name is not itself publication truth. Publication truth remains the underlying construction/material fields.

## Provenance

Every generated presentation asset should be traceable to:

- the edition;
- the package version;
- the physical specification used;
- the source artwork asset(s);
- the generation method/tool version when automated;
- creation timestamp.

This permits regeneration without turning generated mockups into uncontrolled source material.

## Completeness

A package may be `draft` while incomplete.

An `approved` package must satisfy the schema plus construction-specific requirements defined in `pipeline.md` and `material-model.md`.

At minimum, an approved physical-book package requires:

- known binding and construction;
- authoritative trim dimensions;
- an approved cover-art path appropriate to that construction;
- at least one public-facing cover asset;
- at least one shelf-capable asset;
- successful validation.

## Supersession

When artwork, dimensions, construction, or mockup outputs materially change after approval:

1. do not modify the sealed approved package in place;
2. create the next `packageVersion`;
3. validate and approve the replacement;
4. mark the prior version `superseded` only after the new version is current.

## Prohibited derivations

The following are explicitly prohibited:

- infer binding from page count;
- infer jacket state from cover image proportions;
- infer cloth/casewrap from color or genre;
- infer trim size from a browser image;
- treat a generated mockup as the source cover design;
- treat frontend animation geometry as publication metadata;
- reuse a different edition's presentation package merely because the Work is the same.

## Consumer guarantee

If a consumer receives an approved EPP, it may assume the package's stated physical and artwork facts are authorized for that edition. It may not assume anything not stated by the package.