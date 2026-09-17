# Edition Presentation Packages

This directory is the conventional package root for the Edition Presentation System (EPS).

It does not replace canonical Work or Edition identity. Each package is owned by one canonical edition and is valid only when its manifest satisfies the EPS contract.

## Package layout

```text
edition-presentations/
  <edition-id>/
    v1/
      manifest.json
      artwork/
        ... source artwork or durable references ...
      presentation/
        ... generated mockups or durable references ...
    v2/
      manifest.json
      ...
```

Repository storage is optional for binary assets. Production packages may reference immutable object-storage assets through the manifest as long as provenance and hashes are retained.

## Rules

- package versions are immutable once approved;
- a new physical construction or materially revised design creates a new package version;
- a package never creates Work or Edition identity;
- the current public consumer may locate an approved package by derived `public_slug -> editionId -> package` index until a canonical Edition/EPP public read seam exists;
- fake/demo books belong in development fixtures, not this directory;
- consumers must not manufacture missing artwork or physical facts.

See `docs/architecture/edition-presentation/` for the governing architecture, schema, material model, pipeline, and consumer contract.

No real publication package is added by the initial runtime slice. The architecture examples remain noncanonical fixtures.
