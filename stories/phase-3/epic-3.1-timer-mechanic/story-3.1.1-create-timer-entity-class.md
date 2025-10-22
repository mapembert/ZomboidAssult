# Story 3.1.1: Create Timer Entity Class

**Epic:** 3.1 Countdown Timer Mechanic
**Phase:** 3 - Timer and Upgrade Systems (Days 6-7)
**Estimated Time:** 4 hours
**Status:** ⏳ PENDING

## Description
Create `src/entities/Timer.ts` entity class that renders as a thin vertical rectangle spanning the full column height, displays a counter value as centered text, implements counter increment logic, and dynamically changes color based on value (negative=red, positive=blue).

## Tasks
- [ ] Create `src/entities/Timer.ts` class extending Phaser.GameObjects.Container
- [ ] Implement thin vertical rectangle rendering using Phaser.GameObjects.Graphics
- [ ] Calculate and render full column height (from top to bottom of screen)
- [ ] Add counter value text display centered in rectangle
- [ ] Implement incrementCounter() method
- [ ] Add color change logic (negative values = red #CF6679, positive values = blue #03DAC6)
- [ ] Implement downward movement at configured speed
- [ ] Add resetForPool() method for object pooling
- [ ] Load TimerConfig from ConfigLoader

## Acceptance Criteria
- [ ] Timer renders as thin vertical box (configured width, full screen height)
- [ ] Counter text visible and centered vertically/horizontally
- [ ] Color changes correctly at value 0 threshold
- [ ] Descends at configured speed
- [ ] Text remains readable against background
- [ ] Timer config loads from timers.json
- [ ] No TypeScript errors
- [ ] No console errors when rendering

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
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Timer renders with correct dimensions
- [ ] Counter text displays correctly
- [ ] Color changes when counter crosses 0
- [ ] Timer moves downward smoothly
- [ ] incrementCounter() updates value and visual
- [ ] onExitScreen() returns final counter value
- [ ] resetForPool() resets all state

## Next Story
Story 3.1.2: Implement Timer Spawning in WaveManager
