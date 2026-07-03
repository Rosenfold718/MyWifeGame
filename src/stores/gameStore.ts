import { create } from 'zustand';
import type {
  GameScreen,
  ElementType,
  PlayerStats,
  InventoryItem,
  Equipment,
  CharacterAppearance,
  NPCData,
  BiomeType,
} from '@/lib/game/constants';
import {
  DEFAULT_STATS,
  DEFAULT_APPEARANCE,
  STARTER_WEAPONS,
  STARTER_ITEMS,
  NPC_DATA,
  BIOME_ZONES,
  WORLD_SIZE,
} from '@/lib/game/constants';
import { getTerrainHeight, getBiomeAtPosition } from '@/lib/game/noise';
import type { SaveData } from '@/lib/game/saveManager';
import { createSave, loadSave, getSaves, deleteSave, updateSave, hasAnySave } from '@/lib/game/saveManager';

interface Projectile {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  element: ElementType;
  speed: number;
  damage: number;
  createdAt: number;
  isPlayerProjectile: boolean;
}

interface DamageNumber {
  id: string;
  position: [number, number, number];
  value: number;
  isHeal: boolean;
  createdAt: number;
}

interface NPCState extends NPCData {
  currentHp: number;
  isAlive: boolean;
  position: [number, number, number];
  targetPosition?: [number, number, number];
  lastAttackTime: number;
  isAggroed: boolean;
}

interface HitEffect {
  id: string;
  position: [number, number, number];
  element: ElementType;
  isCrit: boolean;
  createdAt: number;
}

interface GameState {
  // Screens
  currentScreen: GameScreen;

  // Player
  playerName: string;
  playerPosition: [number, number, number];
  playerRotation: number;
  playerTargetRotation: number;
  playerVelocity: [number, number, number]; // current movement velocity
  playerVerticalVelocity: number; // for jump/gravity
  isGrounded: boolean;
  isSprinting: boolean;
  stats: PlayerStats;
  currentElement: ElementType;
  unlockedElements: ElementType[];
  inventory: InventoryItem[];
  equipment: Equipment;
  appearance: CharacterAppearance;

  // Combat
  projectiles: Projectile[];
  damageNumbers: DamageNumber[];
  hitEffects: HitEffect[];
  isAttacking: boolean;
  isCharging: boolean;
  isDodging: boolean;
  isCasting: boolean;
  comboCount: number;
  lastMeleeTime: number;
  lastMagicTime: number;
  lastDodgeTime: number;
  lastHealTime: number;
  lastComboTime: number;
  elementCooldowns: Record<ElementType, number>; // last use timestamp per element

  // NPCs
  npcStates: NPCState[];

  // World
  currentBiome: BiomeType;
  dayTime: number;

  // UI State
  isInventoryOpen: boolean;
  isDialogueOpen: boolean;
  dialogueNpcId: string | null;
  dialogueLineIndex: number;
  selectedInventoryItem: string | null;

  // Save
  currentSaveId: string | null;
  playTime: number;
  lastSaveTime: number;
  hasSaves: boolean;

  // Actions
  setScreen: (screen: GameScreen) => void;
  setPlayerName: (name: string) => void;
  setPlayerPosition: (pos: [number, number, number]) => void;
  setPlayerRotation: (rot: number) => void;
  updateStats: (updates: Partial<PlayerStats>) => void;
  setCurrentElement: (element: ElementType) => void;
  unlockElement: (element: ElementType) => void;
  addToInventory: (item: InventoryItem) => void;
  removeFromInventory: (itemId: string, quantity?: number) => void;
  useItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (slot: keyof Equipment) => void;
  setAppearance: (updates: Partial<CharacterAppearance>) => void;
  damagePlayer: (amount: number) => void;
  healPlayer: (amount: number) => void;
  useStamina: (amount: number) => void;
  useMana: (amount: number) => void;
  regenStats: (delta: number) => void;

