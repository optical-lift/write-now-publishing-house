import Link from 'next/link';
import { getWnphPublicTitle } from '../../../lib/wnph-public';

export default async function BookPage({ params }: { params: Promise<{ work: string }> }) {
  const { work } = await params;
  const title = await getWnphPublicTitle(work);

  if (!title) {
    return (
      <main className="title-page">
        <div className="title-page-inner">
          <div className="title-meta">Publication not found</div>
          <h1>This work is not currently published.</h1>
        </div>
      </main>
    );
  }

  const author = title.bibliographic.creators.find((creator) => creator.role === 'author')?.label
    ?? title.bibliographic.creators[0]?.label
    ?? 'Unknown creator';
  const underlyingRights = title.rights.find((item) => item.component_type === 'underlying_work');

  return (
    <main className="title-page">
      <div className="title-page-inner">
        <div className="title-meta">WNPH public release · {title.bibliographic.work_type.replaceAll('_', ' ')}</div>
        <h1>{title.bibliographic.title}</h1>
        <div className="byline">{author}</div>

        <div className="title-actions">
          <Link className="button" href={`/books/${work}/read/1`}>Read the web edition</Link>
          <span className="button secondary" aria-disabled="true">Original source — next</span>
          <span className="button secondary" aria-disabled="true">About recovery — next</span>
        </div>

        <hr className="title-rule" />

        <div className="title-grid">
          <section>
            <h2>The work</h2>
            <p>{title.chapters.length} chapters in this released web edition.</p>
          </section>
          <section>
            <h2>The edition</h2>
            <p>Frozen public release {title.release.release_sequence}, derived from WNPH master {title.release.render_master_sha256.slice(0, 12)}…</p>
          </section>
          <section>
            <h2>Rights</h2>
            <p>{underlyingRights ? `${underlyingRights.status.replaceAll('_', ' ')} · ${underlyingRights.use_scope}` : 'Rights information recorded in WNPH custody.'}</p>
          </section>
        </div>

        {title.release.payload_sha256 ? <div className="title-integrity">Public payload SHA-256 · {title.release.payload_sha256}</div> : null}
      </div>
    </main>
  );
}
