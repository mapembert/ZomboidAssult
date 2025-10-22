# Story 4.1.1: Implement Wave Completion Logic

**Epic:** 4.1 Wave Completion and Progression
**Phase:** 4 - Wave Progression and Content (Days 8-9)
**Estimated Time:** 3 hours
**Status:** 📋 READY TO START

## Description
Implement the core logic for detecting when a wave is complete, displaying appropriate feedback to the player, and transitioning to the next wave or chapter completion state. This includes time-based completion, optional zomboid clear requirements, and visual transition effects.

## User Story
**As a player**, I want to know when I've successfully completed a wave so that I can feel a sense of progression and prepare for the next challenge.

## Tasks
- [ ] Add wave completion detection in WaveManager
  - [ ] Check if wave duration has elapsed
  - [ ] Optional: Check if all zomboids destroyed
  - [ ] Trigger wave completion event
- [ ] Create wave completion UI overlay
  - [ ] Display "Wave Complete!" message
  - [ ] Show wave statistics (zomboids killed, accuracy, time)
  - [ ] Add smooth fade in/out animations
- [ ] Implement transition logic
  - [ ] Check if more waves exist in chapter
  - [ ] Transition to next wave (3 second delay)
  - [ ] Transition to chapter complete screen if final wave
- [ ] Preserve game state between waves
  - [ ] Maintain score
  - [ ] Maintain hero count
  - [ ] Maintain weapon tier
- [ ] Add sound effects for wave completion
- [ ] Test with all existing chapter configurations

## Acceptance Criteria
- [ ] Wave completes when duration timer reaches 0
- [ ] Clear visual feedback displayed ("Wave Complete!")
- [ ] Wave statistics shown accurately
- [ ] Score persists between waves within same chapter
- [ ] Hero count and weapon tier persist between waves
- [ ] Smooth 3-second transition between waves
- [ ] Next wave starts automatically after transition
- [ ] Chapter complete triggered on final wave
- [ ] No zomboids/timers spawn during transition
- [ ] Sound effect plays on wave completion

## Files to Create/Modify
- `src/systems/WaveManager.ts` - Add isWaveComplete() method
- `src/scenes/GameScene.ts` - Add wave completion handling
- `src/ui/WaveCompleteOverlay.ts` - NEW: Wave completion UI component
- `src/types/GameTypes.ts` - Add WaveStats interface

## Dependencies
- Story 2.3.3: Implement WaveManager System (completed)
- Story 2.3.4: Integrate Wave System in GameScene (completed)
- config/chapters/*.json files

## Implementation Details

### WaveManager.ts Additions
```typescript
interface WaveStats {
  zomboidsSpawned: number;
  zomboidsKilled: number;
  timersSpawned: number;
  timersCompleted: number;
  duration: number;
  timeElapsed: number;
}

class WaveManager {
  // ... existing code ...

  private waveStartTime: number = 0;
  private waveStats: WaveStats = {
    zomboidsSpawned: 0,
    zomboidsKilled: 0,
    timersSpawned: 0,
    timersCompleted: 0,
    duration: 0,
    timeElapsed: 0,
  };

  /**
   * Check if current wave is complete
   * @returns true if wave duration elapsed and optionally all zomboids cleared
   */
  isWaveComplete(): boolean {
    if (!this.currentWave) return false;

    const elapsed = this.scene.time.now - this.waveStartTime;
    const durationComplete = elapsed >= this.currentWave.duration * 1000;

    // Optional: require all zomboids cleared
    // const allZomboidsCleared = this.activeZomboids.length === 0;
    // return durationComplete && allZomboidsCleared;

    return durationComplete;
  }

  /**
   * Get current wave statistics
   */
  getWaveStats(): WaveStats {
    this.waveStats.timeElapsed = this.scene.time.now - this.waveStartTime;
    return { ...this.waveStats };
  }

  /**
   * Increment zomboid kill counter
   */
  onZomboidDestroyed(): void {
    this.waveStats.zomboidsKilled++;
  }

  /**
   * Increment timer completion counter
   */
  onTimerCompleted(): void {
    this.waveStats.timersCompleted++;
  }

  /**
   * Check if there are more waves in chapter
   */
  hasNextWave(): boolean {
    return this.currentWaveIndex < this.chapter.waves.length - 1;
  }

  /**
   * Advance to next wave
   */
  startNextWave(): void {
    if (this.hasNextWave()) {
      this.currentWaveIndex++;
      this.startWave(this.currentWaveIndex);
    }
  }

  /**
   * Reset wave statistics for new wave
   */
  private resetWaveStats(): void {
    this.waveStats = {
      zomboidsSpawned: 0,
      zomboidsKilled: 0,
      timersSpawned: 0,
      timersCompleted: 0,
      duration: this.currentWave?.duration || 0,
      timeElapsed: 0,
    };
  }
}
```

### WaveCompleteOverlay.ts (NEW)
```typescript
import Phaser from 'phaser';
import type { WaveStats } from '@/types/GameTypes';

export class WaveCompleteOverlay extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private titleText: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private nextWaveText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, waveNumber: number, stats: WaveStats) {
    super(scene, 0, 0);

    const { width, height } = scene.scale;

