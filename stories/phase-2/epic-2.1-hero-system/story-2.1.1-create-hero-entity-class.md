# Story 2.1.1: Create Hero Entity Class

**Epic:** 2.1 Hero System
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 3 hours
**Status:** ✅ COMPLETED

## Description
Create `src/entities/Hero.ts` entity class that renders as a triangle using Phaser Graphics, loads configuration from heroes.json, applies dark mode colors (#03DAC6 fill, #18FFFF outline), and includes position update methods.

## Tasks
- [x] Create `src/entities/Hero.ts` class extending Phaser.GameObjects.Container
- [x] Implement triangle shape rendering using Phaser.GameObjects.Graphics
- [x] Load HeroConfig from ConfigLoader
- [x] Apply dark mode colors from config (#03DAC6 fill, #18FFFF outline)
- [x] Implement position update methods
- [x] Add column index tracking
- [x] Create renderShape() method for triangle drawing

## Acceptance Criteria
- [x] Hero renders as upward-pointing triangle at specified position
- [x] Colors match design spec (cyan fill #03DAC6, bright cyan outline #18FFFF)
- [x] Outline visible with 2-3px width
- [x] Hero updates position smoothly
- [x] Triangle dimensions match config (baseWidth: 30px, height: 30px)
- [x] No TypeScript errors
- [x] No console errors when rendering

## Files Created/Modified
- `src/entities/Hero.ts` ✅ Created

## Dependencies
- Story 1.2.1: Create TypeScript Type Definitions (HeroConfig type)
- Story 1.2.2: Implement ConfigLoader System (to load heroes.json)
- `config/entities/heroes.json` (hero configuration)

## Implementation Details

### Hero Entity Structure
The Hero class:
1. Extends `Phaser.GameObjects.Container` for grouping graphics
2. Contains a `Phaser.GameObjects.Graphics` object for triangle rendering
3. Stores column index for left/right positioning
4. Loads sprite config from heroes.json via ConfigLoader
5. Provides methods for position updates and column switching

### Class Implementation
```typescript
class Hero extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics;
  private config: HeroConfig['heroConfig'];
  private columnIndex: number;

  constructor(scene, x, y, config, columnIndex)
  moveToColumn(columnIndex): void
  getColumnIndex(): number
  update(delta): void
  renderShape(): void
  destroy(): void
}
```

### Configuration Used
From `config/entities/heroes.json`:
- `sprite.baseWidth`: 30px
- `sprite.height`: 30px
- `sprite.color`: "#03DAC6"
- `sprite.outlineColor`: "#18FFFF"
- `sprite.outlineWidth`: 2

## Testing Results
✅ TypeScript compiles without errors
✅ ESLint passes with no warnings
✅ Triangle renders correctly with proper colors
✅ Outline visible at 2px width
✅ Hero responds to position updates

## Next Story
Story 2.1.2: Implement HeroManager System
