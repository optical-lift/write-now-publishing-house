export type ClusterAxis = 'shape' | 'distribution' | 'operational' | 'relational' | 'combined';

export type GlyphTopology = {
  nodes: number;
  edges: number;
  endpoints: number;
  junctions: number;
  loops: number;
  crossings: number;
  enclosures: number;
  branches: number;
  open: boolean;
  symmetric: boolean;
  motifs: string[];
};

export type GlyphInstance = {
  id: string;
  corpusId: string;
  provenance?: {
    culture?: string;
    artifact?: string;
    dateRange?: string;
    source?: string;
  };
  witness?: {
    imageUrl?: string;
    crop?: string;
  };
  topology: GlyphTopology;
  directionality: string[];
  connectivity: string[];
  position: string[];
  repetition: {
    count: number;
    mirrored: boolean;
    intervalBand?: string;
  };
  context: {
    beforePatterns: string[];
    afterPatterns: string[];
    neighborIds?: string[];
  };
  state: {
    from: string[];
    delta: string[];
    to: string[];
  };
  material: string[];
  relations: string[];
  sequence: {
    predecessorPatterns: string[];
    successorPatterns: string[];
  };
  benchmarkRole?: string;
};

export type SimilarityBreakdown = {
  shape: number;
  distribution: number;
  operational: number;
  relational: number;
  combined: number;
  convergence: number;
};

export type GlyphCluster = {
  id: string;
  axis: ClusterAxis;
  memberIds: string[];
  corpusIds: string[];
  meanSimilarity: number;
  meanConvergence: number;
  explanation: string[];
};

export type HoldoutAssignment = {
  instanceId: string;
  assignedClusterId: string | null;
  confidence: number;
  expectedBenchmarkRole?: string;
  predictedBenchmarkRole?: string;
  benchmarkMatch?: boolean;
};

export type HoldoutResult = {
  heldOutCorpusId: string;
  trainSize: number;
  testSize: number;
  assignments: HoldoutAssignment[];
  benchmarkAccuracy: number | null;
};
