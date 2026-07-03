'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import { ELEMENT_COLORS } from '@/lib/game/constants';

export function Projectiles() {
  const projectiles = useGameStore((s) => s.projectiles);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Projectiles are updated in the game loop
  });

  return (
    <group ref={groupRef}>
      {projectiles.map((proj) => {
        const color = ELEMENT_COLORS[proj.element];
        return (
          <Projectile key={proj.id} position={proj.position} color={color} element={proj.element} />
        );
      })}
    </group>
  );
}

function Projectile({
  position,
  color,
  element,
}: {
  position: [number, number, number];
  color: string;
  element: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const time = useRef(Math.random() * 100);

  useFrame((_, delta) => {
    time.current += delta * 10;
    if (meshRef.current) {
      meshRef.current.rotation.x = time.current;
      meshRef.current.rotation.y = time.current * 0.7;
    }
    if (glowRef.current) {
      const scale = 1.5 + Math.sin(time.current * 2) * 0.3;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      {/* Core */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshToonMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      {/* Trail */}
      <pointLight color={color} intensity={2} distance={8} />
    </group>
  );
}