---
Task ID: 5-a
Agent: Visual Overhaul Agent
Task: 3D World, Character & NPC Visual Overhaul

Work Log:
- Rewrote `src/components/game/player/Player.tsx`:
  - Anime proportions: larger head (1/5 of height), slim tapered torso, slender arms with visible hands, longer legs
  - Detailed head: chin/jaw definition, large anime eyes with iris + pupil + highlight spheres
  - Multi-layer hair: cap + top volume + side hair + back hair + style variations (long, tail, spiky, mohawk)
  - Outfit details: collar (torus), belt with buckle, cape/cloak with flow animation
  - Detailed weapon: blade + edge glow + tip cone + crossguard with end spheres + handle wrapping + pommel + element glow
  - Outline effect: BackSide material mesh at 1.03x scale on head and torso
  - Walk animation: arm swing (opposite legs), body bob, head bob, leg swing
  - Idle animation: breathing (chest y-bob), weight shift (z-rotation), head idle
  - Attack animation: full arm swing with progress-based rotation, body rotation, weapon trail
  - Cast animation: both arms raised with lerp, energy gathering body bob
  - Cape flow animation: sine-based sway
  - 6 orbiting element aura particles with scale/position oscillation
  - All materials/geometries memoized with useMemo, reusable vectors to avoid GC

- Rewrote `src/components/game/npc/NPCs.tsx`:
  - Shared `AnimeHead` component with iris/pupil/highlight eyes and layered hair
  - HumanNPC improvements: role-based body types (merchant stockier, guide slender, guardian bigger), unique hair/eye colors per NPC, accessories (guide staff + orb, merchant backpack with straps, crystal sage robe + staff with crystal, ice guardian robe + collar), idle animations (guide/sage head look-around, arm swaying)
  - Wolf: elongated body on ground, neck, detailed head with snout + nose, pointed ears, tail with tip, 4 legs with paws
  - Fox: slender body, white belly, large ears with inner ear detail, bushy tail with white tip
  - Scorpion: flat segmented body, 4 eyes, animated pincers (open/close via refs), curved 5-segment tail with stinger, 8 angled legs
  - Polar Bear: large bulky body on all fours, shoulder hump, small round ears, 4 thick legs with paws, small tail
  - Eagle: body with tail feathers, beak, talons, animated wing flapping (via dedicated refs)
  - Snow Owl: round body, facial disc circles, large amber eyes with pupils, ear tufts, wing tufts

- Rewrote `src/components/game/world/EnvironmentObjects.tsx`:
  - Trees: tapered trunk + root system (5 radial cylinders), sphere cluster foliage (5-6 spheres), subtle sway animation
  - Magic Trees: twisted trunk with knot, translucent purple foliage (3 layers), 5 pulsing/floating orbs with point light, gentle sway
  - Rocks: main dodecahedron + secondary rock cluster + accent icosahedron, optional mossy green top
  - Crystals: cluster of 4 octahedrons with varied sizes/rotations, color variety (blue/purple/pink/teal), inner glow point light, subtle rotation
  - Cactus: main body with segment ribs, right arm (with sag via backward lean), left arm (shorter), joint spheres
  - Ice Formations: cluster of 5 ice spikes, translucent material with emissive blue, pulsing scale animation, glow point light
  - Pine Trees: 3 layered cone foliage with snow caps on each layer, snow tip sphere, trunk, subtle sway
  - Water Patches: semi-transparent blue planes with y-oscillation animation (tundra zone)

- Updated `src/components/game/world/GameWorld.tsx`:
  - Lighting: increased ambient (0.4->0.5), added blue fill directional light from opposite side, added player-following point light (distance 15), increased hemisphere light
  - Fog: reduced density (0.003->0.0018) for better visibility
  - Canvas: added dpr=[1,1.5], gl with ACESFilmicToneMapping + toneMappingExposure 1.2
  - WaterPlane: global 300x300 semi-transparent water plane at y=-2 with wave animation
  - Cleaned unused imports (SpellTrail, useCallback, BIOME_ZONES, getBiomeAtPosition)

Stage Summary:
- 4 files rewritten/updated with significantly improved 3D visuals
- All models use anime toon-shading with sharedGradientMap
- Performance: all materials/geometries memoized, no allocations in useFrame
- Lint: 0 new errors (only pre-existing errors in carousel.tsx and use-mobile.ts)
- Dev server compiles and runs successfully