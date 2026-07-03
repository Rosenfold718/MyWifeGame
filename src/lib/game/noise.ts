import { createNoise2D, createNoise3D } from 'simplex-noise';

export const noise2D = createNoise2D();
export const noise3D = createNoise3D();

export function getTerrainHeight(x: number, z: number): number {
  let height = 0;

  // Very gentle rolling hills
  height += noise2D(x * 0.012, z * 0.012) * 6;

  // Medium detail - subtle
  height += noise2D(x * 0.04, z * 0.04) * 2.5;

  // Small detail - very subtle
  height += noise2D(x * 0.1, z * 0.1) * 0.8;

  // Flatten center area for spawn
  const distFromCenter = Math.sqrt(x * x + z * z);
  if (distFromCenter < 12) {
    const flatFactor = 1 - distFromCenter / 12;
    height *= 1 - flatFactor * 0.85;
  }

  // Clamp max height to prevent extreme terrain
  return Math.max(-3, Math.min(10, height));
}

export function getBiomeAtPosition(x: number, z: number): 'forest' | 'desert' | 'tundra' {
  const biomeNoise = noise2D(x * 0.015 + 500, z * 0.015 + 500);

  if (biomeNoise < -0.15) return 'tundra';
  if (biomeNoise > 0.15) return 'desert';
  return 'forest';
}

export function getBiomeBlend(x: number, z: number): { forest: number; desert: number; tundra: number } {
  const n = noise2D(x * 0.015 + 500, z * 0.015 + 500);

  const desert = Math.max(0, (n - 0.05) * 3.0);
  const tundra = Math.max(0, (-n - 0.05) * 3.0);
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
  const slope = 1 - normal.y;

  // Forest - lush green tones
  const forestGrass: [number, number, number] = [0.22, 0.52, 0.18];
  const forestDark: [number, number, number] = [0.15, 0.38, 0.12];
  const forestDirt: [number, number, number] = [0.32, 0.24, 0.14];
  const forestRock: [number, number, number] = [0.38, 0.36, 0.32];

  // Desert - warm golden tones
  const desertSand: [number, number, number] = [0.85, 0.75, 0.45];
  const desertDark: [number, number, number] = [0.72, 0.58, 0.32];
  const desertRock: [number, number, number] = [0.62, 0.52, 0.32];
  const desertCrystal: [number, number, number] = [0.55, 0.70, 0.82];

  // Tundra - cool blue-white tones
  const tundraSnow: [number, number, number] = [0.88, 0.91, 0.95];
  const tundraIce: [number, number, number] = [0.68, 0.80, 0.88];
  const tundraRock: [number, number, number] = [0.48, 0.50, 0.53];

  const heightFactor = Math.min(1, Math.max(0, height / 8));
  const rockMix = Math.pow(slope, 1.5);

  let r = 0, g = 0, b = 0;

  // Forest
  const fColor = lerpColor(
    lerpColor(forestGrass, forestDark, heightFactor * 0.6),
    forestRock,
    rockMix
  );
  r += fColor[0] * blend.forest;
  g += fColor[1] * blend.forest;
  b += fColor[2] * blend.forest;

  // Desert
  const dColor = lerpColor(
    lerpColor(desertSand, desertDark, heightFactor * 0.4),
    lerpColor(desertRock, desertCrystal, Math.max(0, heightFactor - 0.5) * 2),
    rockMix
  );
  r += dColor[0] * blend.desert;
  g += dColor[1] * blend.desert;
  b += dColor[2] * blend.desert;

  // Tundra
  const tColor = lerpColor(
    lerpColor(tundraSnow, tundraIce, heightFactor * 0.7),
    tundraRock,
    rockMix
  );
  r += tColor[0] * blend.tundra;
  g += tColor[1] * blend.tundra;
  b += tColor[2] * blend.tundra;

  // Subtle noise variation for visual richness
  const variation = noise2D(x * 0.15, z * 0.15) * 0.04;
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