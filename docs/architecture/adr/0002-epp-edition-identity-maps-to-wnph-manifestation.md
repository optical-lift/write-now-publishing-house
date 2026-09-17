# ADR-0002: EPP edition identity maps to WNPH Manifestation

- **Status:** Accepted
- **Date:** 2026-09-16
- **Decision owners:** Write Now Publishing House architecture

## Context

The first Edition Presentation System documents used the domain-neutral term **Edition**. Inspection of the existing WNPH publication model shows that the durable object representing a concrete publication form is `wnph.manifestations`.

For *The Wish Fairy and Dewy Dear*, the governed publication Expression `wish-fairy-dewy-dear:wnph-publication-e1` already has a planned paperback Manifestation with canonical key `wish-fairy-dewy-dear:wnph-paperback-v1`.

Creating a second application-local "edition" identity for presentation would duplicate authority.

## Decision

Within WNPH, the EPP v1 `editionId` maps to the canonical **Manifestation key**.

```text
Historical Work
  -> Publication Expression
      -> Manifestation
          -> Edition Presentation Package
              -> Consumer rendering
```

For the first real package:

```text
editionId = wish-fairy-dewy-dear:wnph-paperback-v1
```

The EPP does not create the Manifestation. It only records physical and visual presentation facts for an existing Manifestation.

## Release relationship

A public release may expose a Work/Expression without exposing the Manifestation identifier needed by an EPP consumer. Until that public seam exists, `public_slug` may be used only as a derived lookup key:

```text
public_slug
  -> Manifestation canonical key
  -> current approved EPP
```

The slug never becomes Manifestation identity.

## Consequences

- WNPH keeps one authority for physical publication identity;
- paperback and hardcover manifestations of the same Work can own separate packages;
- EPP can remain artifact-first without adding a parallel edition table;
- future public RPC work can expose the existing Manifestation relationship instead of inventing another identifier;
- the neutral word "edition" may remain in EPS documentation, but in WNPH implementation it means the owning Manifestation.

## Physical facts

Manifestation identity does not imply that all physical production facts are already known. Trim, final page count, spine width, stock, finish, and cover art remain absent until governed publication work establishes them. A draft EPP must leave those fields absent rather than infer them.

## Verification

This decision is satisfied when real WNPH EPP manifests use existing Manifestation canonical keys and no frontend or package directory creates a competing edition identity.
