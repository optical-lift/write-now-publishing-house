# The Wish Fairy and Dewy Dear — WNPH Restored Hardcover EPP v1

**Package status:** draft

This Edition Presentation Package is owned by the existing WNPH Manifestation that was corrected from the early paperback assumption to the restored cloth-hardcover target. It preserves the same Manifestation identity; it does not create a second edition merely to repair the physical specification.

## Canonical ownership

- Work: `wish-fairy-and-dewy-dear`
- Publication Expression: `wish-fairy-dewy-dear:wnph-publication-e1`
- Expression ID: `d383ca4f-227f-4455-b7d0-169d7485e5a2`
- Owning Manifestation: `wish-fairy-dewy-dear:wnph-hardcover-v1`
- Manifestation ID: `0bb1920c-3df4-4ae9-9e4a-67ba8b39ff82`
- Manifestation state: `planned`
- Publisher: Write Now Publishing House
- Active render profile: `wnph:render:cloth-hardcover:v1`
- Current planned derivation: `aeac0ab9-0b32-4a1d-aff6-c6cb72fb0d42`
- Superseded paperback derivation: `7a8f443a-1ace-4675-95e0-c3874bdd43e9`

The EPP v1 `editionId` is the owning Manifestation canonical key. The old paperback derivation remains in publication custody as history; it is not the current physical target.

## Current publication snapshot

The current public release associated with the Expression is:

- release key: `wish-fairy-dewy-dear:wnph-public-release:v5`
- release sequence: 5
- release ID: `4e8f7291-975c-46a7-8a73-e8650c454193`
- release state: `released`
- render master: `b7bf5b77808954b4e04ccbe418edb125601aa9c604f5b45b8364c4a555561a1d`

The current planned physical derivation uses `wnph:render:cloth-hardcover:v1` and preserves the governed publication Expression as the text-and-media master. These facts establish ownership and restoration direction. They do **not** establish final printer geometry.

## Recovered cover artwork

WNPH already has an established recovered cover image for this book. That recovered image remains the graphic source for the physical-book presentation workflow.

The current web derivative at `public/recovered-covers/the-wish-fairy-and-dewy-dear/front-cover-restored.jpg` is only **320 × 480 pixels**. It is therefore not suitable as the high-resolution presentation master for the selected-book mockup. The governed Library of Congress source custody includes the original source surface through IIIF; however, that raw scan includes collection markings that the recovered cover removed. The correct repair is to recover or regenerate a high-resolution derivative from the governed source while preserving the already-approved restoration decisions—not to upscale the 320 × 480 file and not to redesign the cover.

Until a durable high-resolution recovered-cover asset reference is resolved into this package, `artwork` remains empty, the package remains draft, and no presentation asset may be represented as approved publication truth.

## Facts currently admitted to the manifest

- binding: hardcover
- construction: cloth case
- physical character: gray book cloth case
- surface character: cloth
- historical lettering/art direction: green lettering with the book-specific multicolor front image

The canonical Manifestation intentionally uses the Henry Altemus c1922 physical character as the restoration target. Exact WNPH manufacturing values remain separate decisions.

## Deliberately unresolved

The following remain absent from `manifest.json` until publication work establishes them:

- exact WNPH trim width and height;
- final print page count;
- spine width;
- exact cloth and board specification;
- page stock;
- exact jacket stock and construction;
- durable high-resolution recovered-cover asset reference;
- approved spine/back/case/jacket artwork when applicable;
- shelf-spine presentation asset;
- front-cover presentation asset;
- three-quarter/detail mockup;
- jacket-on/jacket-off presentation assets.

The historical approximately 5.5 × 4.25 inch bound-book dimensions remain source evidence. They are not silently promoted into exact printer trim.

## Historical dust jacket

The Henry Altemus series evidence records a matching white coated dust jacket. That is part of the restored edition's historical design target, but WNPH does not yet have approved jacket artwork or enough governed physical information to declare the EPP construction `dust-jacket`. The v1 package therefore records the authoritative cloth case now and leaves jacket presentation pending rather than inventing missing graphics.

## Proposal workspace

`proposals/` is the non-authoritative preparation area for the physical mockup workflow. It may hold mockup briefs, template tests, or physical-spec candidates. It is not a cover-design studio when approved/recovered cover art already exists.

Promotion path:

```text
approved high-resolution recovered cover
  + approved cloth-case physical specification
  + approved jacket facts/assets when available
  -> mockup generation job
  -> realistic presentation assets
  -> EPP validation
  -> package approval and sealing
```

See `proposals/mockup-brief-v1.md` and the architecture Mockup Generation Contract.

## Historical reference

`references/historical-source.md` records the source evidence governing the restored physical character and keeps that evidence distinct from exact WNPH manufacturing choices.

## Stop condition

This package must remain `draft` until the high-resolution recovered cover has a durable governed reference and the physical inputs required for the desired presentation outputs are authoritative. It cannot enter the public EPP index in its current state.
