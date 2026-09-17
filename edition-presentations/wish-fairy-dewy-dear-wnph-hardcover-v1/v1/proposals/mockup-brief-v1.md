# Mockup Brief v1 — The Wish Fairy and Dewy Dear

**Status:** proposal workflow only — no new cover design

## Purpose

Create realistic physical-book presentation assets from the already-established recovered cover image for *The Wish Fairy and Dewy Dear* and the corrected WNPH cloth-hardcover Manifestation.

The recovered image is the graphic cover input. This workflow does not redesign, redraw, recolor, reinterpret, or replace that image.

## Canonical identity

- Work: `wish-fairy-and-dewy-dear`
- Publication Expression: `wish-fairy-dewy-dear:wnph-publication-e1`
- Target Manifestation: `wish-fairy-dewy-dear:wnph-hardcover-v1`
- Manifestation ID: `0bb1920c-3df4-4ae9-9e4a-67ba8b39ff82`
- Render profile: `wnph:render:cloth-hardcover:v1`
- Planned derivation: `aeac0ab9-0b32-4a1d-aff6-c6cb72fb0d42`

## Required artwork input

Resolve the approved/recovered cover image through the governed WNPH publication/media seam and record its immutable asset reference in the EPP artwork section when approved for this Manifestation.

The current repository web derivative is 320 × 480 pixels. It may be used to identify the established restoration, but it must not be promoted as the high-resolution mockup master. The governed Library of Congress source surface is available through IIIF; any high-resolution recovery must preserve the established restoration decisions while removing collection-only markings deterministically and reviewably.

Do not create a substitute cover if the recovered master is temporarily unavailable. The presentation job remains blocked on the real recovered image.

## Mockup task

Once the authoritative cloth-case physical specification is sufficient, place the approved recovered front image onto a reusable cloth-hardcover mockup template that provides:

- rigid case-board geometry;
- gray book-cloth material response;
- a separate page block recessed inside the boards;
- front and back board overhang;
- hinge/joint behavior appropriate to a cloth case;
- fore-edge, top-edge, and bottom-edge paper surfaces;
- physically plausible case thickness;
- contact and cast shadows;
- cloth/material response over the front treatment without altering the recovered graphic.

The historical source also records a matching white coated dust jacket. Do not synthesize that jacket. Jacketed outputs remain pending until approved jacket artwork and physical facts exist.

## Required web presentation outputs

Generate, from the same approved artwork and governed physical job when each output is supportable:

1. `presentation.shelfSpine`;
2. `presentation.frontCover`;
3. `presentation.threeQuarterMockup`;
4. `presentation.detailMockup`;
5. `presentation.jacketOffMockup` if and when an approved dust-jacket layer exists.

If approved spine/back/jacket artwork does not yet exist, do not invent it. Generate only outputs that can be produced without fabricating publication graphics, or leave those outputs pending.

## Website use

The homepage shelf consumes generated presentation assets and may position, lean, scale, and animate them. The selected-book state consumes the approved detail or three-quarter mockup. The website does not redraw the recovered cover or synthesize a replacement physical identity.

Until the EPP is approved, the current CSS book may remain only as interaction geometry. It must not be treated as authoritative publication appearance.

## Stop condition

This mockup brief is complete when the high-resolution recovered cover asset has been resolved and the cloth-hardcover physical specification is authoritative enough to run the supported template job. Until then, no newly designed cover art, spine, back, or jacket should be created.
