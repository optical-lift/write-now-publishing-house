import Link from 'next/link';
import type { WnphPublicLibraryBook } from '../../lib/wnph-public';
import styles from './library.module.css';

export default function BookObject({ book }: { book: WnphPublicLibraryBook }) {
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
