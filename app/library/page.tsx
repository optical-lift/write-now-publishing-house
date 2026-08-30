import type { Metadata } from 'next';
import Link from 'next/link';
import { getWnphPublicLibrary, type WnphPublicLibraryBook } from '../../lib/wnph-public';
import BookObject from './book-object';
import styles from './library.module.css';

export const metadata: Metadata = {
  title: 'The Library · Write Now Publishing House',
  description: 'Recovered works returned to reading by Write Now Publishing House.',
};

export default async function LibraryPage() {
  const library = await getWnphPublicLibrary();

  if (!library) {
    return (
      <main className={styles.library}>
        <div className={styles.inner}>
          <div className={styles.intro}>
            <div className={styles.eyebrow}>The Library</div>
            <h1>Books recovered for reading again.</h1>
          </div>
          <div className={styles.empty}>The library catalogue is temporarily unavailable.</div>
        </div>
      </main>
    );
  }

  const booksBySlug = new Map(library.books.map((book) => [book.public_slug, book]));

  return (
    <main className={styles.library}>
      <div className={styles.inner}>
        <header className={styles.intro}>
          <div className={styles.eyebrow}>The Library</div>
          <h1>Books recovered for reading again.</h1>
          <p>Wander the shelves of works returned from surviving evidence to active reading.</p>
        </header>

        {library.shelves.map((shelf) => {
          const books = shelf.book_slugs
            .map((slug) => booksBySlug.get(slug))
            .filter((book): book is WnphPublicLibraryBook => Boolean(book));

          if (books.length === 0) return null;

          return (
            <section className={styles.shelf} key={shelf.shelf_key} id={shelf.shelf_key}>
              <div className={styles.shelfHeading}>
                <h2><Link href={`/library/${shelf.shelf_key}`}>{shelf.title}</Link></h2>
                <Link className={styles.shelfLink} href={`/library/${shelf.shelf_key}`}>
                  View shelf · {books.length} {books.length === 1 ? 'work' : 'works'} →
                </Link>
              </div>
              <div className={styles.books}>
                {books.map((book) => <BookObject book={book} key={`${shelf.shelf_key}:${book.public_slug}`} />)}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
