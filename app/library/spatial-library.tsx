'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { WnphPublicLibrary } from '../../lib/wnph-public';
import {
  DEMO_BINDING_VOLUMES,
  projectLibraryBookToVolume,
} from '../../lib/library-scene';
import styles from './spatial-library.module.css';

const ThreeBookshelf = dynamic(() => import('./three-bookshelf'), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      style={{ minHeight: 485, width: '100%' }}
    />
  ),
});

type SpatialLibraryProps = {
  library: WnphPublicLibrary;
  showDirectory?: boolean;
  presentation?: 'default' | 'dissolved';
};

const dissolvedStageStyle: CSSProperties = {
  width: '100vw',
  marginLeft: 'calc(50% - 50vw)',
};

export default function SpatialLibrary({
  library,
  showDirectory = true,
  presentation = 'default',
}: SpatialLibraryProps) {
  const dissolved = presentation === 'dissolved';
  const volumes = useMemo(
    () => [
      ...library.books.map(projectLibraryBookToVolume),
      ...(dissolved ? DEMO_BINDING_VOLUMES : []),
    ],
    [dissolved, library.books],
  );

  return (
    <div className={styles.libraryScene}>
      {!dissolved ? (
        <header className={styles.shelfHeading}>
          <div>
            <div className={styles.shelfEyebrow}>Collection</div>
            <h2>All works</h2>
          </div>
          <span className={styles.shelfCount}>
            {library.books.length} {library.books.length === 1 ? 'work' : 'works'}
          </span>
        </header>
      ) : null}

      <div style={dissolved ? dissolvedStageStyle : undefined}>
        <ThreeBookshelf volumes={volumes} />
      </div>

      {showDirectory && library.shelves.length > 0 ? (
        <nav className={styles.shelfDirectory} aria-label="Browse library shelves">
          <div>
            <div className={styles.shelfEyebrow}>Browse by shelf</div>
            <p>These are the catalogue's existing shelf groupings. They do not create duplicate works.</p>
          </div>
          <div className={styles.shelfLinks}>
            {library.shelves.map((shelf) => (
              <Link href={`/library/${shelf.shelf_key}`} key={shelf.shelf_key}>
                <span>{shelf.title}</span>
                <small>{shelf.book_slugs.length}</small>
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
