'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getTerrainHeight, getBiomeAtPosition } from '@/lib/game/noise';
import { sharedGradientMap, createToonMaterial } from '@/lib/game/toonMaterial';

// ============================================
// TREE (Forest - improved with roots, sphere foliage, sway)
// ============================================
function Tree({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const swayOffset = useMemo(() => Math.random() * 100, []);
  const scale = useMemo(() => 0.8 + Math.random() * 0.6, []);

  const trunkMat = useMemo(() => createToonMaterial('#5a3a1a'), []);
  const rootMat = useMemo(() => createToonMaterial('#4a2a10'), []);
  const leafMats = useMemo(() => {
    const shade = 0.6 + Math.random() * 0.4;
    const base = createToonMaterial(`rgb(${Math.floor(40 * shade)}, ${Math.floor(140 * shade)}, ${Math.floor(50 * shade)})`);
    const dark = createToonMaterial(`rgb(${Math.floor(30 * shade)}, ${Math.floor(100 * shade)}, ${Math.floor(35 * shade)})`);
    return { base, dark };
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = Date.now() * 0.0005 + swayOffset;
    groupRef.current.rotation.z = Math.sin(t) * 0.015;
    groupRef.current.rotation.x = Math.cos(t * 0.7) * 0.008;
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Trunk (tapered) - reduced height */}
      <mesh material={trunkMat} position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.28, 2.8, 7]} />
      </mesh>

      {/* Roots */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
        <mesh
          key={i}
          material={rootMat}
          position={[
            Math.cos(angle) * 0.3,
            0.15,
            Math.sin(angle) * 0.3,
          ]}
          rotation={[Math.cos(angle) * 0.5, angle, Math.sin(angle) * 0.5]}
          castShadow
        >
          <cylinderGeometry args={[0.04, 0.1, 0.6, 5]} />
        </mesh>
      ))}

      {/* Foliage clusters (spheres) - reduced height ~40% */}
      <mesh material={leafMats.base} position={[0, 2.9, 0]} castShadow>
        <sphereGeometry args={[1.0, 8, 6]} />
      </mesh>
      <mesh material={leafMats.dark} position={[0.6, 3.3, 0.3]} castShadow>
        <sphereGeometry args={[0.65, 7, 5]} />
      </mesh>
      <mesh material={leafMats.base} position={[-0.5, 3.2, -0.4]} castShadow>
        <sphereGeometry args={[0.72, 7, 5]} />
      </mesh>
      <mesh material={leafMats.dark} position={[0.2, 3.7, -0.2]} castShadow>
        <sphereGeometry args={[0.58, 7, 5]} />
      </mesh>
      <mesh material={leafMats.base} position={[-0.3, 3.6, 0.5]} castShadow>
        <sphereGeometry args={[0.5, 6, 5]} />
      </mesh>
      {/* Top cluster */}
      <mesh material={leafMats.dark} position={[0, 4.0, 0]} castShadow>
        <sphereGeometry args={[0.43, 6, 5]} />
      </mesh>
    </group>
  );
}

