# EPP Publication Intake Template

Use this template to start the presentation package for every new physical Manifestation. The template is a working checklist; authoritative values belong in the governed publication record and EPP manifest after approval.

## 1. Ownership

- Work key:
- Publication Expression key:
- Manifestation key:
- Manifestation ID:
- Output family:
- Render profile:
- Package version:

Stop if the physical Manifestation does not already exist. Do not create presentation identity in the frontend or package directory.

## 2. Physical specification

- Binding: `paperback | hardcover`
- Construction: `paperback-wrap | cloth-case | printed-casewrap | dust-jacket`
- Trim width:
- Trim height:
- Final interior page count:
- Spine-width basis/vendor formula:
- Calculated/authorized spine width:
- Page stock:
- Cover/case stock:
- Jacket stock, if applicable:
- Surface finish:
- Foil/stamping/embossing, if applicable:

Unknown values remain blank. They are not estimated into the EPP.

## 3. Design inputs

- Canonical title/credit source:
- Approved source illustrations/assets:
- Historical/reference materials:
- Rights status for each design input:
- Design direction:
- Required publisher marks/copy:

Reference evidence is kept separate from approved artwork.

## 4. Cover proposal

Review at minimum:

- flat front;
- back;
- spine;
- continuous wrap/jacket spread where applicable;
- thumbnail/shelf readability;
- realistic three-quarter mockup;
- website detail mockup.

Decision:

- [ ] rejected
- [ ] revise
- [ ] approved for physical/artwork promotion

Approval note/date:

## 5. Physical realism review

Confirm that the mockup still reads as the declared binding when artwork is mentally removed:

- [ ] page block is physically distinct from cover/case;
- [ ] spine geometry matches binding construction;
- [ ] cover/jacket thickness reads plausibly;
- [ ] hardcover board overhang exists when applicable;
- [ ] dust jacket is a separate paper layer when applicable;
- [ ] artwork appears printed/wrapped/stamped onto material rather than replacing geometry;
- [ ] lighting/shadow does not bake false physical facts into artwork;
- [ ] trim and spine proportions match approved production specification.

## 6. Promote approved package

Populate authoritative EPP fields only from approved facts/assets:

- [ ] `physical`
- [ ] `artwork`
- [ ] `materialProfile`
- [ ] provenance records
- [ ] `presentation.shelfSpine`
- [ ] `presentation.frontCover`
- [ ] `presentation.threeQuarterMockup`
- [ ] `presentation.detailMockup`
- [ ] optional construction-specific outputs

## 7. Validate and seal

- [ ] runtime/schema validation passes;
- [ ] construction-specific requirements pass;
- [ ] visual mapping reviewed;
- [ ] immutable asset references/hashes recorded;
- [ ] package status changed to `approved`;
- [ ] approval timestamp recorded;
- [ ] package designated current for the Manifestation through the governed publication seam.

Website preview or production deployment is not part of package approval and requires separate authorization.
