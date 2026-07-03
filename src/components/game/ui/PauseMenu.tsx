'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Play, Save, Settings, LogOut, RotateCcw } from 'lucide-react';

export function PauseMenu() {
  const setScreen = useGameStore((s) => s.setScreen);
  const saveGame = useGameStore((s) => s.saveGame);
  const isInventoryOpen = useGameStore((s) => s.isInventoryOpen);

  const closePause = () => {
    if (isInventoryOpen) {
      useGameStore.setState({ isInventoryOpen: false });
    }
    setScreen('playing');
  };

  const handleSave = () => {
    saveGame();
  };

  const handleQuit = () => {
    saveGame();
    setScreen('menu');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-80 bg-slate-900/95 border border-purple-500/20 rounded-2xl p-6"
      >
        <h2 className="text-white text-2xl font-bold text-center mb-8">Пауза</h2>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.97 }}
            onClick={closePause}
            className="flex items-center gap-3 w-full h-12 px-4 rounded-xl bg-gradient-to-r from-green-600/60 to-green-700/60 hover:from-green-500/80 hover:to-green-600/80 text-white font-medium border border-green-500/20 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5" />
            Продолжить
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="flex items-center gap-3 w-full h-12 px-4 rounded-xl bg-gradient-to-r from-blue-600/60 to-blue-700/60 hover:from-blue-500/80 hover:to-blue-600/80 text-white font-medium border border-blue-500/20 transition-all cursor-pointer"
          >
            <Save className="w-5 h-5" />
            Сохранить
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => useGameStore.setState({ isInventoryOpen: true })}
            className="flex items-center gap-3 w-full h-12 px-4 rounded-xl bg-gradient-to-r from-purple-600/60 to-purple-700/60 hover:from-purple-500/80 hover:to-purple-600/80 text-white font-medium border border-purple-500/20 transition-all cursor-pointer"
          >
            <Settings className="w-5 h-5" />
            Инвентарь
          </motion.button>

          <div className="border-t border-white/10 my-1" />

          <motion.button
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleQuit}
            className="flex items-center gap-3 w-full h-12 px-4 rounded-xl bg-gradient-to-r from-red-600/40 to-red-700/40 hover:from-red-500/60 hover:to-red-600/60 text-red-300 font-medium border border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            В Главное Меню
          </motion.button>
        </div>

        <p className="text-white/20 text-xs text-center mt-6">
          Esc — закрыть паузу
        </p>
      </motion.div>
    </motion.div>
  );
}