// ============================================
// MAGIC TREE (Enchanted Forest - ethereal, translucent, glowing)
// ============================================
function MagicTree({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulseTime = useRef(0);

  const trunkMat = useMemo(() => createToonMaterial('#3a2a5a'), []);
  const leafMat = useMemo(() => new THREE.MeshToonMaterial({
    color: '#9955dd',
    transparent: true,
    opacity: 0.75,
    gradientMap: sharedGradientMap,
    emissive: '#6633aa',
    emissiveIntensity: 0.2,
  }), []);
  const orbMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#cc88ff',
    transparent: true,
    opacity: 0.85,
  }), []);

  const scale = useMemo(() => 0.9 + Math.random() * 0.5, []);

  // Orb positions - reduced height ~40%
  const orbPositions = useMemo(() => [
    [-1.5, 2.5, 1] as [number, number, number],
    [1.8, 3.2, -1] as [number, number, number],
    [0.5, 4.1, 1.5] as [number, number, number],
    [-1, 2.2, -1.2] as [number, number, number],
    [0, 4.4, 0.5] as [number, number, number],
  ], []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    pulseTime.current += delta;
    const t = pulseTime.current;

    // Gentle sway
    groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.01;

    // Pulse orbs
    orbRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const s = 0.8 + Math.sin(t * 2 + i * 1.5) * 0.3;
      ref.scale.setScalar(s);
      ref.position.y = (orbPositions[i]?.[1] ?? 0) + Math.sin(t * 1.5 + i * 2) * 0.2;
    });
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Trunk (twisted, dark purple) - reduced height */}
      <mesh material={trunkMat} position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.35, 3.6, 7]} />
      </mesh>
      {/* Trunk knot detail */}
      <mesh material={trunkMat} position={[0.15, 1.0, 0.1]} castShadow>
        <sphereGeometry args={[0.15, 6, 5]} scale={[0.8, 0.6, 0.8]} />
      </mesh>

      {/* Translucent foliage - reduced height */}
      <mesh material={leafMat} position={[0, 3.8, 0]} castShadow>
        <sphereGeometry args={[2.0, 10, 8]} />
      </mesh>
      {/* Secondary foliage */}
      <mesh material={leafMat} position={[0.8, 4.5, 0.5]} castShadow>
        <sphereGeometry args={[1.3, 8, 6]} />
      </mesh>
      <mesh material={leafMat} position={[-1.0, 4.2, -0.8]} castShadow>
        <sphereGeometry args={[1.1, 8, 6]} />
      </mesh>

      {/* Point light for glow */}
      <pointLight color="#9955dd" intensity={0.5} distance={10} position={[0, 3.2, 0]} />

      {/* Floating orbs */}
      {orbPositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => { orbRefs.current[i] = el; }}
          material={orbMat}
          position={pos}
        >
          <sphereGeometry args={[0.12, 6, 6]} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// ROCK (improved with varied shapes, mossy option)
// ============================================
function Rock({
  position,
  scale: s = 1,
  color = '#777777',
  mossy = false,
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  mossy?: boolean;
}) {
  const rockMat = useMemo(() => createToonMaterial(color), [color]);
  const darkRockMat = useMemo(() => createToonMaterial(
    new THREE.Color(color).multiplyScalar(0.75).getHexString()
  ), [color]);
  const mossMat = useMemo(() => createToonMaterial('#4a7a3a'), []);

  return (
    <group position={position} scale={s}>
      {/* Main rock */}
      <mesh material={rockMat} castShadow>
        <dodecahedronGeometry args={[1, 1]} />
      </mesh>
      {/* Secondary rock (cluster) */}
      <mesh material={darkRockMat} position={[0.7, -0.2, 0.3]} scale={[0.6, 0.5, 0.7]} castShadow>
        <dodecahedronGeometry args={[1, 0]} />
      </mesh>
      {/* Small accent rock */}
      <mesh material={darkRockMat} position={[-0.5, -0.3, 0.6]} scale={[0.35, 0.3, 0.4]} castShadow>
        <icosahedronGeometry args={[1, 0]} />
      </mesh>

      {/* Moss top */}
      {mossy && (
        <mesh material={mossMat} position={[0, 0.5, 0]}>
          <dodecahedronGeometry args={[0.9, 1]} />
        </mesh>
      )}
    </group>
  );
}

