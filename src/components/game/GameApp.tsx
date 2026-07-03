'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { MainMenu } from './MainMenu';
import { CharacterCustomization } from './ui/CharacterCustomization';
import { SaveLoadMenu } from './ui/SaveLoadMenu';
import { GameWorld } from './world/GameWorld';
import { GameHUD } from './ui/GameHUD';
import { DialogueBox } from './ui/DialogueBox';
import { Inventory } from './ui/Inventory';
import { PauseMenu } from './ui/PauseMenu';
import { ScreenShake, ScreenEffects } from './effects/ScreenEffects';

export function GameApp() {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const isInventoryOpen = useGameStore((s) => s.isInventoryOpen);
  const isDialogueOpen = useGameStore((s) => s.isDialogueOpen);
  const updatePlayTime = useGameStore((s) => s.updatePlayTime);
  const regenStats = useGameStore((s) => s.regenStats);
  const updateProjectiles = useGameStore((s) => s.updateProjectiles);
  const cleanupDamageNumbers = useGameStore((s) => s.cleanupDamageNumbers);
  const updateNPCs = useGameStore((s) => s.updateNPCs);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const lastFrameTime = useRef(Date.now());

  // Game loop
  useEffect(() => {
    if (currentScreen !== 'playing') return;
    let animFrame: number;

    const loop = () => {
      const now = Date.now();
      const delta = (now - lastFrameTime.current) / 1000;
      lastFrameTime.current = now;

      regenStats(delta);
      updateProjectiles(now);
      cleanupDamageNumbers(now);
      updateNPCs(playerPosition, now);
      updatePlayTime(delta);

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [currentScreen, playerPosition, regenStats, updateProjectiles, cleanupDamageNumbers, updateNPCs, updatePlayTime]);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (currentScreen === 'playing') {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (isDialogueOpen) {
            useGameStore.getState().closeDialogue();
          } else if (isInventoryOpen) {
            useGameStore.getState().setScreen('playing');
            useGameStore.setState({ isInventoryOpen: false });
          } else {
            useGameStore.getState().setScreen('paused');
          }
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          useGameStore.setState({ isInventoryOpen: !useGameStore.getState().isInventoryOpen });
        }
        if (e.key === 'e' || e.key === 'E' || e.key === 'з' || e.key === 'З') {
          if (isDialogueOpen) {
            useGameStore.getState().advanceDialogue();
          }
        }
      }
    },
    [currentScreen, isDialogueOpen, isInventoryOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="w-full h-full relative">
      {currentScreen === 'menu' && <MainMenu />}
      {currentScreen === 'customization' && <CharacterCustomization />}
      {currentScreen === 'saveload' && <SaveLoadMenu />}

      {currentScreen === 'playing' && (
        <ScreenShake>
          <GameWorld />
          <ScreenEffects />
          <GameHUD />
          {isDialogueOpen && <DialogueBox />}
          {isInventoryOpen && <Inventory />}
        </ScreenShake>
      )}

      {currentScreen === 'paused' && (
        <ScreenShake>
          <GameWorld />
          <PauseMenu />
        </ScreenShake>
      )}
    </div>
  );
}