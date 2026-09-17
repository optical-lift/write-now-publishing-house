# Mockup Generation Runtime Boundary

This document defines the website-facing runtime boundary for physical-book mockups.

## Publication side

Publication owns:

- approved/recovered cover artwork;
- Manifestation physical facts;
- template-family selection;
- generated presentation assets;
- asset provenance and hashes;
- EPP approval/versioning.

## Website side

The website owns only:

- shelf order and grouping;
- horizontal position and spacing;
- lean and camera curve;
- hover/focus treatment;
- pull-forward / return motion;
- responsive scaling;
- selection state.

The website does not own cover design, binding/material truth, or mockup generation.

## Preferred shelf contract

For each approved EPP consumer record, provide:

- `editionId`;
- `packageVersion`;
- `shelfSpine` asset;
- `detailMockup` or `threeQuarterMockup` asset;
- optional `frontCover` asset;
- physical aspect/depth hints derived from approved Manifestation facts when needed for interaction geometry.

The shelf renderer may place `shelfSpine` on a lightweight 3D interaction plane. On selection it should transition continuously into the selected-book presentation asset or an approved live render without changing edition identity.

## Motion rule

Motion is consumer geometry, not mockup truth.

The selected representation should:

1. remain keyed to one edition throughout the animation;
2. originate from the live source element;
3. move through one continuous transform chain where practical;
4. return to the freshly measured live source position;
5. hand visibility back only after overlap/alignment is complete.

This avoids the jerky visual substitution seen in early prototypes.

## Missing assets

If `shelfSpine` or a detail asset is missing, use another approved semantically appropriate asset or a neutral non-physical fallback. Do not resurrect arbitrary procedural colors or newly generated cover graphics as a production fallback.

## Deployment boundary

Wiring a new EPP/mockup consumer into the website is implementation work. Updating a watched Git branch, generating a Vercel preview, or releasing to production remains separately authorized.