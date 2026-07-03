// ============================================
// GAME CONSTANTS & TYPES
// ============================================

export type GameScreen = 'menu' | 'customization' | 'playing' | 'paused' | 'saveload' | 'inventory';

export type ElementType = 'fire' | 'ice' | 'lightning' | 'wind' | 'earth';
export type BiomeType = 'forest' | 'desert' | 'tundra';
export type NPCType = 'human' | 'animal';
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'potion_hp' | 'potion_mana' | 'potion_stamina' | 'material';

export const WORLD_SIZE = 400;
export const TERRAIN_SEGMENTS = 200;
export const TERRAIN_HEIGHT_SCALE = 30;
export const GRAVITY = -25;

export const ELEMENT_COLORS: Record<ElementType, string> = {
  fire: '#ff4444',
  ice: '#44ccff',
  lightning: '#cc44ff',
  wind: '#44ff88',
  earth: '#ffaa44',
};

export const ELEMENT_NAMES: Record<ElementType, string> = {
  fire: 'Огонь',
  ice: 'Лёд',
  lightning: 'Молния',
  wind: 'Ветер',
  earth: 'Земля',
};

export const ELEMENT_ICONS: Record<ElementType, string> = {
  fire: '🔥',
  ice: '❄️',
  lightning: '⚡',
  wind: '🌪️',
  earth: '🪨',
};

export const BIOME_COLORS: Record<BiomeType, { ground: string; fog: string; sky: string; ambient: string }> = {
  forest: {
    ground: '#2d5a27',
    fog: '#1a3a15',
    sky: '#87ceeb',
    ambient: '#4a7a3a',
  },
  desert: {
    ground: '#d4a437',
    fog: '#c49427',
    sky: '#ffd89b',
    ambient: '#e8c878',
  },
  tundra: {
    ground: '#c8dce8',
    fog: '#a8c0d0',
    sky: '#b0d0e8',
    ambient: '#90b8d0',
  },
};

export const BIOME_ZONES: { biome: BiomeType; center: [number, number]; radius: number }[] = [
  { biome: 'forest', center: [0, 0], radius: 120 },
  { biome: 'desert', center: [150, 0], radius: 100 },
  { biome: 'tundra', center: [-50, -150], radius: 110 },
];

export interface PlayerStats {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  armor: number;
  attack: number;
  magicAttack: number;
  speed: number;
  level: number;
  exp: number;
  expToNext: number;
}

export const DEFAULT_STATS: PlayerStats = {
  hp: 100,
  maxHp: 100,
  mana: 80,
  maxMana: 80,
  stamina: 100,
  maxStamina: 100,
  armor: 5,
  attack: 15,
  magicAttack: 25,
  speed: 8,
  level: 1,
  exp: 0,
  expToNext: 100,
};

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  icon: string;
  quantity: number;
  stats?: Partial<PlayerStats>;
  element?: ElementType;
  value: number;
}

export interface Equipment {
  weapon: InventoryItem | null;
  armor: InventoryItem | null;
  accessory: InventoryItem | null;
}

export interface NPCData {
  id: string;
  name: string;
  type: NPCType;
  biome: BiomeType;
  position: [number, number, number];
  color: string;
  scale: number;
  dialogue: string[];
  isHostile: boolean;
  stats?: Partial<PlayerStats>;
  questId?: string;
}

