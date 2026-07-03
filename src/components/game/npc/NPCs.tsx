'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import { Html } from '@react-three/drei';
import { sharedGradientMap, createToonMaterial } from '@/lib/game/toonMaterial';
import type { NPCState } from '@/stores/gameStore';

// Shared outline material (lazy init to avoid SSR crash)
let _npcOutlineMat: THREE.MeshBasicMaterial | null = null;
function getNpcOutlineMat() {
  if (!_npcOutlineMat) _npcOutlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
  return _npcOutlineMat;
}

function toonMat(color: string, emissive?: string, emissiveIntensity?: number) {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: sharedGradientMap,
    emissive: emissive || '#000000',
    emissiveIntensity: emissiveIntensity || 0,
  });
}

function darkenColor(hex: string, factor: number): string {
  const c = new THREE.Color(hex);
  c.multiplyScalar(factor);
  return '#' + c.getHexString();
}

// ============================================
// ANIME HEAD (shared between player & human NPCs)
// ============================================
function AnimeHead({
  skinMat,
  hairMat,
  eyeColor,
  hairStyle = 0,
  headScale = 1,
}: {
  skinMat: THREE.Material;
  hairMat: THREE.Material;
  eyeColor: string;
  hairStyle?: number;
  headScale?: number;
}) {
  const eyeIrisMat = useMemo(() => toonMat(eyeColor, eyeColor, 0.4), [eyeColor]);
  const eyeWhiteMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const pupilMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x111111 }), []);
  const highlightMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);

  const s = headScale;

  return (
    <group scale={s}>
      {/* Head */}
      <mesh material={skinMat} castShadow>
        <sphereGeometry args={[0.36, 12, 10]} scale={[0.95, 1.05, 0.9]} />
      </mesh>
      {/* Chin */}
      <mesh material={skinMat} position={[0, -0.25, 0.05]} castShadow>
        <sphereGeometry args={[0.2, 8, 6]} scale={[0.85, 0.5, 0.75]} />
      </mesh>

      {/* Left eye */}
      <group position={[-0.12, 0.05, 0.3]}>
        <mesh material={eyeWhiteMat}>
          <sphereGeometry args={[0.09, 8, 6]} scale={[1, 1.2, 0.5]} />
        </mesh>
        <mesh position={[0, 0, 0.055]} material={eyeIrisMat}>
          <sphereGeometry args={[0.07, 8, 6]} scale={[1, 1.1, 0.4]} />
        </mesh>
        <mesh position={[0, -0.01, 0.075]} material={pupilMat}>
          <sphereGeometry args={[0.032, 8, 6]} />
        </mesh>
        <mesh position={[0.025, 0.035, 0.085]} material={highlightMat}>
          <sphereGeometry args={[0.018, 6, 6]} />
        </mesh>
      </group>
      {/* Right eye */}
      <group position={[0.12, 0.05, 0.3]}>
        <mesh material={eyeWhiteMat}>
          <sphereGeometry args={[0.09, 8, 6]} scale={[1, 1.2, 0.5]} />
        </mesh>
        <mesh position={[0, 0, 0.055]} material={eyeIrisMat}>
          <sphereGeometry args={[0.07, 8, 6]} scale={[1, 1.1, 0.4]} />
        </mesh>
        <mesh position={[0, -0.01, 0.075]} material={pupilMat}>
          <sphereGeometry args={[0.032, 8, 6]} />
        </mesh>
        <mesh position={[0.025, 0.035, 0.085]} material={highlightMat}>
          <sphereGeometry args={[0.018, 6, 6]} />
        </mesh>
      </group>

      {/* Hair cap */}
      <mesh material={hairMat} position={[0, 0.1, -0.03]} castShadow>
        <sphereGeometry args={[0.39, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
      </mesh>
      {/* Hair top volume */}
      <mesh material={hairMat} position={[0, 0.2, -0.05]} castShadow>
        <sphereGeometry args={[0.35, 8, 6]} scale={[1.1, 0.6, 1.0]} />
      </mesh>
      {/* Side hair */}
      <mesh material={hairMat} position={[-0.3, -0.05, 0.05]} castShadow>
        <capsuleGeometry args={[0.055, 0.2, 3, 5]} />
      </mesh>
      <mesh material={hairMat} position={[0.3, -0.05, 0.05]} castShadow>
        <capsuleGeometry args={[0.055, 0.2, 3, 5]} />
      </mesh>
      {/* Back hair */}
      <mesh material={hairMat} position={[0, -0.05, -0.2]} castShadow>
        <capsuleGeometry args={[0.16, 0.25, 4, 6]} />
      </mesh>

      {/* Long hair styles */}
      {hairStyle >= 1 && (
        <>
          <mesh material={hairMat} position={[-0.25, -0.25, -0.05]} castShadow>
            <capsuleGeometry args={[0.06, 0.3, 3, 5]} />
          </mesh>
          <mesh material={hairMat} position={[0.25, -0.25, -0.05]} castShadow>
            <capsuleGeometry args={[0.06, 0.3, 3, 5]} />
          </mesh>
          <mesh material={hairMat} position={[0, -0.25, -0.15]} castShadow>
            <capsuleGeometry args={[0.13, 0.35, 4, 6]} />
          </mesh>
        </>
      )}
    </group>
  );
}

// ============================================
// HUMAN NPC (improved anime proportions)
// ============================================
function HumanNPC({ npc }: { npc: NPCState }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const animTime = useRef(Math.random() * 100);

  // Determine body type based on NPC id
  const isMerchant = npc.id === 'merchant';
  const isCrystalSage = npc.id === 'crystal_sage';
  const isIceGuardian = npc.id === 'ice_guardian';
  const isGuide = npc.id === 'forest_guide';

  // Body proportions based on role
  const bodyWidth = isMerchant ? 0.3 : isIceGuardian ? 0.32 : 0.25;
  const bodyHeight = isMerchant ? 0.55 : 0.5;

  // Materials
  const bodyMat = useMemo(() => createToonMaterial(npc.color), [npc.color]);
  const bodyDarkMat = useMemo(() => createToonMaterial(darkenColor(npc.color, 0.7)), [npc.color]);
  const skinMat = useMemo(() => createToonMaterial('#ffe0bd'), []);
  const hairMat = useMemo(() => createToonMaterial(
    isGuide ? '#88cc88' : isCrystalSage ? '#aaaadd' : isIceGuardian ? '#ccddee' : '#333333'
  ), [isGuide, isCrystalSage, isIceGuardian]);
  const pantsMat = useMemo(() => createToonMaterial(isGuide ? '#335533' : isCrystalSage ? '#555577' : isIceGuardian ? '#445566' : '#443322'), [isGuide, isCrystalSage, isIceGuardian]);
  const shoeMat = useMemo(() => createToonMaterial('#443322'), []);
  const beltMat = useMemo(() => createToonMaterial('#664422'), []);
  const eyeColor = useMemo(() =>
    isGuide ? '#44ff44' : isCrystalSage ? '#aa88ff' : isIceGuardian ? '#88ccff' : '#4466ff'
  , [isGuide, isCrystalSage, isIceGuardian]);

  // Robe materials
  const robeMat = useMemo(() => isCrystalSage || isIceGuardian
    ? createToonMaterial(npc.color)
    : bodyMat
  , [isCrystalSage, isIceGuardian, npc.color, bodyMat]);

  // Accessory materials
  const staffMat = useMemo(() => createToonMaterial('#664422'), []);
  const staffOrbMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: isCrystalSage ? '#aa66ff' : '#44ff88',
    transparent: true,
    opacity: 0.9,
  }), [isCrystalSage]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!npc.isAlive) return;

    groupRef.current.position.set(npc.position[0], npc.position[1], npc.position[2]);

    if (!npc.isAggroed) {
      animTime.current += delta * 2;
      // Subtle idle bob
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(animTime.current) * 0.03;
      }
      // Head look around (guide & sage)
      if ((isGuide || isCrystalSage) && headRef.current) {
        headRef.current.rotation.y = Math.sin(animTime.current * 0.5) * 0.3;
        headRef.current.rotation.x = Math.sin(animTime.current * 0.3) * 0.1;
      }
      // Arm idle animations
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(animTime.current * 0.8) * 0.05;
      }
      if (rightArmRef.current && !isCrystalSage) {
        rightArmRef.current.rotation.x = Math.sin(animTime.current * 0.8 + 1) * 0.05;
      }
    }
  });

  if (!npc.isAlive) return null;

  const s = npc.scale;

  return (
    <group ref={groupRef}>
      <group scale={[s, s, s]}>
        {/* Outline */}
        <group scale={[1.03, 1.03, 1.03]}>
          <mesh material={getNpcOutlineMat()} position={[0, 1.65, 0]}>
            <sphereGeometry args={[0.36, 10, 8]} scale={[0.95, 1.05, 0.9]} />
          </mesh>
          <mesh material={getNpcOutlineMat()} position={[0, 1.05, 0]}>
            <capsuleGeometry args={[bodyWidth, bodyHeight, 4, 8]} />
          </mesh>
        </group>

        <group ref={bodyRef}>
          {/* Head */}
          <group ref={headRef} position={[0, 1.65, 0]}>
            <AnimeHead
              skinMat={skinMat}
              hairMat={hairMat}
              eyeColor={eyeColor}
              hairStyle={isGuide ? 1 : 0}
            />
          </group>

          {/* Torso */}
          <mesh material={robeMat} position={[0, 1.05, 0]} castShadow>
            <capsuleGeometry args={[bodyWidth, bodyHeight, 4, 8]} />
          </mesh>
          <mesh material={bodyDarkMat} position={[0, 1.15, 0]} castShadow>
            <sphereGeometry args={[bodyWidth * 0.9, 8, 6]} scale={[1, 0.45, 0.8]} />
          </mesh>

          {/* Belt */}
          <mesh material={beltMat} position={[0, 0.72, 0]}>
            <torusGeometry args={[bodyWidth + 0.02, 0.03, 6, 12]} />
          </mesh>

          {/* Robe for Crystal Sage / Ice Guardian */}
          {(isCrystalSage || isIceGuardian) && (
            <>
              <mesh material={robeMat} position={[0, 0.5, -0.08]} castShadow>
                <cylinderGeometry args={[bodyWidth + 0.1, bodyWidth + 0.18, 0.8, 8]} />
              </mesh>
              {/* Robe collar */}
              <mesh material={createToonMaterial('#ffffff')} position={[0, 1.38, 0]}>
                <torusGeometry args={[bodyWidth - 0.02, 0.035, 6, 12]} />
              </mesh>
            </>
          )}

          {/* Merchant backpack */}
          {isMerchant && (
            <group position={[0, 1.1, -0.25]}>
              <mesh material={createToonMaterial('#8B4513')} castShadow>
                <boxGeometry args={[0.35, 0.4, 0.2]} />
              </mesh>
              <mesh material={createToonMaterial('#A0522D')} position={[0, 0.12, 0]}>
                <boxGeometry args={[0.37, 0.15, 0.22]} />
              </mesh>
              {/* Straps */}
              <mesh material={createToonMaterial('#553311')} position={[-0.15, 0.1, 0.12]}>
                <boxGeometry args={[0.04, 0.3, 0.02]} />
              </mesh>
              <mesh material={createToonMaterial('#553311')} position={[0.15, 0.1, 0.12]}>
                <boxGeometry args={[0.04, 0.3, 0.02]} />
              </mesh>
            </group>
          )}

          {/* Left arm */}
          <group ref={leftArmRef} position={[-bodyWidth - 0.1, 1.25, 0]}>
            <mesh material={robeMat} position={[0, -0.18, 0]} castShadow>
              <capsuleGeometry args={[0.06, 0.28, 4, 6]} />
            </mesh>
            <mesh material={skinMat} position={[0, -0.45, 0]} castShadow>
              <capsuleGeometry args={[0.05, 0.2, 4, 6]} />
            </mesh>
            <mesh material={skinMat} position={[0, -0.62, 0]} castShadow>
              <sphereGeometry args={[0.045, 6, 6]} scale={[0.9, 1.1, 0.7]} />
            </mesh>
          </group>

          {/* Right arm */}
          <group ref={rightArmRef} position={[bodyWidth + 0.1, 1.25, 0]}>
            <mesh material={robeMat} position={[0, -0.18, 0]} castShadow>
              <capsuleGeometry args={[0.06, 0.28, 4, 6]} />
            </mesh>
            <mesh material={skinMat} position={[0, -0.45, 0]} castShadow>
              <capsuleGeometry args={[0.05, 0.2, 4, 6]} />
            </mesh>
            <mesh material={skinMat} position={[0, -0.62, 0]} castShadow>
              <sphereGeometry args={[0.045, 6, 6]} scale={[0.9, 1.1, 0.7]} />
            </mesh>

            {/* Guide staff */}
            {isGuide && (
              <group position={[0, -0.3, -0.08]}>
                <mesh material={staffMat} position={[0, 0.5, 0]} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 1.2, 6]} />
                </mesh>
                <mesh material={staffOrbMat} position={[0, 1.15, 0]}>
                  <sphereGeometry args={[0.06, 8, 8]} />
                </mesh>
              </group>
            )}
          </group>

          {/* Crystal Sage staff (in right hand, raised) */}
          {isCrystalSage && (
            <group position={[bodyWidth + 0.1, 0.85, 0.1]}>
              <mesh material={staffMat} position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.025, 0.03, 1.4, 6]} />
              </mesh>
              <mesh material={staffOrbMat} position={[0, 1.25, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
              </mesh>
              {/* Crystal on staff */}
              <mesh position={[0, 1.35, 0]} rotation={[0.3, 0.5, 0]} material={
                new THREE.MeshToonMaterial({
                  color: '#aa88ff',
                  transparent: true,
                  opacity: 0.8,
                  emissive: '#6633cc',
                  emissiveIntensity: 0.5,
                })
              }>
                <octahedronGeometry args={[0.08, 0]} />
              </mesh>
            </group>
          )}

          {/* Legs */}
          <group ref={leftLegRef} position={[-0.1, 0.65, 0]}>
            <mesh material={pantsMat} position={[0, -0.18, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.28, 4, 6]} />
            </mesh>
            <mesh material={shoeMat} position={[0, -0.46, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.2, 4, 6]} />
            </mesh>
            <mesh material={shoeMat} position={[0, -0.62, 0.04]} castShadow>
              <boxGeometry args={[0.12, 0.07, 0.18]} />
            </mesh>
          </group>
          <group ref={rightLegRef} position={[0.1, 0.65, 0]}>
            <mesh material={pantsMat} position={[0, -0.18, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.28, 4, 6]} />
            </mesh>
            <mesh material={shoeMat} position={[0, -0.46, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.2, 4, 6]} />
            </mesh>
            <mesh material={shoeMat} position={[0, -0.62, 0.04]} castShadow>
              <boxGeometry args={[0.12, 0.07, 0.18]} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Name */}
      <Html position={[0, s * 2.5 + 0.3, 0]} center>
        <div className="text-center pointer-events-none select-none">
          <div
            className="text-xs font-bold text-white px-2 py-0.5 rounded bg-black/50 whitespace-nowrap"
            style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
          >
            {npc.name}
          </div>
          {npc.isHostile && (
            <div className="text-[10px] text-red-400 mt-0.5">⚠ Враждебный</div>
          )}
          {!npc.isHostile && (
            <div className="text-[10px] text-yellow-300/60 mt-0.5">[E] Говорить</div>
          )}
        </div>
      </Html>

      {/* Health bar for hostile NPCs */}
      {npc.isHostile && npc.stats && (
        <Html position={[0, s * 2.8 + 0.5, 0]} center>
          <div className="w-24 h-1.5 bg-black/50 rounded-full overflow-hidden pointer-events-none">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${(npc.currentHp / (npc.stats.maxHp || 1)) * 100}%`,
                background: 'linear-gradient(90deg, #ff4444, #ff6666)',
              }}
            />
          </div>
        </Html>
      )}
    </group>
  );
}

// ============================================
// WOLF (improved)
// ============================================
function WolfModel({ color, isHostile }: { color: string; isHostile: boolean }) {
  const bodyMat = useMemo(() => createToonMaterial(color), [color]);
  const bellyMat = useMemo(() => createToonMaterial(darkenColor(color, 1.3)), [color]);
  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: isHostile ? '#ff3333' : '#ffaa00',
  }), [isHostile]);
  const noseMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#222222' }), []);

  return (
    <group>
      {/* Main body (elongated, low) */}
      <mesh material={bodyMat} position={[0, 0.35, 0]} rotation={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.7, 4, 8]} />
      </mesh>
      {/* Belly */}
      <mesh material={bellyMat} position={[0, 0.25, 0.05]}>
        <sphereGeometry args={[0.17, 8, 6]} scale={[1, 0.6, 1.3]} />
      </mesh>

      {/* Neck */}
      <mesh material={bodyMat} position={[0, 0.4, 0.4]} rotation={[0.4, 0, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.2, 4, 6]} />
      </mesh>

      {/* Head */}
      <mesh material={bodyMat} position={[0, 0.5, 0.6]} rotation={[0.3, 0, 0]} castShadow>
        <sphereGeometry args={[0.16, 8, 8]} scale={[0.9, 0.8, 1.1]} />
      </mesh>
      {/* Snout */}
      <mesh material={bodyMat} position={[0, 0.45, 0.75]} rotation={[0.5, 0, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.15, 4, 6]} />
      </mesh>
      {/* Nose */}
      <mesh material={noseMat} position={[0, 0.5, 0.88]}>
        <sphereGeometry args={[0.035, 6, 6]} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.09, 0.56, 0.7]} material={eyeMat}>
        <sphereGeometry args={[0.035, 6, 6]} />
      </mesh>
      <mesh position={[0.09, 0.56, 0.7]} material={eyeMat}>
        <sphereGeometry args={[0.035, 6, 6]} />
      </mesh>

      {/* Pointed ears */}
      <mesh material={bodyMat} position={[-0.1, 0.62, 0.55]} rotation={[0, 0, 0.2]} castShadow>
        <coneGeometry args={[0.05, 0.14, 4]} />
      </mesh>
      <mesh material={bodyMat} position={[0.1, 0.62, 0.55]} rotation={[0, 0, -0.2]} castShadow>
        <coneGeometry args={[0.05, 0.14, 4]} />
      </mesh>

      {/* Tail */}
      <mesh material={bodyMat} position={[0, 0.4, -0.6]} rotation={[-0.8, 0, 0]} castShadow>
        <capsuleGeometry args={[0.04, 0.35, 4, 6]} />
      </mesh>
      <mesh material={bellyMat} position={[0, 0.42, -0.85]} rotation={[-1.2, 0, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
      </mesh>

      {/* Legs (4 legs, on ground) */}
      {[[-0.14, 0.15, 0.25], [0.14, 0.15, 0.25], [-0.14, 0.15, -0.25], [0.14, 0.15, -0.25]].map((pos, i) => (
        <mesh key={i} material={bodyMat} position={pos as [number, number, number]} castShadow>
          <capsuleGeometry args={[0.04, 0.28, 4, 6]} />
        </mesh>
      ))}
      {/* Paws */}
      {[[-0.14, 0.03, 0.28], [0.14, 0.03, 0.28], [-0.14, 0.03, -0.22], [0.14, 0.03, -0.22]].map((pos, i) => (
        <mesh key={`paw-${i}`} material={bodyMat} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.045, 6, 4]} scale={[1, 0.5, 1.2]} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// FOX (improved)
// ============================================
function FoxModel({ color }: { color: string }) {
  const bodyMat = useMemo(() => createToonMaterial(color), [color]);
  const whiteMat = useMemo(() => createToonMaterial('#fff8ee'), []);
  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffaa00' }), []);
  const noseMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#222222' }), []);

  return (
    <group>
      {/* Body (slender) */}
      <mesh material={bodyMat} position={[0, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
      </mesh>
      {/* White belly */}
      <mesh material={whiteMat} position={[0, 0.22, 0.05]}>
        <sphereGeometry args={[0.12, 8, 6]} scale={[0.8, 0.5, 1.2]} />
      </mesh>

      {/* Neck */}
      <mesh material={bodyMat} position={[0, 0.35, 0.35]} rotation={[0.3, 0, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.15, 4, 6]} />
      </mesh>

      {/* Head */}
      <mesh material={bodyMat} position={[0, 0.42, 0.5]} rotation={[0.3, 0, 0]} castShadow>
        <sphereGeometry args={[0.13, 8, 8]} scale={[0.85, 0.8, 1.0]} />
      </mesh>
      {/* Snout */}
      <mesh material={whiteMat} position={[0, 0.38, 0.62]} rotation={[0.4, 0, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.12, 4, 6]} />
      </mesh>
      <mesh material={noseMat} position={[0, 0.42, 0.72]}>
        <sphereGeometry args={[0.025, 6, 6]} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.07, 0.47, 0.6]} material={eyeMat}>
        <sphereGeometry args={[0.028, 6, 6]} />
      </mesh>
      <mesh position={[0.07, 0.47, 0.6]} material={eyeMat}>
        <sphereGeometry args={[0.028, 6, 6]} />
      </mesh>

      {/* Large ears */}
      <mesh material={bodyMat} position={[-0.09, 0.56, 0.45]} rotation={[0, 0, 0.25]} castShadow>
        <coneGeometry args={[0.055, 0.18, 4]} />
      </mesh>
      <mesh material={bodyMat} position={[0.09, 0.56, 0.45]} rotation={[0, 0, -0.25]} castShadow>
        <coneGeometry args={[0.055, 0.18, 4]} />
      </mesh>
      {/* Inner ear */}
      <mesh position={[-0.09, 0.55, 0.47]} rotation={[0, 0, 0.25]}>
        <coneGeometry args={[0.03, 0.12, 4]} />
        <meshBasicMaterial color="#ffccaa" />
      </mesh>
      <mesh position={[0.09, 0.55, 0.47]} rotation={[0, 0, -0.25]}>
        <coneGeometry args={[0.03, 0.12, 4]} />
        <meshBasicMaterial color="#ffccaa" />
      </mesh>

      {/* Bushy tail */}
      <group position={[0, 0.35, -0.55]} rotation={[-0.6, 0, 0]}>
        <mesh material={bodyMat} castShadow>
          <capsuleGeometry args={[0.1, 0.4, 4, 6]} />
        </mesh>
        <mesh material={whiteMat} position={[0, -0.15, 0]}>
          <sphereGeometry args={[0.1, 6, 6]} />
        </mesh>
      </group>

      {/* Legs */}
      {[[-0.1, 0.12, 0.22], [0.1, 0.12, 0.22], [-0.1, 0.12, -0.22], [0.1, 0.12, -0.22]].map((pos, i) => (
        <mesh key={i} material={bodyMat} position={pos as [number, number, number]} castShadow>
          <capsuleGeometry args={[0.035, 0.22, 4, 6]} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// SCORPION (improved)
// ============================================
function ScorpionModel({ color }: { color: string }) {
  const leftClawRef = useRef<THREE.Group>(null);
  const rightClawRef = useRef<THREE.Group>(null);
  const bodyMat = useMemo(() => createToonMaterial(color), [color]);
  const stingerMat = useMemo(() => createToonMaterial('#ff6633'), [color]);
  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ff3333' }), []);
  const clawMat = useMemo(() => createToonMaterial(darkenColor(color, 0.8)), [color]);

  // Animate pincers
  useFrame(() => {
    const t = Date.now() * 0.003;
    if (leftClawRef.current) {
      leftClawRef.current.rotation.z = -0.4 + Math.sin(t * 2) * 0.15;
    }
    if (rightClawRef.current) {
      rightClawRef.current.rotation.z = 0.4 - Math.sin(t * 2) * 0.15;
    }
  });

  return (
    <group>
      {/* Main body (flat, segmented) */}
      <mesh material={bodyMat} position={[0, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
      </mesh>
      {/* Body segment details */}
      {[-0.15, 0, 0.15, 0.3].map((z, i) => (
        <mesh key={i} material={bodyMat} position={[0, 0.2, z]} castShadow>
          <sphereGeometry args={[0.2 - Math.abs(z) * 0.15, 8, 6]} scale={[1, 0.5, 1]} />
        </mesh>
      ))}

      {/* Head */}
      <mesh material={bodyMat} position={[0, 0.22, 0.45]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} scale={[1.1, 0.6, 1.0]} />
      </mesh>

      {/* Eyes (multiple) */}
      <mesh position={[-0.08, 0.3, 0.52]} material={eyeMat}>
        <sphereGeometry args={[0.025, 6, 6]} />
      </mesh>
      <mesh position={[0.08, 0.3, 0.52]} material={eyeMat}>
        <sphereGeometry args={[0.025, 6, 6]} />
      </mesh>
      <mesh position={[-0.12, 0.27, 0.5]} material={eyeMat}>
        <sphereGeometry args={[0.018, 6, 6]} />
      </mesh>
      <mesh position={[0.12, 0.27, 0.5]} material={eyeMat}>
        <sphereGeometry args={[0.018, 6, 6]} />
      </mesh>

      {/* Pincers */}
      <group ref={leftClawRef} position={[-0.35, 0.25, 0.35]} rotation={[0, 0, -0.5]}>
        <mesh material={clawMat} castShadow>
          <capsuleGeometry args={[0.04, 0.25, 4, 6]} />
        </mesh>
        {/* Pincer claw top */}
        <mesh material={clawMat} position={[-0.06, 0.08, 0]} rotation={[0, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.03, 0.12, 4, 6]} />
        </mesh>
        {/* Pincer claw bottom */}
        <mesh material={clawMat} position={[-0.06, -0.08, 0]} rotation={[0, 0, -0.3]} castShadow>
          <capsuleGeometry args={[0.03, 0.12, 4, 6]} />
        </mesh>
      </group>
      <group ref={rightClawRef} position={[0.35, 0.25, 0.35]} rotation={[0, 0, 0.5]}>
        <mesh material={clawMat} castShadow>
          <capsuleGeometry args={[0.04, 0.25, 4, 6]} />
        </mesh>
        <mesh material={clawMat} position={[0.06, 0.08, 0]} rotation={[0, 0, -0.3]} castShadow>
          <capsuleGeometry args={[0.03, 0.12, 4, 6]} />
        </mesh>
        <mesh material={clawMat} position={[0.06, -0.08, 0]} rotation={[0, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.03, 0.12, 4, 6]} />
        </mesh>
      </group>

      {/* Tail (curved segments going up and back) */}
      <group position={[0, 0.25, -0.5]} rotation={[0.6, 0, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} material={bodyMat} position={[0, -i * 0.12, 0]} rotation={[0.15 * i, 0, 0]} castShadow>
            <sphereGeometry args={[0.07 - i * 0.008, 6, 6]} />
          </mesh>
        ))}
        {/* Stinger */}
        <mesh material={stingerMat} position={[0, -0.65, -0.05]} rotation={[0.6, 0, 0]} castShadow>
          <coneGeometry args={[0.04, 0.14, 4]} />
        </mesh>
      </group>

      {/* Legs (8 legs) */}
      {[[-0.2, 0.1, 0.2], [0.2, 0.1, 0.2], [-0.22, 0.1, 0], [0.22, 0.1, 0],
       [-0.22, 0.1, -0.15], [0.22, 0.1, -0.15], [-0.2, 0.1, -0.3], [0.2, 0.1, -0.3]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh material={bodyMat} rotation={[pos[0]! < 0 ? 0.4 : -0.4, 0, pos[2]! > 0 ? 0.2 : -0.2]} castShadow>
            <capsuleGeometry args={[0.02, 0.15, 4, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============================================
// POLAR BEAR (improved, on all fours)
// ============================================
function PolarBearModel({ color, isHostile }: { color: string; isHostile: boolean }) {
  const bodyMat = useMemo(() => createToonMaterial(color), [color]);
  const noseMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#333333' }), []);
  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: isHostile ? '#ff3333' : '#222222',
  }), [isHostile]);

  return (
    <group>
      {/* Main body (large, bulky) */}
      <mesh material={bodyMat} position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.4, 0.9, 4, 8]} />
      </mesh>

      {/* Head */}
      <mesh material={bodyMat} position={[0, 0.55, 0.7]} castShadow>
        <sphereGeometry args={[0.25, 8, 8]} scale={[0.9, 0.85, 1.0]} />
      </mesh>
      {/* Snout */}
      <mesh material={bodyMat} position={[0, 0.48, 0.9]} castShadow>
        <sphereGeometry args={[0.15, 8, 6]} scale={[0.8, 0.7, 1.0]} />
      </mesh>
      {/* Nose */}
      <mesh material={noseMat} position={[0, 0.52, 1.02]}>
        <sphereGeometry args={[0.04, 6, 6]} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.12, 0.6, 0.88]} material={eyeMat}>
        <sphereGeometry args={[0.03, 6, 6]} />
      </mesh>
      <mesh position={[0.12, 0.6, 0.88]} material={eyeMat}>
        <sphereGeometry args={[0.03, 6, 6]} />
      </mesh>
      {/* Ears (small round) */}
      <mesh material={bodyMat} position={[-0.18, 0.75, 0.65]} castShadow>
        <sphereGeometry args={[0.07, 6, 6]} />
      </mesh>
      <mesh material={bodyMat} position={[0.18, 0.75, 0.65]} castShadow>
        <sphereGeometry args={[0.07, 6, 6]} />
      </mesh>

      {/* Shoulder hump */}
      <mesh material={bodyMat} position={[0, 0.6, 0.3]} castShadow>
        <sphereGeometry args={[0.3, 8, 6]} scale={[1, 0.7, 1.2]} />
      </mesh>

      {/* Tail (small) */}
      <mesh material={bodyMat} position={[0, 0.5, -0.75]}>
        <sphereGeometry args={[0.08, 6, 6]} />
      </mesh>

      {/* Thick legs */}
      {[[-0.28, 0.2, 0.35], [0.28, 0.2, 0.35], [-0.28, 0.2, -0.35], [0.28, 0.2, -0.35]].map((pos, i) => (
        <group key={i}>
          <mesh material={bodyMat} position={pos as [number, number, number]} castShadow>
            <capsuleGeometry args={[0.1, 0.3, 4, 6]} />
          </mesh>
          {/* Paw */}
          <mesh material={bodyMat} position={[pos[0], 0.04, pos[2]! + (pos[2]! > 0 ? 0.05 : -0.05)]}>
            <sphereGeometry args={[0.1, 6, 4]} scale={[1, 0.4, 1.2]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============================================
// EAGLE (improved with wing flapping)
// ============================================
function EagleModel({ color }: { color: string }) {
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const bodyMat = useMemo(() => createToonMaterial(color), [color]);
  const wingMat = useMemo(() => createToonMaterial(darkenColor(color, 0.85)), [color]);
  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffaa00' }), []);
  const beakMat = useMemo(() => createToonMaterial('#ddaa33'), []);
  const talonMat = useMemo(() => createToonMaterial('#554422'), []);

  // Wing flap animation
  useFrame(() => {
    const t = Date.now() * 0.002;
    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = 0.3 + Math.sin(t * 2) * 0.2;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -0.3 - Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group>
      {/* Body */}
      <mesh material={bodyMat} position={[0, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
      </mesh>

      {/* Head */}
      <mesh material={bodyMat} position={[0, 0.55, 0.35]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} scale={[0.8, 0.8, 1.0]} />
      </mesh>
      {/* Beak */}
      <mesh material={beakMat} position={[0, 0.5, 0.48]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.03, 0.12, 4]} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.06, 0.58, 0.42]} material={eyeMat}>
        <sphereGeometry args={[0.02, 6, 6]} />
      </mesh>
      <mesh position={[0.06, 0.58, 0.42]} material={eyeMat}>
        <sphereGeometry args={[0.02, 6, 6]} />
      </mesh>

      {/* Tail feathers */}
      <mesh material={wingMat} position={[0, 0.45, -0.4]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[0.2, 0.25]} />
      </mesh>
      <mesh material={wingMat} position={[0, 0.4, -0.38]} rotation={[0.4, 0, 0]}>
        <planeGeometry args={[0.15, 0.2]} />
      </mesh>

      {/* Left wing */}
      <group ref={leftWingRef} position={[-0.15, 0.55, -0.05]} rotation={[0, 0, 0.3]}>
        <mesh material={wingMat} castShadow>
          <planeGeometry args={[0.6, 0.18]} />
        </mesh>
        {/* Wing detail */}
        <mesh material={bodyMat} position={[-0.2, 0, 0]}>
          <planeGeometry args={[0.2, 0.15]} />
        </mesh>
      </group>
      {/* Right wing */}
      <group ref={rightWingRef} position={[0.15, 0.55, -0.05]} rotation={[0, 0, -0.3]}>
        <mesh material={wingMat} castShadow>
          <planeGeometry args={[0.6, 0.18]} />
        </mesh>
        <mesh material={bodyMat} position={[0.2, 0, 0]}>
          <planeGeometry args={[0.2, 0.15]} />
        </mesh>
      </group>

      {/* Talons */}
      {[[-0.08, 0.1, 0.15], [0.08, 0.1, 0.15]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh material={bodyMat} castShadow>
            <capsuleGeometry args={[0.02, 0.15, 4, 6]} />
          </mesh>
          {/* Talons */}
          {[-0.03, 0, 0.03].map((x, j) => (
            <mesh key={j} material={talonMat} position={[x, -0.1, 0.04]} rotation={[0.5, 0, 0]}>
              <coneGeometry args={[0.008, 0.05, 3]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ============================================
// SNOW OWL (improved)
// ============================================
function OwlModel({ color }: { color: string }) {
  const bodyMat = useMemo(() => createToonMaterial(color), [color]);
  const faceMat = useMemo(() => createToonMaterial('#ffffff'), []);
  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffaa00' }), []);
  const pupilMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#111111' }), []);
  const beakMat = useMemo(() => createToonMaterial('#cc9933'), []);

  return (
    <group>
      {/* Round body */}
      <mesh material={bodyMat} position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.22, 8, 8]} scale={[1, 1.2, 0.9]} />
      </mesh>

      {/* Head (round) */}
      <mesh material={bodyMat} position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 8]} />
      </mesh>

      {/* Facial disc (flat face discs like real owls) */}
      <mesh material={faceMat} position={[-0.08, 0.55, 0.14]}>
        <circleGeometry args={[0.1, 12]} />
      </mesh>
      <mesh material={faceMat} position={[0.08, 0.55, 0.14]}>
        <circleGeometry args={[0.1, 12]} />
      </mesh>

      {/* Large eyes */}
      <mesh position={[-0.08, 0.56, 0.17]} material={eyeMat}>
        <sphereGeometry args={[0.065, 8, 6]} />
      </mesh>
      <mesh position={[0.08, 0.56, 0.17]} material={eyeMat}>
        <sphereGeometry args={[0.065, 8, 6]} />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.08, 0.56, 0.2]} material={pupilMat}>
        <sphereGeometry args={[0.03, 8, 6]} />
      </mesh>
      <mesh position={[0.08, 0.56, 0.2]} material={pupilMat}>
        <sphereGeometry args={[0.03, 8, 6]} />
      </mesh>

      {/* Beak */}
      <mesh material={beakMat} position={[0, 0.5, 0.2]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.025, 0.06, 4]} />
      </mesh>

      {/* Ear tufts */}
      <mesh material={bodyMat} position={[-0.1, 0.72, -0.02]} rotation={[0, 0, 0.15]} castShadow>
        <coneGeometry args={[0.04, 0.12, 4]} />
      </mesh>
      <mesh material={bodyMat} position={[0.1, 0.72, -0.02]} rotation={[0, 0, -0.15]} castShadow>
        <coneGeometry args={[0.04, 0.12, 4]} />
      </mesh>

      {/* Wings (with tufts at top) */}
      <mesh material={bodyMat} position={[-0.24, 0.4, -0.05]} rotation={[0.1, 0, 0.2]} castShadow>
        <planeGeometry args={[0.2, 0.3]} />
      </mesh>
      <mesh material={bodyMat} position={[0.24, 0.4, -0.05]} rotation={[0.1, 0, -0.2]} castShadow>
        <planeGeometry args={[0.2, 0.3]} />
      </mesh>
      {/* Wing tufts */}
      <mesh material={bodyMat} position={[-0.2, 0.6, 0]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.03, 0.08, 4]} />
      </mesh>
      <mesh material={bodyMat} position={[0.2, 0.6, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.03, 0.08, 4]} />
      </mesh>

      {/* Talons */}
      <group position={[0, 0.08, 0.08]}>
        <mesh material={createToonMaterial('#ddc')} castShadow>
          <capsuleGeometry args={[0.015, 0.1, 4, 6]} />
        </mesh>
      </group>
    </group>
  );
}

// ============================================
// ANIMAL NPC (dispatcher)
// ============================================
function AnimalNPC({ npc }: { npc: NPCState }) {
  const groupRef = useRef<THREE.Group>(null);
  const animTime = useRef(Math.random() * 100);

  useFrame((_, delta) => {
    if (!groupRef.current || !npc.isAlive) return;

    groupRef.current.position.set(npc.position[0], npc.position[1], npc.position[2]);

    if (!npc.isAggroed) {
      animTime.current += delta * 3;
      groupRef.current.position.y = npc.position[1] + Math.sin(animTime.current) * 0.03;
      groupRef.current.rotation.z = Math.sin(animTime.current * 0.7) * 0.03;
    }
  });

  if (!npc.isAlive) return null;

  const s = npc.scale;

  const renderAnimal = () => {
    switch (npc.id) {
      case 'wolf':
        return <WolfModel color={npc.color} isHostile={npc.isHostile} />;
      case 'fox':
        return <FoxModel color={npc.color} />;
      case 'scorpion':
        return <ScorpionModel color={npc.color} />;
      case 'polar_bear':
        return <PolarBearModel color={npc.color} isHostile={npc.isHostile} />;
      case 'eagle':
        return <EagleModel color={npc.color} />;
      case 'snow_owl':
        return <OwlModel color={npc.color} />;
      default:
        return (
          <mesh material={createToonMaterial(npc.color)} position={[0, 0.5, 0]}>
            <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
          </mesh>
        );
    }
  };

  return (
    <group ref={groupRef}>
      <group scale={[s, s, s]}>
        {renderAnimal()}
      </group>

      {/* Name */}
      <Html position={[0, s * 1.5 + 0.3, 0]} center>
        <div className="text-center pointer-events-none select-none">
          <div
            className="text-xs font-bold text-white px-2 py-0.5 rounded bg-black/50 whitespace-nowrap"
            style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
          >
            {npc.name}
          </div>
          {npc.isHostile && npc.stats && (
            <div className="w-20 h-1 bg-black/50 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(npc.currentHp / npc.stats.maxHp) * 100}%`,
                  background: 'linear-gradient(90deg, #ff4444, #ff6666)',
                }}
              />
            </div>
          )}
          {!npc.isHostile && (
            <div className="text-[10px] text-yellow-300/60 mt-0.5">[E] Говорить</div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ============================================
// NPC CONTAINER
// ============================================
export function NPCs() {
  const npcStates = useGameStore((s) => s.npcStates);

  if (npcStates.length === 0) return null;

  return (
    <group>
      {npcStates.map((npc) =>
        npc.type === 'human' ? (
          <HumanNPC key={npc.id} npc={npc} />
        ) : (
          <AnimalNPC key={npc.id} npc={npc} />
        )
      )}
    </group>
  );
}