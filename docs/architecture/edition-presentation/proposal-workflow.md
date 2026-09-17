# Edition Presentation Proposal Workflow

Edition Presentation Packages need a place for design exploration before publication facts and artwork are approved. This workflow defines that boundary.

## Two layers

```text
proposal workspace
  -> publication judgment / approval
      -> authoritative EPP manifest + assets
```

A proposal may be realistic, polished, and suitable for review while remaining non-authoritative. It must not be consumed by public surfaces as though it were an approved edition package.

## Why this exists

A real book cover cannot be designed only after every production decision is final: visual design and physical specification inform one another. At the same time, allowing mockups to write facts directly into the package would let experiments become accidental publication truth.

The proposal workspace permits iterative design without collapsing those layers.

## Package convention

A draft package may contain:

```text
v1/
  manifest.json
  README.md
  references/
    ... source and design reference evidence ...
  proposals/
    README.md
    cover-brief-v1.md
    physical-spec-proposal-v1.json
    artwork/
    mockups/
  artwork/
    ... approved source artwork only ...
  presentation/
    ... approved/generated presentation assets only ...
```

`proposals/` is ignored by the public EPP index and consumer adapter.

## Promotion

Promotion is explicit. An approved design does not become authoritative by file movement alone.

For physical facts:

1. a proposed value is reviewed;
2. publication authority approves it for the owning Manifestation;
3. the authoritative Manifestation/publication record is updated when that domain owns the fact;
4. the EPP manifest records the approved value.

For artwork:

1. candidate art is reviewed in flat and realistic physical mockups;
2. final art is approved for the Manifestation;
3. immutable approved asset references/hashes are recorded under `artwork`;
4. presentation derivatives are generated from the approved art and physical spec;
5. derivatives are recorded under `presentation` with provenance.

## Mockup as proof, not authority

A mockup proves that approved artwork and physical facts can compose into a credible object. It does not establish those facts by itself.

The mockup system must render:

- separate cover material and page block;
- binding-specific seams/hinges/creases;
- correct front/spine/back mapping;
- material texture over print rather than replacing print;
- physically plausible lighting and contact shadows;
- the authorized trim/spine proportions once available.

## Iteration

While an EPP is draft, proposals may be added, rejected, and superseded freely. Once an EPP is approved, changing the approved physical identity or artwork requires the normal EPP versioning/supersession process.

## Deployment boundary

Proposal creation, EPP approval, branch movement, website preview deployment, and production deployment are distinct operations. None authorizes another.
