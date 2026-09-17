# Mockup Generation Outputs

The standard web presentation bundle generated from approved cover artwork and a physical template is:

```text
presentation/
  shelf-spine.*
  front-cover.*
  three-quarter.*
  detail.*
```

## `shelf-spine`

Purpose: resting representation on a spatial shelf.

Requirements:

- derived from the same approved artwork/physical package as the detail mockup;
- recognizable at compact size;
- transparent or tightly cropped background preferred;
- must preserve the physical silhouette appropriate to the binding;
- may include rendered edge/highlight/shadow intrinsic to the book object, but not a baked shelf/environment background.

## `front-cover`

Purpose: catalogue/front-facing presentation.

Requirements:

- approved cover art remains faithful;
- may be a clean cover export or a minimally physical front-facing mockup;
- should not introduce perspective that harms legibility when used as a catalogue image.

## `three-quarter`

Purpose: realistic general-purpose physical-object view.

Requirements:

- show front face plus enough spine/page geometry to make construction legible;
- transparent/neutral background preferred;
- preserve material and page-block distinction;
- avoid decorative staging that makes the asset unusable across consumers.

## `detail`

Purpose: selected-book state on the WNPH website.

Requirements:

- optimized for the size/aspect used by the selected-book surface;
- retain enough edge/spine/page information to read as a physical book;
- avoid embedding interface text, buttons, or shelf background;
- transparent background preferred so the website can animate/place the object.

## Optional roles

Construction-specific packages may also generate:

- `jacket-off`;
- `back-cover`;
- `press-three-quarter`;
- higher-resolution retailer/press-kit exports.

## Export identity

All outputs from one mockup job must share:

- edition ID;
- package version;
- source-artwork identity;
- template family/version;
- physical-spec identity;
- generation receipt.

Consumers should not mix presentation roles from different EPP versions in one visible book state.