export const NPC_DATA: NPCData[] = [
  {
    id: 'forest_guide',
    name: 'Эльфийский Проводник',
    type: 'human',
    biome: 'forest',
    position: [10, 0, 15],
    color: '#44aa44',
    scale: 1,
    dialogue: [
      'Добро пожаловать в Зачарованный Лес!',
      'Здесь живут древние духи и магические существа.',
      'Будь осторожен — не все здесь дружелюбны.',
    ],
    isHostile: false,
  },
  {
    id: 'merchant',
    name: 'Странствующий Торговец',
    type: 'human',
    biome: 'forest',
    position: [-20, 0, 30],
    color: '#cc8844',
    scale: 1,
    dialogue: [
      'Хочешь что-нибудь купить?',
      'У меня есть зелья и оружие.',
      'Торговля — лучшая магия!',
    ],
    isHostile: false,
  },
  {
    id: 'wolf',
    name: 'Лесной Волк',
    type: 'animal',
    biome: 'forest',
    position: [35, 0, -20],
    color: '#888888',
    scale: 0.7,
    dialogue: ['*рычит*', '*оскаливается*'],
    isHostile: true,
    stats: { hp: 60, maxHp: 60, attack: 12, speed: 6 },
  },
  {
    id: 'fox',
    name: 'Магическая Лиса',
    type: 'animal',
    biome: 'forest',
    position: [-30, 0, -10],
    color: '#ff6633',
    scale: 0.5,
    dialogue: [
      'Ты видишь меня? Немногие могут.',
      'Я хранитель лесных секретов...',
    ],
    isHostile: false,
  },
  {
    id: 'crystal_sage',
    name: 'Кристальный Мудрец',
    type: 'human',
    biome: 'desert',
    position: [140, 0, 20],
    color: '#88aacc',
    scale: 1,
    dialogue: [
      'Кристальная Пустыня хранит древнюю магию.',
      'Каждый кристалл здесь — память забытых цивилизаций.',
      'Если найдёшь Алтарь Стихий, ты обретёшь силу.',
    ],
    isHostile: false,
  },
  {
    id: 'scorpion',
    name: 'Пустынный Скорпион',
    type: 'animal',
    biome: 'desert',
    position: [170, 0, -30],
    color: '#994422',
    scale: 0.8,
    dialogue: ['*щёлкает клешнями*'],
    isHostile: true,
    stats: { hp: 80, maxHp: 80, attack: 18, armor: 10, speed: 4 },
  },
  {
    id: 'eagle',
    name: 'Пустынный Орёл',
    type: 'animal',
    biome: 'desert',
    position: [130, 0, 50],
    color: '#cc9944',
    scale: 0.6,
    dialogue: ['*кричит в небе*', '*парит над тобой*'],
    isHostile: false,
  },
  {
    id: 'ice_guardian',
    name: 'Ледяной Страж',
    type: 'human',
    biome: 'tundra',
    position: [-60, 0, -140],
    color: '#6699cc',
    scale: 1.2,
    dialogue: [
      'Ты пришёл в Землю Вечного Мороза...',
      'Здесь время замерзло навсегда.',
      'Только тот, кто владеет магией льда, может пройти дальше.',
    ],
    isHostile: false,
  },
  {
    id: 'polar_bear',
    name: 'Ледяной Медведь',
    type: 'animal',
    biome: 'tundra',
    position: [-30, 0, -170],
    color: '#eeeeff',
    scale: 1.1,
    dialogue: ['*рычит*', '*встаёт на задние лапы*'],
    isHostile: true,
    stats: { hp: 120, maxHp: 120, attack: 22, armor: 15, speed: 5 },
  },
  {
    id: 'snow_owl',
    name: 'Снежная Сова',
    type: 'animal',
    biome: 'tundra',
    position: [-80, 0, -120],
    color: '#ddeeff',
    scale: 0.4,
    dialogue: [
      'Ух-ху... Я вижу всё с высоты.',
      'Будь настороже — ледяные трещины повсюду.',
    ],
    isHostile: false,
  },
];

export interface CharacterAppearance {
  hairColor: string;
  hairStyle: number;
  outfitColor: string;
  skinTone: string;
  eyeColor: string;
  height: number;
}

export const HAIR_COLORS = [
  '#1a1a2e', '#8b4513', '#d4a437', '#ff4444',
  '#ff69b4', '#cc44ff', '#44ccff', '#ffffff',
];

export const HAIR_STYLES = ['Короткие', 'Длинные', 'Хвост', 'Ирокез', 'Кудрявые'];

export const OUTFIT_COLORS = [
  '#1a1a4e', '#4a1a1a', '#1a4a1a', '#4a4a1a',
  '#4a1a4a', '#1a4a4a', '#ffffff', '#2a2a2a',
];

export const SKIN_TONES = [
  '#ffe0bd', '#ffcd94', '#eac086', '#c68642',
  '#8d5524', '#5c3317',
];

export const EYE_COLORS = [
  '#4444ff', '#44ff44', '#ff4444', '#cc44ff',
  '#ffaa00', '#44ccff',
];

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  hairColor: '#1a1a2e',
  hairStyle: 0,
  outfitColor: '#1a1a4e',
  skinTone: '#ffe0bd',
  eyeColor: '#4444ff',
  height: 1,
};

export const STARTER_WEAPONS: InventoryItem[] = [
  {
    id: 'wooden_sword',
    name: 'Деревянный Меч',
    type: 'weapon',
    description: 'Простой меч из дуба. Начало пути героя.',
    icon: '⚔️',
    quantity: 1,
    stats: { attack: 5 },
    value: 10,
  },
  {
    id: 'apprentice_staff',
    name: 'Посох Ученика',
    type: 'weapon',
    description: 'Базовый магический посох.',
    icon: '🪄',
    quantity: 1,
    stats: { magicAttack: 10 },
    element: 'fire',
    value: 25,
  },
];

export const STARTER_ITEMS: InventoryItem[] = [
  {
    id: 'hp_potion_1',
    name: 'Зелье Здоровья',
    type: 'potion_hp',
    description: 'Восстанавливает 50 HP.',
    icon: '🧪',
    quantity: 5,
    value: 15,
  },
  {
    id: 'mana_potion_1',
    name: 'Зелье Маны',
    type: 'potion_mana',
    description: 'Восстанавливает 30 Маны.',
    icon: '💧',
    quantity: 3,
    value: 20,
  },
  {
    id: 'stamina_potion_1',
    name: 'Зелье Стамины',
    type: 'potion_stamina',
    description: 'Восстанавливает 50 Стамины.',
    icon: '🌿',
    quantity: 3,
    value: 15,
  },
];

export const COMBAT_COOLDOWNS = {
  meleeAttack: 0.4,
  chargedAttack: 1.2,
  magicBolt: 0.6,
  dodge: 0.5,
  heal: 2.0,
};

export const STAMINA_COSTS = {
  meleeAttack: 8,
  chargedAttack: 25,
  magicBolt: 15,
  dodge: 20,
};

export const MANA_COSTS = {
  magicBolt: 10,
  heal: 25,
  elementalBurst: 50,
};

export const DODGE_DISTANCE = 5;
export const DODGE_DURATION = 0.3;
export const MELEE_RANGE = 3;
export const MAGIC_RANGE = 50;