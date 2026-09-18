'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

type ShelfSourceRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  bottom: number;
};

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
      <span className={shelfStyles.topPageEdge} />
    </span>
  );
}

function CoverPeek({ volume }: { volume: LibraryVolume }) {
  const artUrl = volume.coverArtUrl ?? volume.representativeImageUrl;

  if (!artUrl && !volume.demo) return null;

  const style = {
    '--peek-color': volume.spineColor,
    '--peek-ink': volume.inkColor,
  } as CSSProperties;

  return (
    <span className={shelfStyles.coverPeek} style={style} aria-hidden="true">
      {artUrl ? (
        <img src={artUrl} alt="" draggable={false} />
      ) : (
        <span className={shelfStyles.coverPeekFixture} />
      )}
    </span>
  );
}

function shelfPose(index: number, activeIndex: number | null, restLean: number) {
  if (activeIndex === null) {
    return { lean: restLean, shift: 0, depth: 1 };
  }

  const delta = index - activeIndex;
  if (delta === 0) {
    return { lean: 0, shift: 0, depth: 30 };
  }

  const direction = delta < 0 ? -1 : 1;
  const distance = Math.abs(delta);
  const leanMagnitude = Math.max(1.15, 5.25 * Math.exp(-0.42 * (distance - 1)));
  const shiftMagnitude = 30 * Math.exp(-0.72 * (distance - 1));

  return {
    lean: direction * leanMagnitude,
    shift: direction * shiftMagnitude,
    depth: Math.max(2, 20 - distance),
  };
}

function ShelfVolume({
  volume,
  index,
  activeIndex,
  selectedIndex,
  onActivate,
  onSelect,
  onRegister,
}: {
  volume: LibraryVolume;
  index: number;
  activeIndex: number | null;
  selectedIndex: number | null;
  onActivate: (index: number | null) => void;
  onSelect: (index: number, element: HTMLElement) => void;
  onRegister: (index: number, element: HTMLElement | null) => void;
}) {
  const pose = shelfPose(index, activeIndex, volume.lean);
  const active = activeIndex === index;
  const selected = selectedIndex === index;
  const slotStyle = {
    '--book-width': `${volume.width}px`,
    '--book-height': `${volume.height}px`,
    '--pose-lean': `${pose.lean.toFixed(2)}deg`,
    '--pose-shift': `${pose.shift.toFixed(2)}px`,
    '--cover-width': `${Math.round(volume.height * 0.66)}px`,
    '--pose-turn': active ? '12deg' : '0deg',
    zIndex: pose.depth,
  } as CSSProperties;

  const slotClassName = [
    volume.demo ? shelfStyles.demoSlot : shelfStyles.bookSlot,
    active ? shelfStyles.activeSlot : '',
    selected ? shelfStyles.selectedSlot : '',
  ].filter(Boolean).join(' ');

  const handleMouseEnter = () => {
    if (selectedIndex === null) onActivate(index);
  };

  if (volume.demo) {
    return (
      <button
        type="button"
        className={slotClassName}
        style={slotStyle}
        aria-label={`Inspect ${volume.title} by ${volume.creator}, temporary shelf study`}
        aria-hidden={selected || undefined}
        tabIndex={selected ? -1 : 0}
        ref={(element) => onRegister(index, element)}
        onMouseEnter={handleMouseEnter}
        onFocus={() => {
          if (selectedIndex === null) onActivate(index);
        }}
        onBlur={() => {
          if (selectedIndex === null) onActivate(null);
        }}
        onClick={(event) => onSelect(index, event.currentTarget)}
      >
        <span className={shelfStyles.bookVisual} aria-hidden="true">
          <CoverPeek volume={volume} />
          <SpineVisual volume={volume} />
        </span>
      </button>
    );
  }

  return (
    <Link
      className={slotClassName}
      style={slotStyle}
      href={`/books/${volume.publicSlug}`}
      aria-label={`Inspect ${volume.title} by ${volume.creator}`}
      aria-hidden={selected || undefined}
      tabIndex={selected ? -1 : undefined}
      ref={(element) => onRegister(index, element)}
      onMouseEnter={handleMouseEnter}
      onFocus={() => {
        if (selectedIndex === null) onActivate(index);
      }}
      onBlur={() => {
        if (selectedIndex === null) onActivate(null);
      }}
      onClick={(event) => {
        event.preventDefault();
        onSelect(index, event.currentTarget);
      }}
    >
      <span className={shelfStyles.bookVisual} aria-hidden="true">
        <CoverPeek volume={volume} />
        <SpineVisual volume={volume} />
      </span>
    </Link>
  );
}

