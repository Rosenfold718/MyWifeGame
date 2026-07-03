'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import { ELEMENT_COLORS } from '@/lib/game/constants';
import { Html } from '@react-three/drei';
import { sharedGradientMap, createToonMaterial } from '@/lib/game/toonMaterial';

function createPlayerToonMaterial(color: string, emissive?: string, emissiveIntensity?: number) {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: sharedGradientMap,
    emissive: emissive || '#000000',
    emissiveIntensity: emissiveIntensity || 0,
  });
}

function OutlineMesh({ geometry, scale = 1.05 }: { geometry: THREE.BufferGeometry; scale?: number }) {
  const outlineMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
    });
  }, []);

  return (
    <mesh geometry={geometry} material={outlineMat} scale={scale} />
  );
}

export function Player() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const weaponRef = useRef<THREE.Group>(null);
  const prevPos = useRef(new THREE.Vector3());
  const animTime = useRef(0);
  const isMoving = useRef(false);

  const playerPosition = useGameStore((s) => s.playerPosition);
  const playerRotation = useGameStore((s) => s.playerRotation);
  const appearance = useGameStore((s) => s.appearance);
  const currentElement = useGameStore((s) => s.currentElement);
  const isAttacking = useGameStore((s) => s.isAttacking);
  const isDodging = useGameStore((s) => s.isDodging);
  const isCasting = useGameStore((s) => s.isCasting);
  const stats = useGameStore((s) => s.stats);

  // Create materials
  const skinMat = useMemo(() => createPlayerToonMaterial(appearance.skinTone), [appearance.skinTone]);
  const hairMat = useMemo(() => createPlayerToonMaterial(appearance.hairColor), [appearance.hairColor]);
  const outfitMat = useMemo(() => createPlayerToonMaterial(appearance.outfitColor), [appearance.outfitColor]);
  const eyeMat = useMemo(() => createPlayerToonMaterial(appearance.eyeColor, appearance.eyeColor, 0.5), [appearance.eyeColor]);
  const weaponMat = useMemo(() => createPlayerToonMaterial('#cccccc', ELEMENT_COLORS[currentElement], 0.3), [currentElement]);
  const guardMat = useMemo(() => new THREE.MeshToonMaterial({ color: '#886622', gradientMap: sharedGradientMap }), []);
  const shoeMat = useMemo(() => createToonMaterial('#443322'), []);
  const whiteMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 'white' }), []);

  useFrame((_, delta) => {
    if (!groupRef.current || !bodyRef.current) return;

    // Position
    groupRef.current.position.set(playerPosition[0], playerPosition[1], playerPosition[2]);

    // Rotation
    groupRef.current.rotation.y = playerRotation;

    // Check if moving
    const pos = new THREE.Vector3(...playerPosition);
    const dist = pos.distanceTo(prevPos.current);
    isMoving.current = dist > 0.001;
    prevPos.current.copy(pos);

    // Animation
    if (isMoving.current && !isDodging) {
      animTime.current += delta * 8;
      const swing = Math.sin(animTime.current) * 0.3;
      // Left leg
      bodyRef.current.children[5].rotation.x = swing;
      // Right leg
      bodyRef.current.children[6].rotation.x = -swing;
      // Left arm
      bodyRef.current.children[3].rotation.x = -swing * 0.5;
      // Right arm (weapon arm)
      if (!isAttacking && !isCasting) {
        bodyRef.current.children[4].rotation.x = swing * 0.5;
      }
    } else {
      // Idle animation - subtle breathing
      animTime.current += delta * 2;
      bodyRef.current.position.y = Math.sin(animTime.current) * 0.03;
      bodyRef.current.children[5].rotation.x *= 0.9;
      bodyRef.current.children[6].rotation.x *= 0.9;
    }

    // Attack animation
    if (isAttacking && weaponRef.current) {
      weaponRef.current.rotation.x = Math.sin(animTime.current * 5) * 1.5;
      bodyRef.current.children[4].rotation.x = -0.5;
    } else if (weaponRef.current) {
      weaponRef.current.rotation.x *= 0.85;
    }

    // Casting animation
    if (isCasting) {
      bodyRef.current.children[4].rotation.x = -1.2;
      bodyRef.current.children[4].rotation.z = 0.3;
    } else if (!isAttacking) {
      bodyRef.current.children[4].rotation.z *= 0.9;
    }

    // Dodge animation
    if (isDodging) {
      groupRef.current.scale.setScalar(0.8);
    } else {
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={bodyRef} position={[0, 0, 0]}>
        {/* Body/Torso */}
        <mesh material={outfitMat} position={[0, 1.1, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.5, 4, 8]} />
        </mesh>

        {/* Head */}
        <mesh material={skinMat} position={[0, 1.85, 0]} castShadow>
          <sphereGeometry args={[0.3, 8, 8]} />
        </mesh>

        {/* Hair base */}
        <mesh material={hairMat} position={[0, 1.95, 0]} castShadow>
          <sphereGeometry args={[0.33, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        </mesh>

        {/* Hair style variations */}
        {appearance.hairStyle >= 1 && (
          <mesh material={hairMat} position={[0, 1.95, -0.2]} castShadow>
            <boxGeometry args={[0.6, 0.35, 0.35]} />
          </mesh>
        )}
        {appearance.hairStyle >= 2 && (
          <mesh material={hairMat} position={[0, 1.7, -0.3]} castShadow>
            <capsuleGeometry args={[0.12, 0.4, 4, 6]} />
          </mesh>
        )}
        {appearance.hairStyle >= 3 && (
          <mesh material={hairMat} position={[0, 2.15, -0.05]} rotation={[0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.15, 0.4, 0.3]} />
          </mesh>
        )}

        {/* Eyes */}
        <mesh material={eyeMat} position={[-0.1, 1.88, 0.25]}>
          <sphereGeometry args={[0.06, 6, 6]} />
        </mesh>
        <mesh material={eyeMat} position={[0.1, 1.88, 0.25]}>
          <sphereGeometry args={[0.06, 6, 6]} />
        </mesh>
        {/* Eye whites */}
        <mesh position={[-0.1, 1.88, 0.28]} material={whiteMat}>
          <planeGeometry args={[0.08, 0.06]} />
        </mesh>
        <mesh position={[0.1, 1.88, 0.28]} material={whiteMat}>
          <planeGeometry args={[0.08, 0.06]} />
        </mesh>

        {/* Left arm */}
        <group position={[-0.4, 1.2, 0]}>
          <mesh material={outfitMat} position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.35, 4, 6]} />
          </mesh>
          <mesh material={skinMat} position={[0, -0.5, 0]} castShadow>
            <sphereGeometry args={[0.08, 6, 6]} />
          </mesh>
        </group>

        {/* Right arm (weapon arm) */}
        <group position={[0.4, 1.2, 0]} ref={weaponRef}>
          <mesh material={outfitMat} position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.35, 4, 6]} />
          </mesh>
          <mesh material={skinMat} position={[0, -0.5, 0]} castShadow>
            <sphereGeometry args={[0.08, 6, 6]} />
          </mesh>
          {/* Weapon */}
          <group position={[0, -0.7, -0.2]}>
            <mesh material={weaponMat} castShadow>
              <boxGeometry args={[0.06, 0.8, 0.06]} />
            </mesh>
            {/* Weapon guard */}
            <mesh position={[0, -0.1, 0]} material={guardMat}>
              <boxGeometry args={[0.25, 0.04, 0.08]} />
            </mesh>
            {/* Element glow on weapon tip */}
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.08, 6, 6]} />
              <meshBasicMaterial color={ELEMENT_COLORS[currentElement]} transparent opacity={0.8} />
            </mesh>
          </group>
        </group>

        {/* Left leg */}
        <group position={[-0.15, 0.6, 0]}>
          <mesh material={outfitMat} position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.35, 4, 6]} />
          </mesh>
          <mesh material={shoeMat} position={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.18, 0.1, 0.3]} />
          </mesh>
        </group>

        {/* Right leg */}
        <group position={[0.15, 0.6, 0]}>
          <mesh material={outfitMat} position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.35, 4, 6]} />
          </mesh>
          <mesh material={shoeMat} position={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.18, 0.1, 0.3]} />
          </mesh>
        </group>

        {/* Element aura */}
        <mesh position={[0, 1, 0]} scale={1.8}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color={ELEMENT_COLORS[currentElement]}
            transparent
            opacity={0.05}
          />
        </mesh>
      </group>

      {/* Name tag */}
      <Html position={[0, 2.5, 0]} center>
        <div className="text-white text-xs font-bold px-2 py-0.5 rounded bg-black/50 whitespace-nowrap pointer-events-none select-none"
          style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>
          {useGameStore.getState().playerName}
        </div>
      </Html>
    </group>
  );
}