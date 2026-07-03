'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Play } from 'lucide-react';
import { formatPlayTime } from '@/lib/game/saveManager';

export function SaveLoadMenu() {
  const setScreen = useGameStore((s) => s.setScreen);
  const getSaveList = useGameStore((s) => s.getSaveList);
  const loadGameState = useGameStore((s) => s.loadGameState);
  const deleteGameState = useGameStore((s) => s.deleteGameState);

  const saves = getSaveList();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-96 bg-slate-900/95 border border-purple-500/20 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">Загрузка</h2>
          <Button
            onClick={() => setScreen('menu')}
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Назад
          </Button>
        </div>

        {saves.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/30 text-sm mb-2">Нет сохранений</p>
            <p className="text-white/20 text-xs">Создайте новую игру, чтобы сохранить прогресс</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {saves.map((save) => (
              <motion.div
                key={save.id}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 group hover:border-purple-400/30 transition-all"
              >
                <button
                  onClick={() => loadGameState(save.id)}
                  className="flex-1 text-left cursor-pointer"
                >
                  <p className="text-white text-sm font-medium">{save.name}</p>
                  <p className="text-white/40 text-xs">
                    {new Date(save.timestamp).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-purple-300/40 text-[10px]">
                    {formatPlayTime(save.playTime)}
                  </p>
                </button>
                <div className="flex gap-1.5">
                  <Button
                    onClick={() => loadGameState(save.id)}
                    size="sm"
                    className="h-8 w-8 p-0 bg-green-600/40 hover:bg-green-500/60 border border-green-500/20 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm('Удалить это сохранение?')) {
                        deleteGameState(save.id);
                      }
                    }}
                    size="sm"
                    className="h-8 w-8 p-0 bg-red-600/40 hover:bg-red-500/60 border border-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}