function SelectedBookInspection({
  volume,
  sourceRect,
  onReturn,
}: {
  volume: LibraryVolume;
  sourceRect: ShelfSourceRect;
  onReturn: () => void;
}) {
  const artUrl = volume.coverArtUrl ?? volume.representativeImageUrl;
  const sourceCenter = sourceRect.left + sourceRect.width / 2;
  const bottom = Math.max(18, window.innerHeight - sourceRect.bottom);
  const inspectionHeight = Math.min(sourceRect.height * 1.035, window.innerHeight - 72);
  const style = {
    '--inspection-x': `${sourceCenter.toFixed(2)}px`,
    '--inspection-bottom': `${bottom.toFixed(2)}px`,
    '--inspection-height': `${inspectionHeight.toFixed(2)}px`,
    '--inspection-color': volume.spineColor,
    '--inspection-ink': volume.inkColor,
  } as CSSProperties;

  return (
    <div
      className={shelfStyles.inspectionLayer}
      role="dialog"
      aria-label={`Inspect ${volume.title} by ${volume.creator}`}
    >
      <div className={shelfStyles.selectedInspection} style={style}>
        {artUrl ? (
          <img
            className={shelfStyles.inspectionCover}
            src={artUrl}
            alt={`${volume.title} cover`}
            draggable={false}
          />
        ) : (
          <div className={shelfStyles.inspectionFallback}>
            <strong>{volume.title}</strong>
            <span>{volume.creator}</span>
            <small>{volume.demo ? 'Shelf study' : 'Cover unavailable'}</small>
          </div>
        )}

        <div className={shelfStyles.inspectionActions}>
          {!volume.demo ? (
            <Link href={`/books/${volume.publicSlug}`}>Read</Link>
          ) : null}
          <button type="button" onClick={onReturn}>Return</button>
        </div>
      </div>
    </div>
  );
}

export default function SpatialLibrary({
  library,
  showDirectory = true,
  presentation = 'default',
}: SpatialLibraryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSourceRect, setSelectedSourceRect] = useState<ShelfSourceRect | null>(null);
  const slotRefs = useRef(new Map<number, HTMLElement>());
  const dissolved = presentation === 'dissolved';
  const volumes = useMemo(
    () => [
      ...library.books.map(projectLibraryBookToVolume),
      ...(dissolved ? DEMO_BINDING_VOLUMES : []),
    ],
    [dissolved, library.books],
  );

  const registerSlot = useCallback((index: number, element: HTMLElement | null) => {
    if (element) {
      slotRefs.current.set(index, element);
    } else {
      slotRefs.current.delete(index);
    }
  }, []);

  const readSourceRect = useCallback((index: number, element?: HTMLElement) => {
    const source = element ?? slotRefs.current.get(index);
    if (!source) return null;

    const rect = source.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
    };
  }, []);

  const handleSelect = useCallback((index: number, element: HTMLElement) => {
    const rect = readSourceRect(index, element);
    if (!rect) return;

    setSelectedSourceRect(rect);
    setSelectedIndex(index);
    setHoveredIndex(null);
  }, [readSourceRect]);

  const handleReturn = useCallback(() => {
    const returningIndex = selectedIndex;
    setSelectedIndex(null);
    setSelectedSourceRect(null);

    if (returningIndex !== null) {
      requestAnimationFrame(() => {
        slotRefs.current.get(returningIndex)?.focus();
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) return undefined;

    const refresh = () => {
      const rect = readSourceRect(selectedIndex);
      if (rect) setSelectedSourceRect(rect);
    };

    refresh();
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);

    return () => {
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, [readSourceRect, selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleReturn();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReturn, selectedIndex]);

  const activeIndex = selectedIndex === null ? hoveredIndex : null;
  const selectedVolume = selectedIndex === null ? null : volumes[selectedIndex] ?? null;
  const interactionState = selectedIndex !== null
    ? 'selected'
    : hoveredIndex !== null
      ? 'hoverPreview'
      : 'rest';

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
        <div
          className={[
            shelfStyles.rail,
            activeIndex !== null ? shelfStyles.shelfActive : '',
          ].filter(Boolean).join(' ')}
          data-interaction-state={interactionState}
          onMouseLeave={() => {
            if (selectedIndex === null) setHoveredIndex(null);
          }}
        >
          {volumes.map((volume, index) => (
            <ShelfVolume
              key={volume.publicSlug}
              volume={volume}
              index={index}
              activeIndex={activeIndex}
              selectedIndex={selectedIndex}
              onActivate={setHoveredIndex}
              onSelect={handleSelect}
              onRegister={registerSlot}
            />
          ))}
        </div>
        <div className={shelfStyles.shelfBoard} aria-hidden="true" />
      </div>

      {selectedVolume && selectedSourceRect ? (
        <SelectedBookInspection
          volume={selectedVolume}
          sourceRect={selectedSourceRect}
          onReturn={handleReturn}
        />
      ) : null}

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