// ============================================
// CRYSTAL CLUSTER (Desert - improved with inner glow, multiple)
// ============================================
function Crystal({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  const crystalColors = useMemo(() => {
    const colors = ['#88ccff', '#aa88ff', '#ff88cc', '#88ffcc'];
    const idx = Math.floor(Math.random() * colors.length);
    const main = colors[idx];
    const emissive = new THREE.Color(main).multiplyScalar(0.5).getHexString();
    return { main, emissive };
  }, []);

  const crystalMat = useMemo(() => new THREE.MeshToonMaterial({
    color: crystalColors.main,
    transparent: true,
    opacity: 0.7,
    emissive: crystalColors.emissive,
    emissiveIntensity: 0.4,
  }), [crystalColors]);

  const scale = useMemo(() => 0.5 + Math.random() * 1.5, []);
  const rotY = useMemo(() => Math.random() * Math.PI, []);

  // Crystal cluster offsets
  const crystals = useMemo(() => [
    { pos: [0, 0, 0] as [number, number, number], rotZ: 0, s: [0.3, scale, 0.3] as [number, number, number] },
    { pos: [0.3, -0.2, 0.1] as [number, number, number], rotZ: 0.15, s: [0.2, scale * 0.7, 0.2] as [number, number, number] },
    { pos: [-0.25, -0.15, -0.15] as [number, number, number], rotZ: -0.2, s: [0.25, scale * 0.85, 0.25] as [number, number, number] },
    { pos: [0.15, -0.1, -0.2] as [number, number, number], rotZ: 0.1, s: [0.18, scale * 0.5, 0.18] as [number, number, number] },
  ], [scale]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = rotY + Math.sin(Date.now() * 0.0005) * 0.1;
  });

  return (
    <group position={position}>
      <group ref={groupRef} rotation={[0, rotY, 0]}>
        {crystals.map((c, i) => (
          <mesh key={i} material={crystalMat} position={c.pos} rotation={[0, 0, c.rotZ]} scale={c.s} castShadow>
            <octahedronGeometry args={[1, 0]} />
          </mesh>
        ))}
      </group>

      {/* Point light for inner glow */}
      <pointLight
        color={crystalColors.main}
        intensity={0.4 * scale}
        distance={5 + scale * 3}
        position={[0, scale * 0.5, 0]}
      />
    </group>
  );
}

// ============================================
// CACTUS (Desert - realistic with arms, slight sag)
// ============================================
function Cactus({ position }: { position: [number, number, number] }) {
  const mat = useMemo(() => createToonMaterial('#2d6b2d'), []);
  const spineMat = useMemo(() => createToonMaterial('#1a441a'), []);
  const scale = useMemo(() => 0.7 + Math.random() * 0.6, []);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Main body (slightly curved look with segments) */}
      <mesh material={mat} position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 3, 8]} />
      </mesh>
      {/* Segments / ribs */}
      {[0.5, 1.0, 1.5, 2.0, 2.5].map((y, i) => (
        <mesh key={i} material={spineMat} position={[0, y, 0]}>
          <torusGeometry args={[0.22, 0.015, 4, 8]} />
        </mesh>
      ))}

      {/* Right arm (with sag) */}
      <group position={[0.45, 2.0, 0]}>
        {/* Arm segment going right */}
        <mesh material={mat} position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 0.6, 6]} />
        </mesh>
        {/* Arm going up (slight backward lean for sag) */}
        <mesh material={mat} position={[0.6, 0.4, -0.05]} rotation={[0, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.8, 6]} />
        </mesh>
        {/* Joint */}
        <mesh material={spineMat} position={[0.6, 0, 0]}>
          <sphereGeometry args={[0.14, 6, 6]} />
        </mesh>
      </group>

      {/* Left arm (shorter) */}
      <group position={[-0.4, 1.2, 0.05]}>
        <mesh material={mat} position={[-0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.4, 6]} />
        </mesh>
        <mesh material={mat} position={[-0.4, 0.25, 0.02]} rotation={[0.08, 0, 0.1]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 0.5, 6]} />
        </mesh>
        <mesh material={spineMat} position={[-0.4, 0, 0]}>
          <sphereGeometry args={[0.12, 6, 6]} />
        </mesh>
      </group>
    </group>
  );
}

