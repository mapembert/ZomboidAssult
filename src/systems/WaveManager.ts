import Phaser from 'phaser';
import { Zomboid } from '@/entities/Zomboid';
import { Timer } from '@/entities/Timer';
import { ObjectPool } from '@/utils/ObjectPool';
import { ConfigLoader } from '@/systems/ConfigLoader';
import type { WaveData, ZomboidSpawnPattern, TimerSpawnPattern } from '@/types/ConfigTypes';

/**
 * Spawn Schedule Entry for Zomboids
 * Represents when and where to spawn a zomboid
 */
interface ZomboidSpawnScheduleEntry {
  time: number;
  zomboidType: string;
  columnIndex: number;
}

/**
 * Spawn Schedule Entry for Timers
 * Represents when and where to spawn a timer
 */
interface TimerSpawnScheduleEntry {
  time: number;
  timerType: string;
  columnIndex: number;
}

/**
 * WaveManager System
 * Manages wave progression, zomboid spawning, and wave duration tracking
 */
export class WaveManager {
  private scene: Phaser.Scene;
  private waves: WaveData[];
  private currentWaveIndex: number = 0;
  private currentWave: WaveData | null = null;
  private zomboidPool: ObjectPool<Zomboid>;
  private timerPool: ObjectPool<Timer>;
  private activeZomboids: Zomboid[] = [];
  private activeTimers: Timer[] = [];
  private configLoader: ConfigLoader;

  // Wave timing
  private waveElapsedTime: number = 0;
  private isWaveActive: boolean = false;

  // Spawn schedules
  private zomboidSpawnSchedule: ZomboidSpawnScheduleEntry[] = [];
  private timerSpawnSchedule: TimerSpawnScheduleEntry[] = [];
  private nextZomboidSpawnIndex: number = 0;
  private nextTimerSpawnIndex: number = 0;

  // Column positions
  private columnPositions: number[] = [];

  constructor(scene: Phaser.Scene, waves: WaveData[]) {
    this.scene = scene;
    this.waves = waves;
    this.configLoader = ConfigLoader.getInstance();

    // Calculate column positions (same as HeroManager)
    // Left column: SCREEN_WIDTH / 4
    // Right column: (3 * SCREEN_WIDTH) / 4
    const screenWidth = this.scene.scale.width;
    this.columnPositions = [screenWidth / 4, (3 * screenWidth) / 4];

    // Create zomboid pool (50 zomboids initially)
    this.zomboidPool = new ObjectPool<Zomboid>(
      () => new Zomboid(this.scene),
      (zomboid: Zomboid) => {
        zomboid.setActive(false);
        zomboid.setVisible(false);
      },
      50
    );

    // Create timer pool (10 timers initially)
    this.timerPool = new ObjectPool<Timer>(
      () => {
        // Create a placeholder timer with hero_add_timer config
        const timerConfig = this.configLoader.getTimerType('hero_add_timer');
        if (!timerConfig) {
          throw new Error('Failed to load hero_add_timer config for timer pool');
        }
        const timer = new Timer(this.scene, 0, 0, timerConfig, 0);
        // Immediately hide the timer after creation
        timer.setActive(false);
        timer.setVisible(false);
        return timer;
      },
      (timer: Timer) => {
        timer.setActive(false);
        timer.setVisible(false);
      },
      10
    );
  }

  /**
   * Start a specific wave
   */
  startWave(waveIndex: number): boolean {
    if (waveIndex < 0 || waveIndex >= this.waves.length) {
      console.error('Invalid wave index: ' + waveIndex);
      return false;
    }

    this.currentWaveIndex = waveIndex;
    this.currentWave = this.waves[waveIndex];
    this.waveElapsedTime = 0;
    this.isWaveActive = true;

    // Build spawn schedules for this wave
    this.buildZomboidSpawnSchedule();
    this.buildTimerSpawnSchedule();
    this.nextZomboidSpawnIndex = 0;
    this.nextTimerSpawnIndex = 0;

    console.log('Wave ' + (waveIndex + 1) + ' started: ' + this.currentWave.waveName);
    return true;
  }

