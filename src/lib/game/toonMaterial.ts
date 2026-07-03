import * as THREE from 'three';

// Single shared gradient map for ALL toon materials in the game.
let _gradientMap: THREE.DataTexture | null = null;

export function getGradientMap(): THREE.DataTexture {
  if (!_gradientMap) {
    const data = new Uint8Array([0, 100, 200, 255]);
    _gradientMap = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
    _gradientMap.minFilter = THREE.NearestFilter;
    _gradientMap.magFilter = THREE.NearestFilter;
    _gradientMap.needsUpdate = true;
  }
  return _gradientMap;
}

// Lazy wrapper that calls getGradientMap on each access
// This avoids SSR crash while staying backward-compatible
export const sharedGradientMap = new Proxy({} as THREE.DataTexture, {
  get(_, prop, receiver) {
    const map = getGradientMap();
    const value = Reflect.get(map, prop, receiver);
    if (typeof value === 'function') return value.bind(map);
    return value;
  },
  set(_, prop, value) {
    const map = getGradientMap();
    return Reflect.set(map, prop, value);
  },
});

export function createToonMaterial(color: string) {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: getGradientMap(),
  });
}