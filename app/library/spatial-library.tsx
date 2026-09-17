'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import type { WnphPublicLibrary, WnphPublicLibraryBook, WnphPublicLibraryShelf } from '../../lib/wnph-public';
import {
  DEMO_BINDING_VOLUMES,
  projectLibraryBookToVolume,
  type LibraryVolume,
} from '../../lib/library-scene';
import styles from './spatial-library.module.css';
import motionStyles from './spatial-library-motion.module.css';

type RectSnapshot = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type SpatialLibraryProps = {
  library: WnphPublicLibrary;
  showDirectory?: boolean;
  presentation?: 'default' | 'dissolved';
};

type SpatialShelfProps = {
  shelf: WnphPublicLibraryShelf;
  books: WnphPublicLibraryBook[];
  onSelect: (volume: LibraryVolume, source: HTMLElement) => void;
  dissolved?: boolean;
  demoVolumes?: LibraryVolume[];
  selectedVolumeId?: string | null;
  handoffVolumeId?: string | null;
};

type SelectedVolume = {
  volume: LibraryVolume;
  sourceId: string;
  origin: RectSnapshot;
  sourceCurveRotation: number;
  viewport: {
    width: number;
    height: number;
  };
};

type BookPose = 'shelf' | 'hover' | 'detail';

const BOOK_FLIGHT_MS = 720;
const BOOK_FLIGHT_EASE = 'cubic-bezier(.22, 1, .36, 1)';
const SHELF_MOTION_MS = 360;

const dissolvedStageStyle: CSSProperties = {
  width: '100vw',
  marginLeft: 'calc(50% - 50vw)',
  overflow: 'visible',
  border: 0,
  background: 'transparent',
  boxShadow: 'none',
};

const dissolvedRailStyle: CSSProperties = {
  position: 'absolute',
  inset: '0 0 28px 0',
  minHeight: 0,
  paddingTop: '132px',
  paddingRight: 'max(28px, 5vw)',
  paddingBottom: 0,
  paddingLeft: 'max(28px, 5vw)',
  background: 'transparent',
};

const dissolvedShelfStyle: CSSProperties = {
  height: '9px',
  border: 0,
  background: 'linear-gradient(180deg, #9a7853 0%, #76583a 100%)',
  boxShadow: '0 9px 24px rgba(31, 28, 24, .18), 0 -1px 0 rgba(31, 28, 24, .18)',
};

