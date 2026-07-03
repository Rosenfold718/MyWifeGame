'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

export function DialogueBox() {
  const isDialogueOpen = useGameStore((s) => s.isDialogueOpen);
  const dialogueNpcId = useGameStore((s) => s.dialogueNpcId);
  const dialogueLineIndex = useGameStore((s) => s.dialogueLineIndex);
  const npcStates = useGameStore((s) => s.npcStates);
  const advanceDialogue = useGameStore((s) => s.advanceDialogue);
  const closeDialogue = useGameStore.getState().closeDialogue;

  const npc = npcStates.find((n) => n.id === dialogueNpcId);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!npc || !isDialogueOpen) return;

    const fullText = npc.dialogue[dialogueLineIndex] || '';
    setDisplayedText('');
    setIsTyping(true);

    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [npc, dialogueLineIndex, isDialogueOpen]);

  if (!isDialogueOpen || !npc) return null;

  const isLastLine = dialogueLineIndex >= (npc.dialogue.length - 1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-8 left-8 right-8 max-w-3xl mx-auto pointer-events-auto"
      >
        <div
          className="relative rounded-2xl p-1.5"
          style={{
            background: 'linear-gradient(135deg, rgba(100,50,150,0.6), rgba(50,50,100,0.6))',
            border: '1px solid rgba(200,150,255,0.2)',
          }}
        >
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-5">
            {/* NPC name */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: npc.color + '40', border: `2px solid ${npc.color}` }}
              >
                {npc.type === 'human' ? '👤' : '🐾'}
              </div>
              <h3 className="text-white font-bold text-lg">{npc.name}</h3>
            </div>

            {/* Dialogue text */}
            <p className="text-white/90 text-base leading-relaxed min-h-[3rem]">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-0.5 h-5 bg-purple-300 ml-1 animate-pulse" />
              )}
            </p>

            {/* Continue hint */}
            {!isTyping && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-purple-300/50 text-xs mt-3 text-right"
              >
                {isLastLine ? '[E] Закрыть' : '[E] Продолжить'}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}