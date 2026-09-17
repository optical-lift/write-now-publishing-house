# Physical Specification Proposal v1 — The Wish Fairy and Dewy Dear

**Status:** proposal only — not publication authority

## Purpose

This document defines the first physical study for the planned WNPH paperback Manifestation `wish-fairy-dewy-dear:wnph-paperback-v1`.

It exists so the cover and presentation assets can be reviewed as a manufactured book before any new physical facts are promoted into the Edition Presentation Package.

## Candidate construction

- binding family: paperback
- construction: paperback wrap
- preferred trim study: **5 × 7.5 in**
- production fallback if printer constraints require a standard trim: **5 × 8 in**
- binding method for the study: perfect bound
- page-block character: warm/natural uncoated paper, visibly distinct from cover stock
- cover character: tactile low-gloss stock; avoid hard glossy/plastic response
- visual mass: light, compact storybook rather than full trade-paperback scale

The binding family and paperback-wrap construction are already canonical WNPH facts. Everything else above is a design proposal.

## Why 5 × 7.5 in

The source book is recorded by the Library of Congress as a small 14 cm volume. The new WNPH edition should not copy that historical geometry automatically, but a compact trim preserves the recovered-storybook character while giving the text and seven governed color placements more breathing room than the 1922 object.

The 5 × 7.5 in study also produces a recognizable small book on the digital shelf rather than a generic tall trade paperback.

## Interior and stock proposal

First-pass material intent:

- interior: opaque white or natural-white uncoated stock suitable for readable text and color plates;
- cover: uncoated or very low-gloss coated stock with a paper-forward feel;
- finish: matte/tactile, not high gloss;
- page edges: warm neutral, low specularity.

Exact stock names, weights, coating, and finish remain vendor decisions and are **not** approved EPP facts.

## Page count and spine

The current governed publication Expression is render-ready, but the final print pagination has not been established.

For the proposal mockups only, the rendered object assumes approximately **80 pages** and a visually proportionate narrow spine. Those values exist only to make the study look like a plausible paperback. They must not be copied into `manifest.json`.

The final EPP spine width must come from:

```text
approved trim
+ final paginated print interior
+ approved paper caliper / printer specification
= authoritative spine width
```

If the final spine is too narrow for readable spine typography, the production spine should omit or simplify text rather than force illegible lettering.

## Cover design fit

The first cover concept is intentionally compatible with both proposed trims:

- warm paper field rather than full synthetic color flood;
- dark moss-green typography and border;
- muted blue-green dew/fairy emblem;
- restrained botanical framing;
- title remains the dominant identity at small size;
- artwork is treated as print on flexible cover stock, not as a rigid board.

## Promotion test

No new physical fact from this proposal should enter the EPP until it passes an explicit publication decision.

Potential future promotion candidates:

1. trim dimensions — only after explicit approval;
2. stock/material descriptions — only after printer/material choice;
3. surface finish — only after print finish is selected;
4. final page count — only after print pagination is locked;
5. spine width — only after final pagination and paper caliper are known;
6. perfect-bound method — only if the production Manifestation is actually manufactured that way.

## Current conclusion

This proposal is strong enough to drive visual review, but it is **not yet strong enough to add new physical fields to the authoritative manifest**.

The only EPP physical facts that remain publication-ready today are the ones already present:

- `binding: paperback`
- `construction: paperback-wrap`
