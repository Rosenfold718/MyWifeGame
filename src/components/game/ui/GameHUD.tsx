'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import {
  ELEMENT_COLORS,
  ELEMENT_NAMES,
  ELEMENT_ICONS,
  BIOME_ZONES,
  MANA_COSTS,
} from '@/lib/game/constants';
import type { ElementType, BiomeType } from '@/lib/game/constants';

// ══════════════════════════════════════
// MAIN HUD
// ══════════════════════════════════════

export function GameHUD() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 10,
      fontFamily: 'var(--font-ui)',
    }}>
      <LowHPWarning />
      <ManaEmptyFlash />
      <TopLeftInfo />
      <TopCenterBiome />
      <TopRightMinimap />
      <BottomCenterBars />
      <BottomCenterSkillBar />
      <BottomLeftControls />
    </div>
  );
}

// ══════════════════════════════════════
// 1. TOP LEFT — PLAYER NAME + LEVEL + ELEMENT
// ══════════════════════════════════════

const TopLeftInfo = memo(function TopLeftInfo() {
  const playerName = useGameStore((s) => s.playerName);
  const stats = useGameStore((s) => s.stats);
  const currentElement = useGameStore((s) => s.currentElement);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const npcStates = useGameStore((s) => s.npcStates);
  const isDialogueOpen = useGameStore((s) => s.isDialogueOpen);

  // Find nearest interactable NPC
  let nearestNpc: typeof npcStates[0] | null = null;
  let nearestDist = Infinity;
  for (const npc of npcStates) {
    if (!npc.isAlive || npc.isHostile) continue;
    const dx = playerPosition[0] - npc.position[0];
    const dz = playerPosition[2] - npc.position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 5 && dist < nearestDist) {
      nearestDist = dist;
      nearestNpc = npc;
    }
  }

  // Nearest hostile
  let nearestHostile: typeof npcStates[0] | null = null;
  let nearestHostileDist = Infinity;
  for (const npc of npcStates) {
    if (!npc.isAlive || !npc.isHostile) continue;
    const dx = playerPosition[0] - npc.position[0];
    const dz = playerPosition[2] - npc.position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 10 && dist < nearestHostileDist) {
      nearestHostileDist = dist;
      nearestHostile = npc;
    }
  }

  const showInteraction = nearestNpc && !isDialogueOpen;
  const showHostileWarning = nearestHostile && nearestHostileDist < 6;

  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', top: 16, left: 16 }}
    >
      {/* Player name & level */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {/* Level badge */}
        <div style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${ELEMENT_COLORS[currentElement]}60`,
          borderRadius: 2,
          background: `${ELEMENT_COLORS[currentElement]}10`,
          boxShadow: `0 0 12px ${ELEMENT_COLORS[currentElement]}20, inset 0 0 8px ${ELEMENT_COLORS[currentElement]}08`,
        }}>
          <span style={{
            fontFamily: 'var(--font-title)',
            fontSize: 16,
            fontWeight: 900,
            color: ELEMENT_COLORS[currentElement],
            textShadow: `0 0 8px ${ELEMENT_COLORS[currentElement]}60`,
          }}>
            {stats.level}
          </span>
        </div>
        <div>
          <p style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'rgba(240, 230, 255, 0.9)',
            letterSpacing: '0.05em',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            lineHeight: 1.2,
          }}>
            {playerName || 'Путник'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 12 }}>{ELEMENT_ICONS[currentElement]}</span>
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              color: ELEMENT_COLORS[currentElement],
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textShadow: `0 0 6px ${ELEMENT_COLORS[currentElement]}40`,
            }}>
              {ELEMENT_NAMES[currentElement]}
            </span>
          </div>
        </div>
      </div>

      {/* Quest objective */}
      <div style={{
        padding: '6px 12px',
        background: 'rgba(10, 0, 21, 0.7)',
        border: '1px solid rgba(199,125,255,0.1)',
        borderRadius: 2,
        marginBottom: 6,
        maxWidth: 220,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 10, color: 'rgba(199,125,255,0.6)' }}>◈</span>
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            color: 'rgba(199,125,255,0.5)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            Задание
          </span>
        </div>
        <p style={{
          fontSize: 11,
          color: 'rgba(240, 230, 255, 0.45)',
          lineHeight: 1.4,
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }}>
          Исследуй мир и найди Алтарь Стихий
        </p>
      </div>

      {/* Interaction prompt */}
      <AnimatePresence mode="wait">
        {showInteraction && nearestNpc && (
          <motion.div
            key={`interact-${nearestNpc.id}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '6px 12px',
              background: 'rgba(10, 0, 21, 0.8)',
              border: '1px solid rgba(255,170,50,0.2)',
              borderRadius: 2,
              boxShadow: '0 0 16px rgba(255,170,50,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255,200,80,0.8)',
              fontFamily: 'monospace',
            }}>E</span>
            <span style={{
              fontSize: 11,
              color: 'rgba(240, 230, 255, 0.7)',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}>
              {nearestNpc.questId ? 'Подобрать' : 'Говорить'} — <span style={{ color: 'rgba(255,200,80,0.9)' }}>{nearestNpc.name}</span>
            </span>
          </motion.div>
        )}

        {showHostileWarning && nearestHostile && !showInteraction && (
          <motion.div
            key={`hostile-${nearestHostile.id}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '5px 12px',
              background: 'rgba(10, 0, 21, 0.8)',
              border: '1px solid rgba(255,60,60,0.2)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 10, color: 'rgba(255,80,80,0.8)' }}>⚔</span>
            <span style={{ fontSize: 11, color: 'rgba(255,120,120,0.7)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              {nearestHostile.name}
            </span>
            <span style={{ fontSize: 9, color: 'rgba(240,230,255,0.2)' }}>
              {Math.round(nearestHostile.currentHp)}/{nearestHostile.stats?.maxHp || '?'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ══════════════════════════════════════
// 2. TOP CENTER — BIOME NAME
// ══════════════════════════════════════

const TopCenterBiome = memo(function TopCenterBiome() {
  const currentBiome = useGameStore((s) => s.currentBiome);

  const biomeInfo: Record<BiomeType, { name: string; color: string }> = {
    forest: { name: 'Зачарованный Лес', color: '#44cc66' },
    desert: { name: 'Кристальная Пустыня', color: '#ffaa44' },
    tundra: { name: 'Ледяная Тундра', color: '#88ccff' },
  };
  const biome = biomeInfo[currentBiome];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)' }}
    >
      <div style={{
        padding: '4px 20px',
        background: 'rgba(10, 0, 21, 0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 2,
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: `${biome.color}80`,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textShadow: `0 0 8px ${biome.color}30`,
        }}>
          {biome.name}
        </span>
      </div>
    </motion.div>
  );
});

// ══════════════════════════════════════
// 3. BOTTOM CENTER — HP / MANA / STAMINA BARS
// ══════════════════════════════════════

function GameBar({
  label,
  value,
  max,
  color1,
  color2,
  glowColor,
  height = 12,
  showNumbers = true,
}: {
  label: string;
  value: number;
  max: number;
  color1: string;
  color2: string;
  glowColor: string;
  height?: number;
  showNumbers?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(240, 230, 255, 0.4)',
          textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        }}>
          {label}
        </span>
        {showNumbers && (
          <span style={{
            fontSize: 9,
            color: 'rgba(240, 230, 255, 0.3)',
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 1px 3px rgba(0,0,0,0.9)',
          }}>
            {Math.round(value)} / {Math.round(max)}
          </span>
        )}
      </div>
      <div style={{
        position: 'relative',
        height,
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 1,
        overflow: 'hidden',
      }}>
        {/* Glow underlay */}
        <div style={{
          position: 'absolute',
          top: -2,
          bottom: -2,
          left: 0,
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${glowColor}, transparent)`,
          filter: 'blur(4px)',
          opacity: 0.5,
          transformOrigin: 'left',
          transition: 'width 0.4s ease-out',
        }} />
        {/* Main fill */}
        <motion.div
          style={{
            position: 'absolute',
            top: 1,
            bottom: 1,
            left: 1,
            background: `linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`,
            borderRadius: 0,
            boxShadow: `0 0 6px ${glowColor}40`,
          }}
          animate={{ width: `${Math.max(0, pct - 0.5)}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        {/* Top highlight */}
        <div style={{
          position: 'absolute',
          top: 1,
          left: 1,
          right: 1,
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15), transparent)',
          pointerEvents: 'none',
          borderRadius: 0,
        }} />
        {/* Tick marks */}
        {[25, 50, 75].map((mark) => (
          <div key={mark} style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${mark}%`,
            width: 1,
            background: 'rgba(255,255,255,0.06)',
          }} />
        ))}
      </div>
    </div>
  );
}

