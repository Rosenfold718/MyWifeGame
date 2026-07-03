'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';
import { Terrain } from './Terrain';
import { Player } from '../player/Player';
import { EnvironmentObjects } from './EnvironmentObjects';
import { NPCs } from '../npc/NPCs';
import { Projectiles } from '../combat/Projectiles';
import { DamageNumbers } from '../combat/DamageNumbers';
import { HitExplosion, DodgeTrail, HealEffect, ElementAura } from '../effects/ParticleEffects';
import { getTerrainHeight } from '@/lib/game/noise';
import { sharedGradientMap } from '@/lib/game/toonMaterial';
import { Sky } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

// ============================================
// AAA CAMERA CONTROLLER
// Smooth spring-based follow, collision-aware
// ============================================
function CameraController() {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(-0.35);
  const distance = useRef(8);
  const targetDistance = useRef(8);
  const currentPos = useRef(new THREE.Vector3(0, 5, 10));
  const currentLookAt = useRef(new THREE.Vector3());
  const isPointerLocked = useRef(false);
  const velocity = useRef(new THREE.Vector3());
  const playerPosition = useGameStore((s) => s.playerPosition);
  const isDodging = useGameStore((s) => s.isDodging);
  const isSprinting = useGameStore((s) => s.isSprinting);
  const comboCount = useGameStore((s) => s.comboCount);

  useEffect(() => {
    const canvas = gl.domElement;

    const onClick = () => {
      if (!isPointerLocked.current) canvas.requestPointerLock();
    };
    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      const sens = 0.002;
      yaw.current -= e.movementX * sens;
      pitch.current = Math.max(-1.2, Math.min(0.5, pitch.current - e.movementY * sens));
      useGameStore.getState().setPlayerRotation(yaw.current);
    };
    const onWheel = (e: WheelEvent) => {
      targetDistance.current = Math.max(3, Math.min(18, targetDistance.current + e.deltaY * 0.008));
    };

    canvas.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel);

    return () => {
      canvas.removeEventListener('click', onClick);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  useFrame(({ camera }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);

    const px = playerPosition[0];
    const py = playerPosition[1];
    const pz = playerPosition[2];

    // Combo camera shake
    const shakeIntensity = comboCount === 3 ? 0.03 : 0;

    // Distance lerp
    const targetDist = isDodging ? 6 : isSprinting ? 10 : targetDistance.current;
    distance.current += (targetDist - distance.current) * 3 * dt;

    // Desired camera position
    const camOffsetX = Math.sin(yaw.current) * Math.cos(pitch.current) * distance.current;
    const camOffsetY = Math.sin(pitch.current) * distance.current;
    const camOffsetZ = Math.cos(yaw.current) * Math.cos(pitch.current) * distance.current;

    const desiredPos = new THREE.Vector3(
      px + camOffsetX,
      py + 2 + camOffsetY,
      pz + camOffsetZ
    );

    // Add shake
    if (shakeIntensity > 0) {
      desiredPos.x += (Math.random() - 0.5) * shakeIntensity;
      desiredPos.y += (Math.random() - 0.5) * shakeIntensity;
    }

    // Spring physics for smooth follow
    const stiffness = isDodging ? 25 : 12;
    const damping = isDodging ? 0.7 : 0.85;
    const springForce = new THREE.Vector3().subVectors(desiredPos, currentPos.current).multiplyScalar(stiffness);
    velocity.current.multiplyScalar(damping).add(springForce.multiplyScalar(dt));
    currentPos.current.add(velocity.current.clone().multiplyScalar(dt));

    // Ground clamp (don't go below terrain + 1)
    const groundY = getTerrainHeight(currentPos.current.x, currentPos.current.z) + 1;
    if (currentPos.current.y < groundY) {
      currentPos.current.y = groundY;
      velocity.current.y = 0;
    }

    // Smooth look-at
    const desiredLook = new THREE.Vector3(px, py + 1.2, pz);
    currentLookAt.current.lerp(desiredLook, isDodging ? 0.4 : 0.15);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);

    // FOV change for sprint
    const targetFov = isSprinting ? 70 : 60;
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov += (targetFov - cam.fov) * 3 * dt;
    cam.updateProjectionMatrix();
  });

  return null;
}

