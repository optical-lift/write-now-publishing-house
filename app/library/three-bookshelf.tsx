'use client';

import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { LibraryVolume } from '../../lib/library-scene';
import styles from './three-bookshelf.module.css';

type ThreeBookshelfProps = {
  volumes: LibraryVolume[];
};

type ShelfBook = {
  volume: LibraryVolume;
  height: number;
  coverWidth: number;
  thickness: number;
  shelfX: number;
};

const DEG = Math.PI / 180;
const SHELF_TOP = 0.14;

function presentationArtUrl(volume: LibraryVolume) {
  return volume.coverArtUrl ?? volume.representativeImageUrl;
}

function makeSpineTexture(volume: LibraryVolume) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = volume.spineColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, 'rgba(255,255,255,.12)');
  gradient.addColorStop(.34, 'rgba(255,255,255,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,.14)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = volume.bandColor;
  context.globalAlpha = .9;
  context.fillRect(0, 174, canvas.width, 18);
  context.globalAlpha = 1;

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(Math.PI / 2);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = volume.inkColor;

  let fontSize = 46;
  context.font = `${fontSize}px Georgia, serif`;
  while (fontSize > 25 && context.measureText(volume.title).width > 760) {
    fontSize -= 2;
    context.font = `${fontSize}px Georgia, serif`;
  }
  context.fillText(volume.title, 0, -2, 770);

  context.font = '20px Arial, sans-serif';
  context.globalAlpha = .7;
  context.fillText(volume.creator.toUpperCase(), 0, 70, 650);
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function useSpineTexture(volume: LibraryVolume) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const next = makeSpineTexture(volume);
    setTexture(next);
    return () => next?.dispose();
  }, [volume.bandColor, volume.creator, volume.inkColor, volume.spineColor, volume.title]);

  return texture;
}

function useCoverTexture(url: string | null) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    setTexture(null);
    if (!url) return undefined;

    let disposed = false;
    let loaded: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (next) => {
        loaded = next;
        if (disposed) {
          next.dispose();
          return;
        }
        next.colorSpace = THREE.SRGBColorSpace;
        next.anisotropy = 8;
        next.needsUpdate = true;
        setTexture(next);
      },
      undefined,
      () => {
        if (!disposed) setTexture(null);
      },
    );

    return () => {
      disposed = true;
      loaded?.dispose();
    };
  }, [url]);

  return texture;
}

function BookMesh({
  book,
  selected,
  hovered,
  onHover,
  onChoose,
}: {
  book: ShelfBook;
  selected: boolean;
  hovered: boolean;
  onHover: (slug: string | null) => void;
  onChoose: (volume: LibraryVolume) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { volume, height, coverWidth, thickness, shelfX } = book;
  const spineTexture = useSpineTexture(volume);
  const coverTexture = useCoverTexture(presentationArtUrl(volume));
  const shelfY = SHELF_TOP + height / 2;
  const lean = volume.lean * DEG;

  const shelfQuaternion = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, lean)),
    [lean],
  );

  const targetPosition = useMemo(() => {
    if (selected) return new THREE.Vector3(-1.45, shelfY + .48, 2.45);
    if (hovered) return new THREE.Vector3(shelfX, shelfY + .04, .3);
    return new THREE.Vector3(shelfX, shelfY, 0);
  }, [hovered, selected, shelfX, shelfY]);

  const targetQuaternion = useMemo(() => {
    if (selected) return new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
    if (hovered) return new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI * .39, 0));
    return shelfQuaternion.clone();
  }, [hovered, selected, shelfQuaternion]);

  const targetScale = useMemo(
    () => new THREE.Vector3(selected ? 1.03 : 1, selected ? 1.03 : 1, selected ? 1.03 : 1),
    [selected],
  );

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const alpha = 1 - Math.exp(-8.5 * delta);
    group.position.lerp(targetPosition, alpha);
    group.quaternion.slerp(targetQuaternion, alpha);
    group.scale.lerp(targetScale, alpha);
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(volume.publicSlug);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(null);
    document.body.style.cursor = '';
  };

  return (
    <group
      ref={groupRef}
      position={[shelfX, shelfY, 0]}
      quaternion={shelfQuaternion}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={(event) => {
        event.stopPropagation();
        onChoose(volume);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[coverWidth, height, thickness]} />
        <meshStandardMaterial
          attach="material-0"
          color="#e9dfcc"
          roughness={.92}
        />
        <meshStandardMaterial
          attach="material-1"
          color={spineTexture ? '#ffffff' : volume.spineColor}
          map={spineTexture ?? undefined}
          roughness={volume.jacket ? .56 : .92}
        />
        <meshStandardMaterial
          attach="material-2"
          color="#eee5d3"
          roughness={1}
        />
        <meshStandardMaterial
          attach="material-3"
          color="#d9cdb8"
          roughness={1}
        />
        <meshStandardMaterial
          attach="material-4"
          color={coverTexture ? '#ffffff' : volume.spineColor}
          map={coverTexture ?? undefined}
          roughness={volume.jacket ? .5 : .9}
        />
        <meshStandardMaterial
          attach="material-5"
          color={volume.spineColor}
          roughness={.95}
        />
      </mesh>
    </group>
  );
}

