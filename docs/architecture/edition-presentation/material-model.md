# Material and Construction Model

The material model exists so artwork is applied to a physical object rather than treated as the object itself.

## Shared anatomy

All physical-book renderers conceptually separate:

```text
front cover
back cover
spine
page block
fore-edge
top edge
bottom edge
binding joints / hinges
optional outer jacket
```

A renderer may simplify geometry at small sizes, but it must preserve construction distinctions.

## Paperback wrap

Physical character:

- flexible printed cover stock;
- cover and page block nearly flush;
- no rigid board overhang;
- adhesive/crease behavior near spine;
- lighter mass and shadow;
- optional subtle corner curl or cover bow.

Artwork behavior:

- print is mapped to the cover surface;
- continuous full-wrap art should align across back/spine/front;
- page block remains a separate paper material;
- lighting/texture applies over the print so artwork appears printed on stock.

## Cloth-case hardcover

Physical character:

- rigid front/back boards;
- board overhang beyond page block;
- recessed page block;
- visible hinge/joint channels;
- defined spine structure;
- optional headbands;
- cloth/case material wraps the boards.

Artwork behavior:

- cloth texture remains materially visible;
- lettering/ornament may be stamped, foiled, debossed, embossed, or printed only when specified;
- plain cloth with no front art is valid;
- a generic graphic image must not automatically become a cloth cover.

## Printed casewrap hardcover

Physical character:

- same rigid-board anatomy as casebound hardcover;
- continuous printed sheet bonded over boards/spine;
- board overhang and recessed page block remain visible.

Artwork behavior:

- print follows rigid-board geometry;
- hinge shadows/folds should affect the printed surface;
- art must not erase edge, seam, or page-block geometry.

## Dust-jacketed hardcover

Physical character:

- underlying hard case remains a complete separate object;
- jacket is a thin printed paper layer outside the case;
- jacket spans front, spine, and back;
- folds at jacket hinges/spine are visible;
- slight looseness, lip, curl, or paper edge may appear within restrained bounds;
- flaps may be modeled when useful in detailed views.

Artwork behavior:

- jacket artwork is mapped to the paper jacket, not painted onto the boards;
- jacket finish (matte/gloss/etc.) affects highlights independently from the underlying case;
- jacket removal must reveal the separately specified case, not an invented generic board.

## Page block

The page block is a material surface distinct from any cover.

Default visual expectations when exact paper appearance is not separately specified:

- warm neutral paper tone;
- fine layered edge variation;
- low specularity;
- subtle roughness at fore-edge;
- no pure-white plastic appearance.

These are renderer defaults, not new edition metadata.

## Material vocabulary

V1 may use normalized renderer categories while preserving source descriptions:

- `cloth`
- `uncoated-paper`
- `coated-paper-matte`
- `coated-paper-gloss`
- `printed-casewrap`
- `board`
- `paper-block`

A future material registry may add vendor/stock-specific profiles. Renderer preset names must remain separate from authoritative publication descriptions.

## Texture rule

Textures modify material response; they do not replace artwork.

Correct order:

```text
physical geometry
  -> base material
      -> approved artwork/print
          -> material texture/roughness
              -> seams/folds/edge behavior
                  -> lighting/shadow
```

This preserves the illusion that artwork was printed, stamped, or wrapped onto a manufactured object.

## Realism levels

### Shelf mode

May use simplified geometry plus an approved `shelfSpine` asset. Required distinctions:

- paperback vs rigid hardcover silhouette;
- board overhang when hardcover;
- jacket state when visually material;
- accurate spine asset;
- contact shadow with shelf.

### Detail mode

Should preserve full construction:

- true spine face;
- page/fore-edge face;
- front cover;
- binding-specific seams/hinges;
- material texture;
- dust-jacket layer when applicable;
- approved cover art.

## Prohibited visual shortcuts

Do not:

- use arbitrary solid color as the final identity of a released edition when approved artwork exists;
- flatten jacket and case into one surface;
- use page texture as a book spine;
- let cover art erase board overhang or page edges;
- invent wear, foil, embossing, cloth, jacket, or gloss as publication facts;
- infer construction from genre, era, or page count.

Subtle renderer-level imperfection may be used to avoid sterile CGI appearance only when it does not imply a specific production fact.