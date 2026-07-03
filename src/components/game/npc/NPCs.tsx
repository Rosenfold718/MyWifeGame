'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import { Html } from '@react-three/drei';
import type { NPCState } from '@/stores/gameStore';

function createToonMaterial(color: string) {
  const gradientData = new Uint8Array([0, 100, 200, 255]);
  const gradientMap = new THREE.DataTexture(gradientData, 4, 1, THREE.RedFormat);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;
  return new THREE.MeshToonMaterial({ color, gradientMap });
}

function HumanNPC({ npc }: { npc: NPCState }) {
  const groupRef = useRef<THREE.Group>(null);
  const animTime = useRef(Math.random() * 100);

  const bodyMat = useMemo(() => createToonMaterial(npc.color), [npc.color]);
  const skinMat = useMemo(() => createToonMaterial('#ffe0bd'), []);

  useFrame((_, delta) => {
    if (!groupRef.current || !npc.isAlive) return;

    groupRef.current.position.set(npc.position[0], npc.position[1], npc.position[2]);

    // Idle animation
    if (!npc.isAggroed) {
      animTime.current += delta * 2;
      groupRef.current.position.y = npc.position[1] + Math.sin(animTime.current) * 0.05;
    }
  });

  if (!npc.isAlive) return null;

  const s = npc.scale;

  return (
    <group ref={groupRef}>
      <group scale={[s, s, s]}>
        {/* Body */}
        <mesh material={bodyMat} position={[0, 1.1, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.5, 4, 8]} />
        </mesh>
        {/* Head */}
        <mesh material={skinMat} position={[0, 1.85, 0]} castShadow>
          <sphereGeometry args={[0.28, 8, 8]} />
        </mesh>
        {/* Hair */}
        <mesh material={createToonMaterial('#333333')} position={[0, 1.95, 0]}>
          <sphereGeometry args={[0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.09, 1.88, 0.24]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshBasicMaterial color="#4466ff" />
        </mesh>
        <mesh position={[0.09, 1.88, 0.24]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshBasicMaterial color="#4466ff" />
        </mesh>
        {/* Left arm */}
        <group position={[-0.4, 1.2, 0]}>
          <mesh material={bodyMat} position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.3, 4, 6]} />
          </mesh>
          <mesh material={skinMat} position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.07, 6, 6]} />
          </mesh>
        </group>
        {/* Right arm */}
        <group position={[0.4, 1.2, 0]}>
          <mesh material={bodyMat} position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.3, 4, 6]} />
          </mesh>
          <mesh material={skinMat} position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.07, 6, 6]} />
          </mesh>
        </group>
        {/* Legs */}
        <mesh material={createToonMaterial('#443322')} position={[-0.12, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.35, 4, 6]} />
        </mesh>
        <mesh material={createToonMaterial('#443322')} position={[0.12, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.35, 4, 6]} />
        </mesh>
      </group>

      {/* Name */}
      <Html position={[0, s * 2.5 + 0.3, 0]} center>
        <div className="text-center pointer-events-none select-none">
          <div className="text-xs font-bold text-white px-2 py-0.5 rounded bg-black/50 whitespace-nowrap"
            style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>
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

