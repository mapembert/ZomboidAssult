import Phaser from 'phaser';
import { Projectile } from '@/entities/Projectile';
import { Zomboid } from '@/entities/Zomboid';
import { Timer } from '@/entities/Timer';
import { AudioManager } from '@/systems/AudioManager';

/**
 * CollisionManager System
 * Handles collision detection between projectiles and zomboids
 */
export class CollisionManager {
  private scene: Phaser.Scene;
  private collisionCount: number = 0;
  private audioManager: AudioManager;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize(scene);
  }

  /**
   * Check AABB (Axis-Aligned Bounding Box) collision between two rectangles
   */
  private checkAABB(rect1: Phaser.Geom.Rectangle, rect2: Phaser.Geom.Rectangle): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Check collisions between projectiles and zomboids
   */
  checkProjectileZomboidCollisions(
    projectiles: Projectile[],
    zomboids: Zomboid[]
  ): { projectile: Projectile; zomboid: Zomboid }[] {
    const collisions: { projectile: Projectile; zomboid: Zomboid }[] = [];

    // Check each projectile against each zomboid
    for (const projectile of projectiles) {
      if (!projectile.active) continue;

      const projectileBounds = projectile.getBounds();

      for (const zomboid of zomboids) {
        if (!zomboid.active) continue;

        const zomboidBounds = zomboid.getBounds();

        // Check AABB collision
        if (this.checkAABB(projectileBounds, zomboidBounds)) {
          collisions.push({ projectile, zomboid });
        }
      }
    }

    return collisions;
  }

  /**
   * Handle collision outcomes
   */
  handleCollisions(collisions: { projectile: Projectile; zomboid: Zomboid }[]): void {
    for (const collision of collisions) {
      const { projectile, zomboid } = collision;

      // Skip if either entity is already inactive
      if (!projectile.active || !zomboid.active) continue;

      // Apply damage to zomboid
      const damage = projectile.getDamage();
      const destroyed = zomboid.takeDamage(damage);

      // Play hit sound
      this.audioManager.playSFX('zomboid_hit', { volume: 0.3 });

      // Play destruction sound if zomboid destroyed
      if (destroyed) {
        this.audioManager.playSFX('zomboid_destroyed', { volume: 0.5 });
      }

      // Destroy projectile
      projectile.setActive(false);
      projectile.setVisible(false);

      // Increment collision count
      this.collisionCount++;

      // Emit collision event
      this.scene.events.emit('collision', {
        projectile,
        zomboid,
        destroyed,
        score: destroyed ? zomboid.getScoreValue() : 0,
      });
    }
  }

  /**
   * Check collisions between projectiles and timers
   */
  checkProjectileTimerCollisions(
    projectiles: Projectile[],
    timers: Timer[]
  ): { projectile: Projectile; timer: Timer }[] {
    const collisions: { projectile: Projectile; timer: Timer }[] = [];

    // Check each projectile against each timer
    for (const projectile of projectiles) {
      if (!projectile.active) continue;

      const projectileBounds = projectile.getBounds();

      for (const timer of timers) {
        if (!timer.active) continue;

        const timerBounds = timer.getBounds();

        // Check AABB collision
        if (this.checkAABB(projectileBounds, timerBounds)) {
          collisions.push({ projectile, timer });
        }
      }
    }

    return collisions;
  }

  /**
   * Handle timer collision outcomes
   */
  handleTimerCollisions(collisions: { projectile: Projectile; timer: Timer }[]): void {
    for (const collision of collisions) {
      const { projectile, timer } = collision;

      // Skip if either entity is already inactive
      if (!projectile.active || !timer.active) continue;

      // Increment timer counter
      const incrementValue = timer.getIncrementValue();
      timer.incrementCounter(incrementValue);

      // Play timer increment sound
      this.audioManager.playSFX('timer_increment', { volume: 0.4 });

      // Destroy projectile
      projectile.setActive(false);
      projectile.setVisible(false);

      // Emit collision event
      this.scene.events.emit('timer_hit', {
        timer: timer,
        newValue: timer.getCounterValue(),
        incrementValue: incrementValue,
      });
    }
  }

  /**
   * Process all collisions (check + handle)
   */
  processCollisions(projectiles: Projectile[], zomboids: Zomboid[]): void {
    const collisions = this.checkProjectileZomboidCollisions(projectiles, zomboids);
    this.handleCollisions(collisions);
  }

  /**
   * Process timer collisions (check + handle)
   */
  processTimerCollisions(projectiles: Projectile[], timers: Timer[]): void {
    const collisions = this.checkProjectileTimerCollisions(projectiles, timers);
    this.handleTimerCollisions(collisions);
  }

  /**
   * Get collision count (for debugging)
   */
  getCollisionCount(): number {
    return this.collisionCount;
  }

  /**
   * Reset collision count
   */
  resetCollisionCount(): void {
    this.collisionCount = 0;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.collisionCount = 0;
  }
}
