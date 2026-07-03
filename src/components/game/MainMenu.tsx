'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Sparkles, Play, Save, Settings, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Floating particle component
function FloatingParticle({ delay, x, size, duration }: { delay: number; x: number; size: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        bottom: '-5%',
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(255,180,220,0.8), rgba(200,140,255,0.3), transparent)`,
        filter: 'blur(1px)',
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [-20, -600],
        opacity: [0, 0.8, 0.6, 0],
        x: [0, Math.sin(delay) * 50, Math.cos(delay) * 30, Math.sin(delay * 2) * 60],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

// Animated magic circle
function MagicCircle() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
      <motion.div
        className="w-[600px] h-[600px] rounded-full border-2 border-pink-300/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full border border-purple-300/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full border border-cyan-300/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(255,150,200,0.05), transparent, rgba(150,100,255,0.05), transparent)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function MainMenu() {
  const { newGame, setScreen, refreshHasSaves, hasSaves, loadGameState, getSaveList } = useGameStore();
  const [showNewGameInput, setShowNewGameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    refreshHasSaves();
    const timer = setTimeout(() => setMenuVisible(true), 100);
    return () => clearTimeout(timer);
  }, [refreshHasSaves]);

  const particles = Array.from({ length: 25 }, (_, i) => ({
    delay: i * 0.4,
    x: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 6 + Math.random() * 8,
  }));

  const handleNewGame = () => {
    if (playerName.trim()) {
      newGame(playerName.trim());
    }
  };

  const handleContinue = () => {
    const saves = getSaveList();
    if (saves.length > 0) {
      loadGameState(saves[0].id);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(120, 40, 200, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(200, 50, 100, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(40, 80, 200, 0.2) 0%, transparent 50%),
            linear-gradient(180deg, #0a0015 0%, #1a0a2e 30%, #0d1b3e 60%, #1a0a2e 100%)
          `,
        }}
      />

      {/* Animated stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 1 + Math.random() * 2,
              height: 1 + Math.random() * 2,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Magic circles */}
      <MagicCircle />

      {/* Main content */}
      <AnimatePresence>
        {menuVisible && (
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            {/* Title */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="text-center mb-16"
            >
              <motion.div
                className="relative"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <h1
                  className="text-7xl md:text-8xl font-bold tracking-wider mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #ff9de2, #c77dff, #7eb8ff, #ff9de2)',
                    backgroundSize: '300% 300%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'gradientShift 4s ease infinite',
                    textShadow: '0 0 40px rgba(199,125,255,0.3)',
                    filter: 'drop-shadow(0 0 30px rgba(199,125,255,0.4))',
                  }}
                >
                  Эфирная Сага
                </h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-lg md:text-xl text-purple-200/60 tracking-[0.3em] uppercase font-light"
              >
                <Sparkles className="inline w-4 h-4 mr-2" />
                Мир Магии Ждёт Героя
                <Sparkles className="inline w-4 h-4 ml-2" />
              </motion.p>
            </motion.div>

            {/* Menu buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col gap-4 w-80"
            >
              <AnimatePresence mode="wait">
                {!showNewGameInput && !showLoadMenu && (
                  <motion.div
                    key="main-buttons"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3"
                  >
                    <motion.div whileHover={{ scale: 1.05, x: 10 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setShowNewGameInput(true)}
                        className="w-full h-14 text-lg font-medium bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500 hover:to-pink-500 text-white border border-purple-400/30 rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer"
                      >
                        <Play className="w-5 h-5 mr-3" />
                        Новая Игра
                      </Button>
                    </motion.div>

                    {hasSaves && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.05, x: 10 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleContinue}
                          className="w-full h-14 text-lg font-medium bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/30 rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer"
                        >
                          <Save className="w-5 h-5 mr-3" />
                          Продолжить
                        </Button>
                      </motion.div>
                    )}

                    <motion.div whileHover={{ scale: 1.05, x: 10 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setShowLoadMenu(true)}
                        className="w-full h-14 text-lg font-medium bg-gradient-to-r from-slate-600/80 to-slate-700/80 hover:from-slate-500 hover:to-slate-600 text-white border border-slate-400/30 rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer"
                      >
                        <Swords className="w-5 h-5 mr-3" />
                        Загрузить Сохранение
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {showNewGameInput && (
                  <motion.div
                    key="new-game"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="text-center">
                      <p className="text-purple-200 text-sm mb-3">Как зовут твоего героя?</p>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNewGame()}
                        placeholder="Имя героя..."
                        autoFocus
                        maxLength={20}
                        className="w-full h-14 px-6 text-lg text-white bg-black/40 border border-purple-400/40 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 placeholder:text-purple-300/30 backdrop-blur-sm"
                      />
                    </div>
                    <div className="flex gap-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={handleNewGame}
                          disabled={!playerName.trim()}
                          className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-500 hover:to-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-green-400/30 rounded-xl backdrop-blur-sm cursor-pointer"
                        >
                          Начать Приключение
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setShowNewGameInput(false)}
                          variant="outline"
                          className="flex-1 h-12 text-base text-purple-200 border-purple-400/30 rounded-xl backdrop-blur-sm hover:bg-purple-500/10 cursor-pointer"
                        >
                          Назад
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {showLoadMenu && (
                  <motion.div
                    key="load-menu"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="text-center text-purple-200 text-sm mb-1">Сохранения</div>
                    <SaveLoadSlotList />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setShowLoadMenu(false)}
                        variant="outline"
                        className="w-full h-12 text-base text-purple-200 border-purple-400/30 rounded-xl backdrop-blur-sm hover:bg-purple-500/10 cursor-pointer"
                      >
                        Назад
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Version & credits */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 text-center"
            >
              <p className="text-purple-300/30 text-xs tracking-widest">
                AETHERIAL SAGA v0.1.0
              </p>
              <p className="text-purple-300/20 text-xs mt-1">
                Создано с любовью для неё ♡
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CSS animation for title gradient */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

function SaveLoadSlotList() {
  const { getSaveList, loadGameState, deleteGameState } = useGameStore();
  const saves = getSaveList();

  if (saves.length === 0) {
    return (
      <div className="text-center text-purple-300/50 py-8 text-sm">
        Нет сохранений
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
      {saves.map((save) => (
        <motion.div
          key={save.id}
          whileHover={{ scale: 1.02, x: 5 }}
          className="flex items-center justify-between p-3 bg-black/30 border border-purple-400/20 rounded-xl group"
        >
          <button
            onClick={() => loadGameState(save.id)}
            className="flex-1 text-left cursor-pointer"
          >
            <p className="text-white text-sm font-medium">{save.name}</p>
            <p className="text-purple-300/50 text-xs">
              {new Date(save.timestamp).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </button>
          <button
            onClick={() => deleteGameState(save.id)}
            className="text-red-400/50 hover:text-red-400 transition-colors p-2 opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Удалить"
          >
            ✕
          </button>
        </motion.div>
      ))}
    </div>
  );
}