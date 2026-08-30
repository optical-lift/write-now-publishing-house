import Link from 'next/link';
import { getWnphPublicLibrary, type WnphPublicLibraryBook } from '../lib/wnph-public';
import BookObject from './library/book-object';
import styles from './library/library.module.css';

export default async function HomePage() {
  const library = await getWnphPublicLibrary();

  return (
    <main>
      <section className="home">
        <div className="home-inner">
          <div className="eyebrow">A recovery press</div>
          <h1>Books returned to reading.</h1>
          <p>
            Write Now Publishing House recovers historical works from surviving evidence and rebuilds them as modern, traceable editions for web, ebook, audio, print, and libraries.
          </p>
          <div className="home-actions">
            <Link className="button" href="/library">Enter the library</Link>
            <Link className="button secondary" href="/about">About Write Now</Link>
          </div>
        </div>
      </section>

      <section className={styles.library} aria-label="Library shelves">
        <div className={styles.inner}>
          <header className={styles.intro}>
            <div className={styles.eyebrow}>The Library</div>
            <h2 className={styles.libraryTitle}>Books recovered for reading again.</h2>
          </header>

          {!library ? (
            <div className={styles.empty}>The library catalogue is temporarily unavailable.</div>
          ) : (
            <HomeShelves library={library} />
          )}
        </div>
      </section>
    </main>
  );
}

function HomeShelves({ library }: { library: NonNullable<Awaited<ReturnType<typeof getWnphPublicLibrary>>> }) {
  const booksBySlug = new Map(library.books.map((book) => [book.public_slug, book]));
  const shown = new Set<string>();

  return library.shelves.map((shelf) => {
    const uniqueBooks = shelf.book_slugs
      .filter((slug) => !shown.has(slug))
      .map((slug) => booksBySlug.get(slug))
      .filter((book): book is WnphPublicLibraryBook => Boolean(book));

    uniqueBooks.forEach((book) => shown.add(book.public_slug));

    return (
      <section className={styles.shelf} key={shelf.shelf_key}>
        <div className={styles.shelfHeading}>
          <h2><Link href={`/library/${shelf.shelf_key}`}>{shelf.title}</Link></h2>
          <Link className={styles.shelfLink} href={`/library/${shelf.shelf_key}`}>View shelf →</Link>
        </div>
        {uniqueBooks.length > 0 ? (
          <div className={styles.books}>
            {uniqueBooks.map((book) => <BookObject book={book} key={book.public_slug} />)}
          </div>
        ) : null}
      </section>
    );
  });
}
