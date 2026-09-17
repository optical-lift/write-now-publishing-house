# The Wish Fairy and Dewy Dear — WNPH Restored Hardcover EPP v1

**Package status:** draft

This package presents the WNPH restored edition of *The Wish Fairy and Dewy Dear* as a historically grounded cloth hardcover. It corrects the earlier accidental paperback assumption; it does not create a second WNPH edition or a separate historical-book surrogate.

## Canonical ownership

- Work: `wish-fairy-and-dewy-dear`
- Publication Expression: `wish-fairy-dewy-dear:wnph-publication-e1`
- Expression ID: `d383ca4f-227f-4455-b7d0-169d7485e5a2`
- Owning Manifestation ID: `0bb1920c-3df4-4ae9-9e4a-67ba8b39ff82`
- Corrected Manifestation key: `wish-fairy-dewy-dear:wnph-hardcover-v1`
- Manifestation state: `planned`
- Publisher: Write Now Publishing House
- Intended render profile: `wnph:render:cloth-hardcover:v1`

The database correction preserves the existing Manifestation UUID and Expression relationship while correcting its physical identity from paperback to hardcover.

## Restoration basis

The WNPH physical edition intentionally uses the known Henry Altemus c1922 book as its restoration target rather than inventing a modern paperback format.

Historical evidence currently supports:

- gray cloth case;
- green lettering;
- multicolored, book-specific cover image/appliqué treatment;
- approximately 5.5 × 4.25 inches;
- a matching white coated dust jacket.

WNPH therefore adopts a 4.25 × 5.5 inch cloth-hardcover target for this restored Manifestation. The dust jacket remains historically evidenced but is not yet declared as the active EPP construction because no governed jacket spread/specification has been approved.

## Recovered cover artwork

WNPH already has an established recovered cover image. That image remains the graphic source; the mockup process must not redesign, redraw, recolor, reinterpret, or replace it.

The repository currently contains a 320 × 480 web derivative at:

`/recovered-covers/the-wish-fairy-and-dewy-dear/front-cover-restored.jpg`

That derivative is adequate as a temporary interaction asset but is too small to serve as the final selected-book presentation master. The higher-resolution recovered artwork must be located or regenerated from the governed source before the package can be approved.

## Deliberately unresolved

The following remain absent from the authoritative package until publication work establishes them:

- final print page count;
- spine width;
- exact case cloth/board specification;
- page stock;
- exact green lettering/art production method;
- governed high-resolution recovered-cover asset reference and hash;
- approved case spine/back assets if required;
- approved jacket spread/specification;
- shelf-spine presentation asset;
- front-cover presentation asset;
- three-quarter/detail mockups.

## Promotion path

```text
historical physical evidence
  + governed publication Expression
  + approved high-resolution recovered cover artwork
  + approved restored-hardcover physical specification
  -> cloth-hardcover mockup generation job
  -> realistic presentation assets
  -> EPP validation
  -> package approval and sealing
  -> website consumer
```

The website may animate and place the resulting assets. It does not decide what physical edition WNPH published.

## Stop condition

This package remains `draft` until the high-resolution recovered artwork and remaining manufacturing-dependent facts required by the presentation outputs are governed and the generated assets have been reviewed. It must not enter the approved public EPP index before then.