function rectSnapshot(rect: DOMRect): RectSnapshot {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function volumeElementId(volume: LibraryVolume) {
  return `library-volume-${volume.publicSlug}`;
}

function bindingLabel(volume: LibraryVolume) {
  if (volume.binding === 'hardcover' && volume.jacket) return 'jacketed hardcover';
  if (volume.binding === 'hardcover') return 'cloth hardcover';
  if (volume.binding === 'paperback') return 'paperback';
  return 'binding unknown';
}

function presentationArtUrl(volume: LibraryVolume) {
  return volume.coverArtUrl ?? volume.representativeImageUrl;
}

function coverWidthFor(volume: LibraryVolume) {
  return Math.round(volume.height * (2 / 3));
}

function closedBookTransform(
  volume: LibraryVolume,
  pose: BookPose,
  curveRotation: number | null,
) {
  if (pose === 'detail') return 'translate3d(0, 0, 0) rotateY(0deg) rotateZ(0deg)';
  if (pose === 'hover') return 'translate3d(0, -4px, 24px) rotateY(78deg) rotateZ(0deg)';

  const shelfYaw = curveRotation === null
    ? 'calc(90deg + var(--curve-rotate, 0deg))'
    : `${90 + curveRotation}deg`;

  return `translate3d(0, 0, 0) rotateY(${shelfYaw}) rotateZ(${volume.lean}deg)`;
}

function ClosedBook({
  volume,
  pose,
  curveRotation = 0,
  motionMs = SHELF_MOTION_MS,
}: {
  volume: LibraryVolume;
  pose: BookPose;
  curveRotation?: number | null;
  motionMs?: number;
}) {
  const artUrl = presentationArtUrl(volume);
  const coverWidth = coverWidthFor(volume);
  const facsimile = volume.workKey === 'wish-fairy-and-dewy-dear' && Boolean(artUrl);
  const cloth = volume.binding === 'hardcover'
    && volume.finish === 'cloth'
    && !volume.jacket
    && !facsimile;

  const rootStyle = {
    '--cover-width': `${coverWidth}px`,
    '--book-height': `${volume.height}px`,
    '--book-thickness': `${volume.width}px`,
    '--spine-color': volume.spineColor,
    '--band-color': volume.bandColor,
    '--book-ink': volume.inkColor,
    transform: closedBookTransform(volume, pose, curveRotation),
    filter: pose === 'detail'
      ? 'drop-shadow(24px 30px 30px rgba(31, 28, 24, .28))'
      : pose === 'hover'
        ? 'drop-shadow(10px 14px 14px rgba(31, 28, 24, .22))'
        : 'drop-shadow(5px 8px 8px rgba(31, 28, 24, .14))',
    transition: `transform ${motionMs}ms ${BOOK_FLIGHT_EASE}, filter ${motionMs}ms ${BOOK_FLIGHT_EASE}`,
  } as CSSProperties;

  const className = [
    motionStyles.closedBook,
    volume.binding === 'hardcover' ? motionStyles.hardcover : '',
    volume.jacket ? motionStyles.jacketed : '',
    cloth ? motionStyles.cloth : '',
    facsimile ? motionStyles.facsimile : '',
  ].filter(Boolean).join(' ');

  return (
    <span className={className} style={rootStyle} aria-hidden="true">
      <span className={motionStyles.frontFace}>
        {artUrl ? (
          <Image
            className={motionStyles.coverArtwork}
            src={artUrl}
            alt=""
            fill
            sizes="(max-width: 860px) 260px, 360px"
            unoptimized={facsimile || artUrl.startsWith('data:')}
            draggable={false}
          />
        ) : (
          <span className={motionStyles.coverFallback}>
            <strong>{volume.title}</strong>
            <span>{volume.creator}</span>
          </span>
        )}
      </span>
      <span className={motionStyles.spineFace}>
        <span className={motionStyles.spineBand} />
        <span className={motionStyles.spineTitle}>{volume.title}</span>
        <span className={motionStyles.spineCreator}>{volume.creator}</span>
      </span>
      <span className={motionStyles.foreEdge} />
      <span className={motionStyles.topEdge} />
      <span className={motionStyles.bottomEdge} />
      <span className={motionStyles.backFace} />
    </span>
  );
}

function SpatialVolume({
  volume,
  onSelect,
  selected,
  handoff,
}: {
  volume: LibraryVolume;
  onSelect: (volume: LibraryVolume, source: HTMLElement) => void;
  selected: boolean;
  handoff: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const sourceHidden = selected && !handoff;
  const style = {
    '--book-width': `${volume.width}px`,
    '--book-height': `${volume.height}px`,
    '--book-depth': `${volume.depth}px`,
    '--book-lean': `${volume.lean}deg`,
    '--spine-color': volume.spineColor,
    '--band-color': volume.bandColor,
    '--book-ink': volume.inkColor,
    zIndex: hovered && !selected ? 18 : undefined,
  } as CSSProperties;

  const className = [
    styles.volumeHit,
    motionStyles.volumeReset,
    sourceHidden ? motionStyles.sourceHidden : '',
  ].filter(Boolean).join(' ');

  const commonProps = {
    id: volumeElementId(volume),
    'data-volume': '',
    'data-volume-id': volume.publicSlug,
    style,
    className,
    tabIndex: sourceHidden ? -1 : undefined,
    'aria-hidden': sourceHidden || undefined,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  };

  const content = (
    <ClosedBook
      volume={volume}
      pose={hovered && !selected ? 'hover' : 'shelf'}
      curveRotation={null}
    />
  );

  if (volume.demo) {
    return (
      <button
        {...commonProps}
        type="button"
        aria-label={`Inspect ${volume.title}, ${bindingLabel(volume)} demo`}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          setHovered(false);
          onSelect(volume, event.currentTarget);
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      {...commonProps}
      href={`/books/${volume.publicSlug}`}
      aria-label={`Bring ${volume.title} by ${volume.creator} forward`}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        setHovered(false);
        onSelect(volume, event.currentTarget);
      }}
    >
      {content}
    </Link>
  );
}

function VolumeDetail({
  selection,
  onReturnLanded,
  onDismiss,
}: {
  selection: SelectedVolume;
  onReturnLanded: (volumeId: string) => void;
  onDismiss: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const [returning, setReturning] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [returnRect, setReturnRect] = useState<RectSnapshot>(selection.origin);
  const returningRef = useRef(false);
  const handoffRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volume = selection.volume;
  const compact = selection.viewport.width <= 860;
  const naturalCoverWidth = coverWidthFor(volume);

  const targetHeight = compact
    ? Math.max(250, Math.min(350, selection.viewport.height * 0.46))
    : Math.max(300, Math.min(455, selection.viewport.height - 150));
  const targetScale = targetHeight / volume.height;
  const targetWidth = naturalCoverWidth * targetScale;
  const targetCenterX = compact ? selection.viewport.width / 2 : selection.viewport.width * 0.39;
  const targetLeft = Math.max(24, targetCenterX - targetWidth / 2);
  const targetTop = compact
    ? Math.max(24, selection.viewport.height * 0.07)
    : Math.max(42, (selection.viewport.height - targetHeight) / 2);

  const measureSource = useCallback((): RectSnapshot => {
    const source = document.getElementById(selection.sourceId);
    if (!source) return selection.origin;
    return rectSnapshot(source.getBoundingClientRect());
  }, [selection.origin, selection.sourceId]);

  const openEdition = useCallback(() => {
    if (volume.demo || returningRef.current || !settled) return;
    router.push(`/books/${volume.publicSlug}`);
  }, [router, settled, volume.demo, volume.publicSlug]);

  const beginHandoff = useCallback(() => {
    if (handoffRef.current) return;
    handoffRef.current = true;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    onReturnLanded(volume.publicSlug);
    setHandoff(true);
    closeTimerRef.current = setTimeout(onDismiss, 70);
  }, [onDismiss, onReturnLanded, volume.publicSlug]);

  const dismiss = useCallback(() => {
    if (returningRef.current) return;
    returningRef.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onReturnLanded(volume.publicSlug);
      onDismiss();
      return;
    }

    setSettled(false);
    setReturnRect(measureSource());
    setReturning(true);
    requestAnimationFrame(() => setOpen(false));
    closeTimerRef.current = setTimeout(beginHandoff, BOOK_FLIGHT_MS + 140);
  }, [beginHandoff, measureSource, onDismiss, onReturnLanded, volume.publicSlug]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setOpen(true);
        if (reduced) setSettled(true);
      });
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [dismiss]);

  const targetTranslateX = targetLeft - selection.origin.left;
  const targetTranslateY = targetTop - selection.origin.top;
  const returnTranslateX = returnRect.left - selection.origin.left;
  const returnTranslateY = returnRect.top - selection.origin.top;

  const flightTransform = open
    ? `translate3d(${targetTranslateX}px, ${targetTranslateY}px, 0) scale(${targetScale})`
    : returning
      ? `translate3d(${returnTranslateX}px, ${returnTranslateY}px, 0) scale(1)`
      : 'translate3d(0, 0, 0) scale(1)';

  const flightStyle = {
    '--cover-width': `${naturalCoverWidth}px`,
    '--book-height': `${volume.height}px`,
    top: `${selection.origin.top}px`,
    left: `${selection.origin.left}px`,
    transform: flightTransform,
    opacity: handoff ? 0 : 1,
    transition: `transform ${BOOK_FLIGHT_MS}ms ${BOOK_FLIGHT_EASE}, opacity 60ms linear`,
  } as CSSProperties;

  const infoClassName = [
    motionStyles.detailInfo,
    settled && !returning ? motionStyles.detailInfoVisible : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`${motionStyles.detailOverlay} ${open ? motionStyles.detailOverlayOpen : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${volume.title} by ${volume.creator}`}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) dismiss();
      }}
    >
      <div
        className={motionStyles.bookFlight}
        style={flightStyle}
        onTransitionEnd={(event) => {
          if (event.currentTarget !== event.target || event.propertyName !== 'transform') return;
          if (returning) {
            beginHandoff();
          } else if (open) {
            setSettled(true);
          }
        }}
      >
        <div
          className={motionStyles.detailBookHit}
          role={volume.demo ? undefined : 'button'}
          tabIndex={volume.demo || returning ? undefined : 0}
          aria-label={volume.demo ? undefined : `Open ${volume.title}`}
          title={volume.demo ? undefined : 'Click the cover again to open the book'}
          onClick={openEdition}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openEdition();
            }
          }}
        >
          <ClosedBook
            volume={volume}
            pose={open ? 'detail' : 'shelf'}
            curveRotation={selection.sourceCurveRotation}
            motionMs={BOOK_FLIGHT_MS}
          />
        </div>
      </div>

      <div className={infoClassName}>
        <div className={motionStyles.detailKicker}>{volume.demo ? 'Binding study' : volume.workType}</div>
        <h2>{volume.title}</h2>
        <p className={motionStyles.detailCreator}>{volume.creator}</p>
        <p className={motionStyles.detailFacts}>
          {volume.demo
            ? `${bindingLabel(volume)} · temporary shelf example`
            : `${volume.chapterCount} chapters · ${volume.mediaCount} illustrations`}
        </p>
        {!volume.demo ? (
          <p className={motionStyles.detailInstruction}>Click the cover again to open this edition.</p>
        ) : null}
        <button className={motionStyles.detailReturn} type="button" onClick={dismiss}>Return to shelf</button>
      </div>
    </div>
  );
}

