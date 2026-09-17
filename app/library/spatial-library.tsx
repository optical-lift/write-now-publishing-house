'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { WnphPublicLibrary } from '../../lib/wnph-public';
import {
  DEMO_BINDING_VOLUMES,
  projectLibraryBookToVolume,
  type LibraryVolume,
} from '../../lib/library-scene';
import styles from './spatial-library.module.css';
import shelfStyles from './simple-bookshelf.module.css';

type SpatialLibraryProps = {
  library: WnphPublicLibrary;
  showDirectory?: boolean;
  presentation?: 'default' | 'dissolved';
};

function bindingLabel(volume: LibraryVolume) {
  if (volume.binding === 'hardcover' && volume.jacket) return 'jacketed hardcover';
  if (volume.binding === 'hardcover') return 'cloth hardcover';
  if (volume.binding === 'paperback') return 'paperback';
  return 'book';
}

function spineClass(volume: LibraryVolume) {
  return [
    shelfStyles.spine,
    volume.binding === 'hardcover' ? shelfStyles.hardcover : '',
    volume.binding === 'paperback' ? shelfStyles.paperback : '',
    volume.jacket ? shelfStyles.jacketed : '',
  ].filter(Boolean).join(' ');
}

function SpineVisual({ volume }: { volume: LibraryVolume }) {
  const artUrl = volume.coverArtUrl ?? volume.representativeImageUrl;
  const style = {
    '--spine-color': volume.spineColor,
    '--band-color': volume.bandColor,
    '--book-ink': volume.inkColor,
    '--book-lean': `${volume.lean}deg`,
  } as CSSProperties;

  return (
    <span className={spineClass(volume)} style={style} aria-hidden="true">
      {artUrl ? (
        <span
          className={shelfStyles.coverWrap}
          style={{
            backgroundImage: `url(${JSON.stringify(artUrl)})`,
            '--cover-opacity': volume.workKey === 'wish-fairy-and-dewy-dear' ? '.72' : '.42',
          } as CSSProperties}
        />
      ) : null}
      <span className={shelfStyles.colorSettle} />
      <span className={shelfStyles.bandTop} />
      <span className={shelfStyles.bandBottom} />
      <span className={shelfStyles.spineTitle}>{volume.title}</span>
      {volume.width >= 36 ? <span className={shelfStyles.spineCreator}>{volume.creator}</span> : null}
      {volume.width >= 30 ? <span className={shelfStyles.publisherMark} /> : null}
      <span className={shelfStyles.material} />
      <span className={shelfStyles.sheen} />
      <span className={shelfStyles.wear} />
    </span>
  );
}

function Tooltip({ volume }: { volume: LibraryVolume }) {
  return (
    <span className={shelfStyles.tooltip} aria-hidden="true">
      <strong>{volume.title}</strong>
      <span>{volume.creator}</span>
      <small>{volume.demo ? `Shelf study · ${bindingLabel(volume)}` : volume.workType}</small>
    </span>
  );
}

function ShelfVolume({ volume }: { volume: LibraryVolume }) {
  const slotStyle = {
    '--book-width': `${volume.width}px`,
    '--book-height': `${volume.height}px`,
  } as CSSProperties;

  if (volume.demo) {
    return (
      <div
        className={shelfStyles.demoSlot}
        style={slotStyle}
        aria-label={`${volume.title} by ${volume.creator}, temporary shelf study`}
      >
        <Tooltip volume={volume} />
        <SpineVisual volume={volume} />
      </div>
    );
  }

  return (
    <Link
      className={shelfStyles.bookSlot}
      style={slotStyle}
      href={`/books/${volume.publicSlug}`}
      aria-label={`Open ${volume.title} by ${volume.creator}`}
    >
      <Tooltip volume={volume} />
      <SpineVisual volume={volume} />
    </Link>
  );
}

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

      <div
        className={shelfStyles.stage}
        style={dissolved ? { width: '100vw', marginLeft: 'calc(50% - 50vw)' } : undefined}
      >
        <div className={shelfStyles.rail}>
          {volumes.map((volume) => (
            <ShelfVolume key={volume.publicSlug} volume={volume} />
          ))}
        </div>
        <div className={shelfStyles.shelfBoard} aria-hidden="true" />
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
