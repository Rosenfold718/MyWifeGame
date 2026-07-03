'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

/* ── floating particles ── */
function FloatingParticle({ delay, x, size, duration, colorIdx }: {
  delay: number; x: number; size: number; duration: number; colorIdx: number;
}) {
  const colors = [
    'radial-gradient(circle, rgba(255,180,220,0.9), rgba(200,140,255,0.3), transparent)',
    'radial-gradient(circle, rgba(126,184,255,0.8), rgba(199,125,255,0.2), transparent)',
    'radial-gradient(circle, rgba(255,255,255,0.7), rgba(255,157,226,0.2), transparent)',
  ];
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        bottom: '-3%',
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors[colorIdx % 3],
        filter: 'blur(1px)',
        pointerEvents: 'none',
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [-15, -650 - (colorIdx % 3) * 80],
        opacity: [0, 0.8, 0.5, 0],
        x: [0, Math.sin(delay) * 55, Math.cos(delay * 1.7) * 35, Math.sin(delay * 2.3) * 65],
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

/* ── magic circle rings ── */
function MagicCircles() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      opacity: 0.07,
    }}>
      <motion.div
        style={{ width: 700, height: 700, borderRadius: '50%', border: '2px solid rgba(255,157,226,0.5)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', border: '1px solid rgba(199,125,255,0.4)' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', border: '1px solid rgba(126,184,255,0.3)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, transparent, rgba(255,150,200,0.04), transparent, rgba(150,100,255,0.04), transparent)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

/* ── ornamental game button ── */
function GameButton({
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
  const colors = {
    default: {
      border: 'rgba(199,125,255,0.25)',
      borderHover: 'rgba(199,125,255,0.6)',
      glow: 'rgba(199,125,255,0.35)',
      bg: 'rgba(199,125,255,0.06)',
      bgHover: 'rgba(199,125,255,0.14)',
      accent: 'var(--accent-purple)',
    },
    secondary: {
      border: 'rgba(126,184,255,0.2)',
      borderHover: 'rgba(126,184,255,0.5)',
      glow: 'rgba(126,184,255,0.3)',
      bg: 'rgba(126,184,255,0.05)',
      bgHover: 'rgba(126,184,255,0.12)',
      accent: 'var(--accent-cyan)',
    },
    danger: {
      border: 'rgba(255,157,226,0.2)',
      borderHover: 'rgba(255,157,226,0.5)',
      glow: 'rgba(255,157,226,0.3)',
      bg: 'rgba(255,157,226,0.05)',
      bgHover: 'rgba(255,157,226,0.12)',
      accent: 'var(--accent-pink)',
    },
  };
  const c = colors[variant];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        onClick={onClick}
        whileHover={{
          scale: 1.03,
          backgroundColor: c.bgHover,
        }}
        whileTap={{ scale: 0.97 }}
        style={{
          position: 'relative',
          width: '100%',
          height: 52,
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderRadius: 2,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-ui)',
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: '0.12em',
          cursor: 'pointer',
          outline: 'none',
          overflow: 'hidden',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = c.borderHover;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${c.glow}, inset 0 0 20px rgba(0,0,0,0.3)`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = c.border;
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        {/* Diamond accents on sides */}
        <div style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          width: 6,
          height: 6,
          border: `1px solid ${c.border}`,
          opacity: 0.6,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          width: 6,
          height: 6,
          border: `1px solid ${c.border}`,
          opacity: 0.6,
          pointerEvents: 'none',
        }} />
        {/* Content */}
        <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
      </motion.button>
    </motion.div>
  );
}

/* ── ornamental divider ── */
function OrnamentalDivider() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '4px 0',
    }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(199,125,255,0.2), transparent)' }} />
      <div style={{
        width: 6,
        height: 6,
        border: '1px solid rgba(199,125,255,0.3)',
        transform: 'rotate(45deg)',
      }} />
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(199,125,255,0.2), transparent)' }} />
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN MENU
   ══════════════════════════════════════ */
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

  const particles = Array.from({ length: 30 }, (_, i) => ({
    delay: i * 0.35,
    x: Math.random() * 100,
    size: 2 + Math.random() * 5,
    duration: 6 + Math.random() * 7,
    colorIdx: i,
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
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background atmosphere */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(120, 40, 200, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(200, 50, 100, 0.25) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, rgba(40, 80, 200, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 60% 40%, rgba(100, 30, 150, 0.2) 0%, transparent 40%),
          linear-gradient(180deg, #0a0015 0%, #1a0a2e 30%, #0d0820 60%, #1a0a2e 100%)
        `,
      }} />

      {/* Stars */}
      {Array.from({ length: 70 }, (_, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 53 + 3) % 100}%`,
            width: i % 5 === 0 ? 2 : 1,
            height: i % 5 === 0 ? 2 : 1,
            borderRadius: '50%',
            background: i % 6 === 0 ? '#ff9de2' : i % 4 === 0 ? '#7eb8ff' : '#fff',
          }}
          animate={{ opacity: [0.15, 0.85, 0.15] }}
          transition={{
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 2,
            repeat: Infinity,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Magic circles */}
      <MagicCircles />

      {/* ── MAIN CONTENT ── */}
      <AnimatePresence>
        {menuVisible && (
          <div style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Title block */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center', marginBottom: 48 }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Title glow behind text */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 500,
                  height: 120,
                  background: 'radial-gradient(ellipse, rgba(199,125,255,0.15), transparent 70%)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none',
                }} />
                <h1 style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  lineHeight: 1.1,
                  background: 'linear-gradient(135deg, #ff9de2 0%, #c77dff 35%, #7eb8ff 65%, #ff9de2 100%)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 40px rgba(199,125,255,0.5)) drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
                  animation: 'menuGradient 5s ease infinite',
                  position: 'relative',
                }}>
                  Эфирная Сага
                </h1>
              </motion.div>

              {/* Ornamental line under title */}
              <div style={{ marginTop: 12, marginBottom: 8 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                }}>
                  <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, rgba(199,125,255,0.4))' }} />
                  <div style={{
                    width: 8,
                    height: 8,
                    border: '1px solid rgba(255,157,226,0.5)',
                    transform: 'rotate(45deg)',
                  }} />
                  <div style={{ width: 60, height: 1, background: 'linear-gradient(270deg, transparent, rgba(199,125,255,0.4))' }} />
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: 'rgba(199, 125, 255, 0.5)',
                  textShadow: '0 0 20px rgba(199,125,255,0.3)',
                }}
              >
                Мир Магии Ждёт Героя
              </motion.p>
            </motion.div>

            {/* Menu panel */}
            <AnimatePresence mode="wait">
              {!showNewGameInput && !showLoadMenu && (
                <motion.div
                  key="main-buttons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    width: 320,
                  }}
                >
                  <GameButton onClick={() => setShowNewGameInput(true)} delay={0.8}>
                    ✦ Новая Игра
                  </GameButton>

                  {hasSaves && (
                    <GameButton onClick={handleContinue} variant="secondary" delay={1.0}>
                      ▸ Продолжить
                    </GameButton>
                  )}

                  <OrnamentalDivider />

                  <GameButton onClick={() => setShowLoadMenu(true)} delay={1.1}>
                    ◈ Загрузить Сохранение
                  </GameButton>
                </motion.div>
              )}

              {showNewGameInput && (
                <motion.div
                  key="new-game"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    width: 320,
                  }}
                >
                  <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    color: 'rgba(199, 125, 255, 0.6)',
                    textAlign: 'center',
                    letterSpacing: '0.05em',
                  }}>
                    Как зовут твоего героя?
                  </p>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNewGame()}
                    placeholder="Имя героя..."
                    autoFocus
                    maxLength={20}
                    style={{
                      width: '100%',
                      height: 48,
                      padding: '0 16px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(199, 125, 255, 0.2)',
                      borderRadius: 2,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 15,
                      letterSpacing: '0.05em',
                      outline: 'none',
                      transition: 'border-color 0.3s, box-shadow 0.3s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(199, 125, 255, 0.5)';
                      e.currentTarget.style.boxShadow = '0 0 16px rgba(199,125,255,0.2), inset 0 0 16px rgba(0,0,0,0.3)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(199, 125, 255, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <GameButton onClick={handleNewGame} delay={0}>
                      ✦ Начать Приключение
                    </GameButton>
                  </div>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setShowNewGameInput(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(199,125,255,0.4)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 12,
                      cursor: 'pointer',
                      padding: '4px 0',
                      letterSpacing: '0.1em',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(199,125,255,0.8)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(199,125,255,0.4)'; }}
                  >
                    ← Назад
                  </motion.button>
                </motion.div>
              )}

              {showLoadMenu && (
                <motion.div
                  key="load-menu"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    width: 320,
                    maxHeight: 340,
                  }}
                >
                  <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    color: 'rgba(199, 125, 255, 0.6)',
                    textAlign: 'center',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    Сохранения
                  </p>
                  <OrnamentalDivider />
                  <SaveLoadSlotList />
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setShowLoadMenu(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(199,125,255,0.4)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 12,
                      cursor: 'pointer',
                      padding: '4px 0',
                      letterSpacing: '0.1em',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(199,125,255,0.8)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(199,125,255,0.4)'; }}
                  >
                    ← Назад
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Version & credits */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              style={{
                position: 'absolute',
                bottom: 28,
                textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                letterSpacing: '0.3em',
                color: 'rgba(199, 125, 255, 0.2)',
              }}>
                AETHERIAL SAGA v0.2.0
              </p>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                color: 'rgba(199, 125, 255, 0.14)',
                marginTop: 4,
              }}>
                Создано с любовью для неё ♡
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes menuGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

/* ── Save/Load slot list ── */
function SaveLoadSlotList() {
  const { getSaveList, loadGameState, deleteGameState } = useGameStore();
  const saves = getSaveList();

  if (saves.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        color: 'rgba(199,125,255,0.3)',
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
        padding: '32px 0',
        letterSpacing: '0.05em',
      }}>
        Нет сохранений
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      maxHeight: 220,
      overflowY: 'auto',
      paddingRight: 4,
    }}>
      {saves.map((save) => (
        <motion.div
          key={save.id}
          whileHover={{ x: 4, backgroundColor: 'rgba(199,125,255,0.08)' }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(199,125,255,0.1)',
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(199,125,255,0.3)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(199,125,255,0.1)';
          }}
        >
          <button
            onClick={() => loadGameState(save.id)}
            style={{
              flex: 1,
              textAlign: 'left',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              outline: 'none',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-primary)',
              letterSpacing: '0.03em',
            }}>
              {save.name}
            </p>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              color: 'rgba(199,125,255,0.35)',
              marginTop: 2,
            }}>
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
            onClick={(e) => {
              e.stopPropagation();
              deleteGameState(save.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,80,80,0.3)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: 14,
              fontFamily: 'var(--font-ui)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,80,80,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,80,80,0.3)'; }}
          >
            ✕
          </button>
        </motion.div>
      ))}
    </div>
  );
}