function SpatialShelf({
  shelf,
  books,
  onSelect,
  dissolved = false,
  demoVolumes = [],
  selectedVolumeId = null,
  handoffVolumeId = null,
}: SpatialShelfProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const volumes = useMemo(
    () => [...books.map(projectLibraryBookToVolume), ...demoVolumes],
    [books, demoVolumes],
  );
  const isShortShelf = volumes.length <= 4;

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
          volume.style.setProperty('--curve-rotate', `${(normalized * 4).toFixed(2)}deg`);
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
    <section className={styles.spatialShelf} aria-labelledby={dissolved ? undefined : `shelf-${shelf.shelf_key}`}>
      {!dissolved ? (
        <header className={styles.shelfHeading}>
          <div>
            <div className={styles.shelfEyebrow}>Collection</div>
            <h2 id={`shelf-${shelf.shelf_key}`}>{shelf.title}</h2>
          </div>
          <span className={styles.shelfCount}>{books.length} {books.length === 1 ? 'work' : 'works'}</span>
        </header>
      ) : null}

      <div className={styles.stage} style={dissolved ? dissolvedStageStyle : undefined}>
        <div
          className={`${styles.rail} ${isShortShelf ? styles.shortRail : ''}`}
          ref={railRef}
          style={dissolved ? dissolvedRailStyle : undefined}
        >
          {!isShortShelf ? <div className={styles.railSpacer} aria-hidden="true" /> : null}
          {volumes.map((volume) => (
            <SpatialVolume
              volume={volume}
              onSelect={onSelect}
              selected={selectedVolumeId === volume.publicSlug}
              handoff={handoffVolumeId === volume.publicSlug}
              key={volume.publicSlug}
            />
          ))}
          {!isShortShelf ? <div className={styles.railSpacer} aria-hidden="true" /> : null}
        </div>
        <div className={styles.shelfBoard} style={dissolved ? dissolvedShelfStyle : undefined} aria-hidden="true" />
      </div>
    </section>
  );
}

