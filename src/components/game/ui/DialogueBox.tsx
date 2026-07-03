'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

export function DialogueBox() {
  const isDialogueOpen = useGameStore((s) => s.isDialogueOpen);
  const dialogueNpcId = useGameStore((s) => s.dialogueNpcId);
  const dialogueLineIndex = useGameStore((s) => s.dialogueLineIndex);
  const npcStates = useGameStore((s) => s.npcStates);

  const npc = npcStates.find((n) => n.id === dialogueNpcId);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear previous interval and reset when dialogue changes
  const prevKeyRef = useRef(`${dialogueNpcId}-${dialogueLineIndex}`);
  useEffect(() => {
    const key = `${dialogueNpcId}-${dialogueLineIndex}`;
    if (key !== prevKeyRef.current) {
      prevKeyRef.current = key;
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Reset via microtask to avoid synchronous setState in effect
      queueMicrotask(() => {
        setDisplayedText('');
        setIsTyping(true);
      });
    }
  }, [dialogueNpcId, dialogueLineIndex]);

  // Typewriter effect — runs in interval callback, not synchronously
  useEffect(() => {
    if (!npc || !isDialogueOpen || !isTyping) return;

    const fullText = npc.dialogue[dialogueLineIndex] || '';
    let index = 0;

    intervalRef.current = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [npc, dialogueLineIndex, isDialogueOpen, isTyping]);

  if (!isDialogueOpen || !npc) return null;

  const isLastLine = dialogueLineIndex >= (npc.dialogue.length - 1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          maxWidth: 700,
          marginLeft: 'auto',
          marginRight: 'auto',
          pointerEvents: 'auto',
          fontFamily: 'var(--font-ui)',
          zIndex: 20,
        }}
      >
        {/* Outer ornamental border */}
        <div style={{
          position: 'relative',
          background: 'rgba(10, 0, 21, 0.88)',
          border: '1px solid rgba(199,125,255,0.2)',
          borderRadius: 2,
          padding: 1,
          boxShadow: '0 0 30px rgba(199,125,255,0.08), inset 0 0 30px rgba(0,0,0,0.3)',
        }}>
          {/* Inner border accent */}
          <div style={{
            border: '1px solid rgba(199,125,255,0.06)',
            borderRadius: 1,
            padding: '16px 20px',
          }}>
            {/* Corner ornaments */}
            <div style={{
              position: 'absolute',
              top: -1,
              left: -1,
              width: 14,
              height: 14,
              borderTop: `2px solid ${npc.color}80`,
              borderLeft: `2px solid ${npc.color}80`,
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              top: -1,
              right: -1,
              width: 14,
              height: 14,
              borderTop: `2px solid ${npc.color}80`,
              borderRight: `2px solid ${npc.color}80`,
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              bottom: -1,
              left: -1,
              width: 14,
              height: 14,
              borderBottom: `2px solid ${npc.color}80`,
              borderLeft: `2px solid ${npc.color}80`,
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              bottom: -1,
              right: -1,
              width: 14,
              height: 14,
              borderBottom: `2px solid ${npc.color}80`,
              borderRight: `2px solid ${npc.color}80`,
              pointerEvents: 'none',
            }} />

            {/* NPC name */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: '1px solid rgba(199,125,255,0.08)',
            }}>
              {/* Avatar placeholder */}
              <div style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${npc.color}15`,
                border: `1px solid ${npc.color}60`,
                borderRadius: 2,
                fontSize: 16,
                boxShadow: `0 0 10px ${npc.color}15`,
              }}>
                {npc.type === 'human' ? '👤' : '🐾'}
              </div>
              <h3 style={{
                fontSize: 15,
                fontWeight: 600,
                color: npc.color,
                letterSpacing: '0.05em',
                textShadow: `0 0 10px ${npc.color}30`,
              }}>
                {npc.name}
              </h3>
            </div>

            {/* Dialogue text */}
            <p style={{
              fontSize: 14,
              color: 'rgba(240, 230, 255, 0.85)',
              lineHeight: 1.7,
              minHeight: 48,
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              letterSpacing: '0.01em',
            }}>
              {displayedText}
              {isTyping && (
                <span style={{
                  display: 'inline-block',
                  width: 2,
                  height: 16,
                  background: 'rgba(199,125,255,0.6)',
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                  animation: 'cursorBlink 0.8s ease infinite',
                }} />
              )}
            </p>

            {/* Continue prompt */}
            {!isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: 8,
                }}
              >
                <span style={{
                  fontSize: 10,
                  color: 'rgba(199,125,255,0.4)',
                  letterSpacing: '0.1em',
                }}>
                  [{isLastLine ? 'E' : 'E / Enter'}] {isLastLine ? 'Закрыть' : 'Продолжить'}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes cursorBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}