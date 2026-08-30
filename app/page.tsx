import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="home">
      <div className="home-inner">
        <div className="eyebrow">A recovery press</div>
        <h1>Books returned to reading.</h1>
        <p>
          Write Now Publishing House recovers historical works from surviving evidence and rebuilds them as modern, traceable editions for web, ebook, audio, print, and libraries.
        </p>
        <div className="home-actions">
          <Link className="button" href="/books/the-wish-fairy-and-dewy-dear/read">Read the first recovered edition</Link>
          <Link className="button secondary" href="/books/the-wish-fairy-and-dewy-dear">About the book</Link>
        </div>
      </div>
    </main>
  );
}
