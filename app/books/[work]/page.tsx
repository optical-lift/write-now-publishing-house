import Link from 'next/link';
import { getWnphPublicRelease } from '../../../lib/wnph-public';

export default async function BookPage({ params }: { params: Promise<{ work: string }> }) {
  const { work } = await params;
  const release = await getWnphPublicRelease(work);

  if (!release) {
    return (
      <main className="title-page">
        <div className="title-page-inner">
          <div className="title-meta">Publication not found</div>
          <h1>This work is not currently published.</h1>
        </div>
      </main>
    );
  }

  const { payload, payload_sha256: payloadSha } = release;
  const author = payload.bibliographic.creators.find((creator) => creator.role === 'author')?.label
    ?? payload.bibliographic.creators[0]?.label
    ?? 'Unknown creator';
  const underlyingRights = payload.rights.find((item) => item.component_type === 'underlying_work');

  return (
    <main className="title-page">
      <div className="title-page-inner">
        <div className="title-meta">WNPH public release · {payload.bibliographic.work_type.replaceAll('_', ' ')}</div>
        <h1>{payload.bibliographic.title}</h1>
        <div className="byline">{author}</div>

        <div className="title-actions">
          <Link className="button" href={`/books/${work}/read`}>Read the web edition</Link>
          <span className="button secondary" aria-disabled="true">Original source — next</span>
          <span className="button secondary" aria-disabled="true">About recovery — next</span>
        </div>

        <hr className="title-rule" />

        <div className="title-grid">
          <section>
            <h2>The work</h2>
            <p>{payload.chapters.length} chapters · {payload.media_placements.length} historical illustration placements.</p>
          </section>
          <section>
            <h2>The edition</h2>
            <p>Frozen public release {payload.release.release_sequence}, derived from WNPH master {payload.release.render_master_sha256.slice(0, 12)}…</p>
          </section>
          <section>
            <h2>Rights</h2>
            <p>{underlyingRights ? `${underlyingRights.status.replaceAll('_', ' ')} · ${underlyingRights.use_scope}` : 'Rights information recorded in WNPH custody.'}</p>
          </section>
        </div>

        <div className="title-integrity">Public payload SHA-256 · {payloadSha}</div>
      </div>
    </main>
  );
}
