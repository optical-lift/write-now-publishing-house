# Mockup Generation Pipeline

This pipeline operationalizes the Mockup Generation Contract. It begins only after cover artwork exists; it is not a cover-design workflow.

## State machine

```text
artwork_ready
  -> physical_spec_ready
  -> job_ready
  -> rendered
  -> visually_validated
  -> promoted_to_epp
  -> sealed_with_package
```

A failed render or failed visual review returns to `job_ready` or `rendered` without altering the approved cover artwork.

## 1. Artwork ready

Input:

- approved/recovered front-cover image;
- optional approved back/spine/full-wrap/jacket assets;
- immutable asset references where available.

Rule:

- the approved image is an input, not a prompt for a new design.

Stop if the intended cover image has not been established.

## 2. Physical specification ready

Capture the manufacturing facts required by the chosen template:

- binding;
- construction;
- trim width/height;
- page count when needed;
- spine width when needed;
- cover/case/jacket/page materials;
- surface finish where relevant.

Unknown facts stay unknown. A template may not guess them into publication metadata.

## 3. Mockup job assembled

Create a machine-readable job conforming to `mockup-generation-job.schema.json`.

A job binds exactly one EPP package version to:

- one physical template family/version;
- one set of approved artwork inputs;
- one physical specification;
- one requested output set.

## 4. Rendering

The renderer performs the equivalent of a production Photoshop mockup:

```text
physical template
  + approved cover image
  + approved physical dimensions/materials
  -> mapped/composited book object
  -> presentation exports
```

The physical template owns geometry, masks, surface deformation, texture/roughness response, seams, page edges, shadows, and camera/light setup. The approved image owns the graphic cover design.

## 5. Standard exports

Every full website-capable generation run should target:

```text
presentation/
  shelf-spine.<ext>
  front-cover.<ext>
  three-quarter.<ext>
  detail.<ext>
```

Optional construction-specific outputs:

```text
presentation/
  jacket-off.<ext>
  back-cover.<ext>
  press-three-quarter.<ext>
```

Source artwork remains separate:

```text
artwork/
  front-cover.<ext>
  back-cover.<ext>       # when approved
  spine.<ext>            # when approved
  full-wrap.<ext>        # when approved
  jacket-spread.<ext>    # when approved
```

The mockup outputs never replace the artwork inputs.

## 6. Visual validation

Review the generated object at both shelf size and selected/detail size.

Required checks:

- approved cover image remains faithful;
- image perspective follows the physical face naturally;
- paper/cloth/jacket texture modifies material response rather than obscuring or redesigning the art;
- page block is visibly separate from cover/case;
- paperback has no false rigid-board overhang;
- hardcover has credible board overhang/recessed pages;
- dust jacket reads as a separate paper layer over a hard case;
- spine thickness matches the authorized specification;
- no generated decorative content has appeared;
- shadows/light describe geometry rather than being baked into replacement artwork;
- shelf-spine remains recognizable at actual website scale.

## 7. Promotion into EPP

Only after validation are generated assets eligible for the authoritative package.

Promotion records the asset references and provenance in:

- `presentation.shelfSpine`;
- `presentation.frontCover`;
- `presentation.threeQuarterMockup`;
- `presentation.detailMockup`;
- optional construction-specific roles.

The original approved art remains under `artwork`.

## 8. Website consumption

The website reads presentation assets from the current approved EPP.

Recommended behavior:

```text
shelf resting state -> shelfSpine
selection transition -> same edition identity, animated by consumer
selected/detail state -> detailMockup or threeQuarterMockup
```

The shelf may add position, lean, scale, contact shadow, hover, camera perspective, and motion. Those are interaction effects, not manufacturing facts.

For smooth motion, the shelf should preserve a single edition identity through the transition and return to the live source-book location before handing visibility back to the resting shelf asset.

## 9. Missing-output behavior

If the approved package lacks a required presentation output:

1. use another semantically appropriate approved asset from the same package;
2. use a neutral non-physical fallback;
3. omit physical rendering.

Do not restore the procedural fake-book renderer as a production fallback.

## Repeatable package layout

```text
edition-presentations/
  <manifestation-key>/
    vN/
      manifest.json
      artwork/
        ... approved cover surfaces ...
      mockup/
        job.json
        render-receipt.json
      presentation/
        shelf-spine.*
        front-cover.*
        three-quarter.*
        detail.*
      proposals/
        ... draft-only experiments, never consumed publicly ...
```

Binary assets may live in immutable object storage instead of Git; the package stores durable references and hashes.

## Deployment boundary

Generating, validating, or approving presentation assets does not authorize a website deployment. Branch movement, preview deployment, and production release remain separate operations.