'use client';

import { lazy, Suspense } from 'react';
import { LoadingScreen } from '@/components/game/LoadingScreen';

// Lazy load the entire game app so the loading screen shows immediately
const GameApp = lazy(() =>
  import('@/components/game/GameApp').then((mod) => {
    // Signal that the game module has loaded
    if (typeof window !== 'undefined') {
      const w = window as unknown as Record<string, (() => void) | undefined>;
      if (w.__gameReady) w.__gameReady();
    }
    return { default: mod.GameApp };
  })
);

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <Suspense fallback={<LoadingScreen />}>
        <GameApp />
      </Suspense>
    </div>
  );
}