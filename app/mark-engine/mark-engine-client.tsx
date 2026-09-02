'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { DEMO_CORPUS } from '../../lib/mark-engine/demo-corpus';
import {
  anonymousCorpusLabels,
  clusterInstances,
  runHoldoutEvaluation,
  validateCorpus,
} from '../../lib/mark-engine/engine';
import type { ClusterAxis, GlyphInstance } from '../../lib/mark-engine/types';
import styles from './mark-engine.module.css';

const axes: Array<{ key: ClusterAxis; label: string }> = [
  { key: 'combined', label: 'Combined' },
  { key: 'shape', label: 'Shape' },
  { key: 'distribution', label: 'Distribution' },
  { key: 'operational', label: 'State change' },
  { key: 'relational', label: 'Relations' },
];

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function MarkEngineClient() {
  const [corpus, setCorpus] = useState<GlyphInstance[]>(DEMO_CORPUS);
  const [axis, setAxis] = useState<ClusterAxis>('combined');
  const [blind, setBlind] = useState(true);
  const [raw, setRaw] = useState(() => JSON.stringify(DEMO_CORPUS, null, 2));
  const [error, setError] = useState<string | null>(null);
  const corpusIds = useMemo(() => [...new Set(corpus.map((item) => item.corpusId))].sort(), [corpus]);
  const [heldOutCorpus, setHeldOutCorpus] = useState('c-d');

  const labels = useMemo(() => anonymousCorpusLabels(corpus), [corpus]);
  const clusters = useMemo(() => clusterInstances(corpus, axis), [corpus, axis]);
  const byId = useMemo(() => new Map(corpus.map((item) => [item.id, item])), [corpus]);
  const holdout = useMemo(
    () => runHoldoutEvaluation(corpus, corpusIds.includes(heldOutCorpus) ? heldOutCorpus : corpusIds[corpusIds.length - 1] ?? ''),
    [corpus, corpusIds, heldOutCorpus],
  );

  const crossCorpusClusters = clusters.filter((cluster) => cluster.corpusIds.length > 1).length;
  const convergenceHotspots = clusters.filter((cluster) => cluster.corpusIds.length > 1 && cluster.meanConvergence >= 0.68).length;

  function displayCorpus(instance: GlyphInstance) {
    if (blind) return labels[instance.corpusId] ?? instance.corpusId;
    return instance.provenance?.culture ?? instance.corpusId;
  }

  function loadRawCorpus() {
    try {
      const parsed = validateCorpus(JSON.parse(raw));
      setCorpus(parsed);
      const nextIds = [...new Set(parsed.map((item) => item.corpusId))].sort();
      setHeldOutCorpus(nextIds[nextIds.length - 1] ?? '');
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load corpus.');
    }
  }

  function resetDemo() {
    setCorpus(DEMO_CORPUS);
    setRaw(JSON.stringify(DEMO_CORPUS, null, 2));
    setHeldOutCorpus('c-d');
    setAxis('combined');
    setBlind(true);
    setError(null);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Experimental workbench · provenance sealed by default</p>
          <h1>The Mark Engine</h1>
          <p className={styles.dek}>
            Cluster marks by physical topology, distribution, state transition, and relational behavior before allowing inherited meaning or cultural identity into the model.
          </p>
        </div>
        <aside className={styles.headerAside}>
          <p>
            The included corpus is synthetic and exists only to test the engine. Historical claims begin only when physical witnesses with source custody replace it.
          </p>
        </aside>
      </header>

      <section className={styles.controls} aria-label="Clustering controls">
        {axes.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`${styles.axisButton} ${axis === item.key ? styles.active : ''}`}
            onClick={() => setAxis(item.key)}
          >
            {item.label}
          </button>
        ))}
        <span className={styles.controlSpacer} />
        <button
          type="button"
          className={`${styles.toggle} ${blind ? styles.active : ''}`}
          onClick={() => setBlind((value) => !value)}
        >
          {blind ? 'Provenance sealed' : 'Provenance revealed'}
        </button>
      </section>

      <section className={styles.stats} aria-label="Engine summary">
        <div className={styles.stat}><span className={styles.statLabel}>Glyph instances</span><span className={styles.statValue}>{corpus.length}</span></div>
        <div className={styles.stat}><span className={styles.statLabel}>Anonymous corpora</span><span className={styles.statValue}>{corpusIds.length}</span></div>
        <div className={styles.stat}><span className={styles.statLabel}>Families on this axis</span><span className={styles.statValue}>{clusters.length}</span></div>
        <div className={styles.stat}><span className={styles.statLabel}>Cross-corpus families</span><span className={styles.statValue}>{crossCorpusClusters}</span></div>
        <div className={styles.stat}><span className={styles.statLabel}>Low-shape / high-function hotspots</span><span className={styles.statValue}>{convergenceHotspots}</span></div>
      </section>

      <div className={styles.workspace}>
        <section>
          <div className={styles.sectionTitle}>
            <h2>Discovered families</h2>
            <span>{axis} similarity · no semantic names assigned</span>
          </div>
          <div className={styles.clusterGrid}>
            {clusters.map((cluster) => {
              const hotspot = cluster.corpusIds.length > 1 && cluster.meanConvergence >= 0.68;
              return (
                <article key={cluster.id} className={`${styles.cluster} ${hotspot ? styles.clusterHot : ''}`}>
                  <div className={styles.clusterTop}>
                    <div>
                      <h3>{cluster.id}</h3>
                      <div className={styles.clusterMeta}>
                        {cluster.memberIds.length} marks · {cluster.corpusIds.length} corpora · mean similarity {percent(cluster.meanSimilarity)}
                      </div>
                    </div>
                    {hotspot ? <span className={styles.badge}>convergence hotspot</span> : null}
                  </div>

                  <ul className={styles.explanation}>
                    {cluster.explanation.map((line) => <li key={line}>{line}</li>)}
                  </ul>

                  <div className={styles.members}>
                    {cluster.memberIds.map((id) => {
                      const instance = byId.get(id);
                      if (!instance) return null;
                      return (
                        <div key={id} className={styles.member}>
                          <div className={styles.memberId}>
                            <span>{id}</span>
                            <span>{displayCorpus(instance)}</span>
                          </div>
                          <div className={styles.delta}>{instance.state.delta.join(' · ')}</div>
                          {!blind && instance.provenance ? (
                            <div className={styles.memberMeta}>
                              {instance.provenance.artifact} · {instance.provenance.dateRange}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <h2>Held-out corpus test</h2>
            <p>
              Remove one corpus, discover families from everything else, then predict where the hidden marks belong. Benchmark labels are never used to create the clusters.
            </p>
            <label className={styles.label} htmlFor="held-out">Hidden corpus</label>
            <select
              id="held-out"
              className={styles.select}
              value={corpusIds.includes(heldOutCorpus) ? heldOutCorpus : corpusIds[corpusIds.length - 1] ?? ''}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setHeldOutCorpus(event.target.value)}
            >
              {corpusIds.map((id) => <option key={id} value={id}>{blind ? labels[id] : corpus.find((item) => item.corpusId === id)?.provenance?.culture ?? id}</option>)}
            </select>

            <div className={styles.holdoutRows}>
              <div className={styles.holdoutRow}><span>Training marks</span><strong>{holdout.trainSize}</strong></div>
              <div className={styles.holdoutRow}><span>Hidden marks</span><strong>{holdout.testSize}</strong></div>
              <div className={styles.holdoutRow}>
                <span>Synthetic benchmark accuracy</span>
                <strong>{holdout.benchmarkAccuracy === null ? '—' : percent(holdout.benchmarkAccuracy)}</strong>
              </div>
              {holdout.assignments.map((assignment) => (
                <div key={assignment.instanceId} className={styles.holdoutRow}>
                  <span>{assignment.instanceId} → {assignment.assignedClusterId ?? 'none'}</span>
                  <strong className={assignment.benchmarkMatch === false ? styles.fail : styles.success}>{percent(assignment.confidence)}</strong>
                </div>
              ))}
            </div>
            <div className={styles.smallNote}>
              A real proof corpus should replace synthetic benchmark roles with preregistered, independently scored structural predictions.
            </div>
          </section>

          <details className={styles.details}>
            <summary>Load or inspect corpus JSON</summary>
            <div className={styles.ingest}>
              <textarea
                className={styles.textarea}
                spellCheck={false}
                value={raw}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setRaw(event.target.value)}
                aria-label="Glyph corpus JSON"
              />
              <div className={styles.ingestActions}>
                <button type="button" className={styles.button} onClick={loadRawCorpus}>Run corpus</button>
                <button type="button" className={styles.button} onClick={resetDemo}>Reset demo</button>
              </div>
              {error ? <div className={styles.notice}>{error}</div> : null}
              <div className={styles.smallNote}>
                Required core fields: id, corpusId, topology, context, state, and sequence. Provenance is deliberately separate and may remain hidden during discovery.
              </div>
            </div>
          </details>
        </aside>
      </div>
    </main>
  );
}
