import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWnphPublicLibrary, type WnphPublicLibraryBook } from '../../../lib/wnph-public';
import BookObject from '../book-object';
import styles from '../library.module.css';

export async function generateMetadata({ params }: { params: Promise<{ shelf: string }> }): Promise<Metadata> {
  const { shelf: shelfKey } = await params;
  const library = await getWnphPublicLibrary();
  const shelf = library?.shelves.find((item) => item.shelf_key === shelfKey);

  if (!shelf) return { title: 'The Library · Write Now Publishing House' };

  return {
    title: `${shelf.title} · Write Now Publishing House`,
    description: `${shelf.title} in the Write Now Publishing House library.`,
  };
}

export default async function LibraryShelfPage({ params }: { params: Promise<{ shelf: string }> }) {
  const { shelf: shelfKey } = await params;
  const library = await getWnphPublicLibrary();
  if (!library) notFound();

  const shelf = library.shelves.find((item) => item.shelf_key === shelfKey);
  if (!shelf) notFound();

  const booksBySlug = new Map(library.books.map((book) => [book.public_slug, book]));
  const books = shelf.book_slugs
    .map((slug) => booksBySlug.get(slug))
    .filter((book): book is WnphPublicLibraryBook => Boolean(book));

  return (
    <main className={styles.library}>
      <div className={styles.inner}>
        <header className={styles.intro}>
          <div className={styles.eyebrow}><Link href="/library">The Library</Link></div>
          <h1>{shelf.title}</h1>
          <p>{books.length} {books.length === 1 ? 'work' : 'works'} on this shelf.</p>
        </header>

        <section className={styles.shelf}>
          <div className={styles.books}>
            {books.map((book) => <BookObject book={book} key={book.public_slug} />)}
          </div>
        </section>
      </div>
    </main>
  );
}
