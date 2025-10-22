# Story 3.1.2: Implement Timer Spawning in WaveManager

**Epic:** 3.1 Countdown Timer Mechanic
**Phase:** 3 - Timer and Upgrade Systems (Days 6-7)
**Estimated Time:** 2.5 hours
**Status:** ✅ COMPLETED

## Description
Extend `src/systems/WaveManager.ts` to parse timer spawn data from wave configuration, spawn timers at scheduled times during waves, assign timers to correct columns, and track active timers for collision detection and lifecycle management.

## Tasks
- [x] Add timer spawn data parsing to WaveManager constructor
- [x] Create timer object pool (similar to zomboid pool)
- [x] Implement spawnTimer() method
- [x] Add timer spawn scheduling to wave timeline
- [x] Assign timers to correct column (left or right)
- [x] Track active timers in array
- [x] Update all active timers in update() method
- [x] Remove timers that exit screen (Y > SCREEN_HEIGHT)
- [x] Emit timer_exited event when timer leaves screen
- [x] Fix timer pool initialization to prevent visible timers at start

## Acceptance Criteria
- [x] Timers spawn at correct times specified in wave config
- [x] Column assignment (0=left, 1=right) works correctly
- [x] Timer type (hero_add_timer, weapon_upgrade_timer) loads from config
- [x] Multiple timers can be active simultaneously
- [x] Active timers array updated correctly
- [x] Timers removed when off-screen
- [x] No memory leaks from timer pooling
- [x] TypeScript compiles without errors
- [x] Timers hidden during pool initialization (no red box artifacts)

## Files Created/Modified
- `src/systems/WaveManager.ts` (modified)

## Dependencies
- Story 3.1.1: Create Timer Entity Class
- Story 2.3.3: Implement WaveManager System (base implementation)
- Story 2.2.2: Implement ObjectPool Utility (for timer pooling)
- Wave configuration JSON files in `config/chapters/`

## Implementation Details

### Wave Config Timer Data Structure
From wave configuration JSON:
```json
{
  "wave": 1,
  "duration": 60,
  "zomboidSpawns": [...],
  "timerSpawns": [
    {
      "time": 15,
      "timerType": "hero_count_timer",
      "column": 0,
      "initialValue": -3
    },
    {
      "time": 30,
      "timerType": "weapon_upgrade_timer",
      "column": 1,
      "initialValue": 3
    }
  ]
}
```

### WaveManager Extension
```typescript
class WaveManager {
  private timerPool: ObjectPool<Timer>;
  private activeTimers: Timer[];
  private timerSpawnSchedule: TimerSpawnData[];

  // Existing methods...

  // New methods for timer management
  private parseTimerSpawns(waveData: WaveData): void
  private spawnTimer(timerData: TimerSpawnData): Timer
  private updateTimers(delta: number): void
  private removeOffScreenTimers(): void
  getActiveTimers(): Timer[]
}
```

### Timer Spawning Logic
1. Parse timer spawn data during wave initialization
2. Add timer spawns to timeline (sorted by time)
3. When wave time reaches spawn time:
   - Acquire timer from pool
   - Load timer type config from ConfigLoader
   - Set initial counter value from spawn data
   - Position at top of assigned column
   - Add to activeTimers array
4. Update all active timers each frame
5. Check for timers that exited screen (Y > SCREEN_HEIGHT)
6. Emit timer_exited event with final counter value
7. Return timer to pool

### Column Positioning
```typescript
const columnPositions = [
  SCREEN_WIDTH / 4,      // Left column (column 0)
  3 * SCREEN_WIDTH / 4   // Right column (column 1)
];

const timerX = columnPositions[timerData.column];
const timerY = -timerHeight; // Start above screen
```

### Event Emission
```typescript
// When timer exits screen
this.scene.events.emit('timer_exited', {
  timerType: timer.getTimerType(),
  finalValue: timer.getCounterValue(),
  column: timer.getColumnIndex()
});
```

## Testing Checklist
- [x] TypeScript compiles without errors
- [x] ESLint passes with no warnings
- [x] Timers spawn at configured times
- [x] Timer types load correctly (hero_count, weapon_upgrade)
- [x] Column assignment accurate
- [x] Initial counter values match config
- [x] Multiple timers can be active
- [x] Timer exit event emits with correct data
- [x] Object pool reuses timers correctly
- [x] No console errors during timer lifecycle

## Implementation Notes
- Added timer object pool with proper initialization (hidden by default)
- Implemented buildTimerSpawnSchedule() and processTimerSpawnSchedule()
- Added handleTimerCompleted() for instant trigger events
- Timers assigned unique instance IDs for tracking
- Event listeners properly managed in constructor and destroy
- Fixed pool factory to immediately hide timers (prevents red box artifact)

## Integration Points
- GameScene listens for 'timer_exited' event
- CollisionManager checks projectile-timer collisions (Story 3.1.3)
- HeroManager responds to hero_count_timer exits (Story 3.1.4)
- WeaponSystem responds to weapon_upgrade_timer exits (Story 3.2.2)

## Next Story
Story 3.1.3: Implement Projectile-Timer Collision
