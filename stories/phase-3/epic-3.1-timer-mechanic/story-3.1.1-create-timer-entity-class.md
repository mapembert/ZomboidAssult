# Story 3.1.1: Create Timer Entity Class

**Epic:** 3.1 Countdown Timer Mechanic
**Phase:** 3 - Timer and Upgrade Systems (Days 6-7)
**Estimated Time:** 4 hours
**Status:** ✅ COMPLETED

## Description
Create `src/entities/Timer.ts` entity class that renders as a horizontal barrier spanning the full column width, displays a counter value as centered text, implements counter increment logic, and dynamically changes color based on value (negative=red, positive=blue).

## Tasks
- [x] Create `src/entities/Timer.ts` class extending Phaser.GameObjects.Container
- [x] Implement horizontal barrier rendering using Phaser.GameObjects.Graphics
- [x] Render as horizontal rectangle (full column width, configurable height)
- [x] Add counter value text display centered in rectangle
- [x] Implement incrementCounter() method
- [x] Add color change logic (negative values = red #FF1744, positive values = blue #00B0FF)
- [x] Implement downward movement at configured speed
- [x] Add resetForPool() method for object pooling
- [x] Load TimerConfig from ConfigLoader

## Acceptance Criteria
- [x] Timer renders as horizontal barrier (360px width, 70-90px height)
- [x] Counter text visible and centered vertically/horizontally
- [x] Color changes correctly at value 0 threshold
- [x] Descends at configured speed
- [x] Text remains readable against background
- [x] Timer config loads from timers.json with width and height properties
- [x] No TypeScript errors
- [x] No console errors when rendering

## Files Created/Modified
- `src/entities/Timer.ts` (to be created)

## Dependencies
- Story 1.2.1: Create TypeScript Type Definitions (TimerConfig type)
- Story 1.2.2: Implement ConfigLoader System (to load timers.json)
- `config/entities/timers.json` (timer configuration)
- Phaser.GameObjects.Graphics for rectangle rendering
- Phaser.GameObjects.Text for counter display

## Implementation Details

### Timer Entity Structure
The Timer class:
1. Extends `Phaser.GameObjects.Container` for grouping graphics and text
2. Contains a `Phaser.GameObjects.Graphics` object for rectangle rendering
3. Contains a `Phaser.GameObjects.Text` object for counter display
4. Stores counter value (starts from timer config initialValue)
5. Stores timer type config (hero_count_timer or weapon_upgrade_timer)
6. Provides methods for incrementing counter and checking exit conditions

### Class Implementation
```typescript
class Timer extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private counterText: Phaser.GameObjects.Text;
  private config: TimerType;
  private counter: number;
  private columnIndex: number;
  private speed: number;

  constructor(scene, x, y, timerConfig, columnIndex)
  incrementCounter(amount: number): void
  getCounterValue(): number
  onExitScreen(): number
  update(delta: number): void
  renderShape(): void
  resetForPool(): void
  destroy(): void
}
```

### Configuration Used
From `config/entities/timers.json`:
- Timer type: "hero_count_timer" or "weapon_upgrade_timer"
- `sprite.width`: 40px (thin vertical bar)
- `sprite.height`: Full screen height (1280px)
- `sprite.negativeColor`: "#CF6679" (dark mode red)
- `sprite.positiveColor`: "#03DAC6" (dark mode cyan)
- `sprite.outlineColor`: "#18FFFF"
- `initialValue`: Starting counter value
- `incrementValue`: Amount to add per hit
- `speed`: Downward movement speed (pixels per second)

### Visual Design
```
┌────┐
│ +3 │  <- Counter text (blue if positive)
│    │
│    │  <- Thin vertical rectangle
│    │
│    │
│ -2 │  <- Counter text (red if negative)
└────┘
```

### Color Logic
```typescript
if (this.counter < 0) {
  // Red theme for negative values
  fillColor = 0xCF6679;
} else {
  // Blue/cyan theme for positive values
  fillColor = 0x03DAC6;
}
```

## Testing Checklist
- [x] TypeScript compiles without errors
- [x] ESLint passes with no warnings
- [x] Timer renders with correct dimensions
- [x] Counter text displays correctly
- [x] Color changes when counter crosses 0
- [x] Timer moves downward smoothly
- [x] incrementCounter() updates value and visual
- [x] onExitScreen() returns final counter value
- [x] resetForPool() resets all state

## Implementation Notes
- Timer renders as horizontal barrier (360px width, 70-90px height)
- Added reward display text below counter for instant rewards
- Implemented instant trigger mechanism when maxValue reached
- Added unique instance ID tracking for event handling
- Fixed pool initialization to prevent visible timers at start

## Next Story
Story 3.1.2: Implement Timer Spawning in WaveManager
