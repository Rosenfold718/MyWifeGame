'use client';

import { useGameStore } from '@/stores/gameStore';
import { ELEMENT_COLORS, ELEMENT_NAMES, ELEMENT_ICONS } from '@/lib/game/constants';
import { Save, Heart, Zap, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GameHUD() {
  const stats = useGameStore((s) => s.stats);
  const currentElement = useGameStore((s) => s.currentElement);
  const unlockedElements = useGameStore((s) => s.unlockedElements);
  const currentBiome = useGameStore((s) => s.currentBiome);
  const saveGame = useGameStore((s) => s.saveGame);
  const playerName = useGameStore((s) => s.playerName);
  const isAttacking = useGameStore((s) => s.isAttacking);

  const elements = ['fire', 'ice', 'lightning', 'wind', 'earth'] as const;

  const biomeNames: Record<string, string> = {
    forest: '🌲 Зачарованный Лес',
    desert: '💎 Кристальная Пустыня',
    tundra: '❄️ Ледяная Тундра',
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top-left: Biome name */}
      <div className="absolute top-4 left-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
          <p className="text-white/90 text-sm font-medium">{biomeNames[currentBiome] || currentBiome}</p>
          <p className="text-white/40 text-xs">{playerName} • Ур. {stats.level}</p>
        </div>
      </div>

      {/* Top-right: Save & Map buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          onClick={saveGame}
          className="pointer-events-auto bg-black/40 hover:bg-black/60 border border-white/10 text-white/70 hover:text-white h-9 px-3 cursor-pointer"
          size="sm"
        >
          <Save className="w-4 h-4 mr-1.5" />
          Сохранить
        </Button>
      </div>

      {/* Bottom-left: Stats bars */}
      <div className="absolute bottom-6 left-6 w-72">
        <StatBar
          label="HP"
          value={stats.hp}
          maxValue={stats.maxHp}
          color="from-red-500 to-red-400"
          bgColor="from-red-900/40 to-red-800/40"
          icon={<Heart className="w-3.5 h-3.5" />}
        />
        <StatBar
          label="Мана"
          value={stats.mana}
          maxValue={stats.maxMana}
          color="from-blue-500 to-cyan-400"
          bgColor="from-blue-900/40 to-blue-800/40"
          icon={<Droplets className="w-3.5 h-3.5" />}
        />
        <StatBar
          label="Стамина"
          value={stats.stamina}
          maxValue={stats.maxStamina}
          color="from-yellow-500 to-green-400"
          bgColor="from-yellow-900/40 to-yellow-800/40"
          icon={<Zap className="w-3.5 h-3.5" />}
        />

        {/* EXP bar */}
        <div className="mt-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-white/40 text-[10px]">EXP</span>
            <span className="text-white/40 text-[10px]">{stats.exp}/{stats.expToNext}</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${(stats.exp / stats.expToNext) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom-right: Element selector */}
      <div className="absolute bottom-6 right-6">
        <div className="flex gap-1.5">
          {elements.map((element, i) => {
            const isUnlocked = unlockedElements.includes(element);
            const isActive = currentElement === element;

            return (
              <button
                key={element}
                onClick={() => isUnlocked && useGameStore.getState().setCurrentElement(element)}
                className={`pointer-events-auto relative w-12 h-12 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 border-2 scale-110'
                    : isUnlocked
                    ? 'bg-black/40 border border-white/20 hover:bg-white/10'
                    : 'bg-black/20 border border-white/5 opacity-30'
                }`}
                style={{
                  borderColor: isActive ? ELEMENT_COLORS[element] : undefined,
                  boxShadow: isActive ? `0 0 15px ${ELEMENT_COLORS[element]}40` : undefined,
                }}
                disabled={!isUnlocked}
              >
                {ELEMENT_ICONS[element]}
                <span className="absolute -bottom-0.5 right-0.5 text-[8px] text-white/40 font-mono">
                  {i + 1}
                </span>
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-lg animate-pulse"
                    style={{ boxShadow: `inset 0 0 10px ${ELEMENT_COLORS[element]}30` }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <p className="text-white/30 text-[10px] text-center mt-1">
          {ELEMENT_NAMES[currentElement]}
        </p>
      </div>

      {/* Bottom-center: Controls hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex gap-3 text-[10px] text-white/30">
          <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">WASD</kbd> Движение</span>
          <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">ЛКМ</kbd> Атака</span>
          <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">ПКМ</kbd> Магия</span>
          <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">Space</kbd> Уклон</span>
          <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">E</kbd> Взаим.</span>
          <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">Tab</kbd> Инвент.</span>
          <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50">Q</kbd> Лечение</span>
        </div>
      </div>

      {/* Interaction prompt */}
      <InteractPrompt />
    </div>
  );
}

function StatBar({
  label,
  value,
  maxValue,
  color,
  bgColor,
  icon,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}) {
  const pct = Math.max(0, (value / maxValue) * 100);
  const isLow = pct < 25;

  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1.5">
          <span className={isLow ? 'text-red-400 animate-pulse' : 'text-white/60'}>{icon}</span>
          <span className={`text-xs font-medium ${isLow ? 'text-red-400' : 'text-white/80'}`}>
            {label}
          </span>
        </div>
        <span className={`text-xs font-mono ${isLow ? 'text-red-400' : 'text-white/50'}`}>
          {Math.round(value)}/{Math.round(maxValue)}
        </span>
      </div>
      <div className={`h-2.5 rounded-full overflow-hidden bg-gradient-to-r ${bgColor}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${color} ${
            isLow ? 'animate-pulse' : ''
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function InteractPrompt() {
  const playerPosition = useGameStore((s) => s.playerPosition);
  const npcStates = useGameStore((s) => s.npcStates);
  const isDialogueOpen = useGameStore((s) => s.isDialogueOpen);

  if (isDialogueOpen) return null;

  let nearestNpc = null;
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

  if (!nearestNpc) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
      <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 animate-bounce">
        <p className="text-white/80 text-sm">
          Нажмите <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white text-xs font-mono">E</kbd>
          {' '}чтобы поговорить с <span className="text-yellow-300">{nearestNpc.name}</span>
        </p>
      </div>
    </div>
  );
}

