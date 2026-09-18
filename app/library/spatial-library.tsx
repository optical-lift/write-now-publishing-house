'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
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
      <span className={shelfStyles.topPageEdge} />
    </span>
  );
}

function RigidHoverBook({ volume }: { volume: LibraryVolume }) {
  const artUrl = volume.coverArtUrl;

  const style = {
    '--rigid-cover-width': `${Math.round(volume.height * 0.625)}px`,
    '--rigid-depth': `${volume.width}px`,
    '--rigid-spine-color': volume.spineColor,
    '--rigid-band-color': volume.bandColor,
    '--rigid-ink': volume.inkColor,
  } as CSSProperties;

  return (
    <span className={shelfStyles.rigidPreview} style={style} aria-hidden="true">
      <span className={shelfStyles.rigidBook}>
        <span className={`${shelfStyles.rigidFace} ${shelfStyles.rigidFront}`}>
          {artUrl ? (
            <img src={artUrl} alt="" draggable={false} />
          ) : volume.demo ? (
            <span className={shelfStyles.rigidFrontFallback}>
              <strong>{volume.title}</strong>
              <small>{volume.creator}</small>
            </span>
          ) : null}
        </span>
        <span className={`${shelfStyles.rigidFace} ${shelfStyles.rigidBack}`} />
        <span className={`${shelfStyles.rigidFace} ${shelfStyles.rigidSpine}`}>
          <span>{volume.title}</span>
          <small>{volume.creator}</small>
        </span>
        <span className={`${shelfStyles.rigidFace} ${shelfStyles.rigidForeEdge}`} />
        <span className={`${shelfStyles.rigidFace} ${shelfStyles.rigidTopEdge}`} />
      </span>
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

const SHELF_GAP = 4;
const RIGID_HOVER_ANGLE = 72;

function computeRigidHoverPacking(volumes: LibraryVolume[], activeIndex: number) {
  const naturalLefts: number[] = [];
  let cursor = 0;

  for (const volume of volumes) {
    naturalLefts.push(cursor);
    cursor += volume.width + SHELF_GAP;
  }

  const shifts = volumes.map(() => 0);
  const active = volumes[activeIndex];
  if (!active) return shifts;

  const angle = RIGID_HOVER_ANGLE * Math.PI / 180;
  const coverWidth = Math.round(active.height * 0.625);
  const pivot = naturalLefts[activeIndex] + active.width / 2;
  const halfDepthProjection = (active.width / 2) * Math.sin(angle);
  const projectedLeft = pivot - halfDepthProjection;
  const projectedRight = pivot + coverWidth * Math.cos(angle) + halfDepthProjection;

  let rightBoundary = projectedRight + SHELF_GAP;
  for (let index = activeIndex + 1; index < volumes.length; index += 1) {
    const naturalLeft = naturalLefts[index];
    const shift = Math.max(0, rightBoundary - naturalLeft);
    shifts[index] = shift;
    rightBoundary = naturalLeft + shift + volumes[index].width + SHELF_GAP;
  }

  let leftBoundary = projectedLeft - SHELF_GAP;
  for (let index = activeIndex - 1; index >= 0; index -= 1) {
    const naturalRight = naturalLefts[index] + volumes[index].width;
    const shift = Math.min(0, leftBoundary - naturalRight);
    shifts[index] = shift;
    leftBoundary = naturalLefts[index] + shift - SHELF_GAP;
  }

  return shifts;
}

function shelfPose(
  index: number,
  activeIndex: number | null,
  restLean: number,
  packedShift: number | null,
) {
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

  if (packedShift !== null) {
    return {
      lean: direction * leanMagnitude,
      shift: packedShift,
      depth: Math.max(2, 20 - distance),
    };
  }

  const shiftMagnitude = Math.min(11, 3.5 + (distance - 1) * 2.6);

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
  packedShift,
  onActivate,
}: {
  volume: LibraryVolume;
  index: number;
  activeIndex: number | null;
  packedShift: number | null;
  onActivate: (index: number | null) => void;
}) {
  const pose = shelfPose(index, activeIndex, volume.lean, packedShift);
  const active = activeIndex === index;
  const rigidEnabled = Boolean(volume.coverArtUrl || volume.demo);
  const slotStyle = {
    '--book-width': `${volume.width}px`,
    '--book-height': `${volume.height}px`,
    '--pose-lean': `${pose.lean.toFixed(2)}deg`,
    '--pose-shift': `${pose.shift.toFixed(2)}px`,
    zIndex: pose.depth,
  } as CSSProperties;

  const slotClassName = [
    volume.demo ? shelfStyles.demoSlot : shelfStyles.bookSlot,
    active ? shelfStyles.activeSlot : '',
    rigidEnabled ? shelfStyles.rigidVolumeSlot : '',
  ].filter(Boolean).join(' ');

  if (volume.demo) {
    return (
      <div
        className={slotClassName}
        style={slotStyle}
        aria-label={`${volume.title} by ${volume.creator}, temporary shelf study`}
        onMouseEnter={() => onActivate(index)}
      >
        <Tooltip volume={volume} />
        <SpineVisual volume={volume} />
      </div>
    );
  }

  return (
    <Link
      className={slotClassName}
      style={slotStyle}
      href={`/books/${volume.publicSlug}`}
      aria-label={`Open ${volume.title} by ${volume.creator}`}
      onMouseEnter={() => onActivate(index)}
      onFocus={() => onActivate(index)}
      onBlur={() => onActivate(null)}
    >
      <Tooltip volume={volume} />
      {rigidEnabled ? <RigidHoverBook volume={volume} /> : null}
      <SpineVisual volume={volume} />
    </Link>
  );
}

export default function SpatialLibrary({
  library,
  showDirectory = true,
  presentation = 'default',
}: SpatialLibraryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dissolved = presentation === 'dissolved';
  const volumes = useMemo(
    () => [
      ...library.books.map(projectLibraryBookToVolume),
      ...(dissolved ? DEMO_BINDING_VOLUMES : []),
    ],
    [dissolved, library.books],
  );

  const rigidPackingShifts = useMemo(() => {
    if (activeIndex === null) return null;
    const activeVolume = volumes[activeIndex];
    if (!activeVolume || (!activeVolume.coverArtUrl && !activeVolume.demo)) return null;
    return computeRigidHoverPacking(volumes, activeIndex);
  }, [activeIndex, volumes]);

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
          onMouseLeave={() => setActiveIndex(null)}
        >
          {volumes.map((volume, index) => (
            <ShelfVolume
              key={volume.publicSlug}
              volume={volume}
              index={index}
              activeIndex={activeIndex}
              packedShift={rigidPackingShifts ? rigidPackingShifts[index] : null}
              onActivate={setActiveIndex}
            />
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
