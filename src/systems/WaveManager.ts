import Phaser from 'phaser';
import { Zomboid } from '@/entities/Zomboid';
import { ObjectPool } from '@/utils/ObjectPool';
import { ConfigLoader } from '@/systems/ConfigLoader';
import type { WaveData, ZomboidSpawnPattern } from '@/types/ConfigTypes';

/**
 * Spawn Schedule Entry
 * Represents when and where to spawn a zomboid
 */
interface SpawnScheduleEntry {
  time: number;
  zomboidType: string;
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
  private activeZomboids: Zomboid[] = [];
  private configLoader: ConfigLoader;

  // Wave timing
  private waveElapsedTime: number = 0;
  private isWaveActive: boolean = false;

  // Spawn schedule
  private spawnSchedule: SpawnScheduleEntry[] = [];
  private nextSpawnIndex: number = 0;

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

    // Build spawn schedule for this wave
    this.buildSpawnSchedule();
    this.nextSpawnIndex = 0;

    console.log('Wave ' + (waveIndex + 1) + ' started: ' + this.currentWave.waveName);
    return true;
  }

  /**
   * Build spawn schedule from wave config
   */
  private buildSpawnSchedule(): void {
    if (!this.currentWave) return;

    this.spawnSchedule = [];

    // Process each zomboid spawn pattern
    this.currentWave.spawnPattern.zomboids.forEach((pattern: ZomboidSpawnPattern) => {
      const spawnInterval = 1 / pattern.spawnRate; // Convert rate to interval

      // Schedule spawns for this pattern
      for (let i = 0; i < pattern.count; i++) {
        const spawnTime = pattern.spawnDelay + i * spawnInterval;

        // Randomly select column from available columns
        const columnName = pattern.columns[Math.floor(Math.random() * pattern.columns.length)];
        const columnIndex = columnName === 'left' ? 0 : 1;

        this.spawnSchedule.push({
          time: spawnTime,
          zomboidType: pattern.type,
          columnIndex: columnIndex,
        });
      }
    });

    // Sort schedule by time
    this.spawnSchedule.sort((a, b) => a.time - b.time);

    console.log('Spawn schedule built: ' + this.spawnSchedule.length + ' zomboids');
  }

  /**
   * Update wave and spawn zomboids
   */
  update(_time: number, delta: number): void {
    if (!this.isWaveActive || !this.currentWave) return;

    // Update wave elapsed time
    this.waveElapsedTime += delta / 1000;

    // Process spawn schedule
    this.processSpawnSchedule();

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

    // Check if wave is complete
    if (this.waveElapsedTime >= this.currentWave.duration) {
      this.completeWave();
    }
  }

  /**
   * Process spawn schedule and spawn zomboids at scheduled times
   */
  private processSpawnSchedule(): void {
    while (this.nextSpawnIndex < this.spawnSchedule.length) {
      const entry = this.spawnSchedule[this.nextSpawnIndex];

      // Check if it's time to spawn this zomboid
      if (this.waveElapsedTime >= entry.time) {
        this.spawnZomboid(entry.zomboidType, entry.columnIndex);
        this.nextSpawnIndex++;
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

    // Clear pool
    this.zomboidPool.clear();

    this.isWaveActive = false;
  }
}