// ============================================
// ICE FORMATION (Tundra - cluster, translucent, glowing)
// ============================================
function IceFormation({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  const iceMat = useMemo(() => new THREE.MeshToonMaterial({
    color: '#aae0ff',
    transparent: true,
    opacity: 0.55,
    emissive: '#6699cc',
    emissiveIntensity: 0.25,
  }), []);

  const scale = useMemo(() => 0.8 + Math.random() * 1.5, []);

  // Ice spike cluster
  const spikes = useMemo(() => [
    { pos: [0, 0, 0] as [number, number, number], s: [0.4, scale, 0.4] as [number, number, number], rot: 0 },
    { pos: [0.5, -0.1, 0.3] as [number, number, number], s: [0.3, scale * 0.7, 0.3] as [number, number, number], rot: 0.15 },
    { pos: [-0.4, -0.15, 0.2] as [number, number, number], s: [0.35, scale * 0.8, 0.3] as [number, number, number], rot: -0.1 },
    { pos: [0.2, -0.1, -0.4] as [number, number, number], s: [0.25, scale * 0.55, 0.25] as [number, number, number], rot: 0.08 },
    { pos: [-0.3, -0.2, -0.3] as [number, number, number], s: [0.28, scale * 0.6, 0.28] as [number, number, number], rot: -0.18 },
  ], [scale]);

  useFrame(() => {
    if (!groupRef.current) return;
    // Subtle pulsing
    const t = Date.now() * 0.001;
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const baseScale = spikes[i]?.s[1] ?? 1;
        child.scale.y = baseScale * (1 + Math.sin(t + i) * 0.02);
      }
    });
  });

  return (
    <group position={position}>
      <group ref={groupRef}>
        {spikes.map((spike, i) => (
          <mesh
            key={i}
            material={iceMat}
            position={spike.pos}
            rotation={[spike.rot, 0, spike.rot * 0.5]}
            scale={spike.s}
            castShadow
          >
            <coneGeometry args={[1, 2, 6]} />
          </mesh>
        ))}
      </group>

      {/* Glow light */}
      <pointLight
        color="#88ccff"
        intensity={0.3 * scale}
        distance={6 + scale * 2}
        position={[0, scale * 0.5, 0]}
      />
    </group>
  );
}

// ============================================
// PINE TREE (Tundra - layered cones with snow caps)
// ============================================
function PineTree({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const swayOffset = useMemo(() => Math.random() * 100, []);
  const scale = useMemo(() => 0.7 + Math.random() * 0.6, []);

  const trunkMat = useMemo(() => createToonMaterial('#4a3a2a'), []);
  const leafMat = useMemo(() => createToonMaterial('#1a4a3a'), []);
  const snowMat = useMemo(() => createToonMaterial('#ddeeff'), []);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = Date.now() * 0.0004 + swayOffset;
    groupRef.current.rotation.z = Math.sin(t) * 0.012;
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Trunk - reduced height */}
      <mesh material={trunkMat} position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.2, 2.0, 6]} />
      </mesh>

      {/* Bottom cone layer - reduced */}
      <mesh material={leafMat} position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[1.1, 1.7, 7]} />
      </mesh>
      {/* Bottom snow cap */}
      <mesh material={snowMat} position={[0, 2.6, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.7, 0.4, 7]} />
      </mesh>

      {/* Middle cone layer - reduced */}
      <mesh material={leafMat} position={[0, 3.0, 0]} castShadow>
        <coneGeometry args={[0.85, 1.5, 7]} />
      </mesh>
      {/* Middle snow cap */}
      <mesh material={snowMat} position={[0, 3.5, 0]}>
        <coneGeometry args={[0.5, 0.35, 7]} />
      </mesh>

      {/* Top cone layer - reduced */}
      <mesh material={leafMat} position={[0, 3.8, 0]} castShadow>
        <coneGeometry args={[0.6, 1.2, 7]} />
      </mesh>
      {/* Top snow cap */}
      <mesh material={snowMat} position={[0, 4.2, 0]}>
        <coneGeometry args={[0.35, 0.25, 7]} />
      </mesh>

      {/* Tip - reduced */}
      <mesh material={leafMat} position={[0, 4.5, 0]}>
        <coneGeometry args={[0.2, 0.4, 5]} />
      </mesh>
      <mesh material={snowMat} position={[0, 4.7, 0]}>
        <sphereGeometry args={[0.08, 6, 4]} />
      </mesh>
    </group>
  );
}

