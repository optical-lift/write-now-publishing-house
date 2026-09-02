# The Mark Engine v1

This slice implements the first falsifiable experimental surface from the Mark Engine architecture.

## What exists in v1

- Anonymous corpus labels with provenance sealed by default.
- A typed glyph fingerprint separating topology, directionality, connectivity, position, recurrence, context, state transition, material, relations, and sequence behavior.
- Four independent clustering axes: shape, distribution, operational/state-change, and relational.
- A combined axis weighted toward state transition rather than visual resemblance.
- Explicit low-shape/high-function convergence scoring.
- Explainable clusters that state which repeated observations support a family.
- Cross-corpus family counts.
- A held-out-corpus test that discovers families without one corpus and predicts where its marks belong.
- Optional benchmark roles that are excluded from clustering and used only to score a test after prediction.
- A JSON workbench so real physical-witness observations can replace the synthetic demo corpus without changing the algorithm.

## What v1 does not claim

The included dataset is synthetic. It demonstrates that the engine behaves as designed; it is not evidence about any historical writing system.

No cultural, linguistic, mythological, or scholarly meaning is used in the similarity calculation. Provenance remains a separate revealable layer.

## Next evidence slice

1. Define a custody-safe import format for physical witness crops.
2. Load 250–500 glyph instances from several independently sourced corpora.
3. Record observations before translations or conventional sign names are exposed to the clustering pass.
4. Freeze feature-extraction and threshold versions before running cross-corpus evaluation.
5. Hold out entire corpora and publish prediction accuracy, false positives, singleton rates, and cluster stability.
6. Compare against null models: shuffled state features, shape-only clustering, within-culture-only clustering, and random corpus reassignment.
7. Only then reveal provenance and inherited interpretations for post-hoc comparison.
