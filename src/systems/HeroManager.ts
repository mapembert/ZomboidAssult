import Phaser from 'phaser';
import { Hero } from '@/entities/Hero';
import type { HeroConfig, GameSettings } from '@/types/ConfigTypes';

export class HeroManager {
  private scene: Phaser.Scene;
  private heroes: Hero[];
  private config: HeroConfig;
  private gameSettings: GameSettings;
  
  // Continuous movement properties
  private targetX: number; // Target X position for hero squad
  private currentX: number; // Current actual X position
  private velocityX: number; // Current movement velocity (pixels per second)
  private minX: number; // Minimum allowed X position (left boundary)
  private maxX: number; // Maximum allowed X position (right boundary)

  constructor(scene: Phaser.Scene, config: HeroConfig, gameSettings: GameSettings) {
    this.scene = scene;
    this.config = config;
    this.gameSettings = gameSettings;
    this.heroes = [];
    
    // Initialize continuous movement system
    const screenWidth = gameSettings.gameSettings.screenWidth;
    const padding = gameSettings.gameplay.movementBoundaryPadding || 60;
    
    // Calculate movement boundaries
    this.minX = padding;
    this.maxX = screenWidth - padding;
    
    // Initialize position (center of screen or configured start position)
    const startX = gameSettings.gameplay.playerStartX || screenWidth / 2;
    this.currentX = startX;
    this.targetX = startX;
    this.velocityX = 0;

    // Create initial heroes
    const initialCount = config.heroConfig.defaultHeroCount;
    for (let i = 0; i < initialCount; i++) {
      this.createHero();
    }

    // Position heroes initially
    this.repositionHeroes();
  }

  /**
   * Create a new hero and add to the heroes array
   */
  private createHero(): Hero {
    const hero = new Hero(this.scene, 0, 0, this.config);
    this.heroes.push(hero);
    return hero;
  }

  /**
   * Set target X position for hero squad (with boundary clamping)
   */
  setTargetX(x: number): void {
    this.targetX = Phaser.Math.Clamp(x, this.minX, this.maxX);
  }

  /**
   * Get target X position of hero squad
   */
  getTargetX(): number {
    return this.targetX;
  }

  /**
   * Get current X position of hero squad
   */
  getCurrentX(): number {
    return this.currentX;
  }

  /**
   * Add heroes to the squad
   */
  addHero(count: number): void {
    const maxCount = this.config.heroConfig.maxHeroCount;
    const targetCount = Math.min(this.heroes.length + count, maxCount);
    const heroesAdded = targetCount - this.heroes.length;

    while (this.heroes.length < targetCount) {
      this.createHero();
    }

    this.repositionHeroes();

    // Emit hero count changed event
    this.scene.events.emit('hero_count_changed', {
      count: this.heroes.length,
      change: heroesAdded
    });

    // Emit hero added event (for audio)
    if (heroesAdded > 0) {
      this.scene.events.emit('hero_added', { count: heroesAdded });
    }

    console.log(`Heroes added: ${heroesAdded}. Total count: ${this.heroes.length}`);
  }

  /**
   * Remove heroes from the squad
   */
  removeHero(count: number): void {
    const minCount = this.config.heroConfig.minHeroCount;
    const targetCount = Math.max(this.heroes.length - count, minCount);
    const heroesRemoved = this.heroes.length - targetCount;

    while (this.heroes.length > targetCount) {
      const hero = this.heroes.pop();
      if (hero) {
        hero.destroy();
      }
    }

    this.repositionHeroes();

    // Emit hero count changed event
    this.scene.events.emit('hero_count_changed', {
      count: this.heroes.length,
      change: -heroesRemoved
    });

    // Emit hero removed event (for audio)
    if (heroesRemoved > 0) {
      this.scene.events.emit('hero_removed', { count: heroesRemoved });
    }

    console.log(`Heroes removed: ${heroesRemoved}. Total count: ${this.heroes.length}`);
  }