    // Semi-transparent dark overlay
    this.background = scene.add.graphics();
    this.background.fillStyle(0x000000, 0.8);
    this.background.fillRect(0, 0, width, height);
    this.add(this.background);

    // "Wave Complete!" title
    this.titleText = scene.add.text(width / 2, height / 3, 'Wave Complete!', {
      fontSize: '48px',
      color: '#03DAC6',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(this.titleText);

    // Wave statistics
    const accuracy = stats.zomboidsSpawned > 0
      ? Math.round((stats.zomboidsKilled / stats.zomboidsSpawned) * 100)
      : 0;

    const statsStr = [
      `Wave ${waveNumber}`,
      ``,
      `Zomboids Destroyed: ${stats.zomboidsKilled} / ${stats.zomboidsSpawned}`,
      `Accuracy: ${accuracy}%`,
      `Time: ${Math.floor(stats.timeElapsed / 1000)}s`,
    ].join('\n');

    this.statsText = scene.add.text(width / 2, height / 2, statsStr, {
      fontSize: '24px',
      color: '#E0E0E0',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);
    this.add(this.statsText);

    // Next wave message
    this.nextWaveText = scene.add.text(
      width / 2,
      height * 0.7,
      'Next wave starting...',
      {
        fontSize: '20px',
        color: '#B0B0B0',
      }
    ).setOrigin(0.5);
    this.add(this.nextWaveText);

    // Fade in animation
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
    });

    scene.add.existing(this);
  }

  /**
   * Fade out and destroy overlay
   */
  fadeOut(callback?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
        if (callback) callback();
      },
    });
  }
}
```

### GameScene.ts Modifications
```typescript
// Add to GameScene class
private waveCompleteOverlay: WaveCompleteOverlay | null = null;
private isTransitioningWaves: boolean = false;

update(time: number, delta: number): void {
  if (!this.gameActive || this.isTransitioningWaves) return;

  // ... existing update logic ...

  // Check wave completion
  if (this.waveManager && this.waveManager.isWaveComplete()) {
    this.onWaveComplete();
  }
}

private onWaveComplete(): void {
  if (!this.waveManager) return;

  this.isTransitioningWaves = true;
  this.gameActive = false;

  // Play wave complete sound
  this.sound.play('wave_complete', { volume: 0.5 });

  // Get wave statistics
  const stats = this.waveManager.getWaveStats();
  const currentWave = this.waveManager.getCurrentWaveNumber();

  // Display wave complete overlay
  this.waveCompleteOverlay = new WaveCompleteOverlay(this, currentWave, stats);

  // Wait 3 seconds, then transition
  this.time.delayedCall(3000, () => {
    if (this.waveCompleteOverlay) {
      this.waveCompleteOverlay.fadeOut(() => {
        this.transitionToNextWave();
      });
    } else {
      this.transitionToNextWave();
    }
  });
}

private transitionToNextWave(): void {
  if (!this.waveManager) return;

  if (this.waveManager.hasNextWave()) {
    // Start next wave
    this.waveManager.startNextWave();
    this.updateWaveInfoDisplay();

    // Resume game
    this.isTransitioningWaves = false;
    this.gameActive = true;
  } else {
    // Chapter complete - transition to chapter complete screen
    this.onChapterComplete();
  }
}

private onChapterComplete(): void {
  // TODO: Implement in Story 4.1.2
  console.log('Chapter Complete!');
  this.scene.start('GameOverScene', {
    victory: true,
    score: this.score,
    chapter: this.currentChapter,
  });
}
```

## Testing Checklist
- [ ] Test wave completion with Chapter 1 Wave 1 (30s duration)
- [ ] Verify "Wave Complete!" overlay displays correctly
- [ ] Verify wave statistics are accurate
- [ ] Test transition delay (3 seconds)
- [ ] Verify next wave starts automatically
- [ ] Test final wave triggers chapter complete (not next wave)
- [ ] Verify score persists between waves
- [ ] Verify hero count persists between waves
- [ ] Verify weapon tier persists between waves
- [ ] Test that no zomboids spawn during transition
- [ ] Verify sound effect plays on completion

## Edge Cases to Handle
- [ ] Player pauses during wave complete transition
- [ ] Last zomboid destroyed exactly at wave end time
- [ ] Wave complete while timer is active (timer should exit)
- [ ] Wave complete with 0 heroes (should not happen, but handle gracefully)

## Performance Considerations
- Transition overlay uses single graphics object (minimal draw calls)
- Tween animations use GPU acceleration
- Cleanup overlay on destroy to prevent memory leaks

## Success Metrics
- ✅ Wave completion detected reliably
- ✅ Visual feedback clear and polished
- ✅ Smooth transition between waves
- ✅ No game state bugs (score/heroes persist)
- ✅ 60 FPS maintained during transitions

## Next Steps
After completion:
- Story 4.1.2: Implement Chapter Progression System
- Story 4.1.3: Test All Chapter Configurations

## Notes
- Consider adding optional requirement to clear all zomboids for wave completion (configurable per chapter)
- May want to add "bonus points" for fast completion or high accuracy in future
- Wave transition timing (3s) can be adjusted based on playtesting feedback