function AnimalNPC({ npc }: { npc: NPCState }) {
  const groupRef = useRef<THREE.Group>(null);
  const animTime = useRef(Math.random() * 100);

  const bodyMat = useMemo(() => createToonMaterial(npc.color), [npc.color]);

  useFrame((_, delta) => {
    if (!groupRef.current || !npc.isAlive) return;

    groupRef.current.position.set(npc.position[0], npc.position[1], npc.position[2]);

    // Idle animation
    if (!npc.isAggroed) {
      animTime.current += delta * 3;
      groupRef.current.position.y = npc.position[1] + Math.sin(animTime.current) * 0.03;
      // Slight body sway
      groupRef.current.rotation.z = Math.sin(animTime.current * 0.7) * 0.05;
    }
  });

  if (!npc.isAlive) return null;

  const s = npc.scale;

  // Different animal shapes based on name
  const isWolf = npc.id === 'wolf';
  const isFox = npc.id === 'fox';
  const isScorpion = npc.id === 'scorpion';
  const isBear = npc.id === 'polar_bear';
  const isOwl = npc.id === 'snow_owl';
  const isEagle = npc.id === 'eagle';

  return (
    <group ref={groupRef}>
      <group scale={[s, s, s]}>
        {/* Main body */}
        <mesh material={bodyMat} position={[0, 0.5, 0]} castShadow>
          {(isWolf || isFox || isEagle) && <capsuleGeometry args={[0.25, 0.6, 4, 8]} />}
          {isBear && <capsuleGeometry args={[0.5, 0.8, 4, 8]} />}
          {isScorpion && <capsuleGeometry args={[0.3, 0.5, 4, 8]} />}
          {isOwl && <sphereGeometry args={[0.25, 8, 8]} />}
        </mesh>

        {/* Head */}
        <mesh material={bodyMat} position={[0, 0.6, isBear ? 0.8 : 0.5]} castShadow>
          {(isWolf || isFox) && <sphereGeometry args={[0.18, 8, 8]} />}
          {isBear && <sphereGeometry args={[0.35, 8, 8]} />}
          {isScorpion && <sphereGeometry args={[0.2, 8, 8]} />}
          {(isOwl || isEagle) && <sphereGeometry args={[0.18, 8, 8]} />}
        </mesh>

        {/* Eyes */}
        <mesh position={[isBear ? -0.12 : -0.07, isBear ? 0.7 : 0.65, isBear ? 1.1 : 0.65]}>
          <sphereGeometry args={[isBear ? 0.05 : 0.03, 6, 6]} />
          <meshBasicMaterial color={npc.isHostile ? '#ff3333' : '#ffaa00'} />
        </mesh>
        <mesh position={[isBear ? 0.12 : 0.07, isBear ? 0.7 : 0.65, isBear ? 1.1 : 0.65]}>
          <sphereGeometry args={[isBear ? 0.05 : 0.03, 6, 6]} />
          <meshBasicMaterial color={npc.isHostile ? '#ff3333' : '#ffaa00'} />
        </mesh>

        {/* Ears */}
        {(isWolf || isFox || isOwl) && (
          <>
            <mesh material={bodyMat} position={[-0.12, 0.8, 0.4]} castShadow>
              <coneGeometry args={[0.06, 0.15, 4]} />
            </mesh>
            <mesh material={bodyMat} position={[0.12, 0.8, 0.4]} castShadow>
              <coneGeometry args={[0.06, 0.15, 4]} />
            </mesh>
          </>
        )}

        {/* Legs */}
        {!isOwl && !isEagle && (
          <>
            {[-0.15, 0.15].map((x, i) => (
              <group key={i}>
                <mesh material={bodyMat} position={[x, 0.15, -0.2]} castShadow>
                  <capsuleGeometry args={[isBear ? 0.1 : 0.05, 0.3, 4, 6]} />
                </mesh>
                <mesh material={bodyMat} position={[x, 0.15, 0.2]} castShadow>
                  <capsuleGeometry args={[isBear ? 0.1 : 0.05, 0.3, 4, 6]} />
                </mesh>
              </group>
            ))}
          </>
        )}

        {/* Wings */}
        {isOwl && (
          <>
            <mesh material={bodyMat} position={[-0.3, 0.6, -0.1]} rotation={[0, 0, 0.3]} castShadow>
              <planeGeometry args={[0.4, 0.3]} />
            </mesh>
            <mesh material={bodyMat} position={[0.3, 0.6, -0.1]} rotation={[0, 0, -0.3]} castShadow>
              <planeGeometry args={[0.4, 0.3]} />
            </mesh>
          </>
        )}
        {isEagle && (
          <>
            <mesh material={bodyMat} position={[-0.3, 0.6, -0.1]} rotation={[0, 0, 0.4]} castShadow>
              <planeGeometry args={[0.5, 0.2]} />
            </mesh>
            <mesh material={bodyMat} position={[0.3, 0.6, -0.1]} rotation={[0, 0, -0.4]} castShadow>
              <planeGeometry args={[0.5, 0.2]} />
            </mesh>
          </>
        )}

        {/* Scorpion tail */}
        {isScorpion && (
          <group position={[0, 0.6, -0.6]} rotation={[0.5, 0, 0]}>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} material={bodyMat} position={[0, -i * 0.15, 0]} castShadow>
                <sphereGeometry args={[0.08 - i * 0.015, 6, 6]} />
              </mesh>
            ))}
            {/* Stinger */}
            <mesh material={createToonMaterial('#ff6633')} position={[0, -0.65, 0]} castShadow>
              <coneGeometry args={[0.04, 0.12, 4]} />
            </mesh>
          </group>
        )}

        {/* Fox tail */}
        {isFox && (
          <mesh material={bodyMat} position={[0, 0.5, -0.6]} rotation={[0.3, 0, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.4, 4, 6]} />
          </mesh>
        )}

        {/* Scorpion claws */}
        {isScorpion && (
          <>
            <mesh material={bodyMat} position={[-0.4, 0.5, 0.4]} rotation={[0, 0, -0.8]} castShadow>
              <capsuleGeometry args={[0.04, 0.2, 4, 6]} />
            </mesh>
            <mesh material={bodyMat} position={[0.4, 0.5, 0.4]} rotation={[0, 0, 0.8]} castShadow>
              <capsuleGeometry args={[0.04, 0.2, 4, 6]} />
            </mesh>
          </>
        )}
      </group>

      {/* Name */}
      <Html position={[0, s * 1.5 + 0.3, 0]} center>
        <div className="text-center pointer-events-none select-none">
          <div className="text-xs font-bold text-white px-2 py-0.5 rounded bg-black/50 whitespace-nowrap"
            style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>
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