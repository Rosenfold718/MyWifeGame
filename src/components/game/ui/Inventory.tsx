'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { X, Shield, Swords, Gem } from 'lucide-react';
import type { InventoryItem, Equipment } from '@/lib/game/constants';

export function Inventory() {
  const inventory = useGameStore((s) => s.inventory);
  const equipment = useGameStore((s) => s.equipment);
  const stats = useGameStore((s) => s.stats);
  const handleUseItem = useGameStore((s) => s.useItem);
  const equipItem = useGameStore((s) => s.equipItem);
  const unequipItem = useGameStore((s) => s.unequipItem);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const closeInventory = () => {
    useGameStore.getState().setScreen('playing');
    useGameStore.setState({ isInventoryOpen: false });
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const isEquippable = (item: InventoryItem) =>
    item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';

  const isEquipped = (item: InventoryItem) =>
    equipment.weapon?.id === item.id ||
    equipment.armor?.id === item.id ||
    equipment.accessory?.id === item.id;

  const isUsable = (item: InventoryItem) =>
    item.type.startsWith('potion_');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={closeInventory}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl h-[80vh] bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-purple-500/20 rounded-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <Gem className="w-5 h-5 text-purple-400" />
            Инвентарь
          </h2>
          <Button
            onClick={closeInventory}
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8 p-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Equipment + Stats */}
          <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
            {/* Equipment slots */}
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Снаряжение</h3>
            <div className="space-y-2 mb-6">
              <EquipSlot
                label="Оружие"
                icon={<Swords className="w-4 h-4" />}
                item={equipment.weapon}
                onUnequip={() => unequipItem('weapon')}
              />
              <EquipSlot
                label="Броня"
                icon={<Shield className="w-4 h-4" />}
                item={equipment.armor}
                onUnequip={() => unequipItem('armor')}
              />
              <EquipSlot
                label="Аксессуар"
                icon={<Gem className="w-4 h-4" />}
                item={equipment.accessory}
                onUnequip={() => unequipItem('accessory')}
              />
            </div>

            {/* Stats */}
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Характеристики</h3>
            <div className="space-y-1.5 text-sm">
              <StatRow label="⚡ Атака" value={stats.attack} />
              <StatRow label="✨ Маг. Атака" value={stats.magicAttack} />
              <StatRow label="🛡️ Броня" value={stats.armor} />
              <StatRow label="💨 Скорость" value={stats.speed} />
            </div>
          </div>

          {/* Middle: Items */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Предметы</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {inventory.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedItem?.id === item.id
                      ? 'bg-purple-500/20 border-purple-400/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  } ${isEquipped(item) ? 'ring-1 ring-purple-400/30' : ''}`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-white text-xs font-medium truncate">{item.name}</p>
                  <p className="text-white/40 text-[10px]">
                    {item.type === 'weapon' && 'Оружие'}
                    {item.type === 'armor' && 'Броня'}
                    {item.type === 'accessory' && 'Аксессуар'}
                    {item.type === 'potion_hp' && 'Зелье HP'}
                    {item.type === 'potion_mana' && 'Зелье Маны'}
                    {item.type === 'potion_stamina' && 'Зелье Стамины'}
                    {item.type === 'material' && 'Материал'}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-white/30 text-[10px]">x{item.quantity}</p>
                  )}
                </motion.button>
              ))}
            </div>
            {inventory.length === 0 && (
              <p className="text-white/30 text-center py-8">Инвентарь пуст</p>
            )}
          </div>

          {/* Right: Item details */}
          <div className="w-56 border-l border-white/10 p-4">
            {selectedItem ? (
              <div>
                <div className="text-4xl text-center mb-3">{selectedItem.icon}</div>
                <h3 className="text-white font-bold text-sm text-center mb-2">{selectedItem.name}</h3>
                <p className="text-white/50 text-xs text-center mb-4">{selectedItem.description}</p>

                {selectedItem.stats && (
                  <div className="space-y-1 mb-4">
                    {Object.entries(selectedItem.stats).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-white/50">{statName(key)}</span>
                        <span className="text-green-400">+{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedItem.element && (
                  <div className="text-center mb-4">
                    <span className="text-xs px-2 py-1 bg-purple-500/20 rounded-full text-purple-300">
                      Стихия: {selectedItem.element}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  {isEquippable(selectedItem) && !isEquipped(selectedItem) && (
                    <Button
                      onClick={() => equipItem(selectedItem.id)}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs h-8 cursor-pointer"
                    >
                      Экипировать
                    </Button>
                  )}
                  {isEquipped(selectedItem) && (
                    <Button
                      onClick={() => {
                        if (selectedItem.type === 'weapon') unequipItem('weapon');
                        if (selectedItem.type === 'armor') unequipItem('armor');
                        if (selectedItem.type === 'accessory') unequipItem('accessory');
                      }}
                      variant="outline"
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8 cursor-pointer"
                    >
                      Снять
                    </Button>
                  )}
                  {isUsable(selectedItem) && (
                    <Button
                      onClick={() => {
                        handleUseItem(selectedItem.id);
                        setSelectedItem(null);
                      }}
                      className="w-full bg-green-600 hover:bg-green-500 text-white text-xs h-8 cursor-pointer"
                    >
                      Использовать
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/20 text-xs text-center">Выберите предмет</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EquipSlot({
  label,
  icon,
  item,
  onUnequip,
}: {
  label: string;
  icon: React.ReactNode;
  item: InventoryItem | null;
  onUnequip: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/40">
        {item ? item.icon : icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/40 text-[10px]">{label}</p>
        {item ? (
          <div className="flex items-center justify-between">
            <p className="text-white text-xs truncate">{item.name}</p>
            <button
              onClick={onUnequip}
              className="text-red-400/50 hover:text-red-400 text-[10px] ml-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ) : (
          <p className="text-white/20 text-xs">Пусто</p>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/50 text-xs">{label}</span>
      <span className="text-white text-xs font-medium">{value}</span>
    </div>
  );
}

function statName(key: string): string {
  const names: Record<string, string> = {
    attack: 'Атака',
    magicAttack: 'Маг. Атака',
    armor: 'Броня',
    speed: 'Скорость',
    hp: 'HP',
    maxHp: 'Макс. HP',
    mana: 'Мана',
    maxMana: 'Макс. Мана',
    stamina: 'Стамина',
    maxStamina: 'Макс. Стамина',
  };
  return names[key] || key;
}