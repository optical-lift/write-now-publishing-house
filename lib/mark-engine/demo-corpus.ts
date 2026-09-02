import type { GlyphInstance, GlyphTopology } from './types';

const corpusNames = ['c-a', 'c-b', 'c-c', 'c-d'] as const;

type Role = 'R1' | 'R2' | 'R3';

const shapes: Record<Role, GlyphTopology[]> = {
  R1: [
    { nodes: 5, edges: 5, endpoints: 2, junctions: 1, loops: 1, crossings: 0, enclosures: 1, branches: 1, open: false, symmetric: false, motifs: ['partial-wrap', 'contact-core'] },
    { nodes: 3, edges: 2, endpoints: 3, junctions: 1, loops: 0, crossings: 0, enclosures: 0, branches: 2, open: true, symmetric: true, motifs: ['fork-contact'] },
    { nodes: 6, edges: 6, endpoints: 4, junctions: 2, loops: 0, crossings: 1, enclosures: 0, branches: 2, open: true, symmetric: false, motifs: ['cross-contact', 'extended-stem'] },
    { nodes: 4, edges: 4, endpoints: 2, junctions: 1, loops: 1, crossings: 0, enclosures: 0, branches: 1, open: false, symmetric: true, motifs: ['loop-contact'] },
  ],
  R2: [
    { nodes: 4, edges: 3, endpoints: 4, junctions: 0, loops: 0, crossings: 0, enclosures: 0, branches: 0, open: true, symmetric: true, motifs: ['parallel-divider'] },
    { nodes: 5, edges: 5, endpoints: 2, junctions: 1, loops: 1, crossings: 0, enclosures: 1, branches: 1, open: false, symmetric: false, motifs: ['enclosure-cut'] },
    { nodes: 3, edges: 3, endpoints: 2, junctions: 1, loops: 0, crossings: 1, enclosures: 0, branches: 1, open: true, symmetric: false, motifs: ['cross-divider'] },
    { nodes: 6, edges: 5, endpoints: 5, junctions: 1, loops: 0, crossings: 0, enclosures: 0, branches: 3, open: true, symmetric: false, motifs: ['branch-divider'] },
  ],
  R3: [
    { nodes: 4, edges: 4, endpoints: 1, junctions: 1, loops: 1, crossings: 0, enclosures: 0, branches: 1, open: false, symmetric: false, motifs: ['return-loop'] },
    { nodes: 6, edges: 5, endpoints: 4, junctions: 1, loops: 0, crossings: 0, enclosures: 0, branches: 2, open: true, symmetric: false, motifs: ['bent-return'] },
    { nodes: 5, edges: 5, endpoints: 2, junctions: 1, loops: 0, crossings: 1, enclosures: 0, branches: 1, open: true, symmetric: true, motifs: ['cross-return'] },
    { nodes: 3, edges: 3, endpoints: 1, junctions: 0, loops: 1, crossings: 0, enclosures: 1, branches: 0, open: false, symmetric: true, motifs: ['closed-return'] },
  ],
};

const roleFeatures = {
  R1: {
    directionality: ['inward', 'toward-other-component'],
    connectivity: ['touches', 'attachment-persists'],
    position: ['mid-sequence', 'between-distinct-units'],
    repetition: { count: 1, mirrored: false, intervalBand: 'sparse' },
    context: { beforePatterns: ['independent-pair', 'open-relation'], afterPatterns: ['joined-pair', 'relation-retained'] },
    state: { from: ['two-independent-components'], delta: ['attachment-created', 'relation-preserved'], to: ['linked-components'] },
    material: ['single-emphasis'],
    relations: ['component-contact', 'attachment'],
    sequence: { predecessorPatterns: ['distinction-present'], successorPatterns: ['linked-state-continues'] },
  },
  R2: {
    directionality: ['across-field', 'separating'],
    connectivity: ['terminates-on-edge', 'splits-field'],
    position: ['threshold', 'field-interior'],
    repetition: { count: 1, mirrored: false, intervalBand: 'boundary' },
    context: { beforePatterns: ['undivided-field', 'continuous-region'], afterPatterns: ['paired-regions', 'new-boundary'] },
    state: { from: ['undivided-field'], delta: ['boundary-created', 'portion-distinguished'], to: ['partitioned-field'] },
    material: ['single-emphasis'],
    relations: ['division', 'boundary'],
    sequence: { predecessorPatterns: ['continuous-state'], successorPatterns: ['portion-reference'] },
  },
  R3: {
    directionality: ['outward-then-inward', 'toward-origin'],
    connectivity: ['reconnects', 'terminal-meets-origin'],
    position: ['sequence-end', 'after-separation'],
    repetition: { count: 2, mirrored: false, intervalBand: 'returning' },
    context: { beforePatterns: ['departure', 'gap-present'], afterPatterns: ['reappearance', 'sequence-restored'] },
    state: { from: ['separated-sequence'], delta: ['recurrence-restored', 'return-completed'], to: ['reconnected-sequence'] },
    material: ['terminal-emphasis'],
    relations: ['return', 'reconnection'],
    sequence: { predecessorPatterns: ['departure-recorded'], successorPatterns: ['closure-or-repeat'] },
  },
} satisfies Record<Role, Omit<GlyphInstance, 'id' | 'corpusId' | 'provenance' | 'witness' | 'topology' | 'benchmarkRole'>>;

function build(role: Role, corpusIndex: number): GlyphInstance {
  const corpusId = corpusNames[corpusIndex];
  const base = roleFeatures[role];
  const noise = corpusIndex === 1 ? ['variant-medium'] : corpusIndex === 2 ? ['variant-incised'] : corpusIndex === 3 ? ['variant-compact'] : [];

  return {
    id: `${corpusId}-${role.toLowerCase()}`,
    corpusId,
    provenance: {
      culture: `Synthetic provenance ${String.fromCharCode(65 + corpusIndex)}`,
      artifact: `Synthetic witness ${corpusIndex + 1}-${role}`,
      dateRange: 'Demonstration data only',
      source: 'No historical claim — replace with physical witnesses.',
    },
    topology: shapes[role][corpusIndex],
    directionality: [...base.directionality],
    connectivity: [...base.connectivity, ...noise],
    position: [...base.position],
    repetition: { ...base.repetition },
    context: {
      beforePatterns: [...base.context.beforePatterns],
      afterPatterns: [...base.context.afterPatterns],
    },
    state: {
      from: [...base.state.from],
      delta: [...base.state.delta],
      to: [...base.state.to],
    },
    material: [...base.material, ...noise],
    relations: [...base.relations],
    sequence: {
      predecessorPatterns: [...base.sequence.predecessorPatterns],
      successorPatterns: [...base.sequence.successorPatterns],
    },
    benchmarkRole: role,
  };
}

export const DEMO_CORPUS: GlyphInstance[] = corpusNames.flatMap((_, corpusIndex) => (
  (['R1', 'R2', 'R3'] as Role[]).map((role) => build(role, corpusIndex))
));
