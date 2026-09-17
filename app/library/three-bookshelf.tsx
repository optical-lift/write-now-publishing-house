'use client';

import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
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
const SHELF_TOP = .05;

function presentationArtUrl(volume: LibraryVolume) {
  return volume.coverArtUrl ?? volume.representativeImageUrl;
}

function canvasTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}

function makeSpineTexture(volume: LibraryVolume) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 1400;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = volume.spineColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const light = context.createLinearGradient(0, 0, canvas.width, 0);
  light.addColorStop(0, 'rgba(255,255,255,.11)');
  light.addColorStop(.22, 'rgba(255,255,255,.035)');
  light.addColorStop(.58, 'rgba(0,0,0,.015)');
  light.addColorStop(1, 'rgba(0,0,0,.16)');
  context.fillStyle = light;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = .08;
  context.strokeStyle = '#ffffff';
  context.lineWidth = 1;
  for (let x = 5; x < canvas.width; x += 8) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + 1, canvas.height);
    context.stroke();
  }
  context.globalAlpha = .055;
  context.strokeStyle = '#000000';
  for (let y = 4; y < canvas.height; y += 7) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y + 1);
    context.stroke();
  }
  context.globalAlpha = 1;

  context.fillStyle = volume.bandColor;
  context.globalAlpha = .72;
  context.fillRect(0, 168, canvas.width, 13);
  context.fillRect(0, canvas.height - 184, canvas.width, 13);
  context.globalAlpha = 1;

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(Math.PI / 2);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = volume.inkColor;

  let fontSize = 53;
  context.font = `${fontSize}px Georgia, serif`;
  while (fontSize > 28 && context.measureText(volume.title).width > 1000) {
    fontSize -= 2;
    context.font = `${fontSize}px Georgia, serif`;
  }
  context.fillText(volume.title, 0, -4, 1020);

  context.font = '22px Arial, sans-serif';
  context.globalAlpha = .7;
  context.fillText(volume.creator.toUpperCase(), 0, 92, 820);
  context.restore();

  return canvasTexture(canvas);
}

function drawWrappedTitle(
  context: CanvasRenderingContext2D,
  title: string,
  centerX: number,
  startY: number,
  maxWidth: number,
) {
  const words = title.toUpperCase().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || current.length === 0) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  lines.slice(0, 4).forEach((line, index) => {
    context.fillText(line, centerX, startY + index * 74, maxWidth);
  });
}

function makeFallbackCoverTexture(volume: LibraryVolume) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 1152;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = volume.spineColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const vignette = context.createRadialGradient(390, 510, 80, 390, 510, 640);
  vignette.addColorStop(0, 'rgba(255,255,255,.07)');
  vignette.addColorStop(1, 'rgba(0,0,0,.13)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = volume.bandColor;
  context.globalAlpha = .7;
  context.lineWidth = 4;
  context.strokeRect(46, 48, canvas.width - 92, canvas.height - 96);
  context.globalAlpha = 1;

  context.fillStyle = volume.inkColor;
  context.font = '54px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'top';
  drawWrappedTitle(context, volume.title, canvas.width / 2, 150, 620);

  context.font = '23px Arial, sans-serif';
  context.globalAlpha = .75;
  context.fillText(volume.creator.toUpperCase(), canvas.width / 2, 980, 590);
  context.globalAlpha = 1;

  return canvasTexture(canvas);
}

function makeWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = '#896747';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 18; y < canvas.height; y += 22) {
    context.strokeStyle = y % 44 === 0 ? 'rgba(60,35,18,.09)' : 'rgba(255,245,225,.055)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 32) {
      context.lineTo(x, y + Math.sin((x + y) * .021) * 3);
    }
    context.stroke();
  }

  const texture = canvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 1);
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

function useFallbackCoverTexture(volume: LibraryVolume) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const next = makeFallbackCoverTexture(volume);
    setTexture(next);
    return () => next?.dispose();
  }, [volume.creator, volume.inkColor, volume.spineColor, volume.title, volume.bandColor]);

  return texture;
}

function useWoodTexture() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const next = makeWoodTexture();
    setTexture(next);
    return () => next?.dispose();
  }, []);

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
        next.anisotropy = 16;
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

