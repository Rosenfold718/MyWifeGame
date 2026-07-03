'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useGameStore } from '@/stores/gameStore';

// ============================================================
// Shared: inject keyframe animations once into <head>
// ============================================================

const STYLE_ID = 'screen-effects-keyframes';

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes seDamageFlash {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
    @keyframes seVignettePulse {
      0%, 100% { opacity: 0.55; }
      50%      { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
// ScreenShake — CSS-transform wrapper, reads store for triggers
// ============================================================

export function ScreenShake({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const intensity = useRef(0);
  const duration = useRef(0);
  const elapsed = useRef(0);
  const prevHp = useRef(999);

  // Detect HP decrease → trigger shake
  useEffect(() => {
    // Sync initial HP
    prevHp.current = useGameStore.getState().stats.hp;

    const unsub = useGameStore.subscribe((state) => {
      const hp = state.stats.hp;
      if (hp < prevHp.current) {
        const dmg = prevHp.current - hp;
        intensity.current = Math.min(dmg * 1.2, 18);
        duration.current = 0.25 + Math.min(dmg * 0.005, 0.15);
        elapsed.current = 0;
      }
      prevHp.current = hp;
    });
    return unsub;
  }, []);

  // rAF loop for smooth CSS-transform shake
  useEffect(() => {
    let raf: number;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (elapsed.current < duration.current) {
        elapsed.current += dt;
        const progress = elapsed.current / duration.current;
        const cur = intensity.current * (1 - progress * progress);
        const x = (Math.random() - 0.5) * 2 * cur;
        const y = (Math.random() - 0.5) * 2 * cur;
        if (wrapperRef.current) {
          wrapperRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }
      } else if (wrapperRef.current) {
        wrapperRef.current.style.transform = '';
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>{children}</div>;
}

// ============================================================
// DamageFlash — brief red overlay when the player takes damage
// ============================================================

function DamageFlash() {
  const [visible, setVisible] = useState(false);
  const prevHp = useRef(999);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Sync initial HP
    prevHp.current = useGameStore.getState().stats.hp;

    const unsub = useGameStore.subscribe((state) => {
      if (state.stats.hp < prevHp.current) {
        setVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(false), 160);
      }
      prevHp.current = state.stats.hp;
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(255,60,60,0.25) 0%, rgba(200,0,0,0.5) 100%)',
        animation: 'seDamageFlash 0.16s ease-out forwards',
      }}
    />
  );
}

// ============================================================
// HitStop — brief white flash when landing hits on enemies
// ============================================================

function HitStop() {
  const [active, setActive] = useState(false);
  const prevCount = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    prevCount.current = useGameStore.getState().damageNumbers.length;

    const unsub = useGameStore.subscribe((state) => {
      const len = state.damageNumbers.length;
      if (len > prevCount.current) {
        // Check the latest entry — only flash for non-heal numbers
        const latest = state.damageNumbers[len - 1];
        if (latest && !latest.isHeal) {
          setActive(true);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setActive(false), 75);
        }
      }
      prevCount.current = len;
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        background: 'rgba(255,255,255,0.12)',
      }}
    />
  );
}

// ============================================================
// LowHPVignette — red pulsing vignette when HP < 25 %
// ============================================================

function LowHPVignette() {
  const hp = useGameStore((s) => s.stats.hp);
  const maxHp = useGameStore((s) => s.stats.maxHp);

  const ratio = maxHp > 0 ? hp / maxHp : 1;
  if (ratio >= 0.25) return null;

  const severity = 1 - ratio / 0.25; // 0 at 25 % → 1 at 0 %
  const alpha = 0.3 + severity * 0.45;
  const pulseSpeed = 0.6 + severity * 0.6;

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at center, transparent 35%, rgba(160,0,0,${alpha}) 100%)`,
        animation: `seVignettePulse ${pulseSpeed}s ease-in-out infinite`,
      }}
    />
  );
}

// ============================================================
// ScreenEffects — combined overlay (renders all sub-effects)
// ============================================================

export function ScreenEffects() {
  useEffect(() => {
    injectStyles();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <DamageFlash />
      <HitStop />
      <LowHPVignette />
    </div>
  );
}