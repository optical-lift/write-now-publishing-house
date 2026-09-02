import type {
  ClusterAxis,
  GlyphCluster,
  GlyphInstance,
  HoldoutResult,
  SimilarityBreakdown,
} from './types';

const AXIS_THRESHOLD: Record<ClusterAxis, number> = {
  shape: 0.72,
  distribution: 0.62,
  operational: 0.60,
  relational: 0.62,
  combined: 0.64,
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function jaccard(a: readonly string[], b: readonly string[]) {
  const left = new Set(a);
  const right = new Set(b);
  if (left.size === 0 && right.size === 0) return 1;
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 1 : intersection / union;
}

function numericSimilarity(a: number, b: number) {
  const scale = Math.max(Math.abs(a), Math.abs(b), 1);
  return clamp01(1 - Math.abs(a - b) / scale);
}

function booleanSimilarity(a: boolean, b: boolean) {
  return a === b ? 1 : 0;
}

function mean(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function weighted(parts: Array<[number, number]>) {
  const totalWeight = parts.reduce((sum, [, weight]) => sum + weight, 0);
  if (!totalWeight) return 0;
  return parts.reduce((sum, [value, weight]) => sum + value * weight, 0) / totalWeight;
}

export function similarity(a: GlyphInstance, b: GlyphInstance): SimilarityBreakdown {
  const shape = weighted([
    [numericSimilarity(a.topology.nodes, b.topology.nodes), 0.08],
    [numericSimilarity(a.topology.edges, b.topology.edges), 0.08],
    [numericSimilarity(a.topology.endpoints, b.topology.endpoints), 0.09],
    [numericSimilarity(a.topology.junctions, b.topology.junctions), 0.12],
    [numericSimilarity(a.topology.loops, b.topology.loops), 0.10],
    [numericSimilarity(a.topology.crossings, b.topology.crossings), 0.10],
    [numericSimilarity(a.topology.enclosures, b.topology.enclosures), 0.10],
    [numericSimilarity(a.topology.branches, b.topology.branches), 0.10],
    [booleanSimilarity(a.topology.open, b.topology.open), 0.05],
    [booleanSimilarity(a.topology.symmetric, b.topology.symmetric), 0.04],
    [jaccard(a.topology.motifs, b.topology.motifs), 0.08],
    [jaccard(a.directionality, b.directionality), 0.06],
  ]);

  const distribution = weighted([
    [jaccard(a.position, b.position), 0.22],
    [numericSimilarity(a.repetition.count, b.repetition.count), 0.10],
    [booleanSimilarity(a.repetition.mirrored, b.repetition.mirrored), 0.08],
    [a.repetition.intervalBand === b.repetition.intervalBand ? 1 : 0, 0.08],
    [jaccard(a.context.beforePatterns, b.context.beforePatterns), 0.18],
    [jaccard(a.context.afterPatterns, b.context.afterPatterns), 0.18],
    [jaccard(a.sequence.predecessorPatterns, b.sequence.predecessorPatterns), 0.08],
    [jaccard(a.sequence.successorPatterns, b.sequence.successorPatterns), 0.08],
  ]);

  const operational = weighted([
    [jaccard(a.state.delta, b.state.delta), 0.50],
    [jaccard(a.state.from, b.state.from), 0.16],
    [jaccard(a.state.to, b.state.to), 0.16],
    [jaccard(a.directionality, b.directionality), 0.10],
    [numericSimilarity(a.state.delta.length, b.state.delta.length), 0.08],
  ]);

  const relational = weighted([
    [jaccard(a.relations, b.relations), 0.44],
    [jaccard(a.connectivity, b.connectivity), 0.30],
    [jaccard(a.topology.motifs, b.topology.motifs), 0.16],
    [jaccard(a.position, b.position), 0.10],
  ]);

  const combined = weighted([
    [shape, 0.15],
    [distribution, 0.25],
    [operational, 0.40],
    [relational, 0.20],
  ]);

  const functional = weighted([
    [distribution, 0.28],
    [operational, 0.47],
    [relational, 0.25],
  ]);

  return {
    shape,
    distribution,
    operational,
    relational,
    combined,
    convergence: clamp01(functional - shape + 0.5),
  };
}

function axisScore(a: GlyphInstance, b: GlyphInstance, axis: ClusterAxis) {
  return similarity(a, b)[axis];
}

function pairwiseMembers(instances: GlyphInstance[]) {
  const pairs: Array<[GlyphInstance, GlyphInstance]> = [];
  for (let i = 0; i < instances.length; i += 1) {
    for (let j = i + 1; j < instances.length; j += 1) {
      pairs.push([instances[i], instances[j]]);
    }
  }
  return pairs;
}

function frequent(values: string[][], minRatio = 0.6) {
  const counts = new Map<string, number>();
  for (const group of values) {
    for (const value of new Set(group)) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const threshold = Math.max(1, Math.ceil(values.length * minRatio));
  return [...counts.entries()]
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value]) => value);
}

