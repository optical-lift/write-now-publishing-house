'use client';

import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { LibraryVolume } from '../../lib/library-scene';

type BookAssetProps = {
  volume: LibraryVolume;
  height: number;
  coverWidth: number;
  thickness: number;
};

function canvasTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function grayscaleTexture(canvas: HTMLCanvasElement, repeatX = 1, repeatY = 1) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function makeClothBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = '#808080';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = .2;
  for (let y = 1; y < canvas.height; y += 4) {
    context.fillStyle = y % 8 === 1 ? '#a0a0a0' : '#6d6d6d';
    context.fillRect(0, y, canvas.width, 1);
  }
  for (let x = 2; x < canvas.width; x += 5) {
    context.fillStyle = x % 10 === 2 ? '#969696' : '#737373';
    context.fillRect(x, 0, 1, canvas.height);
  }
  context.globalAlpha = .075;
  for (let index = 0; index < 1800; index += 1) {
    const value = 96 + Math.floor(Math.random() * 64);
    context.fillStyle = `rgb(${value}, ${value}, ${value})`;
    context.fillRect(
      Math.floor(Math.random() * canvas.width),
      Math.floor(Math.random() * canvas.height),
      1,
      1,
    );
  }
  context.globalAlpha = 1;

  return grayscaleTexture(canvas, 2.4, 8.4);
}

function makePageBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = '#7f7f7f';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 1; y < canvas.height; y += 4) {
    const value = 108 + ((y * 13) % 45);
    context.fillStyle = `rgb(${value}, ${value}, ${value})`;
    context.fillRect(0, y, canvas.width, 1);
  }

  context.globalAlpha = .12;
  for (let index = 0; index < 850; index += 1) {
    const value = 80 + Math.floor(Math.random() * 90);
    context.fillStyle = `rgb(${value}, ${value}, ${value})`;
    context.fillRect(
      Math.floor(Math.random() * canvas.width),
      Math.floor(Math.random() * canvas.height),
      1 + Math.floor(Math.random() * 3),
      1,
    );
  }
  context.globalAlpha = 1;

  return grayscaleTexture(canvas, 1.4, 1);
}

function makeSpineTexture(volume: LibraryVolume) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1600;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = volume.spineColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const light = context.createLinearGradient(0, 0, canvas.width, 0);
  light.addColorStop(0, 'rgba(255,255,255,.055)');
  light.addColorStop(.28, 'rgba(255,255,255,.018)');
  light.addColorStop(.72, 'rgba(0,0,0,.014)');
  light.addColorStop(1, 'rgba(0,0,0,.08)');
  context.fillStyle = light;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = volume.bandColor;
  context.globalAlpha = .48;
  context.fillRect(0, 196, canvas.width, 7);
  context.fillRect(0, canvas.height - 202, canvas.width, 7);
  context.globalAlpha = 1;

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(Math.PI / 2);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = volume.inkColor;

  let fontSize = 48;
  context.font = `${fontSize}px Georgia, serif`;
  while (fontSize > 25 && context.measureText(volume.title).width > 1120) {
    fontSize -= 2;
    context.font = `${fontSize}px Georgia, serif`;
  }
  context.fillText(volume.title, 0, -4, 1120);

  context.font = '19px Arial, sans-serif';
  context.globalAlpha = .58;
  context.fillText(volume.creator.toUpperCase(), 0, 82, 900);
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
  canvas.width = 900;
  canvas.height = 1350;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.fillStyle = volume.spineColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const vignette = context.createRadialGradient(450, 560, 100, 450, 560, 700);
  vignette.addColorStop(0, 'rgba(255,255,255,.045)');
  vignette.addColorStop(1, 'rgba(0,0,0,.075)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = volume.bandColor;
  context.globalAlpha = .45;
  context.lineWidth = 3;
  context.strokeRect(64, 66, canvas.width - 128, canvas.height - 132);
  context.globalAlpha = 1;

  context.fillStyle = volume.inkColor;
  context.font = '54px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'top';
  drawWrappedTitle(context, volume.title, canvas.width / 2, 190, 690);

  context.font = '22px Arial, sans-serif';
  context.globalAlpha = .66;
  context.fillText(volume.creator.toUpperCase(), canvas.width / 2, 1160, 650);
  context.globalAlpha = 1;

  return canvasTexture(canvas);
}