// ============================================
// AAA SCENE SETUP (fog + atmosphere)
// ============================================
function SceneSetup() {
  useFrame(({ scene }) => {
    if (!scene.fog) {
      scene.fog = new THREE.FogExp2(0x1a0a2e, 0.0018);
    }
    const biome = useGameStore.getState().currentBiome;
    const targetColor = new THREE.Color(
      biome === 'forest' ? 0x1a3a15 :
      biome === 'desert' ? 0xc49427 :
      0xa8c0d0
    );
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.lerp(targetColor, 0.02);
    }
  });
  return null;
}

// ============================================
// DYNAMIC LIGHTING (improved: blue fill + player light)
// ============================================
function Lighting() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const playerLightRef = useRef<THREE.PointLight>(null);

  const playerPosition = useGameStore((s) => s.playerPosition);

  useFrame(() => {
    if (!lightRef.current) return;
    const biome = useGameStore.getState().currentBiome;
    const targets: Record<string, { color: THREE.Color; intensity: number }> = {
      forest: { color: new THREE.Color(0xffeedd), intensity: 1.5 },
      desert: { color: new THREE.Color(0xffddaa), intensity: 2.0 },
      tundra: { color: new THREE.Color(0xccddff), intensity: 1.2 },
    };
    const t = targets[biome];
    lightRef.current.color.lerp(t.color, 0.02);
    lightRef.current.intensity += (t.intensity - lightRef.current.intensity) * 0.02;

    // Player-following point light for better visibility
    if (playerLightRef.current) {
      playerLightRef.current.position.set(playerPosition[0], playerPosition[1] + 3, playerPosition[2]);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#c8b0e8" />
      <directionalLight
        ref={lightRef}
        position={[50, 80, 30]}
        intensity={1.5}
        color="#ffeedd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      {/* Blue fill light from opposite side */}
      <directionalLight
        position={[-40, 60, -30]}
        intensity={0.3}
        color="#6688cc"
      />
      <hemisphereLight groundColor="#443344" skyColor="#8888cc" intensity={0.35} />
      {/* Player-following point light */}
      <pointLight
        ref={playerLightRef}
        intensity={0.6}
        distance={15}
        color="#ffffff"
        position={[0, 3, 0]}
      />
    </>
  );
}

// ============================================
// AAA INPUT HANDLER
// Camera-relative movement with smooth acceleration
// ============================================
function InputHandler() {
  const keys = useRef<Set<string>>(new Set());
  const moveDir = useRef(new THREE.Vector3());
  const currentSpeed = useRef(0);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const stats = useGameStore((s) => s.stats);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keys.current.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const store = useGameStore.getState();
    if (store.currentScreen !== 'playing') return;
    if (store.isDialogueOpen || store.isInventoryOpen) return;
    if (store.isDodging) return;

    const k = keys.current;
    const rot = store.playerRotation;

    // Camera-relative input direction
    let inputX = 0;
    let inputZ = 0;
    if (k.has('KeyW') || k.has('ArrowUp')) inputZ -= 1;
    if (k.has('KeyS') || k.has('ArrowDown')) inputZ += 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) inputX -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) inputX += 1;

    // Rotate input by camera yaw (camera-relative movement)
    const sinR = Math.sin(rot);
    const cosR = Math.cos(rot);
    const worldX = inputX * cosR + inputZ * sinR;
    const worldZ = -inputX * sinR + inputZ * cosR;

    const hasInput = worldX !== 0 || worldZ !== 0;

    // Normalize
    const inputLen = Math.sqrt(worldX * worldX + worldZ * worldZ) || 1;
    const normX = hasInput ? worldX / inputLen : 0;
    const normZ = hasInput ? worldZ / inputLen : 0;

    // Sprint
    const wantSprint = k.has('ShiftLeft') && hasInput;
    store.setSprinting(wantSprint);

    // Target speed with smooth acceleration/deceleration
    const baseSpeed = stats.speed;
    const maxSpeed = wantSprint ? baseSpeed * 1.6 : baseSpeed;
    const accel = hasInput ? (wantSprint ? 30 : 22) : 25; // deceleration is faster
    const targetSpeed = hasInput ? maxSpeed : 0;

    // Smooth speed interpolation
    if (hasInput) {
      currentSpeed.current = Math.min(currentSpeed.current + accel * delta, targetSpeed);
    } else {
      currentSpeed.current = Math.max(currentSpeed.current - accel * 1.5 * delta, 0);
    }

    // Stamina drain for sprinting
    if (wantSprint && currentSpeed.current > baseSpeed) {
      store.useStamina(15 * delta);
      if (store.stats.stamina <= 0) {
        store.setSprinting(false);
      }
    }

    // Apply movement
    if (currentSpeed.current > 0.1) {
      const dx = normX * currentSpeed.current * delta;
      const dz = normZ * currentSpeed.current * delta;
      const newX = playerPosition[0] + dx;
      const newZ = playerPosition[2] + dz;

      // World bounds
      const half = 150;
      const clampedX = Math.max(-half, Math.min(half, newX));
      const clampedZ = Math.max(-half, Math.min(half, newZ));
      const groundY = getTerrainHeight(clampedX, clampedZ) + 0.1;

      store.setPlayerPosition([clampedX, groundY, clampedZ]);

      // Auto-rotate player to face movement direction
      if (hasInput) {
        const targetRot = Math.atan2(-normX, -normZ);
        store.setPlayerRotation(targetRot);
      }
    }

    // Element switching (1-5)
    const elements = ['fire', 'ice', 'lightning', 'wind', 'earth'] as const;
    for (let i = 0; i < 5; i++) {
      if (k.has(`Digit${i + 1}`)) {
        const el = elements[i];
        if (store.unlockedElements.includes(el)) {
          store.setCurrentElement(el);
          k.delete(`Digit${i + 1}`); // prevent repeat
        }
      }
    }

    // Interact with NPC (E)
    if (k.has('KeyE') && !store.isDialogueOpen) {
      k.delete('KeyE');
      const pos = store.playerPosition;
      for (const npc of store.npcStates) {
        if (!npc.isAlive || npc.isHostile) continue;
        const ndx = pos[0] - npc.position[0];
        const ndz = pos[2] - npc.position[2];
        if (Math.sqrt(ndx * ndx + ndz * ndz) < 5) {
          store.interactWithNPC(npc.id);
          break;
        }
      }
    }

    // Space = jump / dodge
    if (k.has('Space')) {
      k.delete('Space');
      if (store.isGrounded && currentSpeed.current > 1) {
        // Dodge
        store.dodge([normX, 0, normZ]);
      } else if (store.isGrounded) {
        store.jump();
      }
    }

    // Q = heal
    if (k.has('KeyQ')) {
      k.delete('KeyQ');
      store.heal();
    }
  });

  return null;
}

