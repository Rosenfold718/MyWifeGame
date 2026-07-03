'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getTerrainHeight, getBiomeAtPosition, noise2D } from '@/lib/game/noise';

// Toon material factory
function createToonMaterial(color: string) {
  const gradientData = new Uint8Array([0, 100, 200, 255]);
  const gradientMap = new THREE.DataTexture(gradientData, 4, 1, THREE.RedFormat);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;

  return new THREE.MeshToonMaterial({
    color,
    gradientMap,
  });
}

// Tree component for forest biome
function Tree({ position }: { position: [number, number, number] }) {
  const trunkColor = useMemo(() => createToonMaterial('#5a3a1a'), []);
  const leafColor = useMemo(() => {
    const shade = 0.6 + Math.random() * 0.4;
    return createToonMaterial(`rgb(${Math.floor(40 * shade)}, ${Math.floor(140 * shade)}, ${Math.floor(50 * shade)})`);
  }, []);

  const scale = 0.8 + Math.random() * 0.6;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh material={trunkColor} position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 4, 6]} />
      </mesh>
      {/* Foliage layers */}
      <mesh material={leafColor} position={[0, 4.5, 0]} castShadow>
        <coneGeometry args={[1.8, 3, 6]} />
      </mesh>
      <mesh material={leafColor} position={[0, 6, 0]} castShadow>
        <coneGeometry args={[1.3, 2.5, 6]} />
      </mesh>
      <mesh material={leafColor} position={[0, 7.2, 0]} castShadow>
        <coneGeometry args={[0.8, 1.5, 6]} />
      </mesh>
    </group>
  );
}

// Magical tree for enchanted forest
function MagicTree({ position }: { position: [number, number, number] }) {
  const trunkColor = useMemo(() => createToonMaterial('#3a2a5a'), []);
  const leafColor = useMemo(() => createToonMaterial('#8844cc'), []);
  const glowColor = useMemo(() => createToonMaterial('#cc88ff'), []);

  const scale = 0.9 + Math.random() * 0.5;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh material={trunkColor} position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 5, 6]} />
      </mesh>
      <mesh material={leafColor} position={[0, 5.5, 0]} castShadow>
        <sphereGeometry args={[2.5, 8, 6]} />
      </mesh>
      {/* Glowing orbs */}
      {[[-1.5, 4, 1], [1.8, 5, -1], [0.5, 6.5, 1.5], [-1, 3.5, -1.2]].map((pos, i) => (
        <mesh key={i} material={glowColor} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.15, 6, 6]} />
        </mesh>
      ))}
    </group>
  );
}

// Rock component
function Rock({ position, scale: s = 1, color = '#777777' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const mat = useMemo(() => createToonMaterial(color), [color]);

  return (
    <mesh material={mat} position={position} scale={s} castShadow>
      <dodecahedronGeometry args={[1, 0]} />
    </mesh>
  );
}

// Crystal for desert
function Crystal({ position }: { position: [number, number, number] }) {
  const mat = useMemo(() => {
    const m = new THREE.MeshToonMaterial({
      color: '#88ccff',
      transparent: true,
      opacity: 0.7,
      emissive: '#4488aa',
      emissiveIntensity: 0.3,
    });
    return m;
  }, []);

  const scale = 0.5 + Math.random() * 1.5;
  const rotY = Math.random() * Math.PI;
  const rotZ = (Math.random() - 0.5) * 0.5;

  return (
    <group position={position} rotation={[0, rotY, rotZ]}>
      <mesh material={mat} scale={[scale * 0.3, scale, scale * 0.3]} castShadow>
        <octahedronGeometry args={[1, 0]} />
      </mesh>
    </group>
  );
}

// Cactus for desert
function Cactus({ position }: { position: [number, number, number] }) {
  const mat = useMemo(() => createToonMaterial('#2d6b2d'), []);
  const scale = 0.7 + Math.random() * 0.6;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh material={mat} position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 3, 6]} />
      </mesh>
      <mesh material={mat} position={[0.5, 1.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 1.2, 6]} />
      </mesh>
      <mesh material={mat} position={[0.75, 2, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.8, 6]} />
      </mesh>
    </group>
  );
}

// Ice formation for tundra
function IceFormation({ position }: { position: [number, number, number] }) {
  const mat = useMemo(() => {
    return new THREE.MeshToonMaterial({
      color: '#aae0ff',
      transparent: true,
      opacity: 0.6,
      emissive: '#6699cc',
      emissiveIntensity: 0.2,
    });
  }, []);

  const scale = 0.8 + Math.random() * 1.5;

  return (
    <group position={position}>
      <mesh material={mat} scale={[scale * 0.4, scale, scale * 0.4]} castShadow>
        <coneGeometry args={[1, 2, 5]} />
      </mesh>
      <mesh material={mat} scale={[scale * 0.3, scale * 0.7, scale * 0.3]} position={[0.5, 0, 0.3]} castShadow>
        <coneGeometry args={[1, 1.5, 5]} />
      </mesh>
    </group>
  );
}

