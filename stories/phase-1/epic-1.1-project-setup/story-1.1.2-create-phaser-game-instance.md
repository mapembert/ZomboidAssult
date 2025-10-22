# Story 1.1.2: Create Phaser Game Instance

**Epic:** 1.1 Project Setup
**Phase:** 1 - Foundation (Days 1-2)
**Estimated Time:** 2 hours
**Status:** ✅ COMPLETED

## Description
Create `src/main.ts` entry point, configure Phaser game instance (720x1280 portrait, WebGL + Canvas fallback), set up Arcade Physics, create placeholder BootScene, and verify game renders in browser.

## Tasks
- [x] Create `src/main.ts` entry point
- [x] Configure Phaser game instance (720x1280 portrait, WebGL + Canvas fallback)
- [x] Set up Arcade Physics
- [x] Create placeholder BootScene
- [x] Verify game renders in browser

## Acceptance Criteria
- [x] Game canvas renders at correct size
- [x] Dark background (#121212) displays
- [x] Phaser debug info shows 60 FPS
- [x] No console errors

## Implementation Guide

### Create `src/main.ts`
```typescript
import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  backgroundColor: '#121212',
  parent: 'game-container',
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
  scene: [],  // Will add scenes here
};

// Hide loading screen
const loadingEl = document.getElementById('loading');
if (loadingEl) {
  loadingEl.style.display = 'none';
}

// Create game instance
const game = new Phaser.Game(config);

export default game;
```

### Create Placeholder `src/scenes/BootScene.ts`
```typescript
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Placeholder text
    this.add
      .text(360, 640, 'Zomboid Assult\nLoading...', {
        fontSize: '48px',
        color: '#03DAC6',
        align: 'center',
      })
      .setOrigin(0.5);

    console.log('BootScene created successfully');
  }
}
```

### Update `src/main.ts` to include BootScene
```typescript
import { BootScene } from './scenes/BootScene';

// ... (in config)
  scene: [BootScene],
```

## Files to Create
- `src/main.ts`
- `src/scenes/BootScene.ts`

## Dependencies
- Story 1.1.1: Initialize Project (completed)

## Testing
```bash
npm run dev
# Open browser at http://localhost:3000
# Should see dark background with "Zomboid Assult Loading..." text
# Check console for "BootScene created successfully"
# Check FPS in browser (should be ~60 FPS)
```

## Next Story
Story 1.2.1: Create TypeScript Type Definitions