const BottomCenterBars = memo(function BottomCenterBars() {
  const stats = useGameStore((s) => s.stats);
  const currentElement = useGameStore((s) => s.currentElement);

  const hpPct = stats.hp / stats.maxHp;
  const isLowHp = hpPct < 0.25 && hpPct > 0;

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        bottom: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(260px, 35vw, 360px)',
      }}
    >
      {/* Element indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        justifyContent: 'center',
      }}>
        <div style={{
          width: 4,
          height: 4,
          background: ELEMENT_COLORS[currentElement],
          borderRadius: '50%',
          boxShadow: `0 0 6px ${ELEMENT_COLORS[currentElement]}`,
        }} />
        <span style={{
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: `${ELEMENT_COLORS[currentElement]}99`,
          textShadow: `0 0 8px ${ELEMENT_COLORS[currentElement]}40`,
        }}>
          {ELEMENT_ICONS[currentElement]} {ELEMENT_NAMES[currentElement]}
        </span>
        <div style={{
          width: 4,
          height: 4,
          background: ELEMENT_COLORS[currentElement],
          borderRadius: '50%',
          boxShadow: `0 0 6px ${ELEMENT_COLORS[currentElement]}`,
        }} />
      </div>

      {/* HP */}
      <div style={isLowHp ? {
        animation: 'lowHpPulse 1s ease-in-out infinite',
      } : undefined}>
        <GameBar
          label="♥ HP"
          value={stats.hp}
          max={stats.maxHp}
          color1={isLowHp ? '#ff3344' : '#ff4466'}
          color2={isLowHp ? '#cc1122' : '#cc2244'}
          glowColor="rgba(255,60,80,0.6)"
          height={14}
        />
      </div>

      {/* Mana */}
      <GameBar
        label="✦ МАНА"
        value={stats.mana}
        max={stats.maxMana}
        color1="#44bbff"
        color2="#2266cc"
        glowColor="rgba(60,150,255,0.5)"
        height={10}
      />

      {/* Stamina (thin) */}
      <GameBar
        label="⚡ СТАМИНА"
        value={stats.stamina}
        max={stats.maxStamina}
        color1="#ccff44"
        color2="#88aa22"
        glowColor="rgba(180,255,60,0.4)"
        height={6}
        showNumbers={false}
      />

      <style jsx>{`
        @keyframes lowHpPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </motion.div>
  );
});

// ══════════════════════════════════════
// 4. BOTTOM CENTER — SKILL BAR
// ══════════════════════════════════════

const ELEMENTS: ElementType[] = ['fire', 'ice', 'lightning', 'wind', 'earth'];

const BottomCenterSkillBar = memo(function BottomCenterSkillBar() {
  const currentElement = useGameStore((s) => s.currentElement);
  const unlockedElements = useGameStore((s) => s.unlockedElements);
  const stats = useGameStore((s) => s.stats);
  const lastMagicTime = useGameStore((s) => s.lastMagicTime);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCooldowns: Record<string, number> = {};
      ELEMENTS.forEach((el) => {
        const cd = Math.max(0, 600 - (now - lastMagicTime)) / 600;
        if (cd > 0) newCooldowns[el] = cd;
      });
      setCooldowns(newCooldowns);
    }, 30);
    return () => clearInterval(interval);
  }, [lastMagicTime]);

  const handleElementClick = useCallback((element: ElementType) => {
    if (unlockedElements.includes(element)) {
      useGameStore.getState().setCurrentElement(element);
    }
  }, [unlockedElements]);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 4,
      }}
    >
      {ELEMENTS.map((element, i) => {
        const isUnlocked = unlockedElements.includes(element);
        const isActive = currentElement === element;
        const cd = cooldowns[element] || 0;
        const manaCost = MANA_COSTS.magicBolt;
        const canAfford = stats.mana >= manaCost;

        return (
          <motion.button
            key={element}
            onClick={() => handleElementClick(element)}
            style={{
              pointerEvents: isUnlocked ? 'auto' : 'none',
              position: 'relative',
              width: 44,
              height: 44,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive ? `${ELEMENT_COLORS[element]}14` : 'rgba(0,0,0,0.5)',
              border: isActive
                ? `1px solid ${ELEMENT_COLORS[element]}80`
                : `1px solid ${isUnlocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`,
              borderRadius: 2,
              cursor: isUnlocked ? 'pointer' : 'default',
              outline: 'none',
              boxShadow: isActive
                ? `0 0 14px ${ELEMENT_COLORS[element]}30, inset 0 0 10px ${ELEMENT_COLORS[element]}10`
                : 'none',
              opacity: isUnlocked ? 1 : 0.2,
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            whileHover={isUnlocked ? { scale: 1.08, y: -2 } : {}}
            whileTap={isUnlocked ? { scale: 0.95 } : {}}
            onMouseEnter={(e) => {
              if (isUnlocked && !isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 10px rgba(199,125,255,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.borderColor = isUnlocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }
            }}
          >
            <span style={{
              fontSize: 18,
              filter: `drop-shadow(0 0 4px ${ELEMENT_COLORS[element]}60)`,
              position: 'relative',
              zIndex: 2,
            }}>
              {ELEMENT_ICONS[element]}
            </span>

            {/* Cooldown overlay */}
            <AnimatePresence>
              {cd > 0 && (
                <motion.div
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 5,
                    borderRadius: 2,
                    clipPath: `polygon(0 0, 0 100%, ${cd * 100}% 100%, ${cd * 100}% 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}>
                    {(cd * 0.6).toFixed(1)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Key hint */}
            <span style={{
              position: 'absolute',
              bottom: -14,
              fontSize: 8,
              fontFamily: 'monospace',
              color: 'rgba(240,230,255,0.2)',
            }}>
              {i + 1}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
});