  // Combat actions
  setAttacking: (v: boolean) => void;
  setCharging: (v: boolean) => void;
  setDodging: (v: boolean) => void;
  setCasting: (v: boolean) => void;
  spawnProjectile: (p: Omit<Projectile, 'id' | 'createdAt'>) => void;
  updateProjectiles: (now: number) => void;
  spawnDamageNumber: (p: Omit<DamageNumber, 'id' | 'createdAt'>) => void;
  cleanupDamageNumbers: (now: number) => void;
  spawnHitEffect: (p: Omit<HitEffect, 'id' | 'createdAt'>) => void;
  cleanupHitEffects: (now: number) => void;
  meleeAttack: () => void;
  magicAttack: (direction: [number, number, number]) => void;
  dodge: (direction: [number, number, number]) => void;
  heal: () => void;
  setPlayerVelocity: (v: [number, number, number]) => void;
  setSprinting: (v: boolean) => void;
  jump: () => void;
  updatePlayerPhysics: (delta: number) => void;

  // NPC actions
  initNPCs: () => void;
  damageNPC: (npcId: string, amount: number) => void;
  updateNPCs: (playerPos: [number, number, number], now: number) => void;
  interactWithNPC: (npcId: string) => void;
  advanceDialogue: () => void;
  closeDialogue: () => void;

  // World
  updateBiome: () => void;

