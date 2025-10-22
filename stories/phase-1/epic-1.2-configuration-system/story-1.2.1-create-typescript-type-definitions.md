# Story 1.2.1: Create TypeScript Type Definitions

**Epic:** 1.2 Configuration System
**Phase:** 1 - Foundation (Days 1-2)
**Estimated Time:** 1.5 hours
**Status:** 🟡 READY TO START

## Description
Create `src/types/ConfigTypes.ts` with interfaces for all JSON configuration structures (GameSettings, ZomboidType, WeaponType, TimerType, HeroConfig, WaveData, ChapterData) and `src/types/GameTypes.ts` for runtime types.

## Tasks
- [ ] Create `src/types/ConfigTypes.ts`
- [ ] Define GameSettings interface
- [ ] Define ZomboidType interface
- [ ] Define WeaponType interface
- [ ] Define TimerType interface
- [ ] Define HeroConfig interface
- [ ] Define WaveData interface
- [ ] Define ChapterData interface
- [ ] Create `src/types/GameTypes.ts` for runtime types

## Acceptance Criteria
- [ ] All JSON structures have matching TypeScript interfaces
- [ ] No TypeScript compilation errors
- [ ] Types exported and importable

## Implementation Guide

### Create `src/types/ConfigTypes.ts`

```typescript
// Game Settings Types
export interface GameSettings {
  gameSettings: {
    screenWidth: number;
    screenHeight: number;
    columnCount: number;
    backgroundColor: string;
    fps: number;
    debugMode: boolean;
  };
  gameplay: {
    playerStartColumn: number;
    safeZoneHeight: number;
    spawnZoneHeight: number;
    gameOverOnZomboidReachBottom: boolean;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
}

// Zomboid Type
export interface ZomboidType {
  id: string;
  shape: 'circle' | 'square' | 'hexagon';
  size: 'small' | 'medium' | 'large';
  radius?: number;
  width?: number;
  height?: number;
  color: string;
  outlineColor: string;
  health: number;
  speed: number;
  scoreValue: number;
}

// Weapon Type
export interface WeaponType {
  id: string;
  name: string;
  tier: number;
  fireRate: number;
  projectileCount: number;
  damage: number;
  spread: number;
  projectileSpeed: number;
  projectileColor: string;
  projectileSize: number;
}

// Timer Type
export interface TimerType {
  id: string;
  name: string;
  startValue: number;
  increment: number;
  width: number;
  speed: number;
  negativeColor: string;
  positiveColor: string;
  neutralColor: string;
  fontSize: number;
  fontColor: string;
}

// Hero Config
export interface HeroConfig {
  heroConfig: {
    defaultHeroCount: number;
    minHeroCount: number;
    maxHeroCount: number;
    movementSpeed: number;
    sprite: {
      shape: string;
      baseWidth: number;
      height: number;
      color: string;
      outlineColor: string;
      outlineWidth: number;
    };
    spacing: number;
    positionFromBottom: number;
  };
}

// Wave Spawn Pattern
export interface ZomboidSpawnPattern {
  type: string;
  count: number;
  spawnRate: number;
  columns: ('left' | 'right')[];
  spawnDelay: number;
}

export interface TimerSpawnPattern {
  type: string;
  spawnTime: number;
  column: 'left' | 'right';
}

// Wave Data
export interface WaveData {
  waveId: number;
  waveName: string;
  duration: number;
  spawnPattern: {
    zomboids: ZomboidSpawnPattern[];
    timers: TimerSpawnPattern[];
  };
}

// Chapter Data
export interface ChapterData {
  chapterId: string;
  chapterName: string;
  description: string;
  unlockRequirement: string | null;
  waves: WaveData[];
}

// Helper type for config collections
export interface ZomboidTypesConfig {
  zomboidTypes: ZomboidType[];
}

export interface WeaponTypesConfig {
  weaponTypes: WeaponType[];
}

export interface TimerTypesConfig {
  timerTypes: TimerType[];
}
```

### Create `src/types/GameTypes.ts`

```typescript
// Runtime game state types

export interface GameState {
  currentChapter: string;
  currentWave: number;
  score: number;
  heroCount: number;
  currentWeapon: string;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface Vector2D {
  x: number;
  y: number;
}

export enum Column {
  Left = 0,
  Right = 1,
}

export interface SpawnEvent {
  time: number;
  type: 'zomboid' | 'timer';
  entityId: string;
  column: Column;
}
```

## Files to Create
- `src/types/ConfigTypes.ts`
- `src/types/GameTypes.ts`

## Dependencies
- Story 1.1.2: Create Phaser Game Instance

## Testing
```bash
# TypeScript compilation test
npx tsc --noEmit

# Should show no errors
# Import test in any .ts file:
import type { ChapterData, WeaponType } from '@/types/ConfigTypes';
```

## Next Story
Story 1.2.2: Implement ConfigLoader System
