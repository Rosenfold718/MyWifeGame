import { createNoise2D, createNoise3D } from 'simplex-noise';

export const noise2D = createNoise2D();
export const noise3D = createNoise3D();

export function getTerrainHeight(x: number, z: number): number {
  // Base terrain - large rolling hills
  let height = 0;

  // Large-scale features
  height += noise2D(x * 0.005, z * 0.005) * 25;

  // Medium detail
  height += noise2D(x * 0.02, z * 0.02) * 8;

  // Small detail
  height += noise2D(x * 0.08, z * 0.08) * 2;

  // Flatten center area for spawn
  const distFromCenter = Math.sqrt(x * x + z * z);
  if (distFromCenter < 15) {
    const flatFactor = 1 - distFromCenter / 15;
    height *= 1 - flatFactor * 0.9;
  }

  return height;
}

export function getBiomeAtPosition(x: number, z: number): 'forest' | 'desert' | 'tundra' {
  // Use noise to blend biomes naturally
  const biomeNoise = noise2D(x * 0.003 + 500, z * 0.003 + 500);

  if (biomeNoise < -0.2) return 'tundra';
  if (biomeNoise > 0.2) return 'desert';
  return 'forest';
}

export function getBiomeBlend(x: number, z: number): { forest: number; desert: number; tundra: number } {
  const n = noise2D(x * 0.003 + 500, z * 0.003 + 500);

  const desert = Math.max(0, (n - 0.1) * 2.5);
  const tundra = Math.max(0, (-n - 0.1) * 2.5);
  const forest = Math.max(0, 1 - desert - tundra);

  return { forest, desert, tundra };
}

export function getGroundColor(
  x: number,
  z: number,
  height: number,
  normal: { x: number; y: number; z: number }
): [number, number, number] {
  const blend = getBiomeBlend(x, z);
  const slope = 1 - normal.y; // 0 = flat, 1 = vertical

  // Forest colors
  const forestGrass: [number, number, number] = [0.18, 0.45, 0.15];
  const forestDirt: [number, number, number] = [0.35, 0.25, 0.15];
  const forestRock: [number, number, number] = [0.4, 0.38, 0.35];

  // Desert colors
  const desertSand: [number, number, number] = [0.82, 0.72, 0.42];
  const desertRock: [number, number, number] = [0.65, 0.55, 0.35];
  const desertCrystal: [number, number, number] = [0.6, 0.75, 0.85];

  // Tundra colors
  const tundraSnow: [number, number, number] = [0.9, 0.92, 0.95];
  const tundraIce: [number, number, number] = [0.7, 0.82, 0.9];
  const tundraRock: [number, number, number] = [0.5, 0.52, 0.55];

  // Height-based variation
  const heightFactor = Math.min(1, height / 20);

  // Slope-based rock mixing
  const rockMix = Math.pow(slope, 2);

  // Calculate biome color
  let r = 0, g = 0, b = 0;

  // Forest contribution
  const fColor = lerpColor(
    lerpColor(forestGrass, forestDirt, heightFactor),
    forestRock,
    rockMix
  );
  r += fColor[0] * blend.forest;
  g += fColor[1] * blend.forest;
  b += fColor[2] * blend.forest;

  // Desert contribution
  const dColor = lerpColor(
    lerpColor(desertSand, desertRock, heightFactor * 0.5),
    desertCrystal,
    Math.max(0, heightFactor - 0.5) * 2
  );
  r += dColor[0] * blend.desert;
  g += dColor[1] * blend.desert;
  b += dColor[2] * blend.desert;

  // Tundra contribution
  const tColor = lerpColor(
    lerpColor(tundraSnow, tundraIce, heightFactor),
    tundraRock,
    rockMix
  );
  r += tColor[0] * blend.tundra;
  g += tColor[1] * blend.tundra;
  b += tColor[2] * blend.tundra;

  // Add noise variation
  const variation = (noise2D(x * 0.1, z * 0.1) * 0.05);
  r = Math.max(0, Math.min(1, r + variation));
  g = Math.max(0, Math.min(1, g + variation));
  b = Math.max(0, Math.min(1, b + variation));

  return [r, g, b];
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}