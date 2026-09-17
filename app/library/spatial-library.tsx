'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import type { WnphPublicLibrary, WnphPublicLibraryBook, WnphPublicLibraryShelf } from '../../lib/wnph-public';
import {
  DEMO_BINDING_VOLUMES,
  projectLibraryBookToVolume,
  type LibraryVolume,
} from '../../lib/library-scene';
import styles from './spatial-library.module.css';
import bindingStyles from './binding-volume.module.css';

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
  viewport: {
    width: number;
    height: number;
  };
};

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

function bindingClass(volume: LibraryVolume) {
  if (volume.binding === 'hardcover') return bindingStyles.hardcover;
  if (volume.binding === 'paperback') return bindingStyles.paperback;
  return bindingStyles.unknownBinding;
}

function bindingLabel(volume: LibraryVolume) {
  if (volume.binding === 'hardcover' && volume.jacket) return 'jacketed hardcover';
  if (volume.binding === 'hardcover') return 'cloth hardcover';
  if (volume.binding === 'paperback') return 'paperback';
  return 'binding unknown';
}

function BookSpineAnatomy({ volume }: { volume: LibraryVolume }) {
  return (
    <span className={styles.bookBody} aria-hidden="true">
      <span className={bindingStyles.caseTop} />
      <span className={bindingStyles.caseBottom} />
      <span className={bindingStyles.hinge} />
      <span className={bindingStyles.headbandTop} />
      <span className={bindingStyles.headbandBottom} />
      <span className={bindingStyles.jacketSkin} />
      <span className={bindingStyles.materialTexture} />
      <span className={styles.band} />
      <span className={styles.spineTitle}>{volume.title}</span>
      <span className={styles.spineCreator}>{volume.creator}</span>
      <span className={styles.pageBlock} />
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
  const style = {
    '--book-width': `${volume.width}px`,
    '--book-height': `${volume.height}px`,
    '--book-depth': `${volume.depth}px`,
    '--book-lean': `${volume.lean}deg`,
    '--spine-color': volume.spineColor,
    '--band-color': volume.bandColor,
    '--book-ink': volume.inkColor,
  } as CSSProperties;

  const className = [
    styles.volumeHit,
    bindingClass(volume),
    volume.jacket ? bindingStyles.jacketed : '',
    volume.demo ? bindingStyles.demoButton : '',
    selected && !handoff ? bindingStyles.sourceHidden : '',
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <span className={styles.volumeCard} aria-hidden="true">
        <span className={styles.cardKicker}>{volume.demo ? 'Binding study' : volume.workType}</span>
        <strong>{volume.title}</strong>
        <span>{volume.creator}</span>
        <small>
          {volume.demo
            ? `${bindingLabel(volume)} · temporary demo volume`
            : `${volume.chapterCount} chapters · ${volume.mediaCount} illustrations`}
        </small>
      </span>
      <BookSpineAnatomy volume={volume} />
    </>
  );

  const commonProps = {
    id: volumeElementId(volume),
    'data-volume': '',
    'data-volume-id': volume.publicSlug,
    style,
    className,
    tabIndex: selected ? -1 : undefined,
    'aria-hidden': selected || undefined,
  };

  if (volume.demo) {
    return (
      <button
        {...commonProps}
        type="button"
        aria-label={`Inspect ${volume.title}, ${bindingLabel(volume)} demo`}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
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
      aria-label={`Open ${volume.title} by ${volume.creator}`}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
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
  const [open, setOpen] = useState(false);
  const [returnRect, setReturnRect] = useState<RectSnapshot>(selection.origin);
  const [returning, setReturning] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const returningRef = useRef(false);
  const handoffRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volume = selection.volume;
  const compact = selection.viewport.width <= 860;

  const targetHeight = compact
    ? Math.max(260, Math.min(360, selection.viewport.height * 0.48))
    : Math.max(300, Math.min(520, selection.viewport.height - 92));
  const targetWidth = Math.round(targetHeight * 0.68);
  const targetCenterX = compact ? selection.viewport.width / 2 : selection.viewport.width * 0.36;
  const targetLeft = Math.max(24, targetCenterX - targetWidth / 2);
  const targetTop = compact
    ? Math.max(24, selection.viewport.height * 0.08)
    : Math.max(34, (selection.viewport.height - targetHeight) / 2);

  const measureSource = useCallback((): RectSnapshot => {
    const source = document.getElementById(selection.sourceId);
    if (!source) return selection.origin;
    return rectSnapshot(source.getBoundingClientRect());
  }, [selection.origin, selection.sourceId]);

  const beginHandoff = useCallback(() => {
    if (handoffRef.current) return;
    handoffRef.current = true;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    onReturnLanded(volume.publicSlug);
    setHandoff(true);
    closeTimerRef.current = setTimeout(onDismiss, 170);
  }, [onDismiss, onReturnLanded, volume.publicSlug]);

  const dismiss = useCallback(() => {
    if (returningRef.current) return;
    returningRef.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onReturnLanded(volume.publicSlug);
      onDismiss();
      return;
    }

    const liveRect = measureSource();
    setReturnRect(liveRect);
    setReturning(true);

    requestAnimationFrame(() => {
      setOpen(false);
    });

    // Transition completion is the primary handoff signal. This timeout is only
    // a guard for browsers that suppress transitionend during interruption.
    closeTimerRef.current = setTimeout(beginHandoff, 1050);
  }, [beginHandoff, measureSource, onDismiss, onReturnLanded, volume.publicSlug]);

  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setOpen(true));
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

  const returnScaleY = Math.max(0.05, returnRect.height / targetHeight);
  const returnTranslateX = returnRect.left - targetLeft;
  const returnTranslateY = returnRect.top - targetTop;
  const closedTransform = `translate3d(${returnTranslateX}px, ${returnTranslateY}px, 0) scaleY(${returnScaleY}) rotateY(89deg) rotateZ(${volume.lean}deg)`;
  const artUrl = volume.coverArtUrl ?? volume.representativeImageUrl;

  const detailStyle = {
    top: `${targetTop}px`,
    left: `${targetLeft}px`,
    width: `${targetWidth}px`,
    height: `${targetHeight}px`,
    transform: open ? 'translate3d(0, 0, 0) scaleY(1) rotateY(0deg) rotateZ(0deg)' : closedTransform,
    transformOrigin: 'left top',
    boxShadow: open ? '28px 38px 80px rgba(0,0,0,.35)' : '8px 18px 40px rgba(0,0,0,.08)',
    opacity: handoff ? 0 : 1,
    transition: 'transform 860ms cubic-bezier(.16, 1, .3, 1), box-shadow 860ms cubic-bezier(.16, 1, .3, 1), opacity 140ms ease',
    willChange: 'transform, box-shadow, opacity',
    '--target-top': `${targetTop}px`,
    '--target-left': `${targetLeft}px`,
    '--target-width': `${targetWidth}px`,
    '--target-height': `${targetHeight}px`,
    '--detail-spine-width': `${Math.max(18, returnRect.width)}px`,
    '--detail-depth': `${Math.max(18, Math.min(34, volume.depth))}px`,
    '--spine-color': volume.spineColor,
    '--band-color': volume.bandColor,
    '--book-ink': volume.inkColor,
  } as CSSProperties;

  const overlayStyle = {
    background: open ? 'rgba(27, 24, 20, .42)' : 'rgba(27, 24, 20, 0)',
    transition: 'background 280ms ease',
  } as CSSProperties;

  const coverStyle = {
    opacity: open || returning ? 1 : 0,
    transform: open || returning ? 'scale(1)' : 'scale(1.02)',
    transition: open && !returning
      ? 'opacity 260ms ease 120ms, transform 860ms cubic-bezier(.16, 1, .3, 1)'
      : 'opacity 120ms ease, transform 860ms cubic-bezier(.16, 1, .3, 1)',
  } as CSSProperties;

  const panelStyle = {
    transition: open && !returning
      ? 'opacity 340ms ease 280ms, transform 460ms cubic-bezier(.16, 1, .3, 1) 280ms'
      : 'opacity 170ms ease, transform 230ms ease',
  } as CSSProperties;

  const frameClassName = [
    styles.detailBookFrame,
    bindingStyles.detailGeometry,
    bindingClass(volume),
    volume.jacket ? bindingStyles.jacketed : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={styles.detailOverlay}
      data-open={open ? 'true' : 'false'}
      data-returning={returning ? 'true' : 'false'}
      role="dialog"
      aria-modal="true"
      aria-label={`${volume.title} by ${volume.creator}`}
      style={overlayStyle}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) dismiss();
      }}
    >
      <div
        className={frameClassName}
        style={detailStyle}
        aria-hidden="true"
        onTransitionEnd={(event) => {
          if (
            returning
            && !handoff
            && event.currentTarget === event.target
            && event.propertyName === 'transform'
          ) {
            beginHandoff();
          }
        }}
      >
        <div className={`${styles.detailCover} ${bindingStyles.detailCoverFace}`}>
          {artUrl ? (
            <img className={bindingStyles.coverArtwork} src={artUrl} alt="" style={coverStyle} />
          ) : (
            <div className={styles.detailFallback}>
              <span>{volume.demo ? bindingLabel(volume) : volume.workType}</span>
              <strong>{volume.title}</strong>
              <small>{volume.creator}</small>
            </div>
          )}
          <span className={bindingStyles.detailMaterialOverlay} />
          <span className={bindingStyles.detailBoardEdge} />
          <span className={bindingStyles.detailJacketPaper} />
          <span className={bindingStyles.detailJacketSheen} />
        </div>
        <div className={bindingStyles.detailSpineFace}>
          <span>{volume.title}</span>
          <i aria-hidden="true" />
        </div>
        <div className={bindingStyles.detailPageFace} />
        <div className={bindingStyles.detailTopEdge} />
        <div className={bindingStyles.detailBottomEdge} />
        <div className={bindingStyles.detailBackFace} />
      </div>

      <div className={styles.detailPanel} style={panelStyle}>
        <button className={styles.detailClose} type="button" onClick={dismiss} aria-label="Return book to shelf">×</button>
        <div className={styles.detailKicker}>{volume.demo ? 'Binding study' : volume.workType}</div>
        <h2>{volume.title}</h2>
        <p className={styles.detailCreator}>{volume.creator}</p>
        <p className={styles.detailFacts}>
          {volume.demo
            ? `${bindingLabel(volume)} · temporary shelf example`
            : `${volume.chapterCount} chapters · ${volume.mediaCount} illustrations`}
        </p>
        {!volume.demo ? (
          <Link className={styles.readButton} href={`/books/${volume.publicSlug}`}>
            Read this edition →
          </Link>
        ) : null}
        <button className={styles.returnButton} type="button" onClick={dismiss}>Return to shelf</button>
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
    setHandoffVolumeId(null);
    setSelection({
      volume,
      sourceId: source.id,
      origin: rectSnapshot(source.getBoundingClientRect()),
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
