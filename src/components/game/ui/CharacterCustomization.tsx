'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import {
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFIT_COLORS,
  SKIN_TONES,
  EYE_COLORS,
} from '@/lib/game/constants';
import { Check, ArrowLeft } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function CharacterPreview({ appearance }: { appearance: ReturnType<typeof useGameStore.getState>['appearance'] }) {
  const gradientData = new Uint8Array([0, 100, 200, 255]);
  const gradientMap = new THREE.DataTexture(gradientData, 4, 1, THREE.RedFormat);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;

  const toonMat = (color: string) => new THREE.MeshToonMaterial({ color, gradientMap });

  return (
    <Canvas camera={{ position: [0, 1.5, 3], fov: 45 }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={1} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={1}
      />
      <group position={[0, -0.5, 0]}>
        {/* Body */}
        <mesh material={toonMat(appearance.outfitColor)} position={[0, 1.1, 0]}>
          <capsuleGeometry args={[0.3, 0.5, 4, 8]} />
        </mesh>
        {/* Head */}
        <mesh material={toonMat(appearance.skinTone)} position={[0, 1.85, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
        </mesh>
        {/* Hair */}
        <mesh material={toonMat(appearance.hairColor)} position={[0, 1.95, 0]}>
          <sphereGeometry args={[0.33, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        </mesh>
        {appearance.hairStyle >= 1 && (
          <mesh material={toonMat(appearance.hairColor)} position={[0, 1.95, -0.2]}>
            <boxGeometry args={[0.6, 0.35, 0.35]} />
          </mesh>
        )}
        {appearance.hairStyle >= 2 && (
          <mesh material={toonMat(appearance.hairColor)} position={[0, 1.7, -0.3]}>
            <capsuleGeometry args={[0.12, 0.4, 4, 6]} />
          </mesh>
        )}
        {/* Eyes */}
        <mesh position={[-0.1, 1.88, 0.25]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color={appearance.eyeColor} />
        </mesh>
        <mesh position={[0.1, 1.88, 0.25]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color={appearance.eyeColor} />
        </mesh>
        {/* Arms */}
        <mesh material={toonMat(appearance.outfitColor)} position={[-0.4, 1, 0]}>
          <capsuleGeometry args={[0.08, 0.35, 4, 6]} />
        </mesh>
        <mesh material={toonMat(appearance.outfitColor)} position={[0.4, 1, 0]}>
          <capsuleGeometry args={[0.08, 0.35, 4, 6]} />
        </mesh>
        {/* Legs */}
        <mesh material={toonMat('#443322')} position={[-0.15, 0.4, 0]}>
          <capsuleGeometry args={[0.1, 0.35, 4, 6]} />
        </mesh>
        <mesh material={toonMat('#443322')} position={[0.15, 0.4, 0]}>
          <capsuleGeometry args={[0.1, 0.35, 4, 6]} />
        </mesh>
      </group>
    </Canvas>
  );
}

export function CharacterCustomization() {
  const appearance = useGameStore((s) => s.appearance);
  const setAppearance = useGameStore((s) => s.setAppearance);
  const newGame = useGameStore((s) => s.newGame);
  const setScreen = useGameStore((s) => s.setScreen);
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const [name, setName] = useState('');

  const handleConfirm = () => {
    if (name.trim()) {
      newGame(name.trim());
    }
  };

  return (
    <div className="w-full h-full flex">
      {/* Left: 3D Preview */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-slate-900/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-80 h-96">
            <CharacterPreview appearance={appearance} />
          </div>
        </div>
      </div>

      {/* Right: Customization options */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-96 bg-slate-900/95 border-l border-purple-500/20 p-6 overflow-y-auto"
      >
        {/* Back button */}
        <Button
          onClick={() => setScreen('menu')}
          variant="ghost"
          className="text-white/50 hover:text-white hover:bg-white/10 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <h2 className="text-white text-xl font-bold mb-6">Создание Персонажа</h2>

        {/* Name input */}
        <div className="mb-6">
          <label className="text-white/60 text-xs uppercase tracking-wider block mb-2">Имя Героя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите имя..."
            maxLength={20}
            className="w-full h-10 px-3 text-sm text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/50 placeholder:text-white/20"
          />
        </div>

        {/* Hair Color */}
        <ColorPicker
          label="Цвет Волос"
          colors={HAIR_COLORS}
          selected={appearance.hairColor}
          onChange={(color) => setAppearance({ hairColor: color })}
        />

        {/* Hair Style */}
        <div className="mb-5">
          <label className="text-white/60 text-xs uppercase tracking-wider block mb-2">Причёска</label>
          <div className="flex gap-1.5 flex-wrap">
            {HAIR_STYLES.map((style, i) => (
              <button
                key={i}
                onClick={() => setAppearance({ hairStyle: i })}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  appearance.hairStyle === i
                    ? 'bg-purple-500/30 border border-purple-400/50 text-white'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Outfit Color */}
        <ColorPicker
          label="Цвет Одежды"
          colors={OUTFIT_COLORS}
          selected={appearance.outfitColor}
          onChange={(color) => setAppearance({ outfitColor: color })}
        />

        {/* Skin Tone */}
        <ColorPicker
          label="Тон Кожи"
          colors={SKIN_TONES}
          selected={appearance.skinTone}
          onChange={(color) => setAppearance({ skinTone: color })}
        />

        {/* Eye Color */}
        <ColorPicker
          label="Цвет Глаз"
          colors={EYE_COLORS}
          selected={appearance.eyeColor}
          onChange={(color) => setAppearance({ eyeColor: color })}
        />

        {/* Confirm button */}
        <Button
          onClick={handleConfirm}
          disabled={!name.trim()}
          className="w-full mt-6 h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl cursor-pointer"
        >
          <Check className="w-5 h-5 mr-2" />
          Начать Приключение
        </Button>
      </motion.div>
    </div>
  );
}

function ColorPicker({
  label,
  colors,
  selected,
  onChange,
}: {
  label: string;
  colors: string[];
  selected: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="mb-5">
      <label className="text-white/60 text-xs uppercase tracking-wider block mb-2">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full transition-all cursor-pointer border-2 ${
              selected === color
                ? 'border-white scale-110 shadow-lg'
                : 'border-transparent hover:border-white/30 hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}