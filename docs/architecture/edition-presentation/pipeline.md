# Edition Presentation Pipeline

This pipeline turns an edition into a validated, reusable Edition Presentation Package (EPP).

## State machine

```text
identified
  -> physical_specified
  -> artwork_approved
  -> presentation_generated
  -> validated
  -> approved
  -> superseded (optional, only by later approved package)
```

A package may move backward while still in draft. Once approved, it is sealed and is not edited in place.

## 1. Edition identified

Inputs:

- canonical edition ID;
- Work relationship;
- release/publication context.

Output:

- empty draft EPP bound to that edition.

Stop condition:

- no physical/artwork generation begins until the edition identity is stable enough to own the package.

## 2. Physical specification approved

Capture only authoritative physical facts:

- binding;
- construction;
- trim size;
- page count;
- spine width or approved calculation basis;
- page stock/material when relevant;
- cover/case/jacket material;
- surface finish;
- stamping/foil/embossing if applicable.

If a required fact is unknown, the package remains draft.

## 3. Cover artwork approved

The publication workflow supplies approved artwork appropriate to construction.

### Paperback wrap

Preferred source: continuous back + spine + front wrap, or equivalent approved separate faces.

### Cloth-case hardcover

Preferred source: explicit case-front/spine/back design or stamping plan. Plain cloth is valid when intentional.

### Printed casewrap hardcover

Preferred source: continuous casewrap or equivalent approved faces.

### Dust-jacketed hardcover

Preferred source: full jacket spread, including flaps when the print design includes them. The underlying case is specified separately.

## 4. Presentation assets generated

The generation step applies approved artwork to approved physical construction.

Generated outputs may include:

- shelf spine;
- front cover;
- 3/4 mockup;
- selected/detail mockup;
- jacket-off mockup;
- retailer/press-kit variants.

The generation process must not alter canonical title, author, binding, trim, or other edition facts.

Each generated asset records provenance back to the package version and source artwork.

## 5. Validation

Validation has two layers.

### Machine validation

- manifest conforms to schema;
- required assets exist;
- dimensions/file types are valid;
- construction-specific required fields are present;
- asset references are non-empty and unique where required.

### Presentation validation

A human or approved visual verifier checks:

- front/spine/back mapping is not reversed;
- spine width visually matches specification;
- artwork does not cross trim/fold boundaries incorrectly;
- dust jacket reads as a separate paper layer over the case;
- cloth/case materials remain visible where intended;
- page block remains visually distinct from cover material;
- mockup does not invent decorative facts not present in approved artwork;
- shelf asset is recognizable at intended size.

## 6. Approval and sealing

An approved package receives:

- `status: approved`;
- approval timestamp;
- immutable package version;
- current-designation for the edition when appropriate.

Public consumers should use only the edition's current approved package unless explicitly rendering historical package versions.

## 7. Consumption

Consumers read the package without acquiring authority over it.

Examples:

```text
homepage shelf -> shelfSpine
library card -> frontCover
selected book -> detailMockup
press kit -> frontCover + threeQuarterMockup
```

Consumers may animate and responsively position assets. They must not mutate package truth.

## 8. Revision

A material change creates a new version.

Material changes include:

- new/revised cover design;
- changed trim;
- changed page count that changes spine width;
- paperback to hardcover;
- addition/removal of dust jacket;
- changed case/jacket material;
- corrected production mockup that changes physical appearance.

Non-material derivative exports may be regenerated under the same draft package before approval. After approval, replacement public assets should ordinarily flow through a new package version so provenance remains clear.

## Construction-specific minimums

### Paperback

Required for approval:

- `binding: paperback`;
- `construction: paperback-wrap`;
- trim;
- approved front/spine/back or full-wrap artwork;
- shelf spine;
- front cover or detail mockup.

### Cloth-case hardcover

Required for approval:

- `binding: hardcover`;
- `construction: cloth-case`;
- trim;
- explicit case material/color;
- explicit case design/stamping treatment;
- shelf spine;
- front cover/detail representation.

### Printed casewrap hardcover

Required for approval:

- `binding: hardcover`;
- `construction: printed-casewrap`;
- trim;
- approved casewrap artwork;
- shelf spine;
- front cover/detail representation.

### Dust-jacketed hardcover

Required for approval:

- `binding: hardcover`;
- `construction: dust-jacket`;
- trim;
- underlying case specification;
- approved jacket artwork/spread;
- shelf spine representing the jacketed state;
- front cover/detail mockup showing jacket over case.

## Failure behavior

If validation fails, the package remains draft. The system must not substitute guessed values to achieve completeness.

## Deployment boundary

Creating or approving an EPP is publication-domain work. Deployment of a website that consumes an EPP is a separate operation and requires separate authorization.