function ShelfScene({
  books,
  selectedId,
  hoveredId,
  onHover,
  onChoose,
}: {
  books: ShelfBook[];
  selectedId: string | null;
  hoveredId: string | null;
  onHover: (slug: string | null) => void;
  onChoose: (volume: LibraryVolume) => void;
}) {
  return (
    <>
      <ambientLight intensity={1.55} />
      <directionalLight
        castShadow
        position={[4.8, 7.5, 6.5]}
        intensity={2.1}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={6}
        shadow-camera-bottom={-2}
      />
      <directionalLight position={[-5, 3, 4]} intensity={.55} />

      <mesh position={[0, .04, -.04]} receiveShadow>
        <boxGeometry args={[12, .18, 1.75]} />
        <meshStandardMaterial color="#8f6843" roughness={.78} />
      </mesh>

      {books.map((book) => (
        <BookMesh
          key={book.volume.publicSlug}
          book={book}
          selected={selectedId === book.volume.publicSlug}
          hovered={hoveredId === book.volume.publicSlug && selectedId !== book.volume.publicSlug}
          onHover={onHover}
          onChoose={onChoose}
        />
      ))}
    </>
  );
}

function buildShelfBooks(volumes: LibraryVolume[]) {
  const dimensions = volumes.map((volume) => {
    const height = volume.height / 100;
    return {
      volume,
      height,
      coverWidth: height * (2 / 3),
      thickness: Math.max(.22, volume.width / 100),
    };
  });

  const gap = .075;
  const totalWidth = dimensions.reduce((sum, item) => sum + item.thickness, 0)
    + Math.max(0, dimensions.length - 1) * gap;
  let cursor = -totalWidth / 2;

  return dimensions.map((item) => {
    const shelfX = cursor + item.thickness / 2;
    cursor += item.thickness + gap;
    return { ...item, shelfX };
  });
}

export default function ThreeBookshelf({ volumes }: ThreeBookshelfProps) {
  const router = useRouter();
  const books = useMemo(() => buildShelfBooks(volumes), [volumes]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const selectedVolume = useMemo(
    () => volumes.find((volume) => volume.publicSlug === selectedId) ?? null,
    [selectedId, volumes],
  );

  useEffect(() => {
    setDetailVisible(false);
    if (!selectedId) return undefined;
    const timer = window.setTimeout(() => setDetailVisible(true), 460);
    return () => window.clearTimeout(timer);
  }, [selectedId]);

  useEffect(() => () => {
    document.body.style.cursor = '';
  }, []);

  const chooseVolume = (volume: LibraryVolume) => {
    if (selectedId === volume.publicSlug) {
      if (!volume.demo) router.push(`/books/${volume.publicSlug}`);
      return;
    }
    setHoveredId(null);
    setSelectedId(volume.publicSlug);
  };

  return (
    <section className={styles.stage} aria-label="Interactive bookshelf">
      <Canvas
        className={styles.canvas}
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.85, 8.7], fov: 32, near: .1, far: 50 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => {
          setSelectedId(null);
          setHoveredId(null);
          document.body.style.cursor = '';
        }}
      >
        <ShelfScene
          books={books}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onChoose={chooseVolume}
        />
      </Canvas>

      <div className={`${styles.detail} ${detailVisible && selectedVolume ? styles.detailVisible : ''}`}>
        {selectedVolume ? (
          <>
            <div className={styles.kicker}>{selectedVolume.demo ? 'Binding study' : selectedVolume.workType}</div>
            <h2>{selectedVolume.title}</h2>
            <p className={styles.creator}>{selectedVolume.creator}</p>
            <p className={styles.facts}>
              {selectedVolume.demo
                ? `${selectedVolume.binding} · temporary shelf example`
                : `${selectedVolume.chapterCount} chapters · ${selectedVolume.mediaCount} illustrations`}
            </p>
            {!selectedVolume.demo ? (
              <p className={styles.instruction}>Click the cover again to open this edition.</p>
            ) : null}
            <button
              className={styles.returnButton}
              type="button"
              onClick={() => {
                setSelectedId(null);
                setHoveredId(null);
              }}
            >
              Return to shelf
            </button>
          </>
        ) : null}
      </div>

      <p className={styles.status}>WebGL shelf prototype</p>
    </section>
  );
}
