# Story 2.3.4: Integrate Wave System in GameScene

**Epic:** 2.3 Zomboid Spawning and Movement
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 3 hours
**Status:** ✅ COMPLETED

## Description
Instantiate WaveManager with selected chapter in GameScene, start first wave on scene init, update zomboid positions every frame, and display wave info in HUD (wave number, time remaining).

## Tasks
- [x] Instantiate WaveManager in GameScene.create()
- [x] Start first wave automatically
- [x] Update zomboid positions every frame
- [x] Display wave number in HUD
- [x] Display time remaining in HUD
- [x] Handle wave completion
- [x] Transition to next wave

## Acceptance Criteria
- [x] First wave starts automatically
- [x] Zomboids descend at correct speed
- [x] Wave timer counts down
- [x] Zomboid variety matches config
- [x] Wave number displays correctly
- [x] 60 FPS maintained

## Files Created/Modified
- `src/scenes/GameScene.ts` ✅ Modified to add wave system

## Dependencies
- Story 2.3.3: Implement WaveManager System ✅
- Story 1.3.3: Create Placeholder GameScene ✅

## Implementation Details

### GameScene Integration
```typescript
// In GameScene.create()
if (this.currentChapter && this.currentChapter.waves.length > 0) {
  this.waveManager = new WaveManager(this, this.currentChapter.waves);

  this.waveInfoText = this.add.text(20, 180, '', {
    fontSize: '18px',
    color: '#E0E0E0',
  });

  this.waveManager.startWave(0);
  this.updateWaveDisplay();
}

// In GameScene.update()
if (this.waveManager) {
  this.waveManager.update(time, delta);
  this.updateWaveDisplay();
}

// Wave display update
private updateWaveDisplay(): void {
  if (this.waveInfoText && this.waveManager) {
    const waveNum = this.waveManager.getCurrentWaveNumber();
    const totalWaves = this.waveManager.getTotalWaveCount();
    const timeRemaining = Math.ceil(this.waveManager.getWaveTimeRemaining());
    this.waveInfoText.setText('Wave ' + waveNum + '/' + totalWaves + ' - Time: ' + timeRemaining + 's');
  }
}
```

### HUD Display
Current HUD layout (left side at x=20):
```
Heroes: 1          (y=120)
Weapon: Single Gun (Tier 1)  (y=150)
Wave 1/3 - Time: 25s  (y=180)
```

### Wave System Flow
1. GameScene.create() → Instantiate WaveManager with chapter waves
2. WaveManager.startWave(0) → Start first wave
3. GameScene.update() → Call waveManager.update() every frame
4. WaveManager spawns zomboids according to schedule
5. Zomboids move downward at config speed
6. Wave completes after duration
7. Auto-transition to next wave (2s delay)
8. Repeat until all waves complete

## Testing Results
✅ TypeScript compilation successful
✅ ESLint checks passed
✅ WaveManager instantiated in GameScene
✅ First wave starts automatically
✅ Zomboids spawn according to schedule
✅ Zomboids move downward at correct speeds
✅ Wave info displays in HUD
✅ Wave number shows correctly (1/3, 2/3, etc.)
✅ Time remaining counts down properly
✅ Wave transitions work after 2s delay
✅ Cleanup on scene shutdown
✅ All systems integrated (Hero, Weapon, Wave)

## Key Features Implemented
1. **Auto-Start First Wave**: Wave 1 begins immediately
2. **HUD Integration**: Real-time wave info display
3. **Frame Updates**: Zomboid positions updated every frame
4. **Wave Progression**: Automatic transitions between waves
5. **Cleanup**: Proper resource management on shutdown

## Performance
- Smooth 60 FPS with wave system active
- Object pooling prevents GC pressure
- Efficient zomboid spawning and cleanup

## HUD Example
```
First Contact
3 Waves

Heroes: 1
Weapon: Single Gun (Tier 1)
Wave 1/3 - Time: 28s

[⏸ MENU]
```

## Next Story
Story 2.4.1: Implement CollisionManager (Epic 2.4)
