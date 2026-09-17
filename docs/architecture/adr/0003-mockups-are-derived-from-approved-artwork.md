# ADR-0003: Mockups are derived from approved artwork and physical templates

- **Status:** Accepted
- **Date:** 2026-09-16
- **Decision owners:** Write Now Publishing House architecture

## Context

The spatial-library prototype initially attempted to make books look realistic by procedurally inventing cover colors, materials, and book-like surfaces in the frontend. That was useful for interaction research but produced objects that looked synthetic and risked making the website responsible for a book's visual identity.

WNPH already establishes or recovers cover artwork before website presentation. In normal publishing practice, approved cover art is placed into a physical-book mockup template so the art appears printed or wrapped onto a believable paperback, casebound book, or dust jacket.

## Decision

WNPH will treat realistic book mockups as **derived publication presentation assets**.

The governing chain is:

```text
approved cover artwork
  + approved physical specification
  + versioned physical mockup template
  -> generated presentation assets
  -> Edition Presentation Package
  -> website consumer
```

The mockup generator does not design a new cover. The website does not generate a final physical book identity at runtime.

## Consequences

- recovered/approved cover images remain canonical graphic inputs;
- paperback, cloth case, casewrap, and dust-jacket realism comes from reusable physical templates;
- the same cover can be rendered consistently into shelf, three-quarter, and detail assets;
- website code becomes responsible for interaction and placement rather than manufacturing realism;
- material changes remain versioned and reviewable through the EPP;
- a future automated renderer can replace a Photoshop-style manual mockup process without changing the consumer contract.

## Rejected alternatives

### Procedural frontend cover generation

Rejected for production use because it invents colors, graphics, and material identity in a consumer layer.

### Treat the flat cover PNG as the whole book

Rejected because it erases page block, cover thickness, seams, jacket/case distinction, and believable physical lighting.

### Generate new cover art during mockup creation

Rejected because mockup generation is a presentation step, not an artwork-authoring step.

## Verification

This decision is satisfied when:

1. a mockup job references approved artwork rather than prompting for replacement art;
2. physical construction comes from the owning Manifestation/EPP;
3. standard presentation assets are generated from a versioned physical template;
4. the website can render shelf/detail states using those assets without inventing the edition's visual identity.