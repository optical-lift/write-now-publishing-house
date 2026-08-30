import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About · Write Now Publishing House',
  description: 'About Write Now Publishing House and its work recovering historical books for modern reading.',
};

export default function AboutPage() {
  return (
    <main className="title-page">
      <div className="title-page-inner">
        <div className="title-meta">About Write Now Publishing House</div>
        <h1>Books returned to reading.</h1>
        <p className="byline">
          Write Now recovers historical works from surviving evidence and rebuilds them as modern editions without severing them from their source history.
        </p>

        <div className="title-actions">
          <Link className="button" href="/library">Enter the library</Link>
        </div>

        <hr className="title-rule" />

        <div className="title-grid">
          <section>
            <h2>Recovery</h2>
            <p>We preserve the surviving witness, reconstruct the readable work transparently, and keep the evidence trail attached.</p>
          </section>
          <section>
            <h2>One master</h2>
            <p>A governed publication expression can become web, ebook, print PDF, paperback, audio, and future formats without creating separate book truths.</p>
          </section>
          <section>
            <h2>For reading</h2>
            <p>The point of recovery is not to leave a book trapped in an archive. It is to make the work available to readers again.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
