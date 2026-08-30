import type { Metadata } from 'next';
import Link from 'next/link';
import { getWnphPublicLibrary, type WnphPublicLibraryBook } from '../../lib/wnph-public';
import styles from './library.module.css';

export const metadata: Metadata = {
  title: 'The Library · Write Now Publishing House',
  description: 'Recovered works returned to reading by Write Now Publishing House.',
};

function BookObject({ book }: { book: WnphPublicLibraryBook }) {
  const author = book.bibliographic.creators.find((creator) => creator.role === 'author')?.label
    ?? book.bibliographic.creators[0]?.label
    ?? 'Unknown creator';
  const image = book.representative_image;

  return (
    <article className={styles.book}>
      <Link className={styles.artLink} href={`/books/${book.public_slug}`}>
        <div className={styles.artFrame}>
          {image ? (
            <img
              src={image.url}
              alt={`Historical illustration from ${book.bibliographic.title}.`}
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </div>
      </Link>

      <div className={styles.bookMeta}>
        <h3><Link href={`/books/${book.public_slug}`}>{book.bibliographic.title}</Link></h3>
        <div className={styles.author}>{author}</div>
        <div className={styles.details}>
          {book.bibliographic.work_type} · {book.chapter_count} chapters · {book.media_count} illustrations
        </div>
        <Link className={styles.readLink} href={`/books/${book.public_slug}/read`}>Read the edition →</Link>
      </div>
    </article>
  );
}

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
          <p>
            Wander the shelves of works returned from surviving evidence to active reading.
            A book may live on more than one shelf, just as it would in a reader&apos;s memory.
          </p>
        </header>

        {library.shelves.map((shelf) => {
          const books = shelf.book_slugs
            .map((slug) => booksBySlug.get(slug))
            .filter((book): book is WnphPublicLibraryBook => Boolean(book));

          if (books.length === 0) return null;

          return (
            <section className={styles.shelf} key={shelf.shelf_key} id={shelf.shelf_key}>
              <div className={styles.shelfHeading}>
                <h2>{shelf.title}</h2>
                <span>{books.length} {books.length === 1 ? 'work' : 'works'}</span>
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