  // Save/Load
  newGame: (name: string) => void;
  saveGame: () => void;
  loadGameState: (saveId: string) => void;
  deleteGameState: (saveId: string) => void;
  refreshHasSaves: () => void;
  getSaveList: () => { id: string; name: string; timestamp: number; playTime: number }[];
  updatePlayTime: (delta: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  currentScreen: 'menu',
  playerName: '',
  playerPosition: [0, 2, 0],
  playerRotation: 0,
  playerTargetRotation: 0,
  stats: { ...DEFAULT_STATS },
  currentElement: 'fire',
  unlockedElements: ['fire'],
  inventory: [...STARTER_WEAPONS, ...STARTER_ITEMS],
  equipment: { weapon: STARTER_WEAPONS[0], armor: null, accessory: null },
  appearance: { ...DEFAULT_APPEARANCE },
  projectiles: [],
  damageNumbers: [],
  hitEffects: [],
  isAttacking: false,
  isCharging: false,
  isDodging: false,
  isCasting: false,
  comboCount: 0,
  lastMeleeTime: 0,
  lastMagicTime: 0,
  lastDodgeTime: 0,
  lastHealTime: 0,
  lastComboTime: 0,
  elementCooldowns: { fire: 0, ice: 0, lightning: 0, wind: 0, earth: 0 } as Record<ElementType, number>,
  playerVelocity: [0, 0, 0],
  playerVerticalVelocity: 0,
  isGrounded: true,
  isSprinting: false,
  npcStates: [],
  currentBiome: 'forest',
  dayTime: 0.5,
  isInventoryOpen: false,
  isDialogueOpen: false,
  dialogueNpcId: null,
  dialogueLineIndex: 0,
  selectedInventoryItem: null,
  currentSaveId: null,
  playTime: 0,
  lastSaveTime: 0,
  hasSaves: false,

  // Screen management
  setScreen: (screen) => set({ currentScreen: screen }),

  // Player
  setPlayerName: (name) => set({ playerName: name }),
  setPlayerPosition: (pos) => {
    set({ playerPosition: pos });
    get().updateBiome();
  },
  setPlayerRotation: (rot) => set({ playerRotation: rot }),
  updateStats: (updates) =>
    set((s) => ({ stats: { ...s.stats, ...updates } })),

  setCurrentElement: (element) => set({ currentElement: element }),
  unlockElement: (element) =>
    set((s) => ({
      unlockedElements: s.unlockedElements.includes(element)
        ? s.unlockedElements
        : [...s.unlockedElements, element],
    })),

  // Inventory
  addToInventory: (item) =>
    set((s) => {
      const existing = s.inventory.find((i) => i.id === item.id);
      if (existing) {
        return {
          inventory: s.inventory.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return { inventory: [...s.inventory, { ...item }] };
    }),

  removeFromInventory: (itemId, quantity = 1) =>
    set((s) => ({
      inventory: s.inventory
        .map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i
        )
        .filter((i) => i.quantity > 0),
    })),

  useItem: (itemId) => {
    const item = get().inventory.find((i) => i.id === itemId);
    if (!item || item.quantity <= 0) return;

    if (item.type === 'potion_hp') {
      get().healPlayer(50);
      get().spawnDamageNumber({
        position: [...get().playerPosition] as [number, number, number],
        value: 50,
        isHeal: true,
      });
    } else if (item.type === 'potion_mana') {
      get().updateStats({
        mana: Math.min(
          get().stats.maxMana,
          get().stats.mana + 30
        ),
      });
    } else if (item.type === 'potion_stamina') {
      get().updateStats({
        stamina: Math.min(
          get().stats.maxStamina,
          get().stats.stamina + 50
        ),
      });
    }
    get().removeFromInventory(itemId);
  },

  equipItem: (itemId) => {
    const item = get().inventory.find((i) => i.id === itemId);
    if (!item) return;

    let slot: keyof Equipment | null = null;
    if (item.type === 'weapon') slot = 'weapon';
    else if (item.type === 'armor') slot = 'armor';
    else if (item.type === 'accessory') slot = 'accessory';
    if (!slot) return;

    const current = get().equipment[slot];
    set((s) => ({
      equipment: { ...s.equipment, [slot]: item },
      inventory: [
        ...s.inventory.filter((i) => i.id !== itemId),
        ...(current ? [current] : []),
      ],
    }));

    // Recalculate stats
    const eq = get().equipment;
    const bonus: Partial<PlayerStats> = {};
    [eq.weapon, eq.armor, eq.accessory].forEach((e) => {
      if (e?.stats) {
        Object.entries(e.stats).forEach(([key, val]) => {
          (bonus as Record<string, number>)[key] =
            ((bonus as Record<string, number>)[key] || 0) + (val as number);
        });
      }
    });
    get().updateStats(bonus);
  },

  unequipItem: (slot) => {
    const item = get().equipment[slot];
    if (!item) return;
    set((s) => ({
      equipment: { ...s.equipment, [slot]: null },
      inventory: [...s.inventory, item],
    }));
  },

  setAppearance: (updates) =>
    set((s) => ({ appearance: { ...s.appearance, ...updates } })),

  // Stat management
  damagePlayer: (amount) => {
    const { stats } = get();
    const actualDamage = Math.max(1, amount - stats.armor * 0.3);
    const newHp = Math.max(0, stats.hp - actualDamage);
    get().updateStats({ hp: newHp });
    get().spawnDamageNumber({
      position: [...get().playerPosition, get().playerPosition[1] + 2] as [number, number, number],
      value: Math.round(actualDamage),
      isHeal: false,
    });
  },

  healPlayer: (amount) =>
    set((s) => ({
      stats: {
        ...s.stats,
        hp: Math.min(s.stats.maxHp, s.stats.hp + amount),
      },
    })),

  useStamina: (amount) =>
    set((s) => ({
      stats: {
        ...s.stats,
        stamina: Math.max(0, s.stats.stamina - amount),
      },
    })),

  useMana: (amount) =>
    set((s) => ({
      stats: {
        ...s.stats,
        mana: Math.max(0, s.stats.mana - amount),
      },
    })),

  regenStats: (delta) =>
    set((s) => ({
      stats: {
        ...s.stats,
        stamina: Math.min(s.stats.maxStamina, s.stats.stamina + delta * 8),
        mana: Math.min(s.stats.maxMana, s.stats.mana + delta * 3),
        hp: Math.min(s.stats.maxHp, s.stats.hp + delta * 0.5),
      },
    })),

  // Combat state
  setAttacking: (v) => set({ isAttacking: v }),
  setCharging: (v) => set({ isCharging: v }),
  setDodging: (v) => set({ isDodging: v }),
  setCasting: (v) => set({ isCasting: v }),

  spawnProjectile: (p) =>
    set((s) => ({
      projectiles: [
        ...s.projectiles,
        { ...p, id: `proj_${Date.now()}_${Math.random()}`, createdAt: Date.now() },
      ],
    })),

  updateProjectiles: (now) =>
    set((s) => {
      const alive: Projectile[] = [];
      const newDmgNumbers: DamageNumber[] = [];

      for (const proj of s.projectiles) {
        const age = (now - proj.createdAt) / 1000;
        if (age > 3) continue;

        const newPos: [number, number, number] = [
          proj.position[0] + proj.direction[0] * proj.speed * 0.016,
          proj.position[1] + proj.direction[1] * proj.speed * 0.016,
          proj.position[2] + proj.direction[2] * proj.speed * 0.016,
        ];

        // Check collision with NPCs (if player projectile) or player (if NPC projectile)
        if (proj.isPlayerProjectile) {
          for (const npc of s.npcStates) {
            if (!npc.isAlive || !npc.isHostile) continue;
            const dx = newPos[0] - npc.position[0];
            const dy = newPos[1] - (npc.position[1] + npc.scale);
            const dz = newPos[2] - npc.position[2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < 2) {
              get().damageNPC(npc.id, proj.damage);
              newDmgNumbers.push({
                id: `dmg_${Date.now()}_${Math.random()}`,
                position: [npc.position[0], npc.position[1] + npc.scale + 1, npc.position[2]],
                value: proj.damage,
                isHeal: false,
                createdAt: now,
              });
              continue;
            }
          }
          alive.push({ ...proj, position: newPos });
        }
      }

      return {
        projectiles: alive,
        damageNumbers: [...s.damageNumbers, ...newDmgNumbers],
      };
    }),

  spawnDamageNumber: (p) =>
    set((s) => ({
      damageNumbers: [
        ...s.damageNumbers,
        { ...p, id: `dmg_${Date.now()}_${Math.random()}`, createdAt: Date.now() },
      ],
    })),

  cleanupDamageNumbers: (now) =>
    set((s) => ({
      damageNumbers: s.damageNumbers.filter((d) => now - d.createdAt < 1500),
    })),

  spawnHitEffect: (p) =>
    set((s) => ({
      hitEffects: [
        ...s.hitEffects,
        { ...p, id: `hit_${Date.now()}_${Math.random()}`, createdAt: Date.now() },
      ],
    })),

  cleanupHitEffects: (now) =>
    set((s) => ({
      hitEffects: s.hitEffects.filter((h) => now - h.createdAt < 800),
    })),

  setPlayerVelocity: (v) => set({ playerVelocity: v }),
  setSprinting: (v) => set({ isSprinting: v }),

  jump: () => {
    const { isGrounded, playerVerticalVelocity, stats } = get();
    if (!isGrounded || stats.stamina < 10) return;
    get().useStamina(10);
    set({ playerVerticalVelocity: 8, isGrounded: false });
  },

  updatePlayerPhysics: (delta) =>
    set((s) => {
      const vy = s.playerVerticalVelocity + GRAVITY * delta;
      const newY = s.playerPosition[1] + vy * delta;
      const groundY = getTerrainHeight(s.playerPosition[0], s.playerPosition[2]) + 0.1;
      const grounded = newY <= groundY;
      return {
        playerVerticalVelocity: grounded ? 0 : vy,
        playerPosition: [
          s.playerPosition[0],
          grounded ? groundY : newY,
          s.playerPosition[2],
        ] as [number, number, number],
        isGrounded: grounded,
      };
    }),

  meleeAttack: () => {
    const now = Date.now();
    const { lastMeleeTime, lastComboTime, comboCount, stats } = get();
    
    // Combo window: 600ms between attacks to continue combo
    const comboWindow = 600;
    const newCombo = (now - lastComboTime < comboWindow && comboCount < 3) ? comboCount + 1 : 1;
    
    // Combo-specific timings and damage
    const comboData = [
      { cooldown: 300, staminaCost: 6, damageMult: 1.0, range: 3.0, attackTime: 250 },  // Quick slash
      { cooldown: 350, staminaCost: 8, damageMult: 1.2, range: 3.5, attackTime: 300 },  // Heavy slash
      { cooldown: 500, staminaCost: 15, damageMult: 2.0, range: 4.5, attackTime: 450 },  // Finisher
    ];
    const cd = comboData[Math.min(newCombo - 1, 2)];
    
    if (now - lastMeleeTime < cd.cooldown) return;
    if (stats.stamina < cd.staminaCost) return;

    get().useStamina(cd.staminaCost);
    set({ lastMeleeTime: now, lastComboTime: now, isAttacking: true, comboCount: newCombo });
    setTimeout(() => get().setAttacking(false), cd.attackTime);

    const pos = get().playerPosition;
    const rot = get().playerRotation;
    const attackRange = cd.range;
    const attackDir: [number, number, number] = [
      -Math.sin(rot) * attackRange,
      0,
      -Math.cos(rot) * attackRange,
    ];

    // Check NPC hits with wider arc for combo finisher
    const hitAngle = newCombo === 3 ? 2.5 : 1.5; // radians
    let hitAny = false;
    for (const npc of get().npcStates) {
      if (!npc.isAlive || !npc.isHostile) continue;
      const dx = npc.position[0] - pos[0];
      const dz = npc.position[2] - pos[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > attackRange + 1) continue;
      
      // Check angle
      const npcAngle = Math.atan2(dx, dz);
      const playerAngle = -rot;
      let angleDiff = Math.abs(npcAngle - playerAngle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      if (angleDiff > hitAngle / 2) continue;

      const isCrit = newCombo === 3 && Math.random() < 0.5;
      const weaponBonus = get().equipment.weapon?.stats?.attack || 0;
      const baseDamage = stats.attack + weaponBonus;
      const damage = Math.round(baseDamage * cd.damageMult * (isCrit ? 1.5 : 1));
      
      get().damageNPC(npc.id, damage);
      get().spawnHitEffect({
        position: [npc.position[0], npc.position[1] + npc.scale * 0.5, npc.position[2]],
        element: get().currentElement,
        isCrit,
      });
      hitAny = true;
    }

    // Reset combo after finisher or miss
    if (newCombo === 3 || !hitAny) {
      setTimeout(() => set({ comboCount: 0 }), 200);
    }
  },

  magicAttack: (direction) => {
    const now = Date.now();
    const { lastMagicTime, stats, currentElement, elementCooldowns } = get();
    const cooldown = 500;
    const lastUse = elementCooldowns[currentElement] || 0;
    if (now - lastUse < cooldown) return;
    if (now - lastMagicTime < 300) return;
    if (stats.mana < 10) return;
    if (stats.stamina < 12) return;

    get().useMana(10);
    get().useStamina(12);
    set((s) => ({ 
      lastMagicTime: now, 
      isCasting: true, 
      elementCooldowns: { ...s.elementCooldowns, [currentElement]: now } 
    }));
    setTimeout(() => get().setCasting(false), 350);

    const pos = get().playerPosition;
    const damage = stats.magicAttack;

    get().spawnProjectile({
      position: [pos[0], pos[1] + 1.2, pos[2]],
      direction: [direction[0], direction[1], direction[2]],
      element: currentElement,
      speed: 45,
      damage,
      isPlayerProjectile: true,
    });
  },

  dodge: (direction) => {
    const now = Date.now();
    const { lastDodgeTime, stats } = get();
    if (now - lastDodgeTime < 500) return;
    if (stats.stamina < 20) return;

    get().useStamina(20);
    set({ lastDodgeTime: now, isDodging: true });
    setTimeout(() => get().setDodging(false), 300);

    const pos = get().playerPosition;
    const len = Math.sqrt(direction[0] ** 2 + direction[2] ** 2) || 1;
    const newPos: [number, number, number] = [
      pos[0] + (direction[0] / len) * 5,
      pos[1],
      pos[2] + (direction[2] / len) * 5,
    ];
    // Clamp to world
    const half = WORLD_SIZE / 2;
    newPos[0] = Math.max(-half, Math.min(half, newPos[0]));
    newPos[2] = Math.max(-half, Math.min(half, newPos[2]));
    newPos[1] = getTerrainHeight(newPos[0], newPos[2]) + 0.1;
    get().setPlayerPosition(newPos);
  },

  heal: () => {
    const now = Date.now();
    const { lastHealTime, stats } = get();
    if (now - lastHealTime < 2000) return;
    if (stats.mana < 25) return;

    get().useMana(25);
    set({ lastHealTime: now });
    get().healPlayer(30);
  },

  // NPC Management
  initNPCs: () =>
    set(() => {
      const npcs: NPCState[] = NPC_DATA.map((data) => {
        const y = getTerrainHeight(data.position[0], data.position[2]);
        return {
          ...data,
          currentHp: data.stats?.maxHp || 999,
          isAlive: true,
          position: [data.position[0], y, data.position[2]] as [number, number, number],
          lastAttackTime: 0,
          isAggroed: false,
        };
      });
      return { npcStates: npcs };
    }),

  damageNPC: (npcId, amount) =>
    set((s) => ({
      npcStates: s.npcStates.map((npc) =>
        npc.id === npcId
          ? { ...npc, currentHp: Math.max(0, npc.currentHp - amount), isAggroed: true, isAlive: npc.currentHp - amount > 0 }
          : npc
      ),
    })),

  updateNPCs: (playerPos, now) =>
    set((s) => {
      const updatedNPCs = s.npcStates.map((npc) => {
        if (!npc.isAlive || !npc.isHostile || !npc.isAggroed) return npc;

        const dx = playerPos[0] - npc.position[0];
        const dz = playerPos[2] - npc.position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);

        // Attack if close enough
        if (dist < 3 && now - npc.lastAttackTime > 1500) {
          get().damagePlayer(npc.stats?.attack || 10);
          return { ...npc, lastAttackTime: now };
        }

        // Move toward player if in aggro range
        if (dist < 30 && dist > 2) {
          const speed = (npc.stats?.speed || 3) * 0.016;
          const len = Math.sqrt(dx * dx + dz * dz);
          const newX = npc.position[0] + (dx / len) * speed;
          const newZ = npc.position[2] + (dz / len) * speed;
          const newY = getTerrainHeight(newX, newZ);
          return { ...npc, position: [newX, newY, newZ] as [number, number, number] };
        }

        return npc;
      });
      return { npcStates: updatedNPCs };
    }),

  interactWithNPC: (npcId) => {
    const npc = get().npcStates.find((n) => n.id === npcId);
    if (!npc || !npc.isAlive) return;
    if (npc.isHostile) return;

    set({
      isDialogueOpen: true,
      dialogueNpcId: npcId,
      dialogueLineIndex: 0,
    });
  },

  advanceDialogue: () => {
    const { dialogueNpcId, dialogueLineIndex, npcStates } = get();
    const npc = npcStates.find((n) => n.id === dialogueNpcId);
    if (!npc) return;

    if (dialogueLineIndex < npc.dialogue.length - 1) {
      set({ dialogueLineIndex: dialogueLineIndex + 1 });
    } else {
      get().closeDialogue();
    }
  },

  closeDialogue: () =>
    set({ isDialogueOpen: false, dialogueNpcId: null, dialogueLineIndex: 0 }),

  // World
  updateBiome: () => {
    const [x, , z] = get().playerPosition;
    set({ currentBiome: getBiomeAtPosition(x, z) });
  },

  // Save/Load
  newGame: (name) => {
    const saveId = `save_${Date.now()}`;
    const initialStats = { ...DEFAULT_STATS };
    const pos: [number, number, number] = [0, getTerrainHeight(0, 0) + 0.1, 0];

    set({
      playerName: name,
      playerPosition: pos,
      playerRotation: 0,
      stats: initialStats,
      currentElement: 'fire',
      unlockedElements: ['fire'],
      inventory: [...STARTER_WEAPONS, ...STARTER_ITEMS],
      equipment: { weapon: STARTER_WEAPONS[0], armor: null, accessory: null },
      appearance: { ...DEFAULT_APPEARANCE },
      projectiles: [],
      damageNumbers: [],
      npcStates: [],
      currentSaveId: saveId,
      playTime: 0,
      lastSaveTime: Date.now(),
    });

    get().initNPCs();
    get().saveGame();
    get().setScreen('playing');
  },

  saveGame: () => {
    const state = get();
    if (!state.currentSaveId) return;

    const data: SaveData = {
      version: 1,
      timestamp: Date.now(),
      playerName: state.playerName,
      playerPosition: state.playerPosition,
      playerRotation: state.playerRotation,
      stats: state.stats,
      currentElement: state.currentElement,
      inventory: state.inventory,
      equipment: state.equipment,
      appearance: state.appearance,
      npcsDefeated: state.npcStates
        .filter((n) => !n.isAlive)
        .map((n) => n.id),
      playTime: state.playTime,
    };

    createSave(state.currentSaveId, data);
    set({ lastSaveTime: Date.now() });
  },

  loadGameState: (saveId) => {
    const data = loadSave(saveId);
    if (!data) return;

    set({
      playerName: data.playerName,
      playerPosition: data.playerPosition,
      playerRotation: data.playerRotation,
      stats: data.stats,
      currentElement: data.currentElement,
      inventory: data.inventory,
      equipment: data.equipment,
      appearance: data.appearance,
      currentSaveId: saveId,
      playTime: data.playTime,
    });

    get().initNPCs();

    // Mark defeated NPCs
    const defeated = data.npcsDefeated || [];
    set((s) => ({
      npcStates: s.npcStates.map((n) =>
        defeated.includes(n.id) ? { ...n, isAlive: false, currentHp: 0 } : n
      ),
    }));

    get().updateBiome();
    get().setScreen('playing');
  },

  deleteGameState: (saveId) => {
    deleteSave(saveId);
    get().refreshHasSaves();
  },

  refreshHasSaves: () => set({ hasSaves: hasAnySave() }),

  getSaveList: () => getSaves(),

  updatePlayTime: (delta) => set((s) => ({ playTime: s.playTime + delta })),
}));