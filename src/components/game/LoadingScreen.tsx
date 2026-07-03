'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

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

  const markReady = useCallback(() => {
    setProgress(100);
  }, []);

  useEffect(() => {
    markReadyRef.current = markReady;
    const w = window as unknown as Record<string, (() => void) | undefined>;
    w.__gameReady = markReadyRef.current;
    return () => {
      delete w.__gameReady;
    };
  }, [markReady]);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, 3000);

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
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Deep background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse at 30% 40%, rgba(120, 40, 200, 0.25) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 60%, rgba(200, 50, 100, 0.2) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 90%, rgba(100, 60, 180, 0.15) 0%, transparent 40%),
          linear-gradient(180deg, #0a0015 0%, #1a0a2e 50%, #0d0820 100%)
        `,
      }} />

      {/* Distant stars */}
      {Array.from({ length: 60 }, (_, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            left: `${(i * 37 + 13) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            width: i % 4 === 0 ? 2 : 1,
            height: i % 4 === 0 ? 2 : 1,
            borderRadius: '50%',
            background: i % 5 === 0 ? '#ff9de2' : i % 3 === 0 ? '#7eb8ff' : '#fff',
          }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{
            duration: 2 + (i % 4),
            delay: (i % 3) * 0.8,
            repeat: Infinity,
          }}
        />
      ))}

      {/* Rising magic particles — more dense and varied */}
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            left: `${8 + (i * 4.7) % 84}%`,
            bottom: '-3%',
            width: 2 + (i % 4) * 2,
            height: 2 + (i % 4) * 2,
            borderRadius: '50%',
            background: i % 3 === 0
              ? 'radial-gradient(circle, rgba(255,157,226,0.9), rgba(199,125,255,0.3), transparent)'
              : i % 3 === 1
              ? 'radial-gradient(circle, rgba(126,184,255,0.8), rgba(199,125,255,0.2), transparent)'
              : 'radial-gradient(circle, rgba(255,255,255,0.7), rgba(199,125,255,0.2), transparent)',
            filter: 'blur(1px)',
            pointerEvents: 'none',
          }}
          animate={{
            y: [-10, -550 - (i % 3) * 100],
            opacity: [0, 0.7, 0.5, 0],
            x: [0, Math.sin(i * 1.7) * 40, Math.cos(i * 2.3) * 25, Math.sin(i * 0.9) * 55],
          }}
          transition={{
            duration: 5 + i * 0.4,
            delay: i * 0.25,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Spinning magic circles — very faint */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: 0.06,
      }}>
        <motion.div
          style={{
            width: 600,
            height: 600,
            borderRadius: '50%',
            border: '2px solid rgba(255, 157, 226, 0.5)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          style={{
            position: 'absolute',
            width: 480,
            height: 480,
            borderRadius: '50%',
            border: '1px solid rgba(199, 125, 255, 0.4)',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          style={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            border: '1px solid rgba(126, 184, 255, 0.3)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
        padding: '0 24px',
        width: '100%',
        maxWidth: 420,
      }}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-title)',
            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
            fontWeight: 900,
            letterSpacing: '0.08em',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ff9de2 0%, #c77dff 40%, #7eb8ff 70%, #ff9de2 100%)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(199,125,255,0.5))',
            animation: 'loadingGradient 3s ease infinite',
            marginBottom: 8,
          }}>
            Эфирная Сага
          </h1>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(199, 125, 255, 0.35)',
            textAlign: 'center',
          }}>
            Загрузка мира
          </p>
        </motion.div>

        {/* Progress bar — game-style angular shape */}
        <div style={{ width: '100%' }}>
          <div style={{
            position: 'relative',
            height: 6,
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(199, 125, 255, 0.15)',
            borderRadius: 1,
            overflow: 'hidden',
          }}>
            {/* Glow sweep */}
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${Math.max(0, progress - 15)}%`,
                width: '30%',
                background: 'linear-gradient(90deg, transparent, rgba(199,125,255,0.4), transparent)',
                filter: 'blur(3px)',
              }}
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            {/* Fill */}
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                background: 'linear-gradient(90deg, #c77dff, #ff9de2, #7eb8ff)',
                borderRadius: 1,
                boxShadow: '0 0 12px rgba(199,125,255,0.6)',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
            {/* Shine line at tip */}
            <motion.div
              style={{
                position: 'absolute',
                top: -1,
                bottom: -1,
                left: `${progress}%`,
                width: 2,
                background: 'rgba(255,255,255,0.8)',
                filter: 'blur(1px)',
                transform: 'translateX(-1px)',
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
          }}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              color: 'rgba(199, 125, 255, 0.4)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {progress}%
            </span>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              color: 'rgba(199, 125, 255, 0.25)',
            }}>
              v0.2.0
            </span>
          </div>
        </div>

        {/* Loading tip */}
        <motion.div
          key={tipIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: 'center',
            minHeight: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontStyle: 'italic',
            color: 'rgba(199, 125, 255, 0.45)',
            letterSpacing: '0.03em',
          }}>
            ✦ {LOADING_TIPS[tipIndex]} ✦
          </p>
        </motion.div>
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