  /**
   * Reposition all heroes at current X position with vertical spacing
   */
  private repositionHeroes(): void {
    if (this.heroes.length === 0) return;

    const screenHeight = this.gameSettings.gameSettings.screenHeight;
    const spacing = this.config.heroConfig.spacing;
    const positionFromBottom = this.config.heroConfig.positionFromBottom;

    // Calculate vertical positions
    const totalHeight = (this.heroes.length - 1) * spacing;
    const startY = screenHeight - positionFromBottom - totalHeight / 2;

    // Position each hero at current X with vertical spacing
    this.heroes.forEach((hero, index) => {
      const y = startY + index * spacing;
      hero.setPosition(this.currentX, y);
      hero.setTargetX(this.currentX);
    });
  }

  /**
   * Set hero count to a specific value
   */
  setHeroCount(targetCount: number): void {
    const minCount = this.config.heroConfig.minHeroCount;
    const maxCount = this.config.heroConfig.maxHeroCount;
    const clampedCount = Math.max(minCount, Math.min(targetCount, maxCount));

    const currentCount = this.heroes.length;
    const diff = clampedCount - currentCount;

    if (diff > 0) {
      // Add heroes
      this.addHero(diff);
    } else if (diff < 0) {
      // Remove heroes
      this.removeHero(-diff);
    }
    // If diff === 0, no change needed
  }

  /**
   * Get current hero count
   */
  getHeroCount(): number {
    return this.heroes.length;
  }

  /**
   * Get positions of all heroes (for weapon firing)
   */
  getHeroPositions(): { x: number; y: number }[] {
    return this.heroes.map(hero => ({
      x: hero.x,
      y: hero.y
    }));
  }

  /**
   * Update hero positions with smooth velocity-based movement
   */
  update(delta: number): void {
    // Convert delta from milliseconds to seconds
    const deltaSeconds = delta / 1000;

    // Calculate distance to target
    const distance = this.targetX - this.currentX;
    const absDistance = Math.abs(distance);

    // Dead zone - stop if very close to target
    if (absDistance < 2) {
      this.velocityX = 0;
      this.currentX = this.targetX;
    } else {
      // Get movement parameters from config
      const maxSpeed = this.config.heroConfig.movementSpeed || 800;
      const acceleration = this.config.heroConfig.acceleration || 2400;
      const deceleration = this.config.heroConfig.deceleration || 3200;

      // Determine if we should accelerate or decelerate
      const direction = distance > 0 ? 1 : -1;
      const absVelocity = Math.abs(this.velocityX);

      // Calculate stopping distance at current velocity
      const stoppingDistance = (absVelocity * absVelocity) / (2 * deceleration);

      if (absDistance <= stoppingDistance) {
        // Start decelerating
        const decelerationAmount = deceleration * deltaSeconds;
        if (absVelocity > decelerationAmount) {
          this.velocityX -= direction * decelerationAmount;
        } else {
          this.velocityX = 0;
        }
      } else {
        // Accelerate towards target
        const accelerationAmount = acceleration * deltaSeconds * direction;
        this.velocityX += accelerationAmount;

        // Clamp to max speed
        this.velocityX = Phaser.Math.Clamp(this.velocityX, -maxSpeed, maxSpeed);
      }

      // Update position based on velocity
      this.currentX += this.velocityX * deltaSeconds;

      // Clamp to boundaries
      this.currentX = Phaser.Math.Clamp(this.currentX, this.minX, this.maxX);

      // If we hit a boundary, stop
      if (this.currentX === this.minX || this.currentX === this.maxX) {
        this.velocityX = 0;
      }

      // Reposition all heroes to current X
      this.repositionHeroes();
    }

    // Update individual heroes (for any per-hero animations/state)
    this.heroes.forEach(hero => hero.update(delta));
  }

  /**
   * Cleanup when manager is destroyed
   */
  destroy(): void {
    this.heroes.forEach(hero => hero.destroy());
    this.heroes = [];
  }
}
