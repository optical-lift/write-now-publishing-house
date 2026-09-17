# Mockup Generation Contract

**Status:** architecture v1

The Mockup Generation Contract defines how Write Now turns already-approved cover artwork into realistic physical-book presentation assets for an Edition Presentation Package (EPP).

## Core invariant

> Mockup generation does not design the cover. It applies approved artwork to an approved physical book construction.

The approved/recovered cover image remains the graphic identity. The generator supplies only the physical object around it: book geometry, material response, page block, seams, edges, lighting, shadow, and construction-specific wrapping.

## Ownership chain

```text
Manifestation
  -> approved cover artwork
  -> approved physical specification
  -> mockup generation job
  -> derived presentation assets
  -> EPP
  -> website / catalogue / marketing consumers
```

The generator never becomes authority for title, artwork, binding, trim, page count, spine width, material choice, or jacket state.

## Required inputs

A generation job must identify:

- canonical Manifestation / EPP edition ID;
- package version;
- binding and construction;
- approved front-cover asset;
- authoritative trim dimensions;
- authoritative spine width when a spine is rendered;
- physical/material specification required by the chosen template.

Construction-specific inputs may include:

- approved back-cover asset;
- approved spine asset;
- approved full-wrap asset;
- approved case-front/case-spine/case-back assets;
- approved jacket spread;
- page count;
- cover stock / case material / jacket stock / page stock;
- surface finish.

If a required physical fact is unknown, the job stays draft or produces only outputs that do not depend on that fact. The generator does not estimate publication truth.

## Approved artwork rule

Artwork inputs are immutable references for the generation run.

The generator may:

- map artwork to the correct physical surface;
- crop only within an approved safe-area rule;
- perspective-transform artwork to match the physical surface;
- apply lighting, texture, roughness, fold shadows, and edge behavior over the artwork;
- composite the approved artwork with separately rendered physical geometry.

The generator may not:

- redraw or replace the cover image;
- generate a substitute illustration;
- recolor the approved cover as a new design direction;
- rewrite title/author text embedded in the art;
- invent spine/back artwork when no approved rule or source asset exists;
- flatten a dust jacket, cloth case, page block, and artwork into one image layer and call that construction truth.

## Template families

V1 supports these physical template families:

### Paperback

Template responsibilities:

- thin flexible printed wrapper;
- page block separate from cover stock;
- fore-edge/top/bottom paper surfaces;
- subtle spine/hinge crease;
- no rigid board overhang;
- realistic contact/cast shadows.

### Cloth hardcover

Template responsibilities:

- rigid boards and board thickness;
- recessed page block;
- hinge/joint channels;
- cloth texture and matte material response;
- optional headbands;
- approved case art/stamping only when supplied.

### Printed casewrap hardcover

Template responsibilities:

- rigid-board geometry;
- approved printed casewrap mapped over boards/spine;
- hinge shadows and edge wrapping;
- recessed page block.

### Dust-jacketed hardcover

Template responsibilities:

- complete underlying hard case;
- separate thin paper jacket layer;
- jacket folds at spine/hinges;
- jacket edge/lip/curl within restrained physical bounds;
- jacket material response independent from underlying case;
- approved jacket artwork mapped to the jacket, not the boards.

## Required outputs

For a presentation-complete physical edition, the standard output set is:

- `shelfSpine` — shelf-optimized spine presentation;
- `frontCover` — front-facing presentation of the approved cover on the physical object or a clean approved cover export;
- `threeQuarterMockup` — realistic three-quarter physical rendering;
- `detailMockup` — selected-book rendering intended for website/detail use.

Construction-specific optional outputs include:

- `jacketOffMockup`;
- `backCover` presentation;
- `fullWrap` / `jacketSpread` print reference;
- retailer/press-kit derivatives.

## Asset provenance

Every generated asset must record:

- edition ID;
- package version;
- source artwork URI(s) and immutable hash(es) when available;
- physical specification version or hash;
- template family and template version;
- generator/tool version;
- generation timestamp;
- output asset URI and hash.

This permits regeneration without treating the mockup as source artwork.

## Determinism and regeneration

The preferred generator is deterministic for the same input package, template version, and render settings. If deterministic byte identity is not practical, provenance must still make the generation inputs reproducible and comparable.

A mockup may be regenerated for resolution or export format without changing publication identity. A material change to approved artwork or physical construction requires a new EPP package version according to the EPS versioning rules.

## Website boundary

The public website is not the mockup generator.

The website consumes `presentation.shelfSpine`, `presentation.threeQuarterMockup`, or `presentation.detailMockup` and may animate/position those assets. It must not recreate a final physical identity from arbitrary colors, procedural fake covers, or guessed material properties when an approved mockup asset is expected.

A lightweight live renderer is permitted only for interaction geometry and only when it uses approved EPP facts/assets without inventing publication truth.

## Acceptance test

A generated mockup passes this contract when:

1. the approved artwork is visibly unchanged in graphic identity;
2. the book would still read as the declared physical construction if the artwork were mentally ignored;
3. page block, cover/case/jacket, seams, edges, and shadows remain physically distinct;
4. every visual fact that implies manufacturing comes from the approved physical specification or a neutral renderer behavior;
5. the resulting asset can be consumed by the website without the website inventing the book.