// ============================================
// HIT EFFECTS RENDERER
// ============================================
function HitEffectsRenderer() {
  const hitEffects = useGameStore((s) => s.hitEffects);

  return (
    <group>
      {hitEffects.map((effect) => (
        <HitExplosion
          key={effect.id}
          position={effect.position}
          element={effect.element}
          isCrit={effect.isCrit}
          size={effect.isCrit ? 2 : 1}
        />
      ))}
    </group>
  );
}

// ============================================
// PLAYER EFFECTS (aura + heal)
// ============================================
function PlayerEffects() {
  const playerPosition = useGameStore((s) => s.playerPosition);
  const currentElement = useGameStore((s) => s.currentElement);
  const lastHealTime = useGameStore((s) => s.lastHealTime);
  const [showHeal, setShowHeal] = useState(false);
  const healTimer = useRef(0);

  useEffect(() => {
    if (lastHealTime > healTimer.current) {
      healTimer.current = lastHealTime;
      setShowHeal(true);
      const t = setTimeout(() => setShowHeal(false), 2000);
      return () => clearTimeout(t);
    }
  }, [lastHealTime]);

  return (
    <group>
      <ElementAura position={playerPosition} element={currentElement} />
      {showHeal && <HealEffect position={playerPosition} />}
    </group>
  );
}

