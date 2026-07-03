'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ELEMENT_COLORS, type ElementType } from '@/lib/game/constants';

// ============================================================
// SHARED PARTICLE SYSTEM INFRASTRUCTURE
// ============================================================

const VERTEX_SHADER = /* glsl */ `
  attribute float aOpacity;
  attribute float aSize;
  varying float vOpacity;
  void main() {
    vOpacity = aOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * (200.0 / max(-mvPosition.z, 0.1)), 0.0, 64.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vOpacity;
  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;
    float core = smoothstep(0.15, 0.0, dist);
    float glow = smoothstep(0.5, 0.05, dist);
    float alpha = (core * 0.6 + glow * 0.4) * vOpacity;
    vec3 col = mix(uColor, vec3(1.0), core * 0.5);
    gl_FragColor = vec4(col, alpha);
  }
`;

// ---- Particle pool: pre-allocated slots, zero GC during runtime ----

interface PSlot {
  vx: number;
  vy: number;
  vz: number;
  age: number;
  lifetime: number;
  startSize: number;
  active: boolean;
}

interface ParticlePool {
  count: number;
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
  emit: (
    px: number, py: number, pz: number,
    vx: number, vy: number, vz: number,
    lifetime: number, size: number,
  ) => void;
  update: (delta: number, drag?: number, gravity?: number) => void;
  getActiveCount: () => number;
  dispose: () => void;
}

function createParticlePool(count: number, color: string): ParticlePool {
  const positions = new Float32Array(count * 3);
  const opacities = new Float32Array(count);
  const sizes = new Float32Array(count);

  const slots: PSlot[] = [];
  for (let i = 0; i < count; i++) {
    slots.push({ vx: 0, vy: 0, vz: 0, age: 0, lifetime: 1, startSize: 1, active: false });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) } },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const posAttr = geometry.attributes.position as THREE.BufferAttribute;
  const opAttr = geometry.attributes.aOpacity as THREE.BufferAttribute;
  const szAttr = geometry.attributes.aSize as THREE.BufferAttribute;

  function emit(
    px: number, py: number, pz: number,
    vx: number, vy: number, vz: number,
    lifetime: number, size: number,
  ) {
    // Find first inactive slot
    let idx = -1;
    for (let i = 0; i < count; i++) {
      if (!slots[i].active) { idx = i; break; }
    }
    // Pool full — overwrite oldest active particle
    if (idx === -1) {
      let maxAge = -1;
      for (let i = 0; i < count; i++) {
        if (slots[i].active && slots[i].age > maxAge) {
          maxAge = slots[i].age;
          idx = i;
        }
      }
      if (idx === -1) return;
    }

    const s = slots[idx];
    s.active = true;
    s.age = 0;
    s.lifetime = lifetime;
    s.startSize = size;
    s.vx = vx;
    s.vy = vy;
    s.vz = vz;

    const i3 = idx * 3;
    positions[i3] = px;
    positions[i3 + 1] = py;
    positions[i3 + 2] = pz;
  }

  function update(delta: number, drag: number = 2, gravity: number = 0) {
    for (let i = 0; i < count; i++) {
      const s = slots[i];
      if (!s.active) {
        opacities[i] = 0;
        sizes[i] = 0;
        continue;
      }

      s.age += delta;
      if (s.age >= s.lifetime) {
        s.active = false;
        opacities[i] = 0;
        sizes[i] = 0;
        continue;
      }

      // Drag deceleration
      const dragMul = Math.max(0, 1 - drag * delta);
      s.vx *= dragMul;
      s.vy *= dragMul;
      s.vz *= dragMul;
      s.vy += gravity * delta;

      // Integrate position
      const i3 = i * 3;
      positions[i3] += s.vx * delta;
      positions[i3 + 1] += s.vy * delta;
      positions[i3 + 2] += s.vz * delta;

      // Opacity fades quadratically, size shrinks linearly
      const t = s.age / s.lifetime;
      opacities[i] = Math.max(0, 1 - t * t);
      sizes[i] = Math.max(0, s.startSize * (1 - t * 0.6));
    }

    posAttr.needsUpdate = true;
    opAttr.needsUpdate = true;
    szAttr.needsUpdate = true;
  }

  function getActiveCount() {
    let c = 0;
    for (let i = 0; i < count; i++) {
      if (slots[i].active) c++;
    }
    return c;
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
  }

  return { count, geometry, material, emit, update, getActiveCount, dispose };
}

// ============================================================
// SpellTrail — Trail behind magic projectiles
// ============================================================

interface SpellTrailProps {
  color: string;
  position: [number, number, number];
  direction: [number, number, number];
}

