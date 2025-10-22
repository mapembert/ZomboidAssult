# Zomboid Assault - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (2 minutes)
```bash
npm install
```

### Step 2: Start Development Server (1 minute)
```bash
npm run dev
```

Your browser will open automatically at `http://localhost:3000`

### Step 3: What You'll See
Currently, you'll see a **loading screen** because the game code hasn't been implemented yet. That's normal!

---

## 📁 Project Files Overview

### ✅ What's Already Complete

#### Documentation (Ready to Use)
```
docs/
├── zomboid-assult-prototype-design.md    # Complete game design
├── game-architecture.md                   # Technical architecture
└── implementation-roadmap.md              # Development plan (12 days)
```

#### Configuration Files (Ready to Use)
```
config/
├── game-settings.json                     # Game parameters
├── entities/
│   ├── zomboids.json                      # 8 zomboid types defined
│   ├── weapons.json                       # 5 weapon tiers defined
│   ├── timers.json                        # 3 timer types defined
│   └── heroes.json                        # Hero properties
└── chapters/
    ├── chapter-01.json                    # Tutorial chapter (3 waves)
    ├── chapter-02.json                    # Rising threat (2 waves)
    └── chapter-03.json                    # Maximum chaos (2 waves)
```

#### Build Configuration (Ready to Use)
```
Root Files:
├── package.json              # Dependencies installed
├── tsconfig.json             # TypeScript strict mode configured
├── vite.config.ts            # Vite build tool configured
├── .eslintrc.json            # Linting rules
├── .prettierrc.json          # Code formatting
├── .gitignore               # Git ignore rules
└── public/index.html         # HTML entry point with dark mode styling
```

#### Empty Source Directories (Ready for Code)
```
src/                          # ⚠️ NEEDS IMPLEMENTATION
├── main.ts                   # ⚠️ Create this first!
├── scenes/                   # ⚠️ Boot, Menu, Game, GameOver scenes
├── entities/                 # ⚠️ Hero, Zomboid, Projectile, Timer classes
├── systems/                  # ⚠️ Game systems (weapons, collisions, etc.)
├── ui/                       # ⚠️ HUD, menus
├── utils/                    # ⚠️ Object pool, shape renderer, constants
└── types/                    # ⚠️ TypeScript type definitions
```

---

## 🎯 Your Next Action

### Option 1: Follow the Detailed Roadmap (Recommended)
Open `docs/implementation-roadmap.md` and start with:

**Phase 1: Foundation → Epic 1.2: Configuration System → Story 1.2.1**

This will guide you through 12 days of structured development with clear acceptance criteria.

---

### Option 2: Quick Prototype (3-4 Hours)
Want to see something working fast? Implement these core files:

#### 1. Create `src/main.ts` (Entry Point)
```typescript
import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  backgroundColor: '#121212',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [],  // Add scenes here as you create them
};

new Phaser.Game(config);
```

#### 2. Create Basic Scene (Start Simple)
Create `src/scenes/TestScene.ts`:
```typescript
import Phaser from 'phaser';

export class TestScene extends Phaser.Scene {
  constructor() {
    super('TestScene');
  }

  create() {
    // Add test text
    this.add.text(360, 640, 'Zomboid Assault\nPrototype', {
      fontSize: '48px',
      color: '#03DAC6',
      align: 'center',
    }).setOrigin(0.5);

    // Draw a test zomboid (red circle)
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF5252, 1);
    graphics.lineStyle(3, 0xFF8A80, 1);
    graphics.fillCircle(360, 400, 30);
    graphics.strokeCircle(360, 400, 30);
  }
}
```

Then update `src/main.ts`:
```typescript
import { TestScene } from './scenes/TestScene';
// ... (keep existing config)
  scene: [TestScene],
```

Refresh browser → You'll see the title and a test zomboid!

---

### Option 3: Study the Design First
Read these in order to understand the full game:

1. **`PROJECT-SUMMARY.md`** (this gives you the overview)
2. **`docs/zomboid-assult-prototype-design.md`** (game mechanics and visuals)
3. **`docs/game-architecture.md`** (technical systems)
4. **`config/entities/zomboids.json`** (see the actual zombie definitions)
5. **`config/chapters/chapter-01.json`** (see how waves are structured)

---

## 🔍 Understanding the Configuration System

### Example: How Zomboids Work

**In `config/entities/zomboids.json`:**
```json
{
  "id": "basic_circle_small",
  "shape": "circle",
  "size": "small",
  "radius": 15,
  "color": "#FF5252",
  "outlineColor": "#FF8A80",
  "health": 1,
  "speed": 50,
  "scoreValue": 10
}
```

**In your game code (future):**
```typescript
// ConfigLoader will parse this JSON
const zomboidConfig = configLoader.loadZomboidTypes();

// Zomboid class uses the config to render and behave
const zomboid = new Zomboid(scene, x, y, zomboidConfig['basic_circle_small']);
// → Renders a small red circle with 1 health, speed 50, worth 10 points
```

### Example: How Waves Work

**In `config/chapters/chapter-01.json`:**
```json
{
  "waveId": 1,
  "duration": 30,
  "spawnPattern": {
    "zomboids": [
      {
        "type": "basic_circle_small",
        "count": 15,
        "spawnRate": 0.5,
        "columns": ["left", "right"]
      }
    ]
  }
}
```

**What this means:**
- Wave lasts 30 seconds
- Spawns 15 small circle zomboids
- 1 zomboid every 0.5 seconds
- Randomly picks left or right column

---

## 📊 Development Phases Quick Reference

