'use client';

import { Suspense, lazy } from 'react';

const GameApp = lazy(() => import('@/components/game/GameApp'));

function LoadingScreen() {
  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(199,125,255,0.3)', borderTopColor: 'transparent' }}
        />
      </div>
      <p className="text-purple-300/50 text-sm tracking-widest">ЗАГРУЗКА МИРА...</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <Suspense fallback={<LoadingScreen />}>
        <GameApp />
      </Suspense>
    </div>
  );
}