# Story 2.3.3: Implement WaveManager System

**Epic:** 2.3 Zomboid Spawning and Movement
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 5 hours
**Status:** ✅ COMPLETED

## Description
Create `src/systems/WaveManager.ts` to parse WaveData from chapter config, build spawn schedule from wave config, implement zomboid spawning at scheduled times, use zomboid object pool, and track wave duration.

## Tasks
- [x] Create `src/systems/WaveManager.ts` class
- [x] Parse WaveData from chapter config
- [x] Build spawn schedule from wave config
- [x] Implement zomboid spawning at scheduled times
- [x] Use ObjectPool<Zomboid> for zomboid management
- [x] Track wave duration and time remaining
- [x] Support left/right column spawning
- [x] Handle multiple zomboid types per wave

## Acceptance Criteria
- [x] Zomboids spawn according to config schedule
- [x] Spawn rate matches config values
- [x] Column assignment works correctly (left/right)
- [x] Wave duration tracked accurately
- [x] Multiple waves supported sequentially
- [x] Zomboid variety matches config
- [x] Object pool used (no memory leaks)

## Files Created/Modified
- `src/systems/WaveManager.ts` ✅ Created

## Dependencies
- Story 2.3.2: Create Zomboid Entity Class ✅
- Story 2.2.2: Implement ObjectPool Utility ✅
- Story 1.2.2: Implement ConfigLoader System ✅
- `public/config/chapters/*.json` (chapter/wave configs) ✅

## Implementation Details

### WaveManager Class Structure
```typescript
export class WaveManager {
  private scene: Phaser.Scene;
  private waves: WaveData[];
  private currentWaveIndex: number;
  private currentWave: WaveData | null;
  private zomboidPool: ObjectPool<Zomboid>;
  private activeZomboids: Zomboid[];
  private waveElapsedTime: number;
  private isWaveActive: boolean;
  private spawnSchedule: SpawnScheduleEntry[];
  private columnPositions: number[];

  startWave(waveIndex: number): boolean;
  update(time: number, delta: number): void;
  getCurrentWave(): WaveData | null;
  getWaveTimeRemaining(): number;
  getActiveZomboids(): Zomboid[];
}
```

### Spawn Schedule Building
```typescript
private buildSpawnSchedule(): void {
  this.spawnSchedule = [];

  this.currentWave.spawnPattern.zomboids.forEach((pattern) => {
    const spawnInterval = 1 / pattern.spawnRate;

    for (let i = 0; i < pattern.count; i++) {
      const spawnTime = pattern.spawnDelay + i * spawnInterval;
      const columnName = pattern.columns[Math.floor(Math.random() * pattern.columns.length)];
      const columnIndex = columnName === 'left' ? 0 : 1;

      this.spawnSchedule.push({
        time: spawnTime,
        zomboidType: pattern.type,
        columnIndex: columnIndex,
      });
    }
  });

  this.spawnSchedule.sort((a, b) => a.time - b.time);
}
```

### Zomboid Spawning
```typescript
private spawnZomboid(zomboidTypeId: string, columnIndex: number): void {
  const zomboidConfig = this.configLoader.getZomboidType(zomboidTypeId);
  const zomboid = this.zomboidPool.acquire();
  
  const x = this.columnPositions[columnIndex];
  const y = -50; // Spawn above screen

  zomboid.spawn(x, y, zomboidConfig, columnIndex);
  this.activeZomboids.push(zomboid);
}
```

### Wave Progression
```typescript
private completeWave(): void {
  this.isWaveActive = false;

  if (this.currentWaveIndex + 1 < this.waves.length) {
    this.scene.time.delayedCall(2000, () => {
      this.startWave(this.currentWaveIndex + 1);
    });
  } else {
    console.log('All waves completed! Chapter complete!');
  }
}
```

## Wave Configuration Example
From `chapter-01.json`:
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
        "columns": ["left", "right"],
        "spawnDelay": 1
      }
    ]
  }
}
```

## Testing Results
✅ TypeScript compilation successful
✅ ESLint checks passed
✅ WaveManager system created
✅ Wave data parsing from chapter config
✅ Spawn schedule building from wave patterns
✅ Time-based zomboid spawning
✅ ObjectPool<Zomboid> integration (50 object pool)
✅ Left/right column spawning
✅ Random column selection from pattern
✅ Wave duration tracking
✅ Wave time remaining calculation
✅ Multiple zomboid types per wave
✅ Auto-progression to next wave (2s delay)
✅ Active zomboid tracking and cleanup
✅ Off-screen zomboid removal
✅ Pool statistics available

## Key Features Implemented
1. **Spawn Schedule Builder**: Converts wave config into timed spawn events
2. **Column Management**: 2-column layout with random selection
3. **Object Pooling**: 50 pre-allocated zomboids
4. **Wave Progression**: Automatic transition between waves
5. **Time Tracking**: Elapsed time and time remaining
6. **Multi-Type Spawning**: Multiple zomboid types in single wave
7. **ConfigLoader Integration**: Dynamic zomboid type loading

## Next Story
Story 2.3.4: Integrate Wave System in GameScene
