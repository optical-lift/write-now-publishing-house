import Link from 'next/link';

export default async function BookPage({ params }: { params: Promise<{ work: string }> }) {
  const { work } = await params;

  if (work !== 'the-wish-fairy-and-dewy-dear') {
    return (
      <main className="title-page">
        <div className="title-page-inner">
          <div className="title-meta">Publication not found</div>
          <h1>This work is not yet published.</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="title-page">
      <div className="title-page-inner">
        <div className="title-meta">Recovered edition · Children&apos;s book · 1922</div>
        <h1>The Wish Fairy and Dewy Dear</h1>
        <div className="byline">Alice Ross Colver</div>

        <div className="title-actions">
          <Link className="button" href="/books/the-wish-fairy-and-dewy-dear/read">Read the web edition</Link>
          <span className="button secondary" aria-disabled="true">Original source — next</span>
          <span className="button secondary" aria-disabled="true">About recovery — next</span>
        </div>

        <hr className="title-rule" />

        <div className="title-grid">
          <section>
            <h2>The work</h2>
            <p>A six-chapter illustrated children&apos;s book by Alice Ross Colver, first published in 1922.</p>
          </section>
          <section>
            <h2>The edition</h2>
            <p>A Write Now publication expression reconstructed for one source-of-truth output across web, EPUB, and print.</p>
          </section>
          <section>
            <h2>The source</h2>
            <p>Recovered from governed historical source material with seven historical illustration placements preserved.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