| Phase | What You'll Build | Key Files |
|-------|-------------------|-----------|
| **Phase 1** (Days 1-2) | Project setup, config loader, scene flow | `ConfigLoader.ts`, scene files |
| **Phase 2** (Days 3-5) | Heroes, weapons, zomboids, collisions | Entity classes, game systems |
| **Phase 3** (Days 6-7) | Timers, upgrades | `Timer.ts`, weapon upgrade logic |
| **Phase 4** (Days 8-9) | Wave progression, HUD | `WaveManager.ts`, UI components |
| **Phase 5** (Days 10-11) | Audio, polish, optimization | Audio system, performance tuning |
| **Phase 6** (Day 12) | Testing, bug fixes | QA, final polish |

---

## 🛠️ Essential Commands

```bash
# Development
npm run dev              # Start dev server (auto-reload on file changes)

# Build for Production
npm run build            # Creates optimized bundle in dist/
npm run preview          # Test production build locally

# Code Quality
npm run lint             # Check for code issues
npm run format           # Auto-format all code files
```

---

## 🎨 Visual Reference

### Color Palette
Copy these for use in your code:

```typescript
// Background
const BG_COLOR = 0x121212;

// Heroes
const HERO_COLOR = 0x03DAC6;
const HERO_OUTLINE = 0x18FFFF;

// Zomboids
const ZOMBOID_CIRCLE = 0xFF5252;      // Red
const ZOMBOID_SQUARE = 0xFFC107;      // Amber
const ZOMBOID_HEX = 0x4CAF50;         // Green

// Timers
const TIMER_NEGATIVE = 0xFF1744;      // Red
const TIMER_POSITIVE = 0x00B0FF;      // Light Blue

// Projectiles
const PROJECTILE_COLOR = 0xFFFFFF;    // White
```

### Screen Layout
```
┌─────────────────────────────────┐
│  Score    Chapter 1 - Wave 2   Time  │ ← HUD
├─────────────────────────────────┤
│                                 │
│   LEFT        │      RIGHT      │ ← Spawn Zone
│   COLUMN      │      COLUMN     │
│       ↓       │        ↓        │
│       🟥      │        🔶       │ ← Descending Zomboids
│               │                 │
│       🔵      │                 │ ← Timer (countdown)
│       -15     │                 │
│               │        🟥       │
│       🔶      │        🟥       │
│               │                 │
│       ↑       │        ↑        │ ← Auto-Fire Projectiles
│       △       │        △        │ ← Heroes (move left/right)
├─────────────────────────────────┤
│   Heroes: 2     Weapon: Double  │ ← Status Bar
└─────────────────────────────────┘
```

---

## ⚡ Performance Targets

- **Frame Rate:** 60 FPS (minimum 30 FPS on older mobile)
- **Memory:** < 150MB
- **Load Time:** < 3 seconds initial load
- **Battery:** Optimized for mobile (minimal particles)

---

## 🎯 Success Checklist

Use this to track your progress:

### Core Gameplay
- [ ] Heroes move left/right between columns
- [ ] Heroes auto-fire upward continuously
- [ ] Zomboids spawn from top and descend
- [ ] Projectiles collide with zomboids
- [ ] Zomboids destroyed when health reaches 0
- [ ] Game over when zomboid reaches bottom

### Timer Mechanic
- [ ] Timers spawn from top and descend
- [ ] Shooting timer increments counter
- [ ] Timer color changes: red → blue at 0
- [ ] Hero count increases/decreases on timer exit
- [ ] Hero count never drops below 1

### Weapon Upgrades
- [ ] Single gun works
- [ ] Double gun upgrade unlocks
- [ ] Triple gun upgrade unlocks
- [ ] Pulse laser upgrade unlocks
- [ ] Mega machine gun upgrade unlocks

### Wave System
- [ ] Chapter 1 playable (3 waves)
- [ ] Chapter 2 playable (2 waves)
- [ ] Chapter 3 playable (2 waves)
- [ ] Wave duration timer works
- [ ] Progression between waves smooth

### Polish
- [ ] HUD displays all info (score, wave, time, heroes, weapon)
- [ ] Sound effects play
- [ ] Background music loops
- [ ] Dark mode visual theme complete
- [ ] Touch controls work on mobile
- [ ] 60 FPS on desktop

---

## 🆘 Troubleshooting

### "npm install" fails
- Ensure Node.js 18+ installed: `node --version`
- Clear cache: `npm cache clean --force`
- Delete `node_modules/` and retry

### Dev server won't start
- Check port 3000 not in use
- Try: `npm run dev -- --port 3001`

### TypeScript errors in IDE
- Run: `npm install` to get type definitions
- Reload IDE window

### Game canvas not showing
- Check browser console for errors
- Verify `src/main.ts` exists and exports correctly
- Check Phaser version: `npm list phaser`

---

## 📚 Where to Get Help

1. **Phaser 3 API:** https://photonstorm.github.io/phaser3-docs/
2. **Phaser Examples:** https://labs.phaser.io/
3. **TypeScript Docs:** https://www.typescriptlang.org/docs/
4. **Project Docs:** All answers in `docs/` folder!

---

## 🎉 You're Ready!

Everything is set up. The JSON configs are ready. The documentation is complete. The build system works.

**All that's left is to write the game code following the roadmap!**

Start with: `docs/implementation-roadmap.md` → Phase 1 → Story 1.2.1

Good luck building Zomboid Assault! 🧟‍♂️⚡

---

**Created:** 2025-10-21
**BMad Orchestrator** - Prototype Planning Complete
