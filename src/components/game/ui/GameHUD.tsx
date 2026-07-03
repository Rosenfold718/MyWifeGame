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
import {
  Heart,
  Droplets,
  Zap,
  Compass,
  TreePine,
  Snowflake,
  Eye,
  EyeOff,
  Keyboard,
  Swords,
  Gem,
} from 'lucide-react';

// ============================================
// MAIN HUD COMPONENT
// ============================================

export function GameHUD() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 10 }}>
      <LowHPWarning />
      <ManaEmptyFlash />
      <TopLeftObjective />
      <TopRightMinimap />
      <BottomCenterStats />
      <BottomRightSkillBar />
      <BottomLeftControls />
    </div>
  );
}

// ============================================
// 1. BOTTOM CENTER — CHARACTER STATS
// ============================================

const BottomCenterStats = memo(function BottomCenterStats() {
  const stats = useGameStore((s) => s.stats);
  const currentBiome = useGameStore((s) => s.currentBiome);
  const playerName = useGameStore((s) => s.playerName);
  const currentElement = useGameStore((s) => s.currentElement);

  const hpPct = Math.max(0, (stats.hp / stats.maxHp) * 100);
  const manaPct = Math.max(0, (stats.mana / stats.maxMana) * 100);
  const staminaPct = Math.max(0, (stats.stamina / stats.maxStamina) * 100);
  const expPct = stats.expToNext > 0 ? Math.max(0, (stats.exp / stats.expToNext) * 100) : 0;

  const biomeConfig: Record<BiomeType, { name: string; icon: React.ReactNode; color: string }> = {
    forest: { name: 'Зачарованный Лес', icon: <TreePine className="w-3 h-3" />, color: '#44cc66' },
    desert: { name: 'Кристальная Пустыня', icon: <Gem className="w-3 h-3" />, color: '#ffaa44' },
    tundra: { name: 'Ледяная Тундра', icon: <Snowflake className="w-3 h-3" />, color: '#88ccff' },
  };

  const biome = biomeConfig[currentBiome] || biomeConfig.forest;
  const isLowHp = hpPct < 25;
  const isLowMana = manaPct < 20;

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2"
    >
      <div className="relative">
        {/* Main frosted panel */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-5 pt-4 pb-3 min-w-[320px] sm:min-w-[380px]">
          {/* Player name + Level badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border"
                style={{
                  borderColor: ELEMENT_COLORS[currentElement],
                  backgroundColor: `${ELEMENT_COLORS[currentElement]}20`,
                  color: ELEMENT_COLORS[currentElement],
                  boxShadow: `0 0 12px ${ELEMENT_COLORS[currentElement]}30`,
                }}
              >
                {stats.level}
              </div>
              <div>
                <p className="text-white/90 text-sm font-semibold leading-tight tracking-wide">
                  {playerName || 'Путник'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span style={{ color: biome.color }}>{biome.icon}</span>
                  <span className="text-white/40 text-[10px] font-medium">{biome.name}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
              <span className="text-[10px]">{ELEMENT_ICONS[currentElement]}</span>
              <span
                className="text-[10px] font-medium"
                style={{ color: ELEMENT_COLORS[currentElement] }}
              >
                {ELEMENT_NAMES[currentElement]}
              </span>
            </div>
          </div>

          {/* HP Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Heart
                  className={`w-3.5 h-3.5 transition-colors duration-300 ${
                    isLowHp ? 'text-red-400' : 'text-pink-400'
                  }`}
                />
                <span
                  className={`text-[11px] font-bold tracking-wider uppercase ${
                    isLowHp ? 'text-red-400' : 'text-white/70'
                  }`}
                >
                  HP
                </span>
              </div>
              <span
                className={`text-[11px] font-mono tabular-nums ${
                  isLowHp ? 'text-red-400' : 'text-white/50'
                }`}
              >
                {Math.round(stats.hp)} / {Math.round(stats.maxHp)}
              </span>
            </div>
            <div className="relative h-4 rounded-full overflow-hidden bg-black/60 border border-white/5">
              {/* Glow underlay */}
              <div
                className="absolute inset-0 rounded-full opacity-40 blur-sm transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, #ff2244, #ff6688, #ff4466)`,
                  transform: `scaleX(${hpPct / 100})`,
                  transformOrigin: 'left',
                }}
              />
              {/* Main bar */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #ff2244 0%, #ff6688 50%, #ff4466 100%)',
                }}
                animate={{ width: `${hpPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
              {/* Shine overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              {/* Tick marks */}
              <div className="absolute inset-0 flex items-center">
                {[25, 50, 75].map((mark) => (
                  <div
                    key={mark}
                    className="absolute h-full w-px bg-white/10"
                    style={{ left: `${mark}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mana Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Droplets
                  className={`w-3.5 h-3.5 transition-colors duration-300 ${
                    isLowMana ? 'text-cyan-300 animate-pulse' : 'text-cyan-400'
                  }`}
                />
                <span
                  className={`text-[11px] font-bold tracking-wider uppercase ${
                    isLowMana ? 'text-cyan-300' : 'text-white/70'
                  }`}
                >
                  МАНА
                </span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-white/50">
                {Math.round(stats.mana)} / {Math.round(stats.maxMana)}
              </span>
            </div>
            <div className="relative h-3 rounded-full overflow-hidden bg-black/60 border border-white/5">
              {/* Glow underlay */}
              <div
                className="absolute inset-0 rounded-full opacity-30 blur-sm transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(90deg, #22aaff, #66ccff, #4488ff)',
                  transform: `scaleX(${manaPct / 100})`,
                  transformOrigin: 'left',
                }}
              />
              {/* Main bar */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #22aaff 0%, #66ccff 50%, #4488ff 100%)',
                }}
                animate={{ width: `${manaPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
              {/* Shine overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Stamina + EXP row */}
          <div className="flex items-center gap-3">
            {/* Stamina bar (thin) */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] text-white/50 font-medium">СТАМИНА</span>
                </div>
                <span className="text-[10px] font-mono text-white/40 tabular-nums">
                  {Math.round(stats.stamina)}
                </span>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden bg-black/60 border border-white/5">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #ffaa00 0%, #ccff44 50%, #88ff22 100%)',
                  }}
                  animate={{ width: `${staminaPct}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* EXP bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-white/50 font-medium">EXP</span>
                <span className="text-[10px] font-mono text-white/40 tabular-nums">
                  {stats.exp}/{stats.expToNext}
                </span>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden bg-black/60 border border-white/5">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #aa44ff 0%, #ff66aa 50%, #cc44ff 100%)',
                  }}
                  animate={{ width: `${expPct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </div>
    </motion.div>
  );
});

// ============================================
// 2. BOTTOM RIGHT — SKILL BAR
// ============================================

const ELEMENTS: ElementType[] = ['fire', 'ice', 'lightning', 'wind', 'earth'];

const BottomRightSkillBar = memo(function BottomRightSkillBar() {
  const currentElement = useGameStore((s) => s.currentElement);
  const unlockedElements = useGameStore((s) => s.unlockedElements);
  const stats = useGameStore((s) => s.stats);
  const lastMagicTime = useGameStore((s) => s.lastMagicTime);
  const lastMeleeTime = useGameStore((s) => s.lastMeleeTime);
  const lastHealTime = useGameStore((s) => s.lastHealTime);
  const lastDodgeTime = useGameStore((s) => s.lastDodgeTime);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // Track cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCooldowns: Record<string, number> = {};
      ELEMENTS.forEach((el) => {
        const cd = Math.max(0, 600 - (now - lastMagicTime)) / 600;
        if (cd > 0) newCooldowns[el] = cd;
      });
      newCooldowns['melee'] = Math.max(0, 400 - (now - lastMeleeTime)) / 400;
      newCooldowns['heal'] = Math.max(0, 2000 - (now - lastHealTime)) / 2000;
      newCooldowns['dodge'] = Math.max(0, 500 - (now - lastDodgeTime)) / 500;
      setCooldowns(newCooldowns);
    }, 30);
    return () => clearInterval(interval);
  }, [lastMagicTime, lastMeleeTime, lastHealTime, lastDodgeTime]);

  const handleElementClick = useCallback((element: ElementType) => {
    if (unlockedElements.includes(element)) {
      useGameStore.getState().setCurrentElement(element);
    }
  }, [unlockedElements]);

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-4 right-4"
    >
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5">
        {/* Element skills row */}
        <div className="flex items-end gap-1.5">
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
                className="pointer-events-auto relative flex flex-col items-center gap-0.5 group"
                whileHover={isUnlocked ? { scale: 1.08, y: -2 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                disabled={!isUnlocked}
              >
                {/* Skill slot */}
                <div
                  className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl overflow-hidden transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? `${ELEMENT_COLORS[element]}18` : 'rgba(0,0,0,0.5)',
                    border: isActive
                      ? `2px solid ${ELEMENT_COLORS[element]}`
                      : `1px solid ${isUnlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'}`,
                    boxShadow: isActive
                      ? `0 0 20px ${ELEMENT_COLORS[element]}40, inset 0 0 15px ${ELEMENT_COLORS[element]}15`
                      : isUnlocked
                      ? '0 2px 8px rgba(0,0,0,0.3)'
                      : 'none',
                    opacity: isUnlocked ? 1 : 0.25,
                  }}
                >
                  {/* Element icon */}
                  <span className="relative z-10 drop-shadow-lg">{ELEMENT_ICONS[element]}</span>

                  {/* Cooldown sweep overlay */}
                  <AnimatePresence>
                    {cd > 0 && (
                      <motion.div
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 z-20"
                        style={{
                          clipPath: `polygon(0 0, 0 100%, ${cd * 100}% 100%, ${cd * 100}% 0)`,
                        }}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white/70 text-xs font-mono font-bold">
                            {Math.ceil(cd * 0.6 * 10) / 10}s
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active glow ring */}
                  {isActive && (
                    <motion.div
                      layoutId="active-element-glow"
                      className="absolute -inset-0.5 rounded-xl z-0"
                      style={{
                        border: `1px solid ${ELEMENT_COLORS[element]}60`,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>

                {/* Key binding */}
                <span className="text-[9px] font-mono text-white/30 group-hover:text-white/50 transition-colors">
                  {i + 1}
                </span>

                {/* Mana cost indicator */}
                {isUnlocked && (
                  <span
                    className={`text-[8px] font-mono transition-colors ${
                      canAfford ? 'text-cyan-400/60' : 'text-red-400/60'
                    }`}
                  >
                    {manaCost}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Active element name */}
        <motion.div
          key={currentElement}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-1.5"
        >
          <span
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: `${ELEMENT_COLORS[currentElement]}cc` }}
          >
            {ELEMENT_NAMES[currentElement]}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
});

// ============================================
// 3. TOP RIGHT — MINIMAP
// ============================================

const MINIMAP_SIZE = 140;
const MINIMAP_RANGE = 80;

const TopRightMinimap = memo(function TopRightMinimap() {
  const playerPosition = useGameStore((s) => s.playerPosition);
  const npcStates = useGameStore((s) => s.npcStates);
  const currentBiome = useGameStore((s) => s.currentBiome);

  const halfSize = MINIMAP_SIZE / 2;
  const scale = halfSize / MINIMAP_RANGE;

  const toMinimapCoords = (worldX: number, worldZ: number) => {
    const relX = worldX - playerPosition[0];
    const relZ = worldZ - playerPosition[2];
    return {
      x: halfSize + relX * scale,
      y: halfSize + relZ * scale,
    };
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

  // Determine NPC visibility on minimap
  const visibleNpcs = npcStates.filter((npc) => {
    if (!npc.isAlive) return false;
    const dx = npc.position[0] - playerPosition[0];
    const dz = npc.position[2] - playerPosition[2];
    return Math.sqrt(dx * dx + dz * dz) < MINIMAP_RANGE;
  });

  return (
    <motion.div
      initial={{ x: 40, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-4 right-4"
    >
      <div className="relative">
        {/* Circular mask */}
        <div
          className="rounded-full overflow-hidden border-2 border-white/10"
          style={{
            width: MINIMAP_SIZE,
            height: MINIMAP_SIZE,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)',
          }}
        >
          <svg
            width={MINIMAP_SIZE}
            height={MINIMAP_SIZE}
            viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`}
            className="absolute inset-0"
          >
            {/* Dark background */}
            <rect
              width={MINIMAP_SIZE}
              height={MINIMAP_SIZE}
              fill="rgba(0,0,0,0.7)"
            />

            {/* Biome zones */}
            {BIOME_ZONES.map((zone) => {
              const { x, y } = toMinimapCoords(zone.center[0], zone.center[1]);
              const r = zone.radius * scale;
              return (
                <g key={zone.biome}>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={biomeColors[zone.biome]}
                    stroke={biomeBorders[zone.biome]}
                    strokeWidth={1}
                  />
                </g>
              );
            })}

            {/* Grid lines (subtle) */}
            {[0.25, 0.5, 0.75].map((frac) => (
              <g key={frac}>
                <line
                  x1={MINIMAP_SIZE * frac}
                  y1={0}
                  x2={MINIMAP_SIZE * frac}
                  y2={MINIMAP_SIZE}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={0.5}
                />
                <line
                  x1={0}
                  y1={MINIMAP_SIZE * frac}
                  x2={MINIMAP_SIZE}
                  y2={MINIMAP_SIZE * frac}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={0.5}
                />
              </g>
            ))}

            {/* NPC dots */}
            {visibleNpcs.map((npc) => {
              const { x, y } = toMinimapCoords(npc.position[0], npc.position[2]);
              const color = npc.isHostile ? '#ff4444' : '#44ff88';
              const r = npc.isHostile ? 3 : 2.5;
              return (
                <circle
                  key={npc.id}
                  cx={x}
                  cy={y}
                  r={r}
                  fill={color}
                  opacity={0.9}
                  style={{ filter: `drop-shadow(0 0 3px ${color})` }}
                />
              );
            })}

            {/* Player center dot */}
            <circle
              cx={halfSize}
              cy={halfSize}
              r={4}
              fill="#ffffff"
              opacity={0.9}
              style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))' }}
            />
            <circle
              cx={halfSize}
              cy={halfSize}
              r={2}
              fill={ELEMENT_COLORS[useGameStore.getState().currentElement]}
            />

            {/* Player direction indicator */}
            <polygon
              points={`${halfSize},${halfSize - 8} ${halfSize - 3},${halfSize - 3} ${halfSize + 3},${halfSize - 3}`}
              fill="white"
              opacity={0.7}
              transform={`rotate(${-useGameStore.getState().playerRotation * (180 / Math.PI)}, ${halfSize}, ${halfSize})`}
            />

            {/* North indicator */}
            <polygon
              points={`${halfSize},8 ${halfSize - 4},16 ${halfSize + 4},16`}
              fill="rgba(255,255,255,0.5)"
            />
            <text
              x={halfSize}
              y={24}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="7"
              fontFamily="monospace"
            >
              N
            </text>
          </svg>
        </div>

        {/* Outer ring glow */}
        <div
          className="absolute -inset-1 rounded-full pointer-events-none"
          style={{
            boxShadow: `inset 0 0 20px rgba(0,0,0,0.3), 0 0 15px rgba(0,0,0,0.2)`,
          }}
        />

        {/* Biome label */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[9px] text-white/30 font-medium tracking-wider uppercase">
            {currentBiome === 'forest' ? 'Лес' : currentBiome === 'desert' ? 'Пустыня' : 'Тундра'}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

// ============================================
// 4. TOP LEFT — QUEST / INTERACTION AREA
// ============================================

const TopLeftObjective = memo(function TopLeftObjective() {
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

  // Also check for lootable/hostile NPCs
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
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-4 left-4 max-w-xs"
    >
      <div className="space-y-2">
        {/* Current objective placeholder */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold text-purple-300/80 tracking-widest uppercase">
              Задание
            </span>
          </div>
          <p className="text-white/60 text-xs leading-relaxed">
            Исследуй мир Эфирной Саги и найди Алтарь Стихий
          </p>
        </div>

        {/* Interaction prompt */}
        <AnimatePresence mode="wait">
          {showInteraction && nearestNpc && (
            <motion.div
              key={`interact-${nearestNpc.id}`}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-black/50 backdrop-blur-xl border border-amber-400/20 rounded-xl px-4 py-2.5"
              style={{
                boxShadow: '0 0 20px rgba(255,170,50,0.08)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/20">
                  <kbd className="text-amber-300 text-xs font-bold font-mono">E</kbd>
                </div>
                <p className="text-white/80 text-xs">
                  {nearestNpc.questId ? 'Подобрать' : 'Говорить'} —{' '}
                  <span className="text-amber-300/90 font-medium">{nearestNpc.name}</span>
                </p>
              </div>
            </motion.div>
          )}

          {showHostileWarning && nearestHostile && !showInteraction && (
            <motion.div
              key={`hostile-${nearestHostile.id}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="bg-black/50 backdrop-blur-xl border border-red-400/20 rounded-xl px-4 py-2"
            >
              <div className="flex items-center gap-2">
                <Swords className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-300/80 text-xs font-medium">
                  {nearestHostile.name}
                </span>
                <span className="text-white/30 text-[10px]">
                  HP {Math.round(nearestHostile.currentHp)}/{nearestHostile.stats?.maxHp || '?'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// ============================================
// 5. BOTTOM LEFT — CONTROLS HINT
// ============================================

const BottomLeftControls = memo(function BottomLeftControls() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // F1 toggle
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
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-4 left-4"
    >
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="pointer-events-auto w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
        >
          <Keyboard className="w-3.5 h-3.5 text-white/40" />
          <span className="text-[10px] text-white/40 font-medium">Управление</span>
          {isExpanded ? (
            <EyeOff className="w-3 h-3 text-white/30 ml-auto" />
          ) : (
            <Eye className="w-3 h-3 text-white/30 ml-auto" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-white/5">
                {controls.map((ctrl) => (
                  <div key={ctrl.key} className="flex items-center justify-between">
                    <kbd className="px-1.5 py-0.5 bg-white/8 border border-white/10 rounded text-[10px] text-white/50 font-mono min-w-[36px] text-center">
                      {ctrl.key}
                    </kbd>
                    <span className="text-[10px] text-white/30">{ctrl.label}</span>
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

// ============================================
// 6. COMBAT FEEDBACK — LOW HP WARNING
// ============================================

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
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 5 }}
        >
          {/* Red vignette pulse */}
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              boxShadow: 'inset 0 0 120px 40px rgba(255, 20, 20, 0.6)',
            }}
          />
          {/* Additional edge glow */}
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
            style={{
              boxShadow: 'inset 0 0 60px 10px rgba(255, 0, 0, 0.4)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// 6b. COMBAT FEEDBACK — MANA EMPTY FLASH
// ============================================

function ManaEmptyFlash() {
  const mana = useGameStore((s) => s.stats.mana);
  const lastMagicTime = useGameStore((s) => s.lastMagicTime);

  // Show flash when mana is depleted and a magic action was attempted
  const showFlash = mana <= 0 && lastMagicTime > 0;

  return (
    <AnimatePresence>
      {showFlash && (
        <motion.div
          key={lastMagicTime}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 5 }}
          >
          <div
            className="absolute inset-0"
            style={{
              boxShadow: 'inset 0 0 100px 30px rgba(0, 150, 255, 0.4)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}