export function SpellTrail({ color, position, direction }: SpellTrailProps) {
  const MAX = 40;
  const pool = useMemo(() => createParticlePool(MAX, color), [color]);
  const emitAccum = useRef(0);

  useFrame((_, delta) => {
    emitAccum.current += delta;
    const emitInterval = 0.05; // ~20 particles per second

    while (emitAccum.current >= emitInterval) {
      emitAccum.current -= emitInterval;

      const dirLen =
        Math.sqrt(direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2) || 1;
      const invDir = 1 / dirLen;
      const spread = 0.25;

      pool.emit(
        position[0] + (Math.random() - 0.5) * spread,
        position[1] + (Math.random() - 0.5) * spread,
        position[2] + (Math.random() - 0.5) * spread,
        -direction[0] * invDir * 1.5 + (Math.random() - 0.5) * 0.6,
        -direction[1] * invDir * 1.5 + (Math.random() - 0.5) * 0.6,
        -direction[2] * invDir * 1.5 + (Math.random() - 0.5) * 0.6,
        0.25 + Math.random() * 0.2,
        0.15 + Math.random() * 0.25,
      );
    }

    pool.update(delta, 5);
  });

  useEffect(() => {
    return () => pool.dispose();
  }, [pool]);

  return <points geometry={pool.geometry} material={pool.material} />;
}

// ============================================================
// HitExplosion — Burst on enemy hit
// ============================================================

interface HitExplosionProps {
  position: [number, number, number];
  color: string;
  element: ElementType;
  size?: number;
}

export function HitExplosion({ position, color, element, size = 1 }: HitExplosionProps) {
  const MAX = 25;
  const pool = useMemo(() => createParticlePool(MAX, color), [color]);
  const emitted = useRef(false);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    // Emit all particles once on the first frame
    if (!emitted.current) {
      emitted.current = true;
      const particleCount = 15 + Math.floor(Math.random() * 11); // 15–25

      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = (3 + Math.random() * 5) * size;

        let vy = Math.sin(phi) * Math.sin(theta) * speed;
        // Fire rises, earth falls, others neutral
        if (element === 'fire') vy += 2.5;
        else if (element === 'earth') vy -= 1.5;

        pool.emit(
          position[0],
          position[1],
          position[2],
          Math.sin(phi) * Math.cos(theta) * speed,
          vy,
          Math.cos(phi) * speed,
          0.4 + Math.random() * 0.35,
          (0.4 + Math.random() * 0.7) * size,
        );
      }
    }

    const gravity = element === 'fire' ? -1.5 : element === 'earth' ? 6 : element === 'ice' ? 1 : 0;
    pool.update(delta, 3, gravity);

    // Hide when all particles are dead
    if (emitted.current && pool.getActiveCount() === 0 && pointsRef.current) {
      pointsRef.current.visible = false;
    }
  });

  useEffect(() => {
    return () => pool.dispose();
  }, [pool]);

  return <points ref={pointsRef} geometry={pool.geometry} material={pool.material} />;
}

// ============================================================
// DodgeTrail — Afterimage effect when dodging
// ============================================================

interface DodgeTrailProps {
  position: [number, number, number];
  color: string;
}