  /**
   * Build zomboid spawn schedule from wave config
   */
  private buildZomboidSpawnSchedule(): void {
    if (!this.currentWave) return;

    this.zomboidSpawnSchedule = [];

    // Process each zomboid spawn pattern
    this.currentWave.spawnPattern.zomboids.forEach((pattern: ZomboidSpawnPattern) => {
      const spawnInterval = 1 / pattern.spawnRate; // Convert rate to interval

      // Schedule spawns for this pattern
      for (let i = 0; i < pattern.count; i++) {
        const spawnTime = pattern.spawnDelay + i * spawnInterval;

        // Randomly select column from available columns
        const columnName = pattern.columns[Math.floor(Math.random() * pattern.columns.length)];
        const columnIndex = columnName === 'left' ? 0 : 1;

        this.zomboidSpawnSchedule.push({
          time: spawnTime,
          zomboidType: pattern.type,
          columnIndex: columnIndex,
        });
      }
    });

    // Sort schedule by time
    this.zomboidSpawnSchedule.sort((a, b) => a.time - b.time);

    console.log('Zomboid spawn schedule built: ' + this.zomboidSpawnSchedule.length + ' zomboids');
  }

  /**
   * Build timer spawn schedule from wave config
   */
  private buildTimerSpawnSchedule(): void {
    if (!this.currentWave) return;

    this.timerSpawnSchedule = [];

    // Process each timer spawn pattern
    this.currentWave.spawnPattern.timers.forEach((pattern: TimerSpawnPattern) => {
      const columnIndex = pattern.column === 'left' ? 0 : 1;

      this.timerSpawnSchedule.push({
        time: pattern.spawnTime,
        timerType: pattern.type,
        columnIndex: columnIndex,
      });
    });

    // Sort schedule by time
    this.timerSpawnSchedule.sort((a, b) => a.time - b.time);

    console.log('Timer spawn schedule built: ' + this.timerSpawnSchedule.length + ' timers');
  }

  /**
   * Update wave and spawn zomboids and timers
   */
  update(_time: number, delta: number): void {
    if (!this.isWaveActive || !this.currentWave) return;

    // Update wave elapsed time
    this.waveElapsedTime += delta / 1000;

    // Process spawn schedules
    this.processZomboidSpawnSchedule();
    this.processTimerSpawnSchedule();

    // Update all active zomboids
    for (let i = this.activeZomboids.length - 1; i >= 0; i--) {
      const zomboid = this.activeZomboids[i];
      zomboid.update(delta);

      // Check if zomboid is off-screen or destroyed
      if (!zomboid.active || zomboid.isOffScreen()) {
        // Return to pool
        this.zomboidPool.release(zomboid);
        this.activeZomboids.splice(i, 1);
      }
    }

    // Update all active timers
    for (let i = this.activeTimers.length - 1; i >= 0; i--) {
      const timer = this.activeTimers[i];
      timer.update(delta);

      // Check if timer exited screen
      if (timer.y > this.scene.scale.height) {
        const finalValue = timer.onExitScreen();

        // Emit event with timer data
        this.scene.events.emit('timer_exited', {
          timerType: timer.getTimerType(),
          finalValue: finalValue,
          column: timer.getColumnIndex(),
        });

        // Remove and return to pool
        this.activeTimers.splice(i, 1);
        this.timerPool.release(timer);
      }
    }

    // Check if wave is complete
    if (this.waveElapsedTime >= this.currentWave.duration) {
      this.completeWave();
    }
  }

  /**
   * Process zomboid spawn schedule and spawn zomboids at scheduled times
   */
  private processZomboidSpawnSchedule(): void {
    while (this.nextZomboidSpawnIndex < this.zomboidSpawnSchedule.length) {
      const entry = this.zomboidSpawnSchedule[this.nextZomboidSpawnIndex];

      // Check if it's time to spawn this zomboid
      if (this.waveElapsedTime >= entry.time) {
        this.spawnZomboid(entry.zomboidType, entry.columnIndex);
        this.nextZomboidSpawnIndex++;
      } else {
        break; // Not time yet
      }
    }
  }

