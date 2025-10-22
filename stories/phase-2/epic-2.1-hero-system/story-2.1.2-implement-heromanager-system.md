# Story 2.1.2: Implement HeroManager System

**Epic:** 2.1 Hero System
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 4 hours
**Status:** ✅ COMPLETED

## Description
Create `src/systems/HeroManager.ts` system to manage multiple hero entities, calculate column positions, implement left/right movement between columns, handle hero count management (add/remove), and position heroes evenly within their current column.

## Tasks
- [x] Create `src/systems/HeroManager.ts` class
- [x] Calculate column positions (X: SCREEN_WIDTH / 4 and 3 * SCREEN_WIDTH / 4)
- [x] Implement moveLeft() method to switch to left column
- [x] Implement moveRight() method to switch to right column
- [x] Implement addHero(count) method
- [x] Implement removeHero(count) method
- [x] Implement repositionHeroes() to space heroes evenly in column
- [x] Ensure hero count never goes below minHeroCount (1)
- [x] Track current column index

## Acceptance Criteria
- [x] Heroes start in left column (playerStartColumn from config)
- [x] Movement between columns works with smooth transition
- [x] Multiple heroes spaced evenly within column
- [x] Heroes never go below minHeroCount (1)
- [x] Heroes never exceed maxHeroCount (5)
- [x] Hero spacing maintains positionFromBottom offset
- [x] Column positions calculated correctly (180px and 540px for 720px width)
- [x] All heroes update positions when repositioned

## Files Created/Modified
- `src/systems/HeroManager.ts` ✅ Created

## Dependencies
- Story 2.1.1: Create Hero Entity Class (Hero entity must exist)
- Story 1.2.2: Implement ConfigLoader System (to load heroes.json)
- `public/config/game-settings.json` (screen dimensions, column count)
- `public/config/entities/heroes.json` (hero configuration)

## Implementation Details

### Column Position Calculation
For a 720px wide screen with 2 columns:
- Left column: X = 720 / 4 = 180px
- Right column: X = (3 * 720) / 4 = 540px

### Hero Positioning Algorithm
Within a column, heroes are stacked vertically:
- Total height = (heroCount - 1) * spacing
- Start Y = screenHeight - positionFromBottom - totalHeight / 2
- Each hero Y = startY + index * spacing

### Class Implementation
```typescript
class HeroManager {
  private scene: Phaser.Scene;
  private heroes: Hero[];
  private config: HeroConfig;
  private gameSettings: GameSettings;
  private currentColumn: number;
  private columnPositions: number[];

  constructor(scene, config, gameSettings)
  moveLeft(): void
  moveRight(): void
  addHero(count): void
  removeHero(count): void
  getHeroCount(): number
  getHeroPositions(): { x, y }[]
  getCurrentColumn(): number
  update(delta): void
  repositionHeroes(): void
  destroy(): void
}
```

## Configuration Values
From `public/config/entities/heroes.json`:
- `defaultHeroCount`: 1
- `minHeroCount`: 1
- `maxHeroCount`: 5
- `spacing`: 15px
- `positionFromBottom`: 100px

From `public/config/game-settings.json`:
- `screenWidth`: 720px
- `screenHeight`: 1280px
- `columnCount`: 2
- `playerStartColumn`: 0 (left)

## Testing Results
✅ TypeScript compiles without errors
✅ ESLint passes with no warnings
✅ Heroes start in left column
✅ moveLeft() and moveRight() work correctly
✅ Heroes spaced evenly (15px apart)
✅ Min/max hero count enforced
✅ Position calculations correct

## Next Story
Story 2.1.3: Implement InputManager
