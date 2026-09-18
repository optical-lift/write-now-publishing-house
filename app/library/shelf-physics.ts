import type { LibraryVolume } from '../../lib/library-scene';

export type ShelfPhysicsPose = {
  shift: number;
  lean: number;
  depth: number;
  pressure: number;
};

type HorizontalEnvelope = {
  left: number;
  right: number;
};

type WorkingPose = {
  center: number;
  lean: number;
};

const SHELF_GAP = 4;
const RIGID_HOVER_ANGLE = 72;
const MAX_CONTACT_LEAN = 7;
const SOLVER_PASSES = 3;

function degreesToRadians(value: number) {
  return value * Math.PI / 180;
}

function radiansToDegrees(value: number) {
  return value * 180 / Math.PI;
}

export function buildNaturalShelfState(volumes: LibraryVolume[]) {
  const centers: number[] = [];
  let cursor = 0;

  for (const volume of volumes) {
    centers.push(cursor + volume.width / 2);
    cursor += volume.width + SHELF_GAP;
  }

  return centers;
}

export function computeBookEnvelope(
  volume: LibraryVolume,
  lean: number,
  rigidHover = false,
): HorizontalEnvelope {
  if (rigidHover) {
    const angle = degreesToRadians(RIGID_HOVER_ANGLE);
    const coverWidth = Math.round(volume.height * 0.625);
    const halfDepthProjection = (volume.width / 2) * Math.sin(angle);

    return {
      left: -halfDepthProjection,
      right: coverWidth * Math.cos(angle) + halfDepthProjection,
    };
  }

  const angle = degreesToRadians(lean);
  const halfWidth = volume.width / 2;
  const topCenter = volume.height * Math.sin(angle);
  const topHalfWidth = halfWidth * Math.cos(angle);

  return {
    left: Math.min(-halfWidth, topCenter - topHalfWidth),
    right: Math.max(halfWidth, topCenter + topHalfWidth),
  };
}

export function resolveContact(
  volumes: LibraryVolume[],
  naturalCenters: number[],
  poses: WorkingPose[],
  activeIndex: number,
) {
  const activeEnvelope = computeBookEnvelope(volumes[activeIndex], 0, true);
  const activeCenter = naturalCenters[activeIndex];

  poses[activeIndex] = {
    center: activeCenter,
    lean: 0,
  };

  let rightBoundary = activeCenter + activeEnvelope.right + SHELF_GAP;

  for (let index = activeIndex + 1; index < volumes.length; index += 1) {
    const envelope = computeBookEnvelope(volumes[index], poses[index].lean);
    const minimumCenter = rightBoundary - envelope.left;

    poses[index].center = Math.max(naturalCenters[index], minimumCenter);
    rightBoundary = poses[index].center + envelope.right + SHELF_GAP;
  }

  let leftBoundary = activeCenter + activeEnvelope.left - SHELF_GAP;

  for (let index = activeIndex - 1; index >= 0; index -= 1) {
    const envelope = computeBookEnvelope(volumes[index], poses[index].lean);
    const maximumCenter = leftBoundary - envelope.right;

    poses[index].center = Math.min(naturalCenters[index], maximumCenter);
    leftBoundary = poses[index].center + envelope.left - SHELF_GAP;
  }
}

export function resolveLean(
  volumes: LibraryVolume[],
  naturalCenters: number[],
  poses: WorkingPose[],
  activeIndex: number,
) {
  for (let index = 0; index < volumes.length; index += 1) {
    if (index === activeIndex) {
      poses[index].lean = 0;
      continue;
    }

    const shift = poses[index].center - naturalCenters[index];

    if (Math.abs(shift) < 0.01) {
      poses[index].lean = volumes[index].lean;
      continue;
    }

    const direction = index < activeIndex ? -1 : 1;
    const pressureLean = Math.min(
      MAX_CONTACT_LEAN,
      radiansToDegrees(Math.atan(Math.abs(shift) / Math.max(1, volumes[index].height))),
    );

    if (direction < 0) {
      poses[index].lean = Math.min(volumes[index].lean, -pressureLean);
    } else {
      poses[index].lean = Math.max(volumes[index].lean, pressureLean);
    }
  }
}

export function propagatePressure(
  volumes: LibraryVolume[],
  naturalCenters: number[],
  poses: WorkingPose[],
  activeIndex: number,
) {
  resolveContact(volumes, naturalCenters, poses, activeIndex);
  resolveLean(volumes, naturalCenters, poses, activeIndex);
}

export function settleShelf(
  volumes: LibraryVolume[],
  activeIndex: number | null,
): ShelfPhysicsPose[] {
  if (activeIndex === null) {
    return volumes.map((volume) => ({
      shift: 0,
      lean: volume.lean,
      depth: 1,
      pressure: 0,
    }));
  }

  const naturalCenters = buildNaturalShelfState(volumes);
  const poses: WorkingPose[] = volumes.map((volume, index) => ({
    center: naturalCenters[index],
    lean: index === activeIndex ? 0 : volume.lean,
  }));

  for (let pass = 0; pass < SOLVER_PASSES; pass += 1) {
    propagatePressure(volumes, naturalCenters, poses, activeIndex);
  }

  return poses.map((pose, index) => {
    const shift = pose.center - naturalCenters[index];
    const distance = Math.abs(index - activeIndex);

    return {
      shift,
      lean: pose.lean,
      depth: index === activeIndex ? 30 : Math.max(2, 20 - distance),
      pressure: Math.abs(shift),
    };
  });
}