  /**
   * Process timer spawn schedule and spawn timers at scheduled times
   */
  private processTimerSpawnSchedule(): void {
    while (this.nextTimerSpawnIndex < this.timerSpawnSchedule.length) {
      const entry = this.timerSpawnSchedule[this.nextTimerSpawnIndex];

      // Check if it's time to spawn this timer
      if (this.waveElapsedTime >= entry.time) {
        this.spawnTimer(entry.timerType, entry.columnIndex);
        this.nextTimerSpawnIndex++;
      } else {
        break; // Not time yet
      }
    }
  }

  /**
   * Spawn a zomboid at the specified column
   */
  private spawnZomboid(zomboidTypeId: string, columnIndex: number): void {
    // Get zomboid config
    const zomboidConfig = this.configLoader.getZomboidType(zomboidTypeId);
    if (!zomboidConfig) {
      console.error('Unknown zomboid type: ' + zomboidTypeId);
      return;
    }

    // Acquire zomboid from pool
    const zomboid = this.zomboidPool.acquire();

    // Calculate spawn position
    const x = this.columnPositions[columnIndex];
    const y = -50; // Spawn above screen

    // Spawn zomboid
    zomboid.spawn(x, y, zomboidConfig, columnIndex);
    this.activeZomboids.push(zomboid);
  }

  /**
   * Spawn a timer at the specified column
   */
  private spawnTimer(timerTypeId: string, columnIndex: number): void {
    // Get timer config
    const timerConfig = this.configLoader.getTimerType(timerTypeId);
    if (!timerConfig) {
      console.error('Unknown timer type: ' + timerTypeId);
      return;
    }

    // Acquire timer from pool
    const timer = this.timerPool.acquire();

    // Calculate spawn position (above screen)
    const x = this.columnPositions[columnIndex];
    const y = -timerConfig.height; // Spawn just above screen

    // Reset timer with new config
    timer.resetForPool(x, y, timerConfig, columnIndex);
    this.activeTimers.push(timer);

    console.log(`Timer spawned: ${timerTypeId} in column ${columnIndex}`);
  }

  /**
   * Complete current wave
   */
  private completeWave(): void {
    console.log('Wave ' + (this.currentWaveIndex + 1) + ' completed!');
    this.isWaveActive = false;

    // Check if there's a next wave
    if (this.currentWaveIndex + 1 < this.waves.length) {
      // Auto-start next wave after a delay
      this.scene.time.delayedCall(2000, () => {
        this.startWave(this.currentWaveIndex + 1);
      });
    } else {
      console.log('All waves completed! Chapter complete!');
      // TODO: Trigger chapter completion
    }
  }

  /**
   * Get current wave info
   */
  getCurrentWave(): WaveData | null {
    return this.currentWave;
  }

  /**
   * Get current wave number (1-indexed)
   */
  getCurrentWaveNumber(): number {
    return this.currentWaveIndex + 1;
  }

  /**
   * Get total wave count
   */
  getTotalWaveCount(): number {
    return this.waves.length;
  }

  /**
   * Get wave elapsed time
   */
  getWaveElapsedTime(): number {
    return this.waveElapsedTime;
  }

  /**
   * Get wave time remaining
   */
  getWaveTimeRemaining(): number {
    if (!this.currentWave) return 0;
    return Math.max(0, this.currentWave.duration - this.waveElapsedTime);
  }

  /**
   * Check if wave is active
   */
  isActive(): boolean {
    return this.isWaveActive;
  }

  /**
   * Get all active zomboids
   */
  getActiveZomboids(): Zomboid[] {
    return this.activeZomboids;
  }

  /**
   * Get all active timers
   */
  getActiveTimers(): Timer[] {
    return this.activeTimers;
  }

  /**
   * Get pool statistics
   */
  getPoolStats(): { active: number; available: number; total: number } {
    return this.zomboidPool.getStats();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    // Clear all active zomboids
    this.activeZomboids.forEach((zomboid) => {
      zomboid.destroy();
    });
    this.activeZomboids = [];

    // Clear all active timers
    this.activeTimers.forEach((timer) => {
      timer.destroy();
    });
    this.activeTimers = [];

    // Clear pools
    this.zomboidPool.clear();
    this.timerPool.clear();

    this.isWaveActive = false;
  }
}
