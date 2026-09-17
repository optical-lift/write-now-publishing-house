# Edition Presentation Packages

This directory is the conventional package root for the Edition Presentation System (EPS).

It does not replace canonical Work, Expression, or Manifestation identity. In WNPH, an EPP is owned by an existing publication **Manifestation**. EPP v1 `editionId` maps to that Manifestation's canonical key.

## Package layout

```text
edition-presentations/
  <manifestation-key>/
    v1/
      manifest.json
      README.md
      references/
        ... source/design reference evidence ...
      proposals/
        ... non-authoritative physical/artwork/mockup candidates ...
      artwork/
        ... approved source artwork or durable references ...
      presentation/
        ... approved/generated mockups or durable references ...
    v2/
      manifest.json
      ...
```

Repository storage is optional for binary assets. Production packages may reference immutable object-storage assets through the manifest as long as provenance and hashes are retained.

## Rules

- package versions are immutable once approved;
- a new physical construction or materially revised design creates a new package version;
- a package never creates Work, Expression, or Manifestation identity;
- `proposals/` is a non-authoritative workspace and is never consumed publicly;
- only explicit approval promotes physical facts or artwork into the EPP manifest;
- the current public consumer may locate an approved package by derived `public_slug -> Manifestation key -> package` index until a canonical Manifestation/EPP public read seam exists;
- fake/demo books belong in development fixtures, not approved packages;
- consumers must not manufacture missing artwork or physical facts.

See `docs/architecture/edition-presentation/` for the governing architecture, schema, material model, proposal workflow, pipeline, and consumer contract.

## First real package

`wish-fairy-dewy-dear:wnph-paperback-v1/v1/` is the first real WNPH EPP draft. It is intentionally incomplete: the existing Manifestation establishes paperback identity, while trim, final page count, spine width, stock/finish, cover artwork, and presentation assets remain unresolved until publication approval.
