'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getTerrainHeight, getGroundColor } from '@/lib/game/noise';
import { WORLD_SIZE, TERRAIN_SEGMENTS } from '@/lib/game/constants';
import { sharedGradientMap } from '@/lib/game/toonMaterial';

export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;
    const count = positions.count;
    const colors = new Float32Array(count * 3);
    const normals = geo.attributes.normal.array;

    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = getTerrainHeight(x, z);
      positions.setY(i, y);

      const normal: { x: number; y: number; z: number } = {
        x: normals[i * 3],
        y: normals[i * 3 + 1],
        z: normals[i * 3 + 2],
      };

      const [r, g, b] = getGroundColor(x, z, y, normal);
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    // Create toon gradient map for anime look
    const mat = new THREE.MeshToonMaterial({
      vertexColors: true,
      gradientMap: sharedGradientMap,
      side: THREE.DoubleSide,
    });

    return { geometry: geo, material: mat };
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </mesh>
  );
}