export default function SpatialLibrary({
  library,
  showDirectory = true,
  presentation = 'default',
}: SpatialLibraryProps) {
  const [selection, setSelection] = useState<SelectedVolume | null>(null);
  const [handoffVolumeId, setHandoffVolumeId] = useState<string | null>(null);
  const dissolved = presentation === 'dissolved';

  const allWorksShelf = useMemo<WnphPublicLibraryShelf>(() => ({
    shelf_key: 'all-works',
    title: 'All works',
    book_slugs: library.books.map((book) => book.public_slug),
  }), [library.books]);

  const handleSelect = useCallback((volume: LibraryVolume, source: HTMLElement) => {
    const curveRotation = Number.parseFloat(
      getComputedStyle(source).getPropertyValue('--curve-rotate'),
    ) || 0;

    setHandoffVolumeId(null);
    setSelection({
      volume,
      sourceId: source.id,
      origin: rectSnapshot(source.getBoundingClientRect()),
      sourceCurveRotation: curveRotation,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }, []);

  const handleReturnLanded = useCallback((volumeId: string) => {
    setHandoffVolumeId(volumeId);
  }, []);

  const handleDismiss = useCallback(() => {
    setSelection(null);
    setHandoffVolumeId(null);
  }, []);

  return (
    <>
      <div className={styles.libraryScene}>
        <SpatialShelf
          shelf={allWorksShelf}
          books={library.books}
          onSelect={handleSelect}
          dissolved={dissolved}
          demoVolumes={dissolved ? DEMO_BINDING_VOLUMES : []}
          selectedVolumeId={selection?.volume.publicSlug ?? null}
          handoffVolumeId={handoffVolumeId}
        />

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

      {selection ? (
        <VolumeDetail
          selection={selection}
          onReturnLanded={handleReturnLanded}
          onDismiss={handleDismiss}
        />
      ) : null}
    </>
  );
}
