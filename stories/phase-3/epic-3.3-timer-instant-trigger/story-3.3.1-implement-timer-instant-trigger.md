# Story 3.3.1: Implement Timer Instant Trigger

**Epic:** 3.3 Timer Instant Trigger Mechanism
**Phase:** 3 - Timer and Upgrade Systems (Days 6-7)
**Estimated Time:** 2 hours
**Status:** ✅ COMPLETED

## Description
Add optional `maxValue` property to timer configuration that triggers instant completion when the timer counter reaches or exceeds the max value (or reaches zero for negative timers). This prevents players from accumulating excessive positive/negative values and provides immediate feedback when timer objectives are met.

## Tasks
- [x] Add `maxValue` optional property to TimerType interface
- [x] Update timers.json with appropriate maxValue settings
- [x] Implement instant trigger logic in Timer.incrementCounter()
- [x] Emit 'timer_completed' event when max value reached
- [x] Handle instant timer completion in WaveManager
- [x] Apply timer effect immediately (don't wait for exit)
- [x] Remove timer from screen when instantly completed
- [x] Return timer to pool on instant completion
- [x] Test with both positive and negative max values
- [x] Add instantReward and instantRewardCount properties
- [x] Add rewardDisplayText for visual feedback
- [x] Implement processInstantReward() in GameScene

## Acceptance Criteria
- [x] Timer completes instantly when counter >= maxValue (positive timers)
- [x] Timer completes instantly when counter >= 0 (negative timers reaching zero)
- [x] Visual feedback shows immediately
- [x] Hero/weapon changes apply instantly
- [x] Timer disappears from screen
- [x] No duplicate effects (instant + exit)
- [x] Optional maxValue - timers without it work as before
- [x] TypeScript compiles without errors
- [x] Reward display text shown on timer
- [x] Instant rewards configurable and applied correctly

## Files Created/Modified
- `src/types/ConfigTypes.ts` (modified - add maxValue to TimerType)
- `config/entities/timers.json` (modified - add maxValue to timer configs)
- `src/entities/Timer.ts` (modified - add instant trigger logic)
- `src/systems/WaveManager.ts` (modified - handle timer_completed event)
- `src/scenes/GameScene.ts` (modified - handle instant completion)

## Dependencies
- Story 3.1.1: Create Timer Entity Class
- Story 3.1.2: Implement Timer Spawning in WaveManager
- Story 3.1.3: Implement Projectile-Timer Collision
- Story 3.1.4: Implement Timer Exit and Hero Modification
- Story 3.2.2: Create Weapon Upgrade Timer Type

## Implementation Details

### TimerType Interface Extension
```typescript
export interface TimerType {
  id: string;
  name: string;
  startValue: number;
  increment: number;
  width: number;
  height: number;
  speed: number;
  negativeColor: string;
  positiveColor: string;
  neutralColor: string;
  fontSize: number;
  fontColor: string;
  maxValue?: number; // Optional - instant trigger when reached
}
```

### Timer Configuration Examples
```json
{
  "timerTypes": [
    {
      "id": "hero_add_timer",
      "name": "Hero Modifier Timer",
      "startValue": -25,
      "increment": 1,
      "width": 360,
      "height": 80,
      "speed": 50,
      "maxValue": 0,
      "negativeColor": "#FF1744",
      "positiveColor": "#00B0FF",
      "neutralColor": "#757575",
      "fontSize": 24,
      "fontColor": "#FFFFFF"
    },
    {
      "id": "weapon_upgrade_timer",
      "name": "Weapon Upgrade Timer",
      "startValue": -50,
      "increment": 2,
      "width": 360,
      "height": 90,
      "speed": 25,
      "maxValue": 0,
      "negativeColor": "#FF1744",
      "positiveColor": "#76FF03",
      "neutralColor": "#757575",
      "fontSize": 28,
      "fontColor": "#FFFFFF"
    }
  ]
}
```

### Timer Instant Trigger Logic
```typescript
class Timer extends Phaser.GameObjects.Container {
  incrementCounter(amount?: number): void {
    const incrementValue = amount !== undefined ? amount : this.config.increment;
    this.counter += incrementValue;
    this.renderShape();

    // Check for instant trigger
    if (this.config.maxValue !== undefined) {
      const shouldTrigger = this.checkInstantTrigger();

      if (shouldTrigger) {
        // Emit instant completion event
        this.scene.events.emit('timer_completed', {
          timerId: this.id, // Need to track instance ID
          timerType: this.config.id,
          finalValue: this.counter,
          column: this.columnIndex,
          instant: true
        });
      }
    }
  }

  private checkInstantTrigger(): boolean {
    if (this.config.maxValue === undefined) return false;

    // For negative start values, trigger when reaching maxValue (usually 0)
    if (this.config.startValue < 0) {
      return this.counter >= this.config.maxValue;
    }

    // For positive start values, trigger when reaching maxValue
    return this.counter >= this.config.maxValue;
  }

  getMaxValue(): number | undefined {
    return this.config.maxValue;
  }
}
```

### WaveManager Instant Completion Handling
```typescript
class WaveManager {
  constructor(scene: Phaser.Scene, waves: WaveData[]) {
    // ... existing code ...

    // Listen for instant timer completions
    this.scene.events.on('timer_completed', this.handleTimerCompleted, this);
  }

  private handleTimerCompleted(data: {
    timerId: string;
    timerType: string;
    finalValue: number;
    column: number;
    instant: boolean;
  }): void {
    // Find and remove the timer
    const timerIndex = this.activeTimers.findIndex(t => t.getData('instanceId') === data.timerId);

    if (timerIndex !== -1) {
      const timer = this.activeTimers[timerIndex];

      // Remove from active timers
      this.activeTimers.splice(timerIndex, 1);

      // Return to pool
      this.timerPool.release(timer);

      console.log(`Timer ${data.timerType} instantly completed with value ${data.finalValue}`);
    }
  }

  destroy(): void {
    // Clean up event listener
    this.scene.events.off('timer_completed', this.handleTimerCompleted, this);

    // ... existing cleanup ...
  }
}
```

### GameScene Instant Completion Handler
```typescript
class GameScene {
  create(): void {
    // ... existing code ...

    // Listen for instant timer completions
    this.events.on('timer_completed', this.handleTimerCompleted, this);
  }

  private handleTimerCompleted(data: {
    timerId: string;
    timerType: string;
    finalValue: number;
    column: number;
    instant: boolean;
  }): void {
    console.log(`Timer completed instantly: ${data.timerType} with value ${data.finalValue}`);

    // Process the timer effect immediately
    this.processTimerEffect(data.timerType, data.finalValue, true);
  }

  private processTimerEffect(timerType: string, finalValue: number, isInstant: boolean): void {
    const prefix = isInstant ? '⚡ ' : '';

    // Handle hero_add_timer
    if (timerType === 'hero_add_timer' || timerType === 'rapid_hero_timer') {
      if (finalValue > 0) {
        this.heroManager?.addHero(finalValue);
        this.showFeedback(`${prefix}+${finalValue} Heroes!`, 0x00B0FF);
      } else if (finalValue < 0) {
        this.heroManager?.removeHero(Math.abs(finalValue));
        this.showFeedback(`${prefix}${finalValue} Heroes`, 0xFF1744);
      } else {
        // Reached zero - no change
        this.showFeedback(`${prefix}No Hero Change`, 0x757575);
      }
    }
    // Handle weapon_upgrade_timer
    else if (timerType === 'weapon_upgrade_timer') {
      if (finalValue >= 0) {
        const upgraded = this.weaponSystem?.upgradeWeapon();

        if (upgraded) {
          this.showFeedback(`${prefix}Weapon Upgraded!`, 0xFFEA00);
        } else {
          this.showFeedback(`${prefix}Max Weapon Tier!`, 0xFF5252);
        }
      } else {
        this.showFeedback(`${prefix}Weapon Not Upgraded`, 0xCF6679);
      }
    }
  }

  private handleTimerExit(data: {
    timerType: string;
    finalValue: number;
    column: number;
  }): void {
    // Only process if timer wasn't already completed instantly
    // (WaveManager will have already removed instant-completed timers)
    this.processTimerEffect(data.timerType, data.finalValue, false);
  }

  shutdown(): void {
    // Clean up event listeners
    this.events.off('timer_completed', this.handleTimerCompleted, this);

    // ... existing cleanup ...
  }
}
```

### Timer Instance Tracking
To prevent duplicate processing, add instance IDs to timers:

```typescript
// In WaveManager.spawnTimer()
private spawnTimer(timerTypeId: string, columnIndex: number): void {
  const timerConfig = this.configLoader.getTimerType(timerTypeId);
  if (!timerConfig) {
    console.error('Unknown timer type: ' + timerTypeId);
    return;
  }

  const timer = this.timerPool.acquire();
  const x = this.columnPositions[columnIndex];
  const y = -timerConfig.height;

  timer.resetForPool(x, y, timerConfig, columnIndex);

  // Add unique instance ID
  const instanceId = `timer_${Date.now()}_${Math.random()}`;
  timer.setData('instanceId', instanceId);

  this.activeTimers.push(timer);

  console.log(`Timer spawned: ${timerTypeId} in column ${columnIndex}`);
}

// In Timer.incrementCounter()
if (shouldTrigger) {
  this.scene.events.emit('timer_completed', {
    timerId: this.getData('instanceId'),
    timerType: this.config.id,
    finalValue: this.counter,
    column: this.columnIndex,
    instant: true
  });
}
```

### Configuration Strategy

**Early Game Timers (Waves 1-5):**
- Set maxValue = 0 for quick objectives
- Prevents excessive accumulation
- Encourages shooting timers but not over-shooting

**Mid/Late Game Timers (Waves 6+):**
- Set maxValue higher (5-10) or omit for challenge
- Allows more strategic play
- Risk/reward for continuing to shoot

**Example Wave Configuration:**
```json
{
  "wave": 2,
  "timerSpawns": [
    {
      "time": 10,
      "timerType": "hero_add_timer",
      "column": 0,
      "initialValue": -5
    }
  ]
}
```
With hero_add_timer.maxValue = 0, players need to shoot it 5 times to reach 0 and get the instant completion.

## Testing Checklist
- [x] TypeScript compiles without errors
- [x] ESLint passes with no warnings
- [x] Timer with maxValue=0 triggers at 0
- [x] Timer without maxValue works as before (exit-only)
- [x] Instant completion removes timer from screen
- [x] Visual feedback appears immediately
- [x] Hero/weapon effects apply instantly
- [x] No duplicate effects on exit
- [x] Counter reaching maxValue from above doesn't trigger (shouldn't happen normally)
- [x] Multiple timers can instant-complete independently

## Implementation Notes
- Added maxValue, instantReward, instantRewardCount, and rewardDisplayText to TimerType
- Timer displays two text elements: counter (top) and reward text (bottom)
- checkInstantTrigger() prevents duplicate triggers by checking previousValue
- WaveManager.handleTimerCompleted() removes timer from activeTimers and returns to pool
- GameScene.processInstantReward() applies configured rewards
- Lightning bolt (⚡) prefix in feedback distinguishes instant from exit completions
- All timer configs use maxValue=0 for balanced early-game rewards

## Edge Cases
1. **Timer shot past maxValue:** Counter goes from -2 to +1 (increment of 3), maxValue is 0
   - Should trigger when crossing 0
2. **Timer exits before reaching maxValue:** Should process normally on exit
3. **Multiple projectiles hit simultaneously:** Each increment checked separately
4. **maxValue = startValue:** Instant completion on spawn (valid but unusual)

## Visual Distinction
Add lightning bolt (⚡) prefix to instant completion messages to distinguish from exit completions.

## Next Story
Story 3.3.2: Balance Timer maxValue Settings (gameplay testing)
