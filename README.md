# Эфирная Сага — Aetherial Saga

A 3D anime-style RPG game built with **Next.js 16**, **React Three Fiber**, **TypeScript**, and **Zustand**.

## Overview

Explore a magical open world with three distinct biomes:

- 🌲 **Enchanted Forest** — magical trees, friendly elves, and lurking wolves
- 💎 **Crystal Desert** — ancient crystals, scorpions, and the Crystal Sage
- ❄️ **Frozen Tundra** — ice formations, polar bears, and the Ice Guardian

## Features

- **3D Open World** — procedural terrain with simplex noise, biome blending, and toon-shaded rendering
- **Real-time Combat** — melee attacks, elemental magic projectiles, dodge mechanics
- **5 Elements** — Fire, Ice, Lightning, Wind, Earth — switch between them with number keys
- **Character Customization** — hair color/style, outfit color, skin tone, eye color with live 3D preview
- **NPC System** — friendly NPCs with dialogue, hostile creatures with AI
- **Inventory & Equipment** — weapons, armor, accessories, potions with stat bonuses
- **Save/Load** — persistent save system via localStorage
- **Anime-style Graphics** — toon shading, outlines, and stylized 3D models

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Framework |
| React Three Fiber | 3D rendering |
| Three.js | 3D engine |
| Zustand | State management |
| Framer Motion | UI animations |
| Tailwind CSS 4 | Styling |
| simplex-noise | Procedural terrain |
| shadcn/ui | UI components |
| Lucide React | Icons |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Controls

| Key | Action |
|---|---|
| WASD / Arrows | Move |
| Mouse | Look around (click to lock cursor) |
| Left Click | Melee attack |
| Right Click | Cast magic |
| Space | Dodge |
| E | Interact with NPC / Advance dialogue |
| Q | Heal (costs mana) |
| 1-5 | Switch element |
| Tab | Open inventory |
| Esc | Pause menu |
| Scroll | Zoom in/out |
| Shift | Sprint |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main entry point (lazy-loads GameApp)
│   └── layout.tsx            # Root layout
├── components/game/
│   ├── GameApp.tsx           # Main game orchestrator & game loop
│   ├── MainMenu.tsx          # Animated main menu
│   ├── world/
│   │   ├── GameWorld.tsx     # 3D canvas, camera, input, lighting
│   │   ├── Terrain.tsx       # Procedural terrain mesh
│   │   └── EnvironmentObjects.tsx  # Trees, rocks, crystals, etc.
│   ├── player/
│   │   └── Player.tsx        # Player 3D model & animations
│   ├── npc/
│   │   └── NPCs.tsx          # Human & animal NPC rendering
│   ├── combat/
│   │   ├── Projectiles.tsx   # Magic projectile visuals
│   │   └── DamageNumbers.tsx # Floating damage/heal numbers
│   └── ui/
│       ├── GameHUD.tsx       # Health/mana/stamina bars, element selector
│       ├── DialogueBox.tsx   # NPC dialogue with typewriter effect
│       ├── Inventory.tsx     # Full inventory & equipment UI
│       ├── CharacterCustomization.tsx  # Character creator
│       ├── PauseMenu.tsx     # Pause overlay
│       └── SaveLoadMenu.tsx  # Save/load game menu
├── lib/game/
│   ├── constants.ts          # Game types, data, NPC definitions, stats
│   ├── noise.ts              # Terrain generation & biome system
│   └── saveManager.ts        # LocalStorage save/load system
└── stores/
    └── gameStore.ts          # Zustand store (all game state & logic)
```

## License

MIT