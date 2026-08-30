import Link from 'next/link';

export default async function ReaderPage({ params }: { params: Promise<{ work: string }> }) {
  const { work } = await params;

  if (work !== 'the-wish-fairy-and-dewy-dear') {
    return (
      <main className="reader">
        <div className="reader-placeholder">This publication is not available.</div>
      </main>
    );
  }

  return (
    <main className="reader-shell">
      <div className="reader-toolbar" aria-label="Reader controls">
        <div className="left"><Link href="/books/the-wish-fairy-and-dewy-dear">About this edition</Link></div>
        <div className="center">The Wish Fairy and Dewy Dear</div>
        <div className="right">Contents · Aa</div>
      </div>

      <article className="reader">
        <section className="reader-title">
          <div className="reader-title-inner">
            <div className="kicker">A Write Now recovered edition</div>
            <h1>The Wish Fairy and Dewy Dear</h1>
            <div className="author">Alice Ross Colver</div>
            <div className="status">The reader shell is live. Canonical publication content connects next.</div>
          </div>
        </section>

        <section className="chapter" aria-labelledby="chapter-one-title">
          <div className="chapter-heading">
            <div className="chapter-number">Chapter I</div>
            <h2 id="chapter-one-title">Dewy Dear</h2>
          </div>

          <div className="reader-placeholder">
            <strong>No book text is stored in this website repository.</strong><br />
            This space will be filled directly from the governed WNPH Publication Expression. The web interface owns typography, measure, navigation, and responsive behavior; WNPH remains the authority for the words, structure, illustrations, and provenance.
          </div>

          <div className="reader-actions">
            <span>View original</span>
            <span>·</span>
            <span>About this recovery</span>
          </div>
        </section>
      </article>
    </main>
  );
}