function PhysicalBook({
  volume,
  height,
  coverWidth,
  thickness,
  coverTexture,
  spineTexture,
  fallbackCover,
}: {
  volume: LibraryVolume;
  height: number;
  coverWidth: number;
  thickness: number;
  coverTexture: THREE.Texture | null;
  spineTexture: THREE.Texture | null;
  fallbackCover: THREE.Texture | null;
}) {
  const hardcover = volume.binding !== 'paperback';
  const boardThickness = hardcover ? .034 : .014;
  const overhang = hardcover ? .052 : .018;
  const pageHeight = Math.max(.2, height - overhang * 2);
  const pageWidth = Math.max(.25, coverWidth - overhang * 2 - .025);
  const pageDepth = Math.max(.12, thickness - boardThickness * 2 - .018);
  const pageOffsetX = .024;
  const frontZ = pageDepth / 2 + boardThickness / 2;
  const backZ = -frontZ;
  const frontOuterZ = frontZ + boardThickness / 2 + .0025;
  const spineRadius = pageDepth / 2 + boardThickness * .75;
  const spineX = -coverWidth / 2 + overhang * .72;
  const edgeRoughness = volume.jacket ? .6 : .9;
  const frontTexture = coverTexture ?? fallbackCover;

  return (
    <group>
      <mesh position={[pageOffsetX, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[pageWidth, pageHeight, pageDepth]} />
        <meshStandardMaterial color="#e8deca" roughness={.98} />
      </mesh>

      <mesh position={[pageOffsetX + pageWidth / 2 + .0015, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[pageDepth * .96, pageHeight * .98]} />
        <meshStandardMaterial color="#ddd0b8" roughness={1} />
      </mesh>

      <mesh position={[pageOffsetX, pageHeight / 2 + .0015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[pageWidth * .98, pageDepth * .96]} />
        <meshStandardMaterial color="#eee6d7" roughness={1} />
      </mesh>

      <mesh position={[0, 0, frontZ]} castShadow receiveShadow>
        <boxGeometry args={[coverWidth, height, boardThickness]} />
        <meshStandardMaterial color={volume.spineColor} roughness={edgeRoughness} />
      </mesh>

      <mesh position={[0, 0, backZ]} castShadow receiveShadow>
        <boxGeometry args={[coverWidth, height, boardThickness]} />
        <meshStandardMaterial color={volume.spineColor} roughness={edgeRoughness} />
      </mesh>

      {hardcover ? (
        <mesh position={[spineX, 0, 0]} scale={[.34, 1, 1]} castShadow receiveShadow>
          <cylinderGeometry args={[spineRadius, spineRadius, height * .985, 32, 1, false]} />
          <meshStandardMaterial color={volume.spineColor} roughness={.9} />
        </mesh>
      ) : (
        <mesh position={[spineX, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[.028, height * .985, thickness * .96]} />
          <meshStandardMaterial color={volume.spineColor} roughness={.84} />
        </mesh>
      )}

      {spineTexture ? (
        <mesh
          position={[-coverWidth / 2 - (hardcover ? .012 : .004), 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <planeGeometry args={[thickness * .88, height * .93]} />
          <meshStandardMaterial map={spineTexture} roughness={edgeRoughness} />
        </mesh>
      ) : null}

      {frontTexture ? (
        <mesh position={[.004, 0, frontOuterZ]}>
          <planeGeometry args={[coverWidth * .965, height * .965]} />
          <meshStandardMaterial map={frontTexture} roughness={volume.jacket ? .52 : .86} />
        </mesh>
      ) : null}

      <mesh
        position={[-coverWidth / 2 + overhang + .038, 0, frontOuterZ + .003]}
        castShadow
      >
        <boxGeometry args={[.026, height * .9, .007]} />
        <meshStandardMaterial color="#1f1915" transparent opacity={.18} roughness={1} />
      </mesh>

      {hardcover ? (
        <>
          <mesh position={[spineX + .02, pageHeight / 2 - .006, 0]}>
            <boxGeometry args={[.06, .018, pageDepth * .8]} />
            <meshStandardMaterial color={volume.bandColor} roughness={.82} />
          </mesh>
          <mesh position={[spineX + .02, -pageHeight / 2 + .006, 0]}>
            <boxGeometry args={[.06, .018, pageDepth * .8]} />
            <meshStandardMaterial color={volume.bandColor} roughness={.82} />
          </mesh>
        </>
      ) : null}
    </group>
  );
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
  const fallbackCover = useFallbackCoverTexture(volume);
  const shelfY = SHELF_TOP + height / 2;
  const lean = volume.lean * DEG;

  const shelfQuaternion = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, lean)),
    [lean],
  );

  const targetPosition = useMemo(() => {
    if (selected) return new THREE.Vector3(-1.35, shelfY + .2, 3.0);
    if (hovered) return new THREE.Vector3(shelfX, shelfY + .025, .16);
    return new THREE.Vector3(shelfX, shelfY, 0);
  }, [hovered, selected, shelfX, shelfY]);

  const targetQuaternion = useMemo(() => {
    if (selected) return new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
    if (hovered) return new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI * .43, 0));
    return shelfQuaternion.clone();
  }, [hovered, selected, shelfQuaternion]);

  const targetScale = useMemo(
    () => new THREE.Vector3(selected ? 1.04 : 1, selected ? 1.04 : 1, selected ? 1.04 : 1),
    [selected],
  );

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const alpha = 1 - Math.exp(-7 * delta);
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
      <PhysicalBook
        volume={volume}
        height={height}
        coverWidth={coverWidth}
        thickness={thickness}
        coverTexture={coverTexture}
        spineTexture={spineTexture}
        fallbackCover={fallbackCover}
      />
    </group>
  );
}

function CameraAim() {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(0, 1.48, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
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
  const woodTexture = useWoodTexture();

  return (
    <>
      <CameraAim />
      <hemisphereLight color="#fff9ee" groundColor="#6e6358" intensity={1.05} />
      <ambientLight intensity={.38} />
      <directionalLight
        castShadow
        position={[3.4, 6.5, 6.8]}
        intensity={1.45}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-1.5}
        shadow-bias={-.00035}
        shadow-radius={4}
      />
      <directionalLight position={[-4.5, 4.2, 5.5]} intensity={.34} />

      <mesh position={[0, 0, -.035]} receiveShadow>
        <boxGeometry args={[8.8, .1, .62]} />
        <meshStandardMaterial
          color={woodTexture ? '#ffffff' : '#896747'}
          map={woodTexture ?? undefined}
          roughness={.88}
        />
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

  const gap = .055;
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
    const timer = window.setTimeout(() => setDetailVisible(true), 520);
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
        camera={{ position: [0, 1.66, 11.8], fov: 24, near: .1, far: 50 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.03;
        }}
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
    </section>
  );
}
