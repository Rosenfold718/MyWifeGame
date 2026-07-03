import * as THREE from 'three';

// Single shared gradient map for ALL toon materials in the game.
// This prevents creating hundreds of identical DataTextures.
const gradientData = new Uint8Array([0, 100, 200, 255]);
export const sharedGradientMap = new THREE.DataTexture(gradientData, 4, 1, THREE.RedFormat);
sharedGradientMap.minFilter = THREE.NearestFilter;
sharedGradientMap.magFilter = THREE.NearestFilter;
sharedGradientMap.needsUpdate = true;

export function createToonMaterial(color: string) {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: sharedGradientMap,
  });
}