// ============================================
// GRASS TUFT
// ============================================
function GrassTuft({ position }: { position: [number, number, number] }) {
  const mat = useMemo(() => createToonMaterial('#4a8a3a'), []);
  const count = useMemo(() => 3 + Math.floor(Math.random() * 4), []);

  // Pre-generate random values to avoid re-renders
  const blades = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 0.5,
      y: 0.3 + Math.random() * 0.3,
      z: (Math.random() - 0.5) * 0.5,
      rx: (Math.random() - 0.5) * 0.3,
      ry: Math.random() * Math.PI,
      rz: (Math.random() - 0.5) * 0.3,
      h: 0.5 + Math.random() * 0.4,
    })),
  [count]);

  return (
    <group position={position}>
      {blades.map((b, i) => (
        <mesh
          key={i}
          material={mat}
          position={[b.x, b.y, b.z]}
          rotation={[b.rx, b.ry, b.rz]}
        >
          <planeGeometry args={[0.1, b.h]} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// WATER PATCH (semi-transparent blue planes)
// ============================================
function WaterPatch({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseY = position[1] - 2;
  const size = useMemo(() => 8 + Math.random() * 12, []);

  const waterMat = useMemo(() => new THREE.MeshToonMaterial({
    color: '#2266aa',
    transparent: true,
    opacity: 0.5,
    gradientMap: sharedGradientMap,
  }), []);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.y = baseY + Math.sin(Date.now() * 0.001) * 0.1;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[position[0], baseY, position[2]]}
      material={waterMat}
    >
      <planeGeometry args={[size, size]} />
    </mesh>
  );
}

// ============================================
// ENVIRONMENT OBJECTS CONTAINER
// ============================================
export function EnvironmentObjects() {
  const objects = useMemo(() => {
    const result: { type: string; position: [number, number, number]; props?: Record<string, unknown> }[] = [];

    // Use seeded random for consistent world generation
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    let seedCounter = 0;

    // Forest zone objects (x: -35 to 35, z: -35 to 35) — ~25 trees, ~3 magic, ~15 rocks, ~10 grass
    for (let i = 0; i < 60; i++) {
      const x = -35 + seededRandom(seedCounter++) * 70;
      const z = -35 + seededRandom(seedCounter++) * 70;
      const biome = getBiomeAtPosition(x, z);
      if (biome !== 'forest') continue;

      const y = getTerrainHeight(x, z);
      const r = seededRandom(seedCounter++);

      if (r < 0.42) {
        result.push({ type: 'tree', position: [x, y, z] });
      } else if (r < 0.47) {
        result.push({ type: 'magicTree', position: [x, y, z] });
      } else if (r < 0.72) {
        result.push({ type: 'rock', position: [x, y, z], props: { color: '#556655', mossy: true } });
      } else if (r < 0.89) {
        result.push({ type: 'grass', position: [x, y, z] });
      } else {
        result.push({ type: 'rock', position: [x, y, z], props: { color: '#887766' } });
      }
    }

    // Desert zone objects (x: 20 to 48, z: -10 to 30) — ~12 crystals, ~8 cacti, ~8 rocks
    for (let i = 0; i < 35; i++) {
      const x = 20 + seededRandom(seedCounter++) * 28;
      const z = -10 + seededRandom(seedCounter++) * 40;
      const biome = getBiomeAtPosition(x, z);
      if (biome !== 'desert') continue;

      const y = getTerrainHeight(x, z);
      const r = seededRandom(seedCounter++);

      if (r < 0.43) {
        result.push({ type: 'crystal', position: [x, y, z] });
      } else if (r < 0.66) {
        result.push({ type: 'cactus', position: [x, y, z] });
      } else {
        result.push({ type: 'rock', position: [x, y, z], props: { color: '#c4a460' } });
      }
    }

    // Tundra zone objects (x: -45 to -10, z: -45 to -15) — ~15 pine, ~10 ice, ~8 rocks, ~4 water
    for (let i = 0; i < 45; i++) {
      const x = -45 + seededRandom(seedCounter++) * 35;
      const z = -45 + seededRandom(seedCounter++) * 30;
      const biome = getBiomeAtPosition(x, z);
      if (biome !== 'tundra') continue;

      const y = getTerrainHeight(x, z);
      const r = seededRandom(seedCounter++);

      if (r < 0.40) {
        result.push({ type: 'pineTree', position: [x, y, z] });
      } else if (r < 0.67) {
        result.push({ type: 'ice', position: [x, y, z] });
      } else if (r < 0.89) {
        result.push({ type: 'rock', position: [x, y, z], props: { color: '#8899aa' } });
      } else {
        result.push({ type: 'water', position: [x, y, z] });
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
                mossy={obj.props?.mossy as boolean || false}
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
          case 'water':
            return <WaterPatch key={key} position={obj.position} />;
          default:
            return null;
        }
      })}
    </group>
  );
}