function useGeneratedTexture(factory: () => THREE.Texture | null, dependencies: unknown[]) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const next = factory();
    setTexture(next);
    return () => next?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return texture;
}

function useCoverTexture(url: string | null) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    setTexture(null);
    if (!url) return undefined;

    let cancelled = false;
    let generated: THREE.Texture | null = null;
    const image = new Image();
    image.decoding = 'async';

    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      const naturalWidth = Math.max(1, image.naturalWidth || image.width);
      const naturalHeight = Math.max(1, image.naturalHeight || image.height);
      canvas.width = naturalWidth;
      canvas.height = naturalHeight;
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) return;

      context.fillStyle = '#f3ecdd';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      generated = canvasTexture(canvas);
      if (!cancelled) setTexture(generated);
    };

    image.onerror = () => {
      if (!cancelled) setTexture(null);
    };

    image.src = url;

    return () => {
      cancelled = true;
      generated?.dispose();
      image.onload = null;
      image.onerror = null;
    };
  }, [url]);

  return texture;
}

export default function BookAsset({ volume, height, coverWidth, thickness }: BookAssetProps) {
  const hardcover = volume.binding !== 'paperback';
  const boardThickness = hardcover ? .016 : .008;
  const overhang = hardcover ? .018 : .008;
  const pageHeight = Math.max(.2, height - overhang * 2);
  const pageWidth = Math.max(.25, coverWidth - overhang * 2 - .01);
  const pageDepth = Math.max(.12, thickness - boardThickness * 2 - .012);
  const pageOffsetX = .008;
  const frontZ = pageDepth / 2 + boardThickness / 2;
  const backZ = -frontZ;
  const frontOuterZ = frontZ + boardThickness / 2;
  const spineRadius = pageDepth / 2 + boardThickness * .26;
  const spineX = -coverWidth / 2 + overhang * .5;
  const frontTexture = useCoverTexture(volume.coverArtUrl ?? volume.representativeImageUrl);
  const fallbackCover = useGeneratedTexture(
    () => makeFallbackCoverTexture(volume),
    [volume.bandColor, volume.creator, volume.inkColor, volume.spineColor, volume.title],
  );
  const spineTexture = useGeneratedTexture(
    () => makeSpineTexture(volume),
    [volume.bandColor, volume.creator, volume.inkColor, volume.spineColor, volume.title],
  );
  const clothBump = useGeneratedTexture(() => makeClothBumpTexture(), []);
  const pageBump = useGeneratedTexture(() => makePageBumpTexture(), []);
  const coverMap = frontTexture ?? fallbackCover;

  const boardRadius = hardcover ? .018 : .008;
  const pageRadius = .012;
  const frontBoardGeometry = useMemo(
    () => new RoundedBoxGeometry(coverWidth, height, boardThickness, 4, boardRadius),
    [boardRadius, boardThickness, coverWidth, height],
  );
  const backBoardGeometry = useMemo(
    () => new RoundedBoxGeometry(coverWidth, height, boardThickness, 4, boardRadius),
    [boardRadius, boardThickness, coverWidth, height],
  );
  const pageGeometry = useMemo(
    () => new RoundedBoxGeometry(pageWidth, pageHeight, pageDepth, 3, pageRadius),
    [pageDepth, pageHeight, pageWidth],
  );

  useEffect(() => () => {
    frontBoardGeometry.dispose();
    backBoardGeometry.dispose();
    pageGeometry.dispose();
  }, [backBoardGeometry, frontBoardGeometry, pageGeometry]);

  const cloth = volume.finish === 'cloth' || (!volume.jacket && hardcover);
  const coverRoughness = volume.jacket ? .48 : cloth ? .88 : .72;
  const coverClearcoat = volume.jacket ? .16 : .02;
  const coverSheen = cloth ? .2 : .04;

  return (
    <group>
      <mesh geometry={pageGeometry} position={[pageOffsetX, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color="#e9dfcd"
          roughness={1}
          bumpMap={pageBump ?? undefined}
          bumpScale={.008}
        />
      </mesh>

      <mesh position={[pageOffsetX + pageWidth / 2 + .002, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[pageDepth * .94, pageHeight * .982]} />
        <meshStandardMaterial
          color="#d9cdb9"
          roughness={1}
          bumpMap={pageBump ?? undefined}
          bumpScale={.012}
        />
      </mesh>

      <mesh position={[pageOffsetX, pageHeight / 2 + .002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[pageWidth * .982, pageDepth * .94]} />
        <meshStandardMaterial color="#eee5d6" roughness={1} bumpMap={pageBump ?? undefined} bumpScale={.01} />
      </mesh>

      <mesh geometry={frontBoardGeometry} position={[0, 0, frontZ]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={volume.spineColor}
          roughness={coverRoughness}
          metalness={0}
          clearcoat={coverClearcoat}
          clearcoatRoughness={.55}
          sheen={coverSheen}
          sheenColor="#e6ddd0"
          sheenRoughness={.9}
          bumpMap={cloth ? clothBump ?? undefined : undefined}
          bumpScale={cloth ? .006 : 0}
        />
      </mesh>

      <mesh geometry={backBoardGeometry} position={[0, 0, backZ]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={volume.spineColor}
          roughness={coverRoughness}
          metalness={0}
          clearcoat={coverClearcoat}
          clearcoatRoughness={.55}
          sheen={coverSheen}
          sheenColor="#e6ddd0"
          sheenRoughness={.9}
          bumpMap={cloth ? clothBump ?? undefined : undefined}
          bumpScale={cloth ? .006 : 0}
        />
      </mesh>

      {hardcover ? (
        <mesh position={[spineX, 0, 0]} scale={[.2, 1, 1]} castShadow receiveShadow>
          <cylinderGeometry args={[spineRadius, spineRadius, height * .986, 64, 1, false]} />
          <meshPhysicalMaterial
            color={volume.spineColor}
            roughness={.87}
            sheen={cloth ? .22 : .04}
            sheenColor="#e6ddd0"
            sheenRoughness={.9}
            bumpMap={cloth ? clothBump ?? undefined : undefined}
            bumpScale={cloth ? .006 : 0}
          />
        </mesh>
      ) : (
        <mesh position={[spineX, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[.014, height * .986, thickness * .96]} />
          <meshStandardMaterial color={volume.spineColor} roughness={.82} />
        </mesh>
      )}

      {spineTexture ? (
        <mesh
          position={[-coverWidth / 2 - (hardcover ? .005 : .0025), 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          renderOrder={3}
        >
          <planeGeometry args={[thickness * .78, height * .91]} />
          <meshPhysicalMaterial
            map={spineTexture}
            color="#ffffff"
            roughness={cloth ? .86 : .7}
            clearcoat={volume.jacket ? .1 : 0}
            sheen={cloth ? .16 : 0}
            sheenColor="#e6ddd0"
            sheenRoughness={.9}
            bumpMap={cloth ? clothBump ?? undefined : undefined}
            bumpScale={cloth ? .004 : 0}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
      ) : null}

      {coverMap ? (
        <mesh position={[0, 0, frontOuterZ + .006]} renderOrder={4}>
          <planeGeometry args={[coverWidth * .966, height * .966]} />
          <meshPhysicalMaterial
            map={coverMap}
            color="#ffffff"
            roughness={volume.jacket ? .52 : .82}
            metalness={0}
            clearcoat={volume.jacket ? .13 : .01}
            clearcoatRoughness={.56}
            sheen={cloth ? .08 : 0}
            sheenColor="#ffffff"
            sheenRoughness={.95}
            bumpMap={cloth ? clothBump ?? undefined : undefined}
            bumpScale={cloth ? .003 : 0}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-3}
          />
        </mesh>
      ) : null}

      {hardcover ? (
        <>
          <mesh position={[-coverWidth / 2 + overhang + .014, 0, frontOuterZ + .003]}>
            <boxGeometry args={[.006, height * .86, .002]} />
            <meshStandardMaterial color="#241d18" transparent opacity={.075} roughness={1} />
          </mesh>
          <mesh position={[spineX + .012, pageHeight / 2 - .004, 0]}>
            <boxGeometry args={[.024, .007, pageDepth * .62]} />
            <meshStandardMaterial color={volume.bandColor} roughness={.9} />
          </mesh>
          <mesh position={[spineX + .012, -pageHeight / 2 + .004, 0]}>
            <boxGeometry args={[.024, .007, pageDepth * .62]} />
            <meshStandardMaterial color={volume.bandColor} roughness={.9} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}
