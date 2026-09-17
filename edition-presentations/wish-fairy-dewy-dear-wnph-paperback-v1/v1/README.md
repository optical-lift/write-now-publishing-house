# The Wish Fairy and Dewy Dear — WNPH Paperback EPP v1

**Package status:** draft

This is the first real Edition Presentation Package created under the WNPH Edition Presentation System. It is owned by the existing planned WNPH paperback Manifestation; it does not create a new edition identity.

## Canonical ownership

- Work: `wish-fairy-and-dewy-dear`
- Publication Expression: `wish-fairy-dewy-dear:wnph-publication-e1`
- Expression ID: `d383ca4f-227f-4455-b7d0-169d7485e5a2`
- Owning Manifestation: `wish-fairy-dewy-dear:wnph-paperback-v1`
- Manifestation ID: `0bb1920c-3df4-4ae9-9e4a-67ba8b39ff82`
- Manifestation state: `planned`
- Publisher: Write Now Publishing House
- Active render profile: `wnph:render:paperback:v2`

The EPP v1 `editionId` is the owning Manifestation canonical key.

## Current publication snapshot

The current public release associated with the Expression is:

- release key: `wish-fairy-dewy-dear:wnph-public-release:v5`
- release sequence: 5
- release ID: `4e8f7291-975c-46a7-8a73-e8650c454193`
- release state: `released`
- render master: `b7bf5b77808954b4e04ccbe418edb125601aa9c604f5b45b8364c4a555561a1d`

The latest governed paperback derivation found for this Manifestation is planned and uses `wnph:render:paperback:v2`. Its master snapshot reports 167 text blocks, 171 admitted blocks, 7 media placements, exact media-byte receipts, and reproducible-build readiness.

These facts establish ownership and input readiness. They do **not** establish final physical geometry.

## Recovered cover artwork

WNPH already has an established recovered image for this book. That image is the graphic source to be used for the physical-book mockup workflow.

The EPS mockup process must **not** redesign or replace it. The correct next step is to resolve its governed asset reference and apply that image to the approved paperback construction through the Mockup Generation Pipeline.

Until that durable asset reference has been resolved into this package, the manifest remains draft and the mockup job remains blocked on the real image rather than substituting new artwork.

## Facts currently admitted to the manifest

- binding: paperback
- construction: paperback wrap

Those facts come from the existing WNPH Manifestation and active paperback render contract.

## Deliberately unresolved

The following remain absent from `manifest.json` until publication work establishes them:

- trim width and height;
- final print page count;
- spine width;
- cover stock;
- page stock;
- surface finish;
- durable recovered-cover asset reference;
- approved spine/back/full-wrap assets when applicable;
- shelf-spine presentation asset;
- front-cover presentation asset;
- three-quarter/detail mockup.

The historical 1922 physical book is reference evidence, not authority for the new WNPH paperback's manufacturing dimensions.

## Proposal workspace

`proposals/` is the non-authoritative preparation area for the physical mockup workflow. It may hold mockup briefs, template tests, or physical-spec candidates. It is not a cover-design studio when approved/recovered cover art already exists.

Promotion path:

```text
approved/recovered cover image
  + approved physical specification
  -> mockup generation job
  -> realistic presentation assets
  -> EPP validation
  -> package approval and sealing
```

See `proposals/mockup-brief-v1.md` and the architecture Mockup Generation Contract.

## Historical reference

`references/historical-source.md` records relevant facts about the original Henry Altemus manifestation so physical/publication research can remain distinct from the recovered cover image and from new WNPH manufacturing choices.

## Stop condition

This package must remain `draft` until the recovered cover asset has been resolved and authoritative physical inputs exist for the required mockup outputs. It cannot enter the public EPP index in its current state.