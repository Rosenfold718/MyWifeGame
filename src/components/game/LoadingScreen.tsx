'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const LOADING_TIPS = [
  'Мир формируется из чистой магии...',
  'Древние духи пробуждаются...',
  'Кристалы стихий заряжаются...',
  'Зачарованный лес вырастает...',
  'Пустыня кристаллов кристаллизуется...',
  'Ледяные земли замерзают...',
  'NPC готовятся к встрече с героем...',
  'Магические существа просыпаются...',
];

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const markReadyRef = useRef<() => void>(() => {});

  // When game signals it's ready, jump to 100%
  const markReady = useCallback(() => {
    setProgress(100);
  }, []);
  markReadyRef.current = markReady;

  useEffect(() => {
    // Expose markReady globally so GameApp can call it
    const w = window as unknown as Record<string, (() => void) | undefined>;
    w.__gameReady = markReadyRef.current;
    return () => {
      delete w.__gameReady;
    };
  }, []);

  useEffect(() => {
    // Cycle through tips
    const tipInterval = setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, 3000);

    // Simulate loading progress for the initial bundle
    let current = 0;
    const progressInterval = setInterval(() => {
      const remaining = 100 - current;
      const increment = Math.max(0.3, remaining * 0.02) + Math.random() * 1.5;
      current = Math.min(current + increment, 95);
      setProgress(Math.floor(current));
      if (current >= 95) clearInterval(progressInterval);
    }, 100);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 40%, rgba(120, 40, 200, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(200, 50, 100, 0.2) 0%, transparent 50%),
            linear-gradient(180deg, #0a0015 0%, #1a0a2e 50%, #0d1b3e 100%)
          `,
        }}
      />

      {/* Animated stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: 1 + (i % 3),
              height: 1 + (i % 3),
            }}
            animate={{ opacity: [0.1, 0.7, 0.1] }}
            transition={{
              duration: 2 + (i % 3),
              delay: (i % 2) * 1,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Floating magic particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            bottom: '-5%',
            width: 2 + (i % 3) * 2,
            height: 2 + (i % 3) * 2,
            background: 'radial-gradient(circle, rgba(255,180,220,0.7), rgba(200,140,255,0.2), transparent)',
            filter: 'blur(1px)',
          }}
          animate={{
            y: [-20, -500],
            opacity: [0, 0.6, 0.4, 0],
            x: [0, Math.sin(i) * 30, Math.cos(i) * 20],
          }}
          transition={{
            duration: 5 + i * 0.5,
            delay: i * 0.3,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-md">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1
            className="text-5xl md:text-6xl font-bold tracking-wider mb-2"
            style={{
              background: 'linear-gradient(135deg, #ff9de2, #c77dff, #7eb8ff, #ff9de2)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'loadingGradient 3s ease infinite',
            }}
          >
            Эфирная Сага
          </h1>
          <p className="text-purple-200/40 text-sm tracking-[0.2em] uppercase">
            Загрузка мира
          </p>
        </motion.div>

        {/* Progress bar container */}
        <div className="w-full">
          <div className="relative h-3 bg-black/50 rounded-full overflow-hidden border border-purple-500/20">
            {/* Animated glow behind progress */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(199,125,255,0.3), transparent)',
                left: `${Math.max(0, progress - 20)}%`,
                width: '40%',
              }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {/* Progress fill */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #c77dff, #ff9de2, #7eb8ff)',
              }}
              transition={{ duration: 0.3 }}
            />
            {/* Shine effect */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.3))',
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex justify-between mt-2">
            <span className="text-purple-300/50 text-xs">{progress}%</span>
            <span className="text-purple-300/50 text-xs">v0.1.0</span>
          </div>
        </div>

        {/* Loading tip */}
        <motion.div
          key={tipIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center min-h-[3rem] flex items-center justify-center"
        >
          <p className="text-purple-200/50 text-sm italic flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-purple-400/50" />
            {LOADING_TIPS[tipIndex]}
            <Sparkles className="w-3 h-3 text-purple-400/50" />
          </p>
        </motion.div>
      </div>

      {/* Spinning magic circle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <motion.div
          className="w-[500px] h-[500px] rounded-full border-2 border-purple-300/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full border border-pink-300/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <style jsx>{`
        @keyframes loadingGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}