// ══════════════════════════════════════
// 5. TOP RIGHT — MINIMAP
// ══════════════════════════════════════

const MINIMAP_SIZE = 130;
const MINIMAP_RANGE = 80;

const TopRightMinimap = memo(function TopRightMinimap() {
  const playerPosition = useGameStore((s) => s.playerPosition);
  const npcStates = useGameStore((s) => s.npcStates);
  const currentElement = useGameStore((s) => s.currentElement);

  const halfSize = MINIMAP_SIZE / 2;
  const scale = halfSize / MINIMAP_RANGE;

  const toMinimapCoords = (worldX: number, worldZ: number) => {
    const relX = worldX - playerPosition[0];
    const relZ = worldZ - playerPosition[2];
    return { x: halfSize + relX * scale, y: halfSize + relZ * scale };
  };

  const biomeColors: Record<BiomeType, string> = {
    forest: 'rgba(34, 90, 30, 0.5)',
    desert: 'rgba(180, 150, 50, 0.5)',
    tundra: 'rgba(140, 180, 210, 0.5)',
  };
  const biomeBorders: Record<BiomeType, string> = {
    forest: 'rgba(34, 120, 30, 0.3)',
    desert: 'rgba(200, 170, 60, 0.3)',
    tundra: 'rgba(120, 160, 200, 0.3)',
  };

  const visibleNpcs = npcStates.filter((npc) => {
    if (!npc.isAlive) return false;
    const dx = npc.position[0] - playerPosition[0];
    const dz = npc.position[2] - playerPosition[2];
    return Math.sqrt(dx * dx + dz * dz) < MINIMAP_RANGE;
  });

  const playerRotation = useGameStore.getState().playerRotation;

  return (
    <motion.div
      initial={{ x: 30, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', top: 16, right: 16 }}
    >
      <div style={{ position: 'relative' }}>
        <div style={{
          width: MINIMAP_SIZE,
          height: MINIMAP_SIZE,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1px solid rgba(199,125,255,0.2)',
          boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.4)',
        }}>
          <svg
            width={MINIMAP_SIZE}
            height={MINIMAP_SIZE}
            viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`}
            style={{ position: 'absolute', inset: 0 }}
          >
            <rect width={MINIMAP_SIZE} height={MINIMAP_SIZE} fill="rgba(0,0,0,0.7)" />

            {/* Biome zones */}
            {BIOME_ZONES.map((zone) => {
              const { x, y } = toMinimapCoords(zone.center[0], zone.center[1]);
              const r = zone.radius * scale;
              return (
                <g key={zone.biome}>
                  <circle cx={x} cy={y} r={r} fill={biomeColors[zone.biome]} stroke={biomeBorders[zone.biome]} strokeWidth={1} />
                </g>
              );
            })}

            {/* Subtle grid */}
            {[0.25, 0.5, 0.75].map((frac) => (
              <g key={frac}>
                <line x1={MINIMAP_SIZE * frac} y1={0} x2={MINIMAP_SIZE * frac} y2={MINIMAP_SIZE} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
                <line x1={0} y1={MINIMAP_SIZE * frac} x2={MINIMAP_SIZE} y2={MINIMAP_SIZE * frac} stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
              </g>
            ))}

            {/* NPC dots */}
            {visibleNpcs.map((npc) => {
              const { x, y } = toMinimapCoords(npc.position[0], npc.position[2]);
              const color = npc.isHostile ? '#ff4444' : '#44ff88';
              const r = npc.isHostile ? 3 : 2.5;
              return (
                <circle key={npc.id} cx={x} cy={y} r={r} fill={color} opacity={0.9}
                  style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
              );
            })}

            {/* Player dot */}
            <circle cx={halfSize} cy={halfSize} r={4} fill="#ffffff" opacity={0.9}
              style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))' }} />
            <circle cx={halfSize} cy={halfSize} r={2} fill={ELEMENT_COLORS[currentElement]} />

            {/* Direction indicator */}
            <polygon
              points={`${halfSize},${halfSize - 8} ${halfSize - 3},${halfSize - 3} ${halfSize + 3},${halfSize - 3}`}
              fill="white"
              opacity={0.7}
              transform={`rotate(${-playerRotation * (180 / Math.PI)}, ${halfSize}, ${halfSize})`}
            />

            {/* North */}
            <polygon points={`${halfSize},8 ${halfSize - 4},16 ${halfSize + 4},16`} fill="rgba(255,255,255,0.4)" />
            <text x={halfSize} y={24} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">N</text>
          </svg>
        </div>

        {/* Compass labels around the circle */}
        <div style={{
          position: 'absolute',
          top: -18,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 8,
          fontFamily: 'monospace',
          color: 'rgba(240,230,255,0.2)',
          letterSpacing: '0.1em',
        }}>N</div>
      </div>
    </motion.div>
  );
});

// ══════════════════════════════════════
// 6. BOTTOM LEFT — CONTROLS HINT
// ══════════════════════════════════════

const BottomLeftControls = memo(function BottomLeftControls() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsVisible((v) => !v);
        if (isVisible) setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isVisible]);

  const controls = [
    { key: 'WASD', label: 'Движение' },
    { key: 'ЛКМ', label: 'Атака' },
    { key: 'ПКМ', label: 'Магия' },
    { key: 'Space', label: 'Уклон' },
    { key: 'E', label: 'Взаимодействие' },
    { key: 'Q', label: 'Лечение' },
    { key: '1-5', label: 'Стихия' },
    { key: 'Tab', label: 'Инвентарь' },
    { key: 'Esc', label: 'Пауза' },
    { key: 'F1', label: 'Управление' },
  ];

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', bottom: 16, left: 16 }}
    >
      <div style={{
        background: 'rgba(10, 0, 21, 0.6)',
        border: '1px solid rgba(199,125,255,0.08)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setIsExpanded((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(240,230,255,0.3)',
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            letterSpacing: '0.05em',
            outline: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(240,230,255,0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,230,255,0.3)'; }}
        >
          <span style={{ fontSize: 11 }}>⌨</span>
          <span>Управление</span>
          <span style={{ marginLeft: 'auto', fontSize: 9 }}>{isExpanded ? '▾' : '▸'}</span>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                padding: '4px 10px 8px',
                borderTop: '1px solid rgba(199,125,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}>
                {controls.map((ctrl) => (
                  <div key={ctrl.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{
                      padding: '1px 5px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 1,
                      fontSize: 9,
                      fontFamily: 'monospace',
                      color: 'rgba(240,230,255,0.35)',
                      minWidth: 32,
                      textAlign: 'center',
                    }}>
                      {ctrl.key}
                    </span>
                    <span style={{
                      fontSize: 9,
                      color: 'rgba(240,230,255,0.2)',
                    }}>
                      {ctrl.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// ══════════════════════════════════════
// 7. LOW HP WARNING
// ══════════════════════════════════════

function LowHPWarning() {
  const hp = useGameStore((s) => s.stats.hp);
  const maxHp = useGameStore((s) => s.stats.maxHp);
  const isLow = hp / maxHp < 0.25 && hp > 0;

  return (
    <AnimatePresence>
      {isLow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}
        >
          <motion.div
            style={{ position: 'absolute', inset: 0 }}
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              boxShadow: 'inset 0 0 120px 40px rgba(255, 20, 20, 0.6)',
            }}
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              boxShadow: 'inset 0 0 60px 10px rgba(255, 0, 0, 0.4)',
            }}
            animate={{ opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ══════════════════════════════════════
// 8. MANA EMPTY FLASH
// ══════════════════════════════════════

function ManaEmptyFlash() {
  const mana = useGameStore((s) => s.stats.mana);
  const lastMagicTime = useGameStore((s) => s.lastMagicTime);
  const showFlash = mana <= 0 && lastMagicTime > 0;

  return (
    <AnimatePresence>
      {showFlash && (
        <motion.div
          key={lastMagicTime}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 100px 30px rgba(0, 150, 255, 0.4)',
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}