// ============================================
// WATER PLANE (global water level)
// ============================================
function WaterPlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  const waterMat = useMemo(() => new THREE.MeshToonMaterial({
    color: '#2266aa',
    transparent: true,
    opacity: 0.45,
    gradientMap: sharedGradientMap,
  }), []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = -2 + Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} material={waterMat}>
      <planeGeometry args={[300, 300]} />
    </mesh>
  );
}

// ============================================
// DODGE TRAIL EFFECT
// ============================================
function DodgeTrailEffect() {
  const playerPosition = useGameStore((s) => s.playerPosition);
  const currentElement = useGameStore((s) => s.currentElement);
  const isDodging = useGameStore((s) => s.isDodging);
  const [triggerKey, setTriggerKey] = useState(0);
  const wasDodging = useRef(false);

  useEffect(() => {
    if (isDodging && !wasDodging.current) {
      wasDodging.current = true;
      setTriggerKey((k) => k + 1);
    }
    if (!isDodging) wasDodging.current = false;
  }, [isDodging]);

  return (
    <group>
      {triggerKey > 0 && <DodgeTrail key={triggerKey} position={[...playerPosition]} element={currentElement} />}
    </group>
  );
}

// ============================================
// PHYSICS LOOP (must be inside Canvas)
// ============================================
function PhysicsLoop() {
  const updatePlayerPhysics = useGameStore((s) => s.updatePlayerPhysics);
  const cleanupHitEffects = useGameStore((s) => s.cleanupHitEffects);

  useFrame((_, delta) => {
    updatePlayerPhysics(delta);
    cleanupHitEffects(Date.now());
  });

  return null;
}

// ============================================
// MAIN GAME WORLD
// ============================================
export function GameWorld() {
  const initNPCs = useGameStore((s) => s.initNPCs);
  const npcStates = useGameStore((s) => s.npcStates);

  useEffect(() => {
    if (npcStates.length === 0) initNPCs();
  }, [initNPCs, npcStates.length]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      camera={{ fov: 60, near: 0.1, far: 500 }}
      style={{ background: '#0a0015' }}
      onPointerDown={(e) => {
        if (e.button === 0) {
          useGameStore.getState().meleeAttack();
        }
        if (e.button === 2) {
          e.preventDefault();
          const rot = useGameStore.getState().playerRotation;
          useGameStore.getState().magicAttack([
            -Math.sin(rot),
            0,
            -Math.cos(rot),
          ]);
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <CameraController />
      <SceneSetup />
      <Lighting />
      <InputHandler />
      <PhysicsLoop />

      <Sky
        distance={450000}
        sunPosition={[100, 80, 50]}
        inclination={0.5}
        azimuth={0.25}
        rayleigh={0.5}
        turbidity={8}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.4}
          intensity={0.8}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.3} darkness={0.5} />
      </EffectComposer>

      {/* World */}
      <Terrain />
      <WaterPlane />
      <EnvironmentObjects />
      <Player />
      <NPCs />

      {/* Combat */}
      <Projectiles />
      <DamageNumbers />
      <HitEffectsRenderer />

      {/* Player VFX */}
      <PlayerEffects />
      <DodgeTrailEffect />
    </Canvas>
  );
}