// Pine tree for tundra
function PineTree({ position }: { position: [number, number, number] }) {
  const trunkMat = useMemo(() => createToonMaterial('#4a3a2a'), []);
  const leafMat = useMemo(() => createToonMaterial('#1a4a3a'), []);
  const snowMat = useMemo(() => createToonMaterial('#ddeeff'), []);

  const scale = 0.7 + Math.random() * 0.6;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh material={trunkMat} position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 3, 6]} />
      </mesh>
      <mesh material={leafMat} position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[1.5, 2.5, 6]} />
      </mesh>
      <mesh material={leafMat} position={[0, 5, 0]} castShadow>
        <coneGeometry args={[1.1, 2, 6]} />
      </mesh>
      <mesh material={snowMat} position={[0, 4.5, 0.5]} scale={[1.2, 0.3, 0.8]}>
        <sphereGeometry args={[1, 6, 4]} />
      </mesh>
    </group>
  );
}

// Grass tuft
function GrassTuft({ position }: { position: [number, number, number] }) {
  const mat = useMemo(() => createToonMaterial('#4a8a3a'), []);
  const count = 3 + Math.floor(Math.random() * 4);

  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          material={mat}
          position={[
            (Math.random() - 0.5) * 0.5,
            0.3 + Math.random() * 0.3,
            (Math.random() - 0.5) * 0.5,
          ]}
          rotation={[
            (Math.random() - 0.5) * 0.3,
            Math.random() * Math.PI,
            (Math.random() - 0.5) * 0.3,
          ]}
        >
          <planeGeometry args={[0.1, 0.5 + Math.random() * 0.4]} />
        </mesh>
      ))}
    </group>
  );
}

export function EnvironmentObjects() {
  const objects = useMemo(() => {
    const result: { type: string; position: [number, number, number]; props?: Record<string, unknown> }[] = [];

    // Use seeded random for consistent world generation
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    let seedCounter = 0;

    // Forest zone objects
    for (let i = 0; i < 50; i++) {
      const angle = seededRandom(seedCounter++) * Math.PI * 2;
      const dist = 10 + seededRandom(seedCounter++) * 110;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const biome = getBiomeAtPosition(x, z);
      if (biome !== 'forest') continue;

      const y = getTerrainHeight(x, z);
      const r = seededRandom(seedCounter++);

      if (r < 0.4) {
        result.push({ type: 'tree', position: [x, y, z] });
      } else if (r < 0.55) {
        result.push({ type: 'magicTree', position: [x, y, z] });
      } else if (r < 0.7) {
        result.push({ type: 'rock', position: [x, y, z], props: { color: '#556655' } });
      } else if (r < 0.85) {
        result.push({ type: 'grass', position: [x, y, z] });
      } else {
        result.push({ type: 'rock', position: [x, y, z], props: { color: '#887766' } });
      }
    }

    // Desert zone objects
    for (let i = 0; i < 30; i++) {
      const x = 100 + seededRandom(seedCounter++) * 100;
      const z = -80 + seededRandom(seedCounter++) * 160;
      const biome = getBiomeAtPosition(x, z);
      if (biome !== 'desert') continue;

      const y = getTerrainHeight(x, z);
      const r = seededRandom(seedCounter++);

      if (r < 0.25) {
        result.push({ type: 'crystal', position: [x, y, z] });
      } else if (r < 0.45) {
        result.push({ type: 'cactus', position: [x, y, z] });
      } else if (r < 0.7) {
        result.push({ type: 'rock', position: [x, y, z], props: { color: '#c4a460' } });
      } else {
        result.push({ type: 'rock', position: [x, y, z], props: { color: '#aa8844' } });
      }
    }

    // Tundra zone objects
    for (let i = 0; i < 30; i++) {
      const x = -120 + seededRandom(seedCounter++) * 140;
      const z = -200 + seededRandom(seedCounter++) * 100;
      const biome = getBiomeAtPosition(x, z);
      if (biome !== 'tundra') continue;

      const y = getTerrainHeight(x, z);
      const r = seededRandom(seedCounter++);

      if (r < 0.35) {
        result.push({ type: 'pineTree', position: [x, y, z] });
      } else if (r < 0.55) {
        result.push({ type: 'ice', position: [x, y, z] });
      } else if (r < 0.75) {
        result.push({ type: 'rock', position: [x, y, z], props: { color: '#8899aa' } });
      } else {
        result.push({ type: 'ice', position: [x, y, z] });
      }
    }

    return result;
  }, []);

  return (
    <group>
      {objects.map((obj, i) => {
        const key = `${obj.type}_${i}`;
        switch (obj.type) {
          case 'tree':
            return <Tree key={key} position={obj.position} />;
          case 'magicTree':
            return <MagicTree key={key} position={obj.position} />;
          case 'rock':
            return (
              <Rock
                key={key}
                position={obj.position}
                scale={0.5 + (obj.props?.scale as number || 0.5)}
                color={obj.props?.color as string || '#777777'}
              />
            );
          case 'crystal':
            return <Crystal key={key} position={obj.position} />;
          case 'cactus':
            return <Cactus key={key} position={obj.position} />;
          case 'pineTree':
            return <PineTree key={key} position={obj.position} />;
          case 'ice':
            return <IceFormation key={key} position={obj.position} />;
          case 'grass':
            return <GrassTuft key={key} position={obj.position} />;
          default:
            return null;
        }
      })}
    </group>
  );
}