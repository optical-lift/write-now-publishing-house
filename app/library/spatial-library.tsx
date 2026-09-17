'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { WnphPublicLibrary, WnphPublicLibraryBook, WnphPublicLibraryShelf } from '../../lib/wnph-public';
import { projectLibraryBookToVolume, type LibraryVolume } from '../../lib/library-scene';
import styles from './spatial-library.module.css';

type SpatialLibraryProps = {
  library: WnphPublicLibrary;
};

type SpatialShelfProps = {
  shelf: WnphPublicLibraryShelf;
  books: WnphPublicLibraryBook[];
};

function SpatialVolume({ volume }: { volume: LibraryVolume }) {
  const style = {
    '--book-width': `${volume.width}px`,
    '--book-height': `${volume.height}px`,
    '--book-depth': `${volume.depth}px`,
    '--book-lean': `${volume.lean}deg`,
    '--spine-color': volume.spineColor,
    '--band-color': volume.bandColor,
    '--book-ink': volume.inkColor,
  } as CSSProperties;

  return (
    <Link
      className={styles.volumeHit}
      href={`/books/${volume.publicSlug}`}
      aria-label={`Read ${volume.title} by ${volume.creator}`}
      data-volume
      style={style}
    >
      <span className={styles.volumeCard} aria-hidden="true">
        <span className={styles.cardKicker}>{volume.workType}</span>
        <strong>{volume.title}</strong>
        <span>{volume.creator}</span>
        <small>{volume.chapterCount} chapters · {volume.mediaCount} illustrations</small>
      </span>

      <span className={styles.bookBody} aria-hidden="true">
        <span className={styles.band} />
        <span className={styles.spineTitle}>{volume.title}</span>
        <span className={styles.spineCreator}>{volume.creator}</span>
        <span className={styles.pageBlock} />
      </span>
    </Link>
  );
}

function SpatialShelf({ shelf, books }: SpatialShelfProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const volumes = useMemo(() => books.map(projectLibraryBookToVolume), [books]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frame = 0;

    const updateCurve = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const railRect = rail.getBoundingClientRect();
        const visibleCenter = railRect.left + railRect.width / 2;
        const halfWidth = Math.max(railRect.width / 2, 1);

        rail.querySelectorAll<HTMLElement>('[data-volume]').forEach((volume) => {
          const rect = volume.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const normalized = Math.max(-1, Math.min(1, (center - visibleCenter) / halfWidth));
          volume.style.setProperty('--curve-rotate', `${(normalized * 30).toFixed(2)}deg`);
        });
      });
    };

    updateCurve();
    rail.addEventListener('scroll', updateCurve, { passive: true });
    window.addEventListener('resize', updateCurve);

    return () => {
      cancelAnimationFrame(frame);
      rail.removeEventListener('scroll', updateCurve);
      window.removeEventListener('resize', updateCurve);
    };
  }, [volumes.length]);

  return (
    <section className={styles.spatialShelf} aria-labelledby={`shelf-${shelf.shelf_key}`}>
      <header className={styles.shelfHeading}>
        <div>
          <div className={styles.shelfEyebrow}>Shelf</div>
          <h2 id={`shelf-${shelf.shelf_key}`}>{shelf.title}</h2>
        </div>
        <Link href={`/library/${shelf.shelf_key}`}>Catalogue · {books.length} {books.length === 1 ? 'work' : 'works'} →</Link>
      </header>

      <div className={styles.stage}>
        <div className={styles.rail} ref={railRef}>
          <div className={styles.railSpacer} aria-hidden="true" />
          {volumes.map((volume) => <SpatialVolume volume={volume} key={volume.publicSlug} />)}
          <div className={styles.railSpacer} aria-hidden="true" />
        </div>
        <div className={styles.shelfBoard} aria-hidden="true" />
      </div>
      <p className={styles.hint}>Scroll the shelf. Select a spine to enter the existing reader.</p>
    </section>
  );
}

export default function SpatialLibrary({ library }: SpatialLibraryProps) {
  const booksBySlug = useMemo(
    () => new Map(library.books.map((book) => [book.public_slug, book])),
    [library.books],
  );

  return (
    <div className={styles.libraryScene}>
      {library.shelves.map((shelf) => {
        const books = shelf.book_slugs
          .map((slug) => booksBySlug.get(slug))
          .filter((book): book is WnphPublicLibraryBook => Boolean(book));

        if (books.length === 0) return null;
        return <SpatialShelf shelf={shelf} books={books} key={shelf.shelf_key} />;
      })}
    </div>
  );
}
