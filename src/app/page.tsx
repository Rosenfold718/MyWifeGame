'use client';

import dynamic from 'next/dynamic';
import { LoadingScreen } from '@/components/game/LoadingScreen';

// Dynamic import with SSR disabled to prevent hydration mismatch from framer-motion
const GameApp = dynamic(
  () =>
    import('@/components/game/GameApp').then((mod) => {
      if (typeof window !== 'undefined') {
        const w = window as unknown as Record<string, (() => void) | undefined>;
        if (w.__gameReady) w.__gameReady();
      }
      return { default: mod.GameApp };
    }),
  {
    ssr: false,
    loading: () => <LoadingScreen />,
  }
);

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <GameApp />
    </div>
  );
}