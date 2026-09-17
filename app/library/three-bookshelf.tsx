'use client';

import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { LibraryVolume } from '../../lib/library-scene';
import BookAsset from './book-asset';
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
  shelfZ: number;
};

const DEG = Math.PI / 180;
const SHELF_TOP = .028;

function presentationArtUrl(volume: LibraryVolume) {
  return volume.coverArtUrl ?? volume.representativeImageUrl;
}

function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
    if (image.complete) resolve();
  });
}

function advanceProgress(current: number, target: number, delta: number, duration: number) {
  if (current === target) return current;
  const step = delta / Math.max(duration, .001);
  if (target > current) return Math.min(target, current + step);
  return Math.max(target, current - step);
}

function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const previousEnvironment = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, .04);

    scene.environment = target.texture;
    scene.environmentIntensity = .72;

    return () => {
      scene.environment = previousEnvironment;
      scene.environmentIntensity = previousIntensity;
      target.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

function SceneReadyGate({ onReady }: { onReady: () => void }) {
  const frameCount = useRef(0);
  const reported = useRef(false);

  useFrame(() => {
    if (reported.current) return;
    frameCount.current += 1;
    if (frameCount.current < 6) return;
    reported.current = true;
    onReady();
  });

  return null;
}

function CameraAim() {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(0, 1.48, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
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
  const visualRef = useRef<THREE.Group>(null);
  const selectionProgress = useRef(selected ? 1 : 0);
  const hoverProgress = useRef(0);
  const { volume, height, coverWidth, thickness, shelfX, shelfZ } = book;
  const shelfY = SHELF_TOP + height / 2;
  const lean = volume.lean * DEG;

  const shelfQuaternion = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, lean)),
    [lean],
  );
  const hoverQuaternion = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2 - 5.25 * DEG, lean * .78)),
    [lean],
  );
  const frontQuaternion = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)),
    [],
  );
  const workingQuaternion = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, delta) => {
    const group = visualRef.current;
    if (!group) return;

    selectionProgress.current = advanceProgress(
      selectionProgress.current,
      selected ? 1 : 0,
      delta,
      selected ? .72 : .62,
    );
    hoverProgress.current = advanceProgress(
      hoverProgress.current,
      hovered && !selected ? 1 : 0,
      delta,
      hovered && !selected ? .22 : .17,
    );

    const selectionT = selectionProgress.current;
    const hoverT = hoverProgress.current;

    // Hover is deliberately two-stage: move the rigid book clear of its neighbors,
    // then reveal a small amount of the cover. Reversal naturally closes it first.
    const hoverPullT = THREE.MathUtils.smootherstep(hoverT, 0, .62);
    const hoverTurnT = THREE.MathUtils.smootherstep(hoverT, .48, 1);

    // Selection follows the same physical rule at larger scale: clear the shelf,
    // then turn toward the reader. No spring overshoot or scale deformation.
    const pullT = THREE.MathUtils.smootherstep(selectionT, 0, .32);
    const faceT = THREE.MathUtils.smootherstep(selectionT, .26, 1);
    const suppressHover = 1 - THREE.MathUtils.smootherstep(selectionT, 0, .16);
    const effectiveHoverPull = hoverPullT * suppressHover;
    const effectiveHoverTurn = hoverTurnT * suppressHover;

    const pullDistance = .24;
    const selectedZ = .74;
    const selectedX = -.74;

    group.position.set(
      THREE.MathUtils.lerp(shelfX, selectedX, faceT),
      shelfY + .004 * pullT,
      shelfZ
        + .13 * effectiveHoverPull
        + pullDistance * pullT
        + (selectedZ - pullDistance) * faceT,
    );

    workingQuaternion.copy(shelfQuaternion).slerp(hoverQuaternion, effectiveHoverTurn);
    workingQuaternion.slerp(frontQuaternion, faceT);
    group.quaternion.copy(workingQuaternion);
    group.scale.setScalar(1);
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (selected) return;
    onHover(volume.publicSlug);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (selected) return;
    onHover(null);
    document.body.style.cursor = '';
  };

  return (
    <>
      {!selected ? (
        <mesh
          position={[shelfX, shelfY, shelfZ + .08]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={(event) => {
            event.stopPropagation();
            onChoose(volume);
          }}
        >
          <boxGeometry args={[Math.max(.12, thickness * .96), height * .98, .12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      ) : null}

      <group
        ref={visualRef}
        position={[shelfX, shelfY, shelfZ]}
        quaternion={shelfQuaternion}
        onClick={(event) => {
          if (!selected) return;
          event.stopPropagation();
          onChoose(volume);
        }}
      >
        <BookAsset
          volume={volume}
          height={height}
          coverWidth={coverWidth}
          thickness={thickness}
        />
      </group>
    </>
  );
}

function ShelfScene({
  books,
  selectedId,
  hoveredId,
  onHover,
  onChoose,
  onReady,
}: {
  books: ShelfBook[];
  selectedId: string | null;
  hoveredId: string | null;
  onHover: (slug: string | null) => void;
  onChoose: (volume: LibraryVolume) => void;
  onReady: () => void;
}) {
  return (
    <>
      <CameraAim />
      <StudioEnvironment />
      <SceneReadyGate onReady={onReady} />

      <hemisphereLight color="#fffaf1" groundColor="#6f665c" intensity={.3} />
      <ambientLight intensity={.07} />
      <directionalLight
        castShadow
        position={[3.8, 6.4, 6.8]}
        intensity={.74}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4.2}
        shadow-camera-bottom={-1}
        shadow-bias={-.00018}
        shadow-radius={7}
      />
      <directionalLight position={[-4.4, 3.6, 4.8]} intensity={.11} />

      <mesh position={[0, -.002, -.02]} receiveShadow>
        <boxGeometry args={[5.35, .052, .34]} />
        <meshStandardMaterial color="#9f8d74" roughness={.84} metalness={0} />
      </mesh>
      <mesh position={[0, -.034, .13]} receiveShadow>
        <boxGeometry args={[5.35, .018, .04]} />
        <meshStandardMaterial color="#8d7b65" roughness={.88} metalness={0} />
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
  const dimensions = volumes.map((volume, index) => {
    const height = volume.height / 100;
    return {
      volume,
      height,
      coverWidth: height * (2 / 3),
      thickness: Math.max(.2, volume.width / 100),
      shelfZ: ((index % 3) - 1) * .009,
    };
  });

  const gap = .012;
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
  const [assetsPrimed, setAssetsPrimed] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  const selectedVolume = useMemo(
    () => volumes.find((volume) => volume.publicSlug === selectedId) ?? null,
    [selectedId, volumes],
  );

  useEffect(() => {
    let cancelled = false;
    setAssetsPrimed(false);
    setSceneReady(false);

    const urls = Array.from(new Set(
      volumes
        .map(presentationArtUrl)
        .filter((url): url is string => Boolean(url)),
    ));

    Promise.all(urls.map(preloadImage)).then(() => {
      if (!cancelled) setAssetsPrimed(true);
    });

    if (urls.length === 0) setAssetsPrimed(true);

    return () => {
      cancelled = true;
    };
  }, [volumes]);

  useEffect(() => {
    setDetailVisible(false);
    if (!selectedId) return undefined;

    const timer = window.setTimeout(() => setDetailVisible(true), 720);
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
      {assetsPrimed ? (
        <Canvas
          className={`${styles.canvas} ${sceneReady ? styles.canvasReady : ''}`}
          shadows
          dpr={[1, 2]}
          camera={{ position: [.12, 1.84, 9.7], fov: 24, near: .1, far: 100 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.02;
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
          onPointerMissed={() => {
            if (selectedId) setSelectedId(null);
          }}
        >
          <ShelfScene
            books={books}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onChoose={chooseVolume}
            onReady={() => setSceneReady(true)}
          />
        </Canvas>
      ) : null}

      {selectedVolume ? (
        <div className={`${styles.detail} ${detailVisible ? styles.detailVisible : ''}`}>
          <div className={styles.kicker}>{selectedVolume.workType}</div>
          <h2>{selectedVolume.title}</h2>
          <p className={styles.creator}>{selectedVolume.creator}</p>
          <p className={styles.facts}>
            {selectedVolume.demo
              ? 'Temporary binding study'
              : `${selectedVolume.chapterCount} chapters · ${selectedVolume.mediaCount} illustrations`}
          </p>
          <button
            className={styles.returnButton}
            type="button"
            onClick={() => {
              setDetailVisible(false);
              setSelectedId(null);
            }}
          >
            Return to shelf
          </button>
        </div>
      ) : null}
    </section>
  );
}
