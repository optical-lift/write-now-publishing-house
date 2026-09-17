# Edition Presentation System

**Status:** architecture v1

The Edition Presentation System (EPS) defines how a published or publication-bound edition acquires a durable physical and visual identity that can be reused by the public library, catalogue, marketing surfaces, print workflows, retailer exports, and future consumers.

## Governing distinction

```text
Work identity != Edition identity
Edition identity != Presentation package
Presentation package != Consumer rendering

Work
  -> Edition / Release
      -> Edition Presentation Package
          -> Website / Catalogue / Marketing / Mockups
```

A Work is the intellectual work. An Edition is a specific publication manifestation. An Edition Presentation Package (EPP) is the versioned physical/visual description and asset set for that edition. A website or other surface is only a consumer of that package.

## Core invariant

> The website never invents a book's physical identity. It renders the Edition Presentation Package produced during publication.

A consumer may scale, crop, position, animate, and responsively compose approved assets. It may not fabricate binding, trim size, jacket state, material, artwork, page count, spine width, or other publication facts.

If physical facts are unknown, they remain unknown. The system must not infer hardcover from page count, paperback from length, or material from appearance.

## Purpose

EPS exists so that every physical edition can pass through the same repeatable publication process and emerge with enough structured evidence for another application to render a recognizable physical representation without inventing facts.

A presentation-complete edition has:

- an explicit edition identity;
- an approved physical specification;
- an approved cover/artwork package;
- a versioned presentation manifest;
- the required presentation assets for its construction type;
- provenance from each presentation asset back to the edition and source artwork;
- validation that the package is internally consistent.

## Scope

EPS owns:

- edition presentation manifests;
- physical presentation facts used to render an edition;
- binding/construction/material vocabulary;
- approved cover, spine, wrap, jacket, and mockup asset references;
- presentation-package versioning;
- validation rules for presentation completeness;
- consumer rules for rendering those assets.

EPS does **not** own:

- Work identity;
- bibliographic authorship or title authority;
- textual content;
- source/recovery provenance;
- release authorization;
- printing vendor state;
- storefront pricing;
- frontend layout state;
- shelf position, lean, animation timing, or other consumer-only geometry.

## Publication lifecycle

```text
Edition identified
  -> Physical specification approved
  -> Cover/artwork package approved
  -> Presentation package assembled
  -> Manifest validated
  -> Package version sealed
  -> Attached to edition/release
  -> Consumed by public surfaces
```

See [pipeline.md](./pipeline.md) for lifecycle and state-transition rules.

## Contract surface

The machine-readable package is defined by [`edition-presentation-manifest.schema.json`](./edition-presentation-manifest.schema.json). Human semantics are defined by [edition-presentation-contract.md](./edition-presentation-contract.md).

The first supported physical constructions are:

- paperback wrap;
- cloth/case hardcover without jacket;
- printed casewrap hardcover;
- dust-jacketed hardcover.

See [material-model.md](./material-model.md).

## Required consumer behavior

A consumer receives an approved presentation manifest and chooses only assets appropriate to its surface. For example:

```text
Homepage shelf
  -> shelfSpine

Selected-book detail
  -> detailMockup or frontCover + physical construction data

Catalogue record
  -> frontCover

Press kit
  -> frontCover + threeQuarterMockup + fullWrap/jacketSpread when authorized
```

Consumers must follow [consumer-contract.md](./consumer-contract.md).

## Versioning

Presentation packages are immutable once sealed for a release. A revised cover, changed binding, corrected spine width, or replacement mockup creates a new package version rather than silently rewriting a sealed package.

A Work may have many Editions. An Edition may have successive presentation-package versions, but exactly one package version may be designated current for a given released edition at a time.

## Unknown state

Unknown is a first-class state. If an edition lacks authoritative physical information, EPS must not manufacture it. Consumers must render a neutral fallback or omit physical representation until an authorized package exists.

## Current prototype relationship

The existing spatial-library prototype may use temporary procedural colors, fake bindings, and demo volumes for interaction research. Those are development fixtures only. They are not Edition Presentation Packages and must never be promoted into publication truth.

The long-term shelf direction is:

```text
canonical edition
  -> current EPP
  -> real spine / mockup assets
  -> lightweight shelf interaction
```

not:

```text
canonical edition
  -> frontend invents book
```

## Acceptance test

> A release is presentation-complete when another application can render a recognizable physical representation of that edition using only its Edition Presentation Package, without inventing bibliographic, material, binding, artwork, or dimensional facts.

## Architecture decisions

- [ADR-0001: Edition presentation is release-derived](../adr/0001-edition-presentation-is-release-derived.md)

## Examples

- [Paperback example](./examples/paperback.json)
- [Cloth hardcover example](./examples/cloth-hardcover.json)
- [Jacketed hardcover example](./examples/jacketed-hardcover.json)

The example manifests are fixtures, not publication records.