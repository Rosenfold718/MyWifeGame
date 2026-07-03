'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/stores/gameStore';
import { Terrain } from './Terrain';
import { EnvironmentObjects } from './EnvironmentObjects';
import { Player } from '../player/Player';
import { NPCs } from '../npc/NPCs';
import { Projectiles } from '../combat/Projectiles';
import { DamageNumbers } from '../combat/DamageNumbers';
import { BIOME_ZONES } from '@/lib/game/constants';
import { getTerrainHeight, getBiomeAtPosition } from '@/lib/game/noise';
import { Sky } from '@react-three/drei';

function CameraController() {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(-0.4);
  const distance = useRef(8);
  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3(0, 5, 10));
  const isPointerLocked = useRef(false);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const isDodging = useGameStore((s) => s.isDodging);

  useEffect(() => {
    const canvas = gl.domElement;

    const onClick = () => {
      if (!isPointerLocked.current) {
        canvas.requestPointerLock();
      }
    };

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLock.current) return;

      yaw.current -= e.movementX * 0.003;
      pitch.current = Math.max(-1.2, Math.min(0.3, pitch.current - e.movementY * 0.003));

      // Update player rotation to face camera direction
      useGameStore.getState().setPlayerRotation(yaw.current);
    };

    const onWheel = (e: WheelEvent) => {
      distance.current = Math.max(3, Math.min(20, distance.current + e.deltaY * 0.01));
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

  useFrame(() => {
    const px = playerPosition[0];
    const py = playerPosition[1];
    const pz = playerPosition[2];

    targetPos.current.set(
      px + Math.sin(yaw.current) * Math.cos(pitch.current) * distance.current,
      py + 2 + Math.sin(pitch.current) * distance.current,
      pz + Math.cos(yaw.current) * Math.cos(pitch.current) * distance.current
    );

    const lerpSpeed = isDodging ? 0.3 : 0.08;
    currentPos.current.lerp(targetPos.current, lerpSpeed);

    camera.position.copy(currentPos.current);
    camera.lookAt(px, py + 1.2, pz);
  });

  return null;
}

function SceneSetup() {
  const currentBiome = useGameStore((s) => s.currentBiome);

  useFrame(({ scene }) => {
    if (!scene.fog) {
      scene.fog = new THREE.FogExp2(0x1a0a2e, 0.004);
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

function Lighting() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const currentBiome = useGameStore((s) => s.currentBiome);

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
  });

  return (
    <>
      <ambientLight intensity={0.4} color="#b8a0d8" />
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
      <hemisphereLight
        groundColor="#443344"
        skyColor="#8888cc"
        intensity={0.3}
      />
    </>
  );
}

function InputHandler() {
  const keys = useRef<Set<string>>(new Set());
  const playerPosition = useGameStore((s) => s.playerPosition);
  const stats = useGameStore((s) => s.stats);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.code);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.code);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame(() => {
    if (useGameStore.getState().currentScreen !== 'playing') return;
    if (useGameStore.getState().isDialogueOpen) return;
    if (useGameStore.getState().isInventoryOpen) return;

    const moveSpeed = stats.speed * 0.016;
    const rot = useGameStore.getState().playerRotation;
    let dx = 0, dz = 0;

    if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) { dx -= Math.sin(rot); dz -= Math.cos(rot); }
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) { dx += Math.sin(rot); dz += Math.cos(rot); }
    if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) { dx -= Math.cos(rot); dz += Math.sin(rot); }
    if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) { dx += Math.cos(rot); dz -= Math.sin(rot); }

    if (dx !== 0 || dz !== 0) {
      const len = Math.sqrt(dx * dx + dz * dz);
      dx = (dx / len) * moveSpeed;
      dz = (dz / len) * moveSpeed;

      const newX = playerPosition[0] + dx;
      const newZ = playerPosition[2] + dz;

      // World bounds
      const half = 200;
      const clampedX = Math.max(-half, Math.min(half, newX));
      const clampedZ = Math.max(-half, Math.min(half, newZ));
      const newY = getTerrainHeight(clampedX, clampedZ) + 0.1;

      useGameStore.getState().setPlayerPosition([clampedX, newY, clampedZ]);
    }

    // Sprint
    if (keys.current.has('ShiftLeft') && (dx !== 0 || dz !== 0)) {
      useGameStore.getState().useStamina(0.3);
    }

    // Melee attack on click
    // Handled in Player component

    // Element switching (1-5)
    const elements = ['fire', 'ice', 'lightning', 'wind', 'earth'] as const;
    for (let i = 0; i < 5; i++) {
      if (keys.current.has(`Digit${i + 1}`)) {
        useGameStore.getState().setCurrentElement(elements[i]);
      }
    }

    // Interact with NPC (E)
    if (keys.current.has('KeyE') && !useGameStore.getState().isDialogueOpen) {
      keys.current.delete('KeyE');
      const pos = useGameStore.getState().playerPosition;
      const npcs = useGameStore.getState().npcStates;
      for (const npc of npcs) {
        if (!npc.isAlive || npc.isHostile) continue;
        const ndx = pos[0] - npc.position[0];
        const ndz = pos[2] - npc.position[2];
        const dist = Math.sqrt(ndx * ndx + ndz * ndz);
        if (dist < 5) {
          useGameStore.getState().interactWithNPC(npc.id);
          break;
        }
      }
    }

    // Space = dodge
    if (keys.current.has('Space')) {
      keys.current.delete('Space');
      if (dx !== 0 || dz !== 0) {
        useGameStore.getState().dodge([dx, 0, dz]);
      } else {
        useGameStore.getState().dodge([0, 0, -1]);
      }
    }

    // Q = heal
    if (keys.current.has('KeyQ')) {
      keys.current.delete('KeyQ');
      useGameStore.getState().heal();
    }
  });

  return null;
}

export function GameWorld() {
  const initNPCs = useGameStore((s) => s.initNPCs);
  const npcStates = useGameStore((s) => s.npcStates);

  useEffect(() => {
    if (npcStates.length === 0) {
      initNPCs();
    }
  }, [initNPCs, npcStates.length]);

  return (
    <Canvas
      shadows
      camera={{ fov: 60, near: 0.1, far: 500 }}
      style={{ background: '#0a0015' }}
      onPointerDown={(e) => {
        if (e.button === 0) {
          useGameStore.getState().meleeAttack();
        }
        if (e.button === 2) {
          e.preventDefault();
          // Right click = magic attack in look direction
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

      <Terrain />
      <EnvironmentObjects />
      <Player />
      <NPCs />
      <Projectiles />
      <DamageNumbers />
    </Canvas>
  );
}