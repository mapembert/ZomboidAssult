# Story 3.1.4: Implement Timer Exit and Hero Modification

**Epic:** 3.1 Countdown Timer Mechanic
**Phase:** 3 - Timer and Upgrade Systems (Days 6-7)
**Estimated Time:** 3 hours
**Status:** ✅ COMPLETED

## Description
Detect when timers exit the screen bottom, call timer.onExitScreen() to retrieve final counter value, pass the value to HeroManager to add or remove heroes, ensure hero count never drops below minimum (1), and update hero count display immediately.

## Tasks
- [ ] Add timer exit detection in WaveManager.updateTimers()
- [ ] Call timer.onExitScreen() to get final counter value
- [ ] Emit 'timer_exited' event with timer type and final value
- [ ] Create GameScene event listener for 'timer_exited'
- [ ] Route hero_count_timer exits to HeroManager
- [ ] Implement hero addition/removal based on counter value
- [ ] Enforce minimum hero count constraint (minHeroCount = 1)
- [ ] Update hero positions after count change
- [ ] Update HUD to reflect new hero count
- [ ] Add visual feedback for hero add/remove

## Acceptance Criteria
- [ ] Timer exit detected when Y > SCREEN_HEIGHT
- [ ] Positive timer values add heroes to HeroManager
- [ ] Negative timer values remove heroes from HeroManager
- [ ] Hero count never drops below 1
- [ ] Visual update is immediate
- [ ] Heroes repositioned evenly in current column
- [ ] HUD displays correct hero count
- [ ] TypeScript compiles without errors

## Files Created/Modified
- `src/systems/WaveManager.ts` (modified - timer exit detection)
- `src/systems/HeroManager.ts` (modified - add addHeroes/removeHeroes methods)
- `src/scenes/GameScene.ts` (modified - event listener)

## Dependencies
- Story 3.1.1: Create Timer Entity Class (onExitScreen method)
- Story 3.1.2: Implement Timer Spawning in WaveManager
- Story 2.1.2: Implement HeroManager System
- `config/entities/heroes.json` (minHeroCount configuration)

## Implementation Details

### Timer Exit Detection
In WaveManager.updateTimers():
```typescript
private updateTimers(delta: number): void {
  for (let i = this.activeTimers.length - 1; i >= 0; i--) {
    const timer = this.activeTimers[i];
    timer.update(delta);

    // Check if timer exited screen
    if (timer.y > SCREEN_HEIGHT) {
      const finalValue = timer.onExitScreen();

      // Emit event with timer data
      this.scene.events.emit('timer_exited', {
        timerType: timer.getTimerType(),
        finalValue: finalValue,
        column: timer.getColumnIndex()
      });

      // Remove and pool timer
      this.activeTimers.splice(i, 1);
      this.timerPool.release(timer);
    }
  }
}
```

### HeroManager Extension
```typescript
class HeroManager {
  private minHeroCount: number = 1;
  private maxHeroCount: number = 10;

  // Existing methods...

  // New methods for dynamic hero management
  addHeroes(count: number): void {
    const newCount = Math.min(
      this.heroes.length + count,
      this.maxHeroCount
    );

    const heroesToAdd = newCount - this.heroes.length;

    for (let i = 0; i < heroesToAdd; i++) {
      const hero = this.heroPool.acquire();
      hero.reset(this.currentColumn);
      this.heroes.push(hero);
    }

    this.repositionHeroes();
    this.emitHeroCountChanged();
  }

  removeHeroes(count: number): void {
    const newCount = Math.max(
      this.heroes.length - count,
      this.minHeroCount
    );

    const heroesToRemove = this.heroes.length - newCount;

    for (let i = 0; i < heroesToRemove; i++) {
      const hero = this.heroes.pop();
      if (hero) {
        this.heroPool.release(hero);
      }
    }

    this.repositionHeroes();
    this.emitHeroCountChanged();
  }

  private repositionHeroes(): void {
    const spacing = this.calculateSpacing();
    const startY = this.calculateStartY();

    this.heroes.forEach((hero, index) => {
      hero.setY(startY + index * spacing);
    });
  }

  private emitHeroCountChanged(): void {
    this.scene.events.emit('hero_count_changed', {
      count: this.heroes.length
    });
  }

  getHeroCount(): number {
    return this.heroes.length;
  }
}
```

### GameScene Event Handling
```typescript
// In GameScene.create()
create(): void {
  // Existing initialization...

  // Listen for timer exits
  this.events.on('timer_exited', this.handleTimerExit, this);
}

private handleTimerExit(data: TimerExitEvent): void {
  const { timerType, finalValue } = data;

  if (timerType === 'hero_count_timer') {
    if (finalValue > 0) {
      this.heroManager.addHeroes(finalValue);
      this.showFeedback(`+${finalValue} Heroes!`, 0x03DAC6);
    } else if (finalValue < 0) {
      this.heroManager.removeHeroes(Math.abs(finalValue));
      this.showFeedback(`${finalValue} Heroes`, 0xCF6679);
    }
  }
  // weapon_upgrade_timer handled in Story 3.2.2
}
```

### Event Data Structures
```typescript
interface TimerExitEvent {
  timerType: 'hero_count_timer' | 'weapon_upgrade_timer';
  finalValue: number;
  column: number;
}

interface HeroCountChangedEvent {
  count: number;
}
```

### Hero Repositioning Logic
When heroes are added or removed, they must be repositioned evenly:
```typescript
// Example: 3 heroes in safe zone (bottom 25% of screen)
const safeZoneStart = SCREEN_HEIGHT * 0.75;
const safeZoneHeight = SCREEN_HEIGHT * 0.25;
const spacing = safeZoneHeight / (heroCount + 1);

// Position heroes evenly
heroes[0].y = safeZoneStart + spacing;
heroes[1].y = safeZoneStart + spacing * 2;
heroes[2].y = safeZoneStart + spacing * 3;
```

### Visual Feedback
Display floating text when heroes added/removed:
```typescript
private showFeedback(text: string, color: number): void {
  const feedback = this.add.text(
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 2,
    text,
    { fontSize: '32px', color: `#${color.toString(16)}` }
  );

  this.tweens.add({
    targets: feedback,
    y: feedback.y - 100,
    alpha: 0,
    duration: 1500,
    onComplete: () => feedback.destroy()
  });
}
```

## Testing Checklist
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Positive timer values add heroes
- [ ] Negative timer values remove heroes
- [ ] Hero count never goes below 1
- [ ] Heroes reposition correctly after modification
- [ ] HUD updates to show new hero count
- [ ] Visual feedback displays for add/remove
- [ ] Maximum hero count respected (if configured)
- [ ] No console errors

## Edge Cases to Handle
1. **Below minimum**: Timer value of -10 when only 1 hero exists → hero count stays at 1
2. **Above maximum**: Timer value of +5 when at 8 heroes (max 10) → only add 2 heroes
3. **Rapid changes**: Multiple timers exit in quick succession → all changes processed correctly
4. **Mid-movement**: Timer exits while heroes are moving columns → position update works

## Next Story
Story 3.2.1: Implement Weapon Upgrade Logic
