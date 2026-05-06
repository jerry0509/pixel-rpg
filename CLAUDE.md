# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI像素冒险 - A Pokemon-style pixel RPG game built with pure HTML5 Canvas + JavaScript. Single HTML file, zero dependencies, double-click to play.

## Quick Start

```bash
# No build step required - just open in browser
start index.html  # Windows
open index.html   # macOS
xdg-open index.html  # Linux
```

## Architecture

### Single-File Architecture

The entire game is in `index.html` (~2000 lines). All code, data, and rendering logic are in one file.

**Module Structure (in order):**
```
CFG (constants)          - Tile types, element system, game config
SKILLS/ITEMS/MATS        - 12 skills, 25 items, materials data
MONS/BOSS                - 30 monsters, 9 bosses
NPCS                     - 15 NPCs with dialogue
MAPS/INTERIORS           - 8 maps, 5 interiors
Input                    - Keyboard input handling
SpriteSheet              - Pixel sprite system (hex-encoded)
Renderer                 - Canvas rendering engine
MapMgr                   - Map loading, collision, portals
Player                   - Player movement, stats, equipment
Monster                  - Monster class
Battle                   - Turn-based combat system
UI                       - Dialog, menus, battle UI
Save                     - LocalStorage save/load
Audio                    - Web Audio API sound effects
Game Loop                - Main game loop (60fps)
```

### Key Systems

**Pixel Sprite System:**
- Sprites encoded as hex strings (1 char = 1 pixel, 36-color palette)
- Decoded to offscreen canvas at init, then `drawImage()` only
- See `SpriteSheet` class for implementation

**Map System:**
- 100x80 tiles per map, 64x64 pixel tiles
- Camera follows player with scrolling
- Tile types defined in `CFG.T` (GRASS, TREE, WATER, PATH, WALL, DOOR, etc.)
- Portal system for map transitions

**Battle System:**
- Turn-based combat (Pokemon GBA style)
- Element system: fire→ice→thunder→water→fire, light↔dark
- Damage formula: `ATK × (1 + random(0.1)) - DEF × 0.5`
- Element weakness: ×1.5 damage, resistance: ×0.5 damage
- Critical hit: 10% chance, ×1.5 damage

**Save System:**
- Uses LocalStorage
- Quick save with S key
- Saves player stats, inventory, map progress, chest states

## Game Content

### Maps (8 total)
| Map | Level Range | Boss |
|-----|-------------|------|
| 新手村 (Village) | Safe zone | - |
| 翡翠草原 (Grassland) | Lv.1-10 | 野猪王 |
| 幽暗森林 (Forest) | Lv.10-20 | 狼王 |
| 烈焰火山 (Volcano) | Lv.20-30 | 火龙 |
| 魔王城堡 (Castle) | Lv.30-40 | 魔王 |
| 迷雾沼泽 (Swamp) | Lv.40-50 | 沼泽之王 |
| 远古遗迹 (Ruins) | Lv.40-50 | 远古巨像 |
| 龙之巢穴 (Dragon Lair) | Lv.50+ | 远古巨龙 |

### Controls
- Arrow keys: Move
- Shift: Run (faster movement)
- Space: Interact/Talk/Confirm
- ESC: Menu
- I: Inventory
- M: Map
- S: Quick save

## Development Notes

### Common Edits

**Adding a new monster:**
1. Add entry to `MONS` object (around line 120)
2. Include: n(name), e(emoji), hp, atk, def, exp, gold, el(element), d(drops), cr(catch rate)

**Adding a new item:**
1. Add entry to `ITEMS` object (around line 74)
2. Types: 'c' = consumable, 'e' = equipment
3. Equipment needs: slot('weapon'/'armor'/'acc'), atk/def bonuses

**Adding a new map:**
1. Add map data to `MAPS` object
2. Add portal connections in `MapMgr.gen()`
3. Update `MapMgr.load()` for map-specific logic

**Modifying sprites:**
- Sprites are hex-encoded strings in `SpriteSheet` class
- Each character maps to a color in the 36-color palette
- Tile sprites: 16x16 = 256 characters
- Character sprites: 16x16 with animation frames

### Known Issues (from BUGS_AND_ISSUES.md)

- Pixel art quality needs improvement (currently code-drawn rectangles)
- Attack animations too fast (~0.1s, should be ~0.5s)
- Wolf King boss collision area too large
- Inn exit detection issue
- Grassland area too empty (needs more decorations)

### Performance Considerations

- Game runs at 60fps target
- Tile caching in `Renderer.tileCache`
- Only render visible tiles (viewport culling)
- Weather effects use particle system

## File Reference

```
pixel-rpg/
├── index.html          # Main game file (all code)
├── GAME_DESIGN.md      # Complete game design document
├── BUGS_AND_ISSUES.md  # Known bugs and improvement areas
├── PLAN.md             # Development plan (historical)
├── README.md           # Project README
├── js/                 # Old multi-file version (backup)
│   ├── battle.js
│   ├── config.js
│   ├── game.js
│   ├── input.js
│   ├── inventory.js
│   ├── map.js
│   ├── monster.js
│   ├── player.js
│   ├── renderer.js
│   ├── renderer.js.bak
│   ├── save.js
│   └── ui.js
├── css/                # Styles (minimal, mostly inline)
├── data/               # Data files (if any)
├── audio/              # Audio assets
└── demo/               # Demo files
```

## Quick Reference

**Config constants:** `CFG` object at top of index.html
**Tile types:** `CFG.T` (GRASS=0, TREE=1, WATER=2, PATH=3, WALL=4, DOOR=5, TGRASS=6, etc.)
**Element types:** `CFG.ELEM` (fire, ice, thunder, water, light, dark, poison, normal)
**Game speed:** `CFG.MOVE_DELAY` (100ms), `CFG.RUN_DELAY` (50ms with Shift)
**Encounter rate:** `CFG.ENC_RATE` (0.05 = 5% per step on tall grass)
