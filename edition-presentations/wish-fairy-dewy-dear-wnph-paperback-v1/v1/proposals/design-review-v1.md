# Design Review v1 — Recovered Storybook Cover Study

**Status:** review of proposal assets only

## Assets reviewed

- `front-cover-v1.svg`
- `spine-v1.svg`
- `three-quarter-v1.svg`
- `detail-v1.svg`
- `physical-spec-v1.md`

## What the proposal is testing

The first study deliberately avoids reproducing the historical object as if it were WNPH production truth. Instead, it tests whether the new edition can feel connected to a recovered 1922 children's book while still reading as a newly manufactured WNPH paperback.

The concept uses:

- a warm paper-colored field;
- a dark moss-green typographic system;
- a dew-drop/fairy emblem derived as a new motif rather than copied from a historical cover;
- restrained botanical framing;
- compact storybook proportions;
- visible page block and cover-stock separation in the physical mockups.

## Visual review

### Front cover

The title remains dominant and readable at reduced scale. The upper WNPH line is intentionally subordinate, the recovered-storybook line provides context, and the central emblem carries the fairy/dew association without becoming a generic fantasy illustration.

The design does not depend on a full-bleed synthetic background, which helps it retain a paper-object character.

### Spine

The spine study establishes the design language, not final production geometry. Its width is intentionally exaggerated enough to review the visual treatment.

The final print spine may be too narrow for the full title. Production typography must be recalculated only after authoritative spine width exists.

### Three-quarter mockup

The mockup preserves the central physical distinction required by EPS:

- the front cover reads as a thin flexible wrapper;
- the page block is visible as a separate object;
- the fore-edge is paper rather than cover material;
- there is no hardcover board overhang;
- the cover receives its own edge/highlight behavior.

That makes the proposal physically consistent with a paperback rather than merely placing a rectangular cover image on a box.

### Website-detail study

The selected-book study remains recognizable without requiring the shelf UI to invent binding, finish, or dimensions. Once an EPP is approved, a final detail asset can replace procedural book construction entirely.

## Source relationship

The Library of Congress record establishes that the 1922 source is a 63+[1]-page, illustrated, 14 cm book published by Henry Altemus and that the digitized copy is public domain. Those are historical facts about the source object; they do not determine WNPH trim, page count, cover stock, or binding geometry.

The current proposal therefore treats the source as aesthetic and bibliographic context rather than a manufacturing template.

## Promotion decision

**No new proposal-only field should be promoted into `manifest.json` yet.**

That is deliberate, not a failure of the design. The proposal has now done its job: it gives publication review a concrete object to approve or reject.

Already-authoritative facts remain:

- paperback;
- paperback-wrap construction.

Review-ready but not authoritative:

- 5 × 7.5 in preferred trim;
- 5 × 8 in fallback trim;
- tactile low-gloss paper-forward cover treatment;
- compact storybook proportion;
- the recovered-storybook cover concept;
- the current title/author/emblem layout.

Still blocked by production evidence:

- final page count;
- exact spine width;
- paper caliper;
- printer-specific cover/interior stock;
- final surface finish;
- production spine typography.

## Next publication boundary

The next state change should happen only after an explicit publication approval of the visual direction and preferred trim. If approved, WNPH can lock the trim, paginate the actual print interior, calculate the real spine, and build a true continuous wrap. That is the point at which new EPP physical fields become eligible for promotion.