function explainCluster(members: GlyphInstance[]) {
  const explanation: string[] = [];
  const deltas = frequent(members.map((item) => item.state.delta));
  const relations = frequent(members.map((item) => item.relations));
  const positions = frequent(members.map((item) => item.position));
  const connectivity = frequent(members.map((item) => item.connectivity));
  const before = frequent(members.map((item) => item.context.beforePatterns));
  const after = frequent(members.map((item) => item.context.afterPatterns));

  if (deltas.length) explanation.push(`Repeated state change: ${deltas.slice(0, 3).join(', ')}`);
  if (relations.length) explanation.push(`Shared relation: ${relations.slice(0, 3).join(', ')}`);
  if (connectivity.length) explanation.push(`Shared connectivity: ${connectivity.slice(0, 3).join(', ')}`);
  if (positions.length) explanation.push(`Shared placement: ${positions.slice(0, 3).join(', ')}`);
  if (before.length || after.length) {
    explanation.push(`Recurring context: before [${before.slice(0, 2).join(', ') || 'varies'}] → after [${after.slice(0, 2).join(', ') || 'varies'}]`);
  }
  if (!explanation.length) explanation.push('Cluster is supported by aggregate similarity without a single feature shared by 60% of members.');
  return explanation;
}

class DisjointSet {
  private parent: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, index) => index);
  }

  find(index: number): number {
    const parent = this.parent[index];
    if (parent !== index) this.parent[index] = this.find(parent);
    return this.parent[index];
  }

  union(a: number, b: number) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent[rootB] = rootA;
  }
}

export function clusterInstances(
  instances: GlyphInstance[],
  axis: ClusterAxis = 'combined',
  threshold = AXIS_THRESHOLD[axis],
): GlyphCluster[] {
  if (instances.length === 0) return [];
  const set = new DisjointSet(instances.length);

  for (let i = 0; i < instances.length; i += 1) {
    for (let j = i + 1; j < instances.length; j += 1) {
      if (axisScore(instances[i], instances[j], axis) >= threshold) set.union(i, j);
    }
  }

  const buckets = new Map<number, GlyphInstance[]>();
  instances.forEach((instance, index) => {
    const root = set.find(index);
    const bucket = buckets.get(root) ?? [];
    bucket.push(instance);
    buckets.set(root, bucket);
  });

  return [...buckets.values()]
    .sort((a, b) => b.length - a.length || a[0].id.localeCompare(b[0].id))
    .map((members, index) => {
      const pairs = pairwiseMembers(members);
      return {
        id: `${axis.slice(0, 1).toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
        axis,
        memberIds: members.map((member) => member.id),
        corpusIds: [...new Set(members.map((member) => member.corpusId))].sort(),
        meanSimilarity: pairs.length ? mean(pairs.map(([a, b]) => axisScore(a, b, axis))) : 1,
        meanConvergence: pairs.length ? mean(pairs.map(([a, b]) => similarity(a, b).convergence)) : 0.5,
        explanation: explainCluster(members),
      };
    });
}

function dominantBenchmarkRole(members: GlyphInstance[]) {
  const counts = new Map<string, number>();
  for (const member of members) {
    if (!member.benchmarkRole) continue;
    counts.set(member.benchmarkRole, (counts.get(member.benchmarkRole) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

function averageSimilarityToCluster(instance: GlyphInstance, members: GlyphInstance[]) {
  return mean(members.map((member) => similarity(instance, member).combined));
}

export function runHoldoutEvaluation(instances: GlyphInstance[], heldOutCorpusId: string): HoldoutResult {
  const training = instances.filter((instance) => instance.corpusId !== heldOutCorpusId);
  const testing = instances.filter((instance) => instance.corpusId === heldOutCorpusId);
  const trainClusters = clusterInstances(training, 'combined');
  const byId = new Map(training.map((instance) => [instance.id, instance]));

  const assignments = testing.map((instance) => {
    const candidates = trainClusters.map((cluster) => {
      const members = cluster.memberIds.map((id) => byId.get(id)).filter((item): item is GlyphInstance => Boolean(item));
      return {
        cluster,
        members,
        confidence: averageSimilarityToCluster(instance, members),
      };
    }).sort((a, b) => b.confidence - a.confidence);

    const best = candidates[0];
    const predictedBenchmarkRole = best ? dominantBenchmarkRole(best.members) : undefined;
    const benchmarkMatch = instance.benchmarkRole && predictedBenchmarkRole
      ? instance.benchmarkRole === predictedBenchmarkRole
      : undefined;

    return {
      instanceId: instance.id,
      assignedClusterId: best?.cluster.id ?? null,
      confidence: best?.confidence ?? 0,
      expectedBenchmarkRole: instance.benchmarkRole,
      predictedBenchmarkRole,
      benchmarkMatch,
    };
  });

  const scored = assignments.filter((assignment) => typeof assignment.benchmarkMatch === 'boolean');
  return {
    heldOutCorpusId,
    trainSize: training.length,
    testSize: testing.length,
    assignments,
    benchmarkAccuracy: scored.length
      ? scored.filter((assignment) => assignment.benchmarkMatch).length / scored.length
      : null,
  };
}

export function anonymousCorpusLabels(instances: GlyphInstance[]) {
  const ids = [...new Set(instances.map((instance) => instance.corpusId))].sort();
  return Object.fromEntries(ids.map((id, index) => [id, `Corpus ${String(index + 1).padStart(2, '0')}`]));
}

export function validateCorpus(value: unknown): GlyphInstance[] {
  if (!Array.isArray(value)) throw new Error('Corpus JSON must be an array of glyph instances.');
  for (const [index, instance] of value.entries()) {
    if (!instance || typeof instance !== 'object') throw new Error(`Instance ${index + 1} is not an object.`);
    const item = instance as Partial<GlyphInstance>;
    if (!item.id || !item.corpusId) throw new Error(`Instance ${index + 1} needs id and corpusId.`);
    if (!item.topology || !item.state || !item.context || !item.sequence) {
      throw new Error(`Instance ${item.id} is missing topology, state, context, or sequence features.`);
    }
  }
  return value as GlyphInstance[];
}
