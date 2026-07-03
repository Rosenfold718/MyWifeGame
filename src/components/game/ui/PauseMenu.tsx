'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

function PauseButton({
  children,
  onClick,
  variant = 'default',
  delay = 0,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'secondary' | 'danger';
  delay?: number;
}) {
  const styles = {
    default: {
      border: 'rgba(199,125,255,0.25)',
      borderHover: 'rgba(199,125,255,0.5)',
      glow: 'rgba(199,125,255,0.3)',
    },
    secondary: {
      border: 'rgba(126,184,255,0.2)',
      borderHover: 'rgba(126,184,255,0.45)',
      glow: 'rgba(126,184,255,0.25)',
    },
    danger: {
      border: 'rgba(255,80,80,0.2)',
      borderHover: 'rgba(255,80,80,0.45)',
      glow: 'rgba(255,80,80,0.25)',
    },
  };
  const s = styles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        onClick={onClick}
        whileHover={{
          scale: 1.02,
          backgroundColor: 'rgba(199,125,255,0.1)',
        }}
        whileTap={{ scale: 0.97 }}
        style={{
          position: 'relative',
          width: '100%',
          height: 48,
          background: 'rgba(10, 0, 21, 0.6)',
          border: `1px solid ${s.border}`,
          borderRadius: 2,
          color: variant === 'danger' ? 'rgba(255,130,130,0.8)' : 'var(--text-primary)',
          fontFamily: 'var(--font-ui)',
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: '0.1em',
          cursor: 'pointer',
          outline: 'none',
          overflow: 'hidden',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = s.borderHover;
          el.style.boxShadow = `0 0 16px ${s.glow}, inset 0 0 16px rgba(0,0,0,0.3)`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = s.border;
          el.style.boxShadow = 'none';
        }}
      >
        {/* Diamond accents */}
        <div style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          width: 5,
          height: 5,
          border: `1px solid ${s.border}`,
          opacity: 0.5,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          width: 5,
          height: 5,
          border: `1px solid ${s.border}`,
          opacity: 0.5,
          pointerEvents: 'none',
        }} />
        <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
      </motion.button>
    </motion.div>
  );
}

function OrnamentalDivider() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: '2px 0',
    }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(199,125,255,0.15), transparent)' }} />
      <div style={{
        width: 5,
        height: 5,
        border: '1px solid rgba(199,125,255,0.2)',
        transform: 'rotate(45deg)',
      }} />
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(199,125,255,0.15), transparent)' }} />
    </div>
  );
}

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
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        fontFamily: 'var(--font-ui)',
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 300,
          background: 'rgba(10, 0, 21, 0.9)',
          border: '1px solid rgba(199,125,255,0.15)',
          borderRadius: 2,
          padding: '28px 24px 20px',
          boxShadow: '0 0 60px rgba(199,125,255,0.08)',
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{
            fontFamily: 'var(--font-title)',
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '0.15em',
            color: 'var(--text-primary)',
            textShadow: '0 0 20px rgba(199,125,255,0.3)',
          }}>
            ПАУЗА
          </h2>
          {/* Ornamental line */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginTop: 8,
          }}>
            <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, rgba(199,125,255,0.3))' }} />
            <div style={{
              width: 6,
              height: 6,
              border: '1px solid rgba(255,157,226,0.4)',
              transform: 'rotate(45deg)',
            }} />
            <div style={{ width: 40, height: 1, background: 'linear-gradient(270deg, transparent, rgba(199,125,255,0.3))' }} />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PauseButton onClick={closePause} delay={0.1}>
            ▸ Продолжить
          </PauseButton>
          <PauseButton onClick={handleSave} variant="secondary" delay={0.15}>
            ◈ Сохранить
          </PauseButton>
          <PauseButton onClick={() => useGameStore.setState({ isInventoryOpen: true })} delay={0.2}>
            ✦ Инвентарь
          </PauseButton>

          <OrnamentalDivider />

          <PauseButton onClick={handleQuit} variant="danger" delay={0.25}>
            ✕ В Главное Меню
          </PauseButton>
        </div>

        {/* ESC hint */}
        <p style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 10,
          color: 'rgba(240,230,255,0.15)',
          letterSpacing: '0.1em',
        }}>
          Esc — закрыть паузу
        </p>
      </motion.div>
    </motion.div>
  );
}