export function DodgeTrail({ position, color }: DodgeTrailProps) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const LIFETIME = 0.45;
  const COUNT = 5;

  // Capture initial position so the afterimage stays where the dodge started
  const [fixedPos] = useState<[number, number, number]>(() => [
    position[0],
    position[1],
    position[2],
  ]);

  const spheres = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        offset: [
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.2 + 1,
          (Math.random() - 0.5) * 0.4,
        ] as [number, number, number],
        scale: 0.7 + Math.random() * 0.3,
        delay: Math.random() * 0.08,
      })),
    [],
  );

  const materials = useMemo(
    () =>
      Array.from({ length: COUNT }, () => {
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        return mat;
      }),
    [color],
  );

  useFrame((_, delta) => {
    elapsed.current += delta;
    const globalT = elapsed.current / LIFETIME;

    if (globalT >= 1) {
      if (groupRef.current) groupRef.current.visible = false;
      return;
    }

    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, i) => {
      const sphere = spheres[i];
      const age = Math.max(0, elapsed.current - sphere.delay);
      const t = Math.min(age / LIFETIME, 1);

      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 * (1 - t);
      child.scale.setScalar(sphere.scale * (1 + t * 0.4));
    });
  });

  useEffect(() => {
    return () => {
      materials.forEach((m) => m.dispose());
    };
  }, [materials]);

  return (
    <group ref={groupRef} position={fixedPos}>
      {spheres.map((s, i) => (
        <mesh key={i} position={s.offset} material={materials[i]}>
          <sphereGeometry args={[0.5, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================
// HealEffect — Green/white rising particles when healing
// ============================================================

interface HealEffectProps {
  position: [number, number, number];
}

export function HealEffect({ position }: HealEffectProps) {
  const MAX = 30;
  const pool = useMemo(() => createParticlePool(MAX, '#44ff88'), []);
  const emitAccum = useRef(0);
  const elapsed = useRef(0);
  const EMIT_DURATION = 1.8;

  useFrame((_, delta) => {
    elapsed.current += delta;
    emitAccum.current += delta;

    // Emit particles for a limited time
    if (elapsed.current < EMIT_DURATION) {
      const emitInterval = 0.04; // ~25 particles per second
      while (emitAccum.current >= emitInterval) {
        emitAccum.current -= emitInterval;

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.6;

        pool.emit(
          position[0] + Math.cos(angle) * radius,
          position[1] + Math.random() * 0.3,
          position[2] + Math.sin(angle) * radius,
          (Math.random() - 0.5) * 0.4,
          2.5 + Math.random() * 3,
          (Math.random() - 0.5) * 0.4,
          0.8 + Math.random() * 0.8,
          0.12 + Math.random() * 0.22,
        );
      }
    }

    pool.update(delta, 1, 0);

    // Hide when all particles have faded
    if (elapsed.current > EMIT_DURATION + 1.5 && pool.getActiveCount() === 0) {
      pool.geometry.setDrawRange(0, 0);
    }
  });

  useEffect(() => {
    return () => pool.dispose();
  }, [pool]);

  return <points geometry={pool.geometry} material={pool.material} />;
}

// ============================================================
// ElementAura — Ambient orbiting particles around the player
// ============================================================

interface ElementAuraProps {
  position: [number, number, number];
  element: ElementType;
}

interface OrbitParticle {
  angle: number;
  radius: number;
  speed: number;
  yOffset: number;
  yFreq: number;
  phase: number;
}

// Helper: update orbiting aura particles (called from useFrame to avoid lint issues)
function tickAura(
  geo: THREE.BufferGeometry,
  mat: THREE.ShaderMaterial,
  orbits: OrbitParticle[],
  position: [number, number, number],
  element: ElementType,
  count: number,
  delta: number,
) {
  mat.uniforms.uColor.value.set(ELEMENT_COLORS[element]);

  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const opAttr = geo.attributes.aOpacity as THREE.BufferAttribute;
  const szAttr = geo.attributes.aSize as THREE.BufferAttribute;
  const p = posAttr.array as Float32Array;
  const o = opAttr.array as Float32Array;
  const s = szAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const orb = orbits[i];
    orb.angle += orb.speed * delta;

    const x = position[0] + Math.cos(orb.angle) * orb.radius;
    const z = position[2] + Math.sin(orb.angle) * orb.radius;
    const y =
      position[1] + orb.yOffset + Math.sin(orb.angle * orb.yFreq + orb.phase) * 0.35;

    const i3 = i * 3;
    p[i3] = x;
    p[i3 + 1] = y;
    p[i3 + 2] = z;

    // Pulsing opacity and size for a sparkle feel
    o[i] = 0.35 + Math.sin(orb.angle * 2 + orb.phase) * 0.2;
    s[i] = 0.22 + Math.sin(orb.angle + orb.phase) * 0.08;
  }

  posAttr.needsUpdate = true;
  opAttr.needsUpdate = true;
  szAttr.needsUpdate = true;
}

export function ElementAura({ position, element }: ElementAuraProps) {
  const COUNT = 20;
  const pointsRef = useRef<THREE.Points>(null);

  // Orbit data is stable across element changes (prevents visual pop)
  const orbits = useRef<OrbitParticle[]>(
    Array.from({ length: COUNT }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.6 + Math.random() * 0.9,
      speed: 0.8 + Math.random() * 1.6,
      yOffset: (Math.random() - 0.5) * 2.0,
      yFreq: 0.4 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2,
    })),
  );

  // Geometry and material created once — color updated per frame via helper
  const pool = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const op = new Float32Array(COUNT);
    const sz = new Float32Array(COUNT);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(op, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(ELEMENT_COLORS.fire) },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat, dispose: () => { geo.dispose(); mat.dispose(); } };
  }, []);

  useFrame((_, delta) => {
    tickAura(
      pool.geometry,
      pool.material,
      orbits.current,
      position,
      element,
      COUNT,
      delta,
    );
  });

  useEffect(() => {
    return () => pool.dispose();
  }, [pool]);

  return <points ref={pointsRef} geometry={pool.geometry} material={pool.material} />;
}