# Consumer Contract

This contract governs applications that consume an approved Edition Presentation Package (EPP).

## Consumer authority

A consumer may present an edition. It does not acquire authority over edition or presentation-package truth.

Consumers may:

- select the approved asset appropriate to a surface;
- scale proportionally;
- crop within documented safe areas;
- position and compose assets;
- animate a physical representation;
- apply responsive layout;
- add non-authoritative interaction geometry such as shelf position, lean, hover lift, or camera perspective;
- fall back conservatively when an approved asset is unavailable.

Consumers may not:

- invent binding or construction;
- recolor approved artwork as the edition identity;
- replace an approved cover with generated substitute art;
- fabricate a dust jacket;
- infer trim/spine dimensions;
- change title/creator text embedded in artwork;
- treat consumer animation state as package metadata;
- mutate or overwrite an approved package.

## Preferred assets by use

### Shelf / compact library

Prefer `presentation.shelfSpine`.

If a shelf spine is absent, use an approved spine artwork asset only when the renderer can preserve the declared physical construction without invention. Otherwise use a neutral non-physical fallback.

### Front-facing catalogue

Prefer `presentation.frontCover`, falling back to approved `artwork.frontCover` when appropriate.

### Selected-book / hero presentation

Prefer `presentation.detailMockup`, then `presentation.threeQuarterMockup`.

A live physical renderer may be used when the package contains enough physical/material/artwork information to reproduce the edition without guessing.

### Press / marketing

Use package-approved presentation exports. Do not scrape or screenshot the interactive website when source presentation assets exist.

## Website shelf rule

The public library may determine layout facts such as:

- order;
- shelf grouping;
- horizontal position;
- visual spacing;
- camera curve;
- selection state;
- animation path.

Those facts remain frontend presentation state and are never written back into the EPP.

## Interaction continuity

When an interactive shelf visually removes a book from its shelf position, the moving representation should remain tied to the same edition and return to the live position of the same source element. Consumers should avoid visual substitution that makes a book appear to become a different object during motion.

## Fallback hierarchy

When assets are missing:

1. use another approved role from the same current package if semantically appropriate;
2. use a neutral edition card or textual fallback;
3. omit physical rendering if necessary.

Never satisfy a missing asset by inventing physical or artwork facts.

## Accessibility

Physical metaphors must not become the only path to an edition.

Consumers must preserve:

- accessible edition labels;
- keyboard selection;
- readable text alternatives;
- reduced-motion behavior;
- conventional links/routes to the edition;
- non-spatial catalogue access where appropriate.

## Cache and version behavior

Consumers should key cached presentation assets by edition ID and package version or immutable asset identity. A newly approved package should not silently reuse stale mockups from an older package version.

## Historical presentations

A consumer may intentionally render a superseded package for historical/editorial purposes only when the context makes that distinction clear. Ordinary public presentation uses the current approved package.

## Validation at integration boundaries

Before exposing an EPP publicly, a consumer should confirm:

- package status is `approved`;
- edition ID matches the requested edition;
- expected asset references resolve;
- package version is current for ordinary public use;
- no local fallback is overriding known package truth.

## Development fixtures

Fake books and procedural binding studies may exist in development. They must be explicitly marked as fixtures and must not flow into canonical library/release reads, public bibliographic counts, or publication records.