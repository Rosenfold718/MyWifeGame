'use client';

import { GameApp } from '@/components/game/GameApp';

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <GameApp />
    </div>
  );
}