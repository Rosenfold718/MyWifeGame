import type { PlayerStats, InventoryItem, Equipment, CharacterAppearance, ElementType } from './constants';

export interface SaveData {
  version: number;
  timestamp: number;
  playerName: string;
  playerPosition: [number, number, number];
  playerRotation: number;
  stats: PlayerStats;
  currentElement: ElementType;
  inventory: InventoryItem[];
  equipment: Equipment;
  appearance: CharacterAppearance;
  npcsDefeated: string[];
  playTime: number;
}

const SAVE_KEY = 'mywifegame_saves';
const CURRENT_VERSION = 1;

export function getSaves(): { id: string; name: string; timestamp: number; playTime: number }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return [];
    const saves = JSON.parse(raw) as Record<string, SaveData>;
    return Object.entries(saves).map(([id, data]) => ({
      id,
      name: data.playerName || `Сохранение ${id}`,
      timestamp: data.timestamp,
      playTime: data.playTime || 0,
    }));
  } catch {
    return [];
  }
}

export function createSave(saveId: string, data: SaveData): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saves = getAllSaves();
    saves[saveId] = { ...data, version: CURRENT_VERSION, timestamp: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
    return true;
  } catch {
    return false;
  }
}

export function loadSave(saveId: string): SaveData | null {
  if (typeof window === 'undefined') return null;
  try {
    const saves = getAllSaves();
    return saves[saveId] || null;
  } catch {
    return null;
  }
}

export function deleteSave(saveId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saves = getAllSaves();
    delete saves[saveId];
    localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
    return true;
  } catch {
    return false;
  }
}

export function updateSave(saveId: string, updates: Partial<SaveData>): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saves = getAllSaves();
    if (!saves[saveId]) return false;
    saves[saveId] = { ...saves[saveId], ...updates, timestamp: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
    return true;
  } catch {
    return false;
  }
}

export function hasAnySave(): boolean {
  return getSaves().length > 0;
}

function getAllSaves(): Record<string, SaveData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function formatPlayTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}ч ${mins}м`;
  return `${mins}м`;
}