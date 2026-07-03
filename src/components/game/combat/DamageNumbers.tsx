'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import { Html } from '@react-three/drei';

export function DamageNumbers() {
  const damageNumbers = useGameStore((s) => s.damageNumbers);

  return (
    <group>
      {damageNumbers.map((dmg) => (
        <DamageNumber key={dmg.id} {...dmg} />
      ))}
    </group>
  );
}

function DamageNumber({
  position,
  value,
  isHeal,
  createdAt,
}: {
  position: [number, number, number];
  value: number;
  isHeal: boolean;
  createdAt: number;
}) {
  const time = useRef(0);
  const startY = position[1];

  useFrame((_, delta) => {
    time.current += delta;
  });

  const age = (Date.now() - createdAt) / 1000;
  const yOffset = age * 2;
  const opacity = Math.max(0, 1 - age / 1.5);
  const scale = Math.min(1, age * 5);

  return (
    <Html
      position={[position[0], startY + yOffset, position[2]]}
      center
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="text-2xl font-black whitespace-nowrap select-none"
        style={{
          color: isHeal ? '#44ff88' : '#ff4444',
          opacity,
          transform: `scale(${scale})`,
          textShadow: isHeal
            ? '0 0 8px rgba(68,255,136,0.6), 2px 2px 4px rgba(0,0,0,0.8)'
            : '0 0 8px rgba(255,68,68,0.6), 2px 2px 4px rgba(0,0,0,0.8)',
        }}
      >
        {isHeal ? '+' : '-'}{Math.round(value)}
      </div>
    </Html>
  );
}