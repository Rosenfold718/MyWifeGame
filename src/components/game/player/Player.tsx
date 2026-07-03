'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import { ELEMENT_COLORS } from '@/lib/game/constants';
import { Html } from '@react-three/drei';
import { sharedGradientMap, createToonMaterial } from '@/lib/game/toonMaterial';

// Outline material (lazy init to avoid SSR crash)
let _outlineMatInstance: THREE.MeshBasicMaterial | null = null;
function getOutlineMat() {
  if (!_outlineMatInstance) _outlineMatInstance = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
  return _outlineMatInstance;
}

// Helper: create toon material with optional emissive
function toonMat(color: string, emissive?: string, emissiveIntensity?: number) {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: sharedGradientMap,
    emissive: emissive || '#000000',
    emissiveIntensity: emissiveIntensity || 0,
  });
}

export function Player() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyGroupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const capeRef = useRef<THREE.Mesh>(null);
  const weaponGroupRef = useRef<THREE.Group>(null);
  const auraParticlesRef = useRef<THREE.Group>(null);

  const prevPos = useRef(new THREE.Vector3());
  const animTime = useRef(0);
  const isMoving = useRef(false);
  const attackTime = useRef(0);
  const castTime = useRef(0);

  // Store selectors
  const playerPosition = useGameStore((s) => s.playerPosition);
  const playerRotation = useGameStore((s) => s.playerRotation);
  const appearance = useGameStore((s) => s.appearance);
  const currentElement = useGameStore((s) => s.currentElement);
  const isAttacking = useGameStore((s) => s.isAttacking);
  const isDodging = useGameStore((s) => s.isDodging);
  const isCasting = useGameStore((s) => s.isCasting);

  // Reusable vectors to avoid allocation in useFrame
  const _v1 = useMemo(() => new THREE.Vector3(), []);
  const _scaleTarget = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  // ---- Materials ----
  const skinMat = useMemo(() => toonMat(appearance.skinTone), [appearance.skinTone]);
  const hairMat = useMemo(() => toonMat(appearance.hairColor), [appearance.hairColor]);
  const outfitMat = useMemo(() => toonMat(appearance.outfitColor), [appearance.outfitColor]);
  const outfitDarkMat = useMemo(() => toonMat(darkenColor(appearance.outfitColor, 0.7)), [appearance.outfitColor]);
  const eyeWhiteMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const eyeMat = useMemo(() => toonMat(appearance.eyeColor, appearance.eyeColor, 0.5), [appearance.eyeColor]);
  const eyeHighlightMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const pupilMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x111111 }), []);
  const weaponMat = useMemo(() => toonMat('#cccccc', ELEMENT_COLORS[currentElement], 0.3), [currentElement]);
  const guardMat = useMemo(() => toonMat('#886622'), []);
  const handleMat = useMemo(() => toonMat('#553311'), []);
  const shoeMat = useMemo(() => toonMat('#443322'), []);
  const beltMat = useMemo(() => toonMat('#664422'), []);
  const capeMat = useMemo(() => toonMat(darkenColor(appearance.outfitColor, 0.6)), [appearance.outfitColor]);
  const collarMat = useMemo(() => toonMat('#ffffff'), []);
  const auraMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: ELEMENT_COLORS[currentElement],
    transparent: true,
    opacity: 0.08,
  }), [currentElement]);
  const particleMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: ELEMENT_COLORS[currentElement],
    transparent: true,
    opacity: 0.7,
  }), [currentElement]);
  const weaponTipMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: ELEMENT_COLORS[currentElement],
    transparent: true,
    opacity: 0.8,
  }), [currentElement]);
  const bladeGlowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: ELEMENT_COLORS[currentElement],
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  }), [currentElement]);

  // ---- Geometries ----
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 12, 8), []);
  const headGeo = useMemo(() => new THREE.SphereGeometry(0.38, 12, 10), []);
  const eyeGeo = useMemo(() => new THREE.SphereGeometry(0.1, 8, 6), []);
  const highlightGeo = useMemo(() => new THREE.SphereGeometry(0.035, 6, 6), []);
  const pupilGeo = useMemo(() => new THREE.SphereGeometry(0.05, 8, 6), []);
  const particleGeo = useMemo(() => new THREE.SphereGeometry(0.06, 6, 4), []);

  // ---- Aura particles (reusable positions) ----
  const auraPositions = useMemo(() => {
    const arr: { offset: number; radius: number; yOff: number; speed: number }[] = [];
    for (let i = 0; i < 6; i++) {
      arr.push({
        offset: (i / 6) * Math.PI * 2,
        radius: 0.6 + Math.random() * 0.2,
        yOff: 0.8 + Math.random() * 0.8,
        speed: 1.5 + Math.random() * 1,
      });
    }
    return arr;
  }, []);

  // ---- Animation loop ----
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Clamp delta
    const dt = Math.min(delta, 0.05);

    // Position & rotation
    groupRef.current.position.set(playerPosition[0], playerPosition[1], playerPosition[2]);
    groupRef.current.rotation.y = playerRotation;

    // Check if moving
    _v1.set(playerPosition[0], playerPosition[1], playerPosition[2]);
    const dist = _v1.distanceTo(prevPos.current);
    isMoving.current = dist > 0.001;
    prevPos.current.copy(_v1);

    // Time accumulators
    animTime.current += dt;
    const wasAttacking = attackTime.current > 0;
    const wasCasting = castTime.current > 0;

    if (isAttacking) attackTime.current = 0.35;
    else attackTime.current = Math.max(0, attackTime.current - dt);
    if (isCasting) castTime.current = 1.0;
    else castTime.current = Math.max(0, castTime.current - dt);

    // --- ANIMATIONS ---
    const body = bodyGroupRef.current;
    const head = headGroupRef.current;
    const la = leftArmRef.current;
    const ra = rightArmRef.current;
    const ll = leftLegRef.current;
    const rl = rightLegRef.current;
    const cape = capeRef.current;
    const weapon = weaponGroupRef.current;
    const aura = auraParticlesRef.current;

    if (!body || !head || !la || !ra || !ll || !rl) return;

    if (isMoving.current && !isDodging) {
      // --- WALK ANIMATION ---
      const speed = 8;
      const t = animTime.current * speed;
      const swing = Math.sin(t) * 0.5;
      const bob = Math.abs(Math.sin(t)) * 0.04;

      // Leg swing
      ll.rotation.x = swing;
      rl.rotation.x = -swing;
      // Arm swing (opposite to legs)
      la.rotation.x = -swing * 0.6;
      // Head slight bob
      head.rotation.x = Math.sin(t * 2) * 0.03;
      // Body bob
      body.position.y = bob;

      // Weapon arm follows walk when not attacking/casting
      if (attackTime.current <= 0 && castTime.current <= 0) {
        ra.rotation.x = swing * 0.4;
        ra.rotation.z = 0;
      }
    } else {
      // --- IDLE ANIMATION ---
      const t = animTime.current * 2;
      // Breathing
      body.position.y = Math.sin(t) * 0.025;
      // Subtle weight shift
      body.rotation.z = Math.sin(t * 0.7) * 0.02;
      // Head idle
      head.rotation.x = Math.sin(t * 0.5) * 0.02;
      head.rotation.z = Math.sin(t * 0.3) * 0.015;

      // Legs return to neutral
      ll.rotation.x *= 0.88;
      rl.rotation.x *= 0.88;
      la.rotation.x *= 0.88;
      la.rotation.z *= 0.88;

      if (attackTime.current <= 0 && castTime.current <= 0) {
        ra.rotation.x *= 0.88;
        ra.rotation.z *= 0.88;
      }
    }

    // --- ATTACK ANIMATION ---
    if (attackTime.current > 0) {
      const progress = 1 - attackTime.current / 0.35;
      const swingAngle = Math.sin(progress * Math.PI) * 1.8;
      ra.rotation.x = -swingAngle;
      ra.rotation.z = 0;
      la.rotation.x = -0.3;
      la.rotation.z = -0.2;
      body.rotation.y = -swingAngle * 0.15;

      if (weapon) {
        weapon.rotation.x = 0;
        weapon.rotation.z = 0;
      }
    } else if (!isMoving.current) {
      body.rotation.y *= 0.9;
    }

    // --- CAST ANIMATION ---
    if (castTime.current > 0) {
      const t = castTime.current;
      const raiseLerp = Math.min(1, (1 - t) * 3);
      // Both arms raised
      la.rotation.x = -2.2 * raiseLerp;
      la.rotation.z = 0.4 * raiseLerp;
      ra.rotation.x = -2.2 * raiseLerp;
      ra.rotation.z = -0.4 * raiseLerp;
      body.position.y = Math.sin(animTime.current * 6) * 0.05;
    }

    // --- CAPE FLOW ---
    if (cape) {
      const capeSwing = isMoving.current
        ? Math.sin(animTime.current * 6) * 0.25
        : Math.sin(animTime.current * 1.5) * 0.08;
      cape.rotation.x = capeSwing;
      cape.rotation.z = Math.sin(animTime.current * 3) * 0.05;
    }

    // --- WEAPON TRAIL (during attack) ---
    if (weapon && attackTime.current > 0) {
      const progress = 1 - attackTime.current / 0.35;
      if (progress > 0.3 && progress < 0.8) {
        weapon.position.z = -0.15 * Math.sin(progress * Math.PI);
      } else {
        weapon.position.z *= 0.8;
      }
    } else if (weapon) {
      weapon.position.z *= 0.9;
    }

    // --- AURA PARTICLES ---
    if (aura) {
      const time = animTime.current;
      aura.children.forEach((child, i) => {
        const p = auraPositions[i];
        if (!p) return;
        const angle = time * p.speed + p.offset;
        child.position.x = Math.cos(angle) * p.radius;
        child.position.z = Math.sin(angle) * p.radius;
        child.position.y = p.yOff + Math.sin(time * 2 + p.offset) * 0.15;
        (child as THREE.Mesh).scale.setScalar(
          0.8 + Math.sin(time * 3 + p.offset) * 0.3
        );
      });
    }

    // --- DODGE ---
    if (isDodging) {
      groupRef.current.scale.setScalar(0.8);
    } else {
      groupRef.current.scale.lerp(_scaleTarget, 0.15);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={bodyGroupRef}>
        {/* ====== OUTLINE (BackSide) ====== */}
        <group scale={[1.03, 1.03, 1.03]}>
          <mesh geometry={headGeo} material={getOutlineMat()} position={[0, 1.65, 0]} />
          {/* Torso outline */}
          <mesh material={getOutlineMat()} position={[0, 1.05, 0]}>
            <capsuleGeometry args={[0.28, 0.55, 4, 8]} />
          </mesh>
          {/* Left arm outline */}
          <mesh material={getOutlineMat()} position={[-0.38, 1.1, 0]}>
            <capsuleGeometry args={[0.07, 0.38, 4, 6]} />
          </mesh>
          {/* Right arm outline */}
          <mesh material={getOutlineMat()} position={[0.38, 1.1, 0]}>
            <capsuleGeometry args={[0.07, 0.38, 4, 6]} />
          </mesh>
        </group>

        {/* ====== HEAD ====== */}
        <group ref={headGroupRef} position={[0, 1.65, 0]}>
          {/* Head main (slightly elongated for anime) */}
          <mesh material={skinMat} castShadow>
            <sphereGeometry args={[0.36, 12, 10]} scale={[0.95, 1.05, 0.9]} />
          </mesh>
          {/* Chin/jaw definition */}
          <mesh material={skinMat} position={[0, -0.25, 0.05]} castShadow>
            <sphereGeometry args={[0.2, 8, 6]} scale={[0.85, 0.5, 0.75]} />
          </mesh>

          {/* ====== EYES (large anime eyes) ====== */}
          {/* Left eye */}
          <group position={[-0.12, 0.05, 0.3]}>
            {/* Eye white */}
            <mesh material={eyeWhiteMat}>
              <sphereGeometry args={[0.1, 8, 6]} scale={[1, 1.2, 0.5]} />
            </mesh>
            {/* Iris */}
            <mesh position={[0, 0, 0.06]} material={eyeMat}>
              <sphereGeometry args={[0.075, 8, 6]} scale={[1, 1.1, 0.4]} />
            </mesh>
            {/* Pupil */}
            <mesh position={[0, -0.01, 0.08]} material={pupilMat}>
              <sphereGeometry args={[0.035, 8, 6]} />
            </mesh>
            {/* Highlight */}
            <mesh position={[0.03, 0.04, 0.09]} material={eyeHighlightMat}>
              <sphereGeometry args={[0.02, 6, 6]} />
            </mesh>
          </group>
          {/* Right eye */}
          <group position={[0.12, 0.05, 0.3]}>
            <mesh material={eyeWhiteMat}>
              <sphereGeometry args={[0.1, 8, 6]} scale={[1, 1.2, 0.5]} />
            </mesh>
            <mesh position={[0, 0, 0.06]} material={eyeMat}>
              <sphereGeometry args={[0.075, 8, 6]} scale={[1, 1.1, 0.4]} />
            </mesh>
            <mesh position={[0, -0.01, 0.08]} material={pupilMat}>
              <sphereGeometry args={[0.035, 8, 6]} />
            </mesh>
            <mesh position={[0.03, 0.04, 0.09]} material={eyeHighlightMat}>
              <sphereGeometry args={[0.02, 6, 6]} />
            </mesh>
          </group>

          {/* ====== HAIR ====== */}
          {/* Hair cap (main volume) */}
          <mesh material={hairMat} position={[0, 0.1, -0.03]} castShadow>
            <sphereGeometry args={[0.39, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          </mesh>
          {/* Hair top volume */}
          <mesh material={hairMat} position={[0, 0.2, -0.05]} castShadow>
            <sphereGeometry args={[0.35, 8, 6]} scale={[1.1, 0.6, 1.0]} />
          </mesh>

          {/* Side hair (left) */}
          <mesh material={hairMat} position={[-0.3, -0.05, 0.05]} castShadow>
            <capsuleGeometry args={[0.06, 0.25, 3, 5]} />
          </mesh>
          {/* Side hair (right) */}
          <mesh material={hairMat} position={[0.3, -0.05, 0.05]} castShadow>
            <capsuleGeometry args={[0.06, 0.25, 3, 5]} />
          </mesh>

          {/* Back hair */}
          <mesh material={hairMat} position={[0, -0.05, -0.2]} castShadow>
            <capsuleGeometry args={[0.18, 0.3, 4, 6]} />
          </mesh>

          {/* Hair style variations */}
          {appearance.hairStyle >= 1 && (
            <>
              {/* Long hair sides */}
              <mesh material={hairMat} position={[-0.25, -0.3, -0.05]} castShadow>
                <capsuleGeometry args={[0.07, 0.35, 3, 5]} />
              </mesh>
              <mesh material={hairMat} position={[0.25, -0.3, -0.05]} castShadow>
                <capsuleGeometry args={[0.07, 0.35, 3, 5]} />
              </mesh>
              {/* Back long hair */}
              <mesh material={hairMat} position={[0, -0.3, -0.15]} castShadow>
                <capsuleGeometry args={[0.15, 0.4, 4, 6]} />
              </mesh>
            </>
          )}
          {appearance.hairStyle >= 2 && (
            <>
              {/* Hair tail */}
              <group position={[0, -0.1, -0.3]} rotation={[0.3, 0, 0]}>
                <mesh material={hairMat} castShadow>
                  <capsuleGeometry args={[0.1, 0.5, 4, 6]} />
                </mesh>
                <mesh material={hairMat} position={[0, -0.35, 0]} castShadow>
                  <capsuleGeometry args={[0.08, 0.3, 3, 5]} />
                </mesh>
              </group>
            </>
          )}
          {appearance.hairStyle >= 3 && (
            <>
              {/* Spiky bangs */}
              <mesh material={hairMat} position={[-0.15, 0.2, 0.25]} rotation={[0.2, 0, 0.1]} castShadow>
                <coneGeometry args={[0.06, 0.25, 4]} />
              </mesh>
              <mesh material={hairMat} position={[0.15, 0.2, 0.25]} rotation={[0.2, 0, -0.1]} castShadow>
                <coneGeometry args={[0.06, 0.25, 4]} />
              </mesh>
              <mesh material={hairMat} position={[0, 0.22, 0.27]} rotation={[0.15, 0, 0]} castShadow>
                <coneGeometry args={[0.05, 0.2, 4]} />
              </mesh>
            </>
          )}
          {appearance.hairStyle >= 4 && (
            <>
              {/* Mohawk / Iroquois spikes */}
              {[-0.08, 0, 0.08].map((x, i) => (
                <mesh key={i} material={hairMat} position={[x, 0.35, -0.02]} rotation={[0.15, 0, x * 0.3]} castShadow>
                  <coneGeometry args={[0.05, 0.2 + i * 0.05, 4]} />
                </mesh>
              ))}
            </>
          )}
        </group>

        {/* ====== TORSO ====== */}
        {/* Main torso (slim, tapered) */}
        <mesh material={outfitMat} position={[0, 1.05, 0]} castShadow>
          <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
        </mesh>
        {/* Chest detail (slight expansion) */}
        <mesh material={outfitDarkMat} position={[0, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.23, 8, 6]} scale={[1, 0.5, 0.8]} />
        </mesh>

        {/* ====== COLLAR ====== */}
        <mesh material={collarMat} position={[0, 1.38, 0]}>
          <torusGeometry args={[0.18, 0.04, 6, 12]} />
        </mesh>

        {/* ====== BELT ====== */}
        <mesh material={beltMat} position={[0, 0.72, 0]}>
          <torusGeometry args={[0.26, 0.035, 6, 12]} />
        </mesh>
        {/* Belt buckle */}
        <mesh material={guardMat} position={[0, 0.72, 0.26]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
        </mesh>

        {/* ====== CAPE / CLOAK ====== */}
        <mesh ref={capeRef} material={capeMat} position={[0, 1.1, -0.22]} castShadow>
          <planeGeometry args={[0.5, 0.9]} />
        </mesh>
        {/* Cape top clasp */}
        <mesh material={guardMat} position={[0, 1.5, -0.15]}>
          <sphereGeometry args={[0.04, 6, 6]} />
        </mesh>

        {/* ====== LEFT ARM ====== */}
        <group ref={leftArmRef} position={[-0.35, 1.25, 0]}>
          {/* Upper arm */}
          <mesh material={outfitMat} position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.28, 4, 6]} />
          </mesh>
          {/* Forearm */}
          <mesh material={skinMat} position={[0, -0.48, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.22, 4, 6]} />
          </mesh>
          {/* Hand */}
          <mesh material={skinMat} position={[0, -0.68, 0]} castShadow>
            <sphereGeometry args={[0.055, 6, 6]} scale={[0.9, 1.1, 0.7]} />
          </mesh>
        </group>

        {/* ====== RIGHT ARM (weapon arm) ====== */}
        <group ref={rightArmRef} position={[0.35, 1.25, 0]}>
          {/* Upper arm */}
          <mesh material={outfitMat} position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.28, 4, 6]} />
          </mesh>
          {/* Forearm */}
          <mesh material={skinMat} position={[0, -0.48, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.22, 4, 6]} />
          </mesh>
          {/* Hand */}
          <mesh material={skinMat} position={[0, -0.68, 0]} castShadow>
            <sphereGeometry args={[0.055, 6, 6]} scale={[0.9, 1.1, 0.7]} />
          </mesh>

          {/* ====== WEAPON (detailed sword) ====== */}
          <group ref={weaponGroupRef} position={[0, -0.7, -0.1]}>
            {/* Blade */}
            <mesh material={weaponMat} position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[0.05, 0.9, 0.02]} />
            </mesh>
            {/* Blade edge glow */}
            <mesh position={[0, 0.45, 0]} material={bladeGlowMat}>
              <boxGeometry args={[0.08, 0.9, 0.01]} />
            </mesh>
            {/* Blade tip */}
            <mesh position={[0, 0.95, 0]} material={weaponMat} castShadow>
              <coneGeometry args={[0.03, 0.12, 4]} />
            </mesh>
            {/* Crossguard */}
            <mesh position={[0, 0.02, 0]} material={guardMat} castShadow>
              <boxGeometry args={[0.22, 0.04, 0.06]} />
            </mesh>
            {/* Crossguard ends */}
            <mesh position={[-0.12, 0.02, 0]} material={guardMat}>
              <sphereGeometry args={[0.025, 6, 6]} />
            </mesh>
            <mesh position={[0.12, 0.02, 0]} material={guardMat}>
              <sphereGeometry args={[0.025, 6, 6]} />
            </mesh>
            {/* Handle */}
            <mesh position={[0, -0.15, 0]} material={handleMat}>
              <cylinderGeometry args={[0.025, 0.03, 0.25, 6]} />
            </mesh>
            {/* Handle wrapping */}
            <mesh position={[0, -0.1, 0]} material={guardMat}>
              <torusGeometry args={[0.032, 0.008, 4, 8]} />
            </mesh>
            <mesh position={[0, -0.18, 0]} material={guardMat}>
              <torusGeometry args={[0.03, 0.008, 4, 8]} />
            </mesh>
            {/* Pommel */}
            <mesh position={[0, -0.3, 0]} material={guardMat}>
              <sphereGeometry args={[0.035, 6, 6]} />
            </mesh>
            {/* Element glow on weapon tip */}
            <mesh position={[0, 1.0, 0]} material={weaponTipMat}>
              <sphereGeometry args={[0.06, 6, 6]} />
            </mesh>
          </group>
        </group>

        {/* ====== LEFT LEG ====== */}
        <group ref={leftLegRef} position={[-0.12, 0.65, 0]}>
          {/* Upper leg */}
          <mesh material={outfitMat} position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.28, 4, 6]} />
          </mesh>
          {/* Lower leg / boot */}
          <mesh material={shoeMat} position={[0, -0.48, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.25, 4, 6]} />
          </mesh>
          {/* Boot foot */}
          <mesh material={shoeMat} position={[0, -0.66, 0.04]} castShadow>
            <boxGeometry args={[0.14, 0.08, 0.22]} />
          </mesh>
        </group>

        {/* ====== RIGHT LEG ====== */}
        <group ref={rightLegRef} position={[0.12, 0.65, 0]}>
          {/* Upper leg */}
          <mesh material={outfitMat} position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.28, 4, 6]} />
          </mesh>
          {/* Lower leg / boot */}
          <mesh material={shoeMat} position={[0, -0.48, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.25, 4, 6]} />
          </mesh>
          {/* Boot foot */}
          <mesh material={shoeMat} position={[0, -0.66, 0.04]} castShadow>
            <boxGeometry args={[0.14, 0.08, 0.22]} />
          </mesh>
        </group>

        {/* ====== ELEMENT AURA (sphere) ====== */}
        <mesh position={[0, 1.0, 0]} scale={2.0} material={auraMat}>
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>

        {/* ====== ORBITING ELEMENT PARTICLES ====== */}
        <group ref={auraParticlesRef}>
          {auraPositions.map((_, i) => (
            <mesh key={i} geometry={particleGeo} material={particleMat} />
          ))}
        </group>
      </group>

      {/* ====== NAME TAG ====== */}
      <Html position={[0, 2.4, 0]} center>
        <div
          className="text-white text-xs font-bold px-2 py-0.5 rounded bg-black/50 whitespace-nowrap pointer-events-none select-none"
          style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
        >
          {useGameStore.getState().playerName}
        </div>
      </Html>
    </group>
  );
}

// Darken a hex color by a factor
function darkenColor(hex: string, factor: number): string {
  const color = new THREE.Color(hex);
  color.multiplyScalar(factor);
  return '#' + color.getHexString();
}