import Link from 'next/link';
import { getWnphPublicLibrary, type WnphPublicLibraryBook } from '../lib/wnph-public';
import BookObject from './library/book-object';
import styles from './library/library.module.css';

export default async function HomePage() {
  const library = await getWnphPublicLibrary();

  if (!library) {
    return (
      <main className={styles.library}>
        <div className={styles.inner}>
          <header className={styles.intro}>
            <div className={styles.eyebrow}>The Library</div>
            <h1>Books recovered for reading again.</h1>
          </header>
          <div className={styles.empty}>The library catalogue is temporarily unavailable.</div>
        </div>
      </main>
    );
  }

  const booksBySlug = new Map(library.books.map((book) => [book.public_slug, book]));
  const shown = new Set<string>();

  return (
    <main className={styles.library}>
      <div className={styles.inner}>
        <header className={styles.intro}>
          <div className={styles.eyebrow}>The Library</div>
          <h1>Books recovered for reading again.</h1>
          <p>Wander the shelves of works returned from surviving evidence to active reading.</p>
        </header>

        {library.shelves.map((shelf) => {
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
        })}
      </div>
    </main>
  );
}
