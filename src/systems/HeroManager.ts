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

  // Snap positions (12 positions total across the bottom)
  private snapPositions: number[] = []; // Calculated snap positions
  private currentSnapIndex: number = 0; // Current snap position index (0-11)

  constructor(scene: Phaser.Scene, config: HeroConfig, gameSettings: GameSettings, startingHeroCount?: number) {
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

    // Calculate 12 snap positions evenly distributed across the screen
    this.calculateSnapPositions(screenWidth, padding);

    // Initialize position (center of screen or configured start position)
    const startX = gameSettings.gameplay.playerStartX || screenWidth / 2;
    // Find nearest snap position and set as initial position
    this.currentSnapIndex = this.findNearestSnapIndex(startX);
    this.currentX = this.snapPositions[this.currentSnapIndex];
    this.targetX = this.currentX;
    this.velocityX = 0;

    // Create initial heroes (use starting count from progressive mode or default)
    const initialCount = startingHeroCount ?? config.heroConfig.defaultHeroCount;
    console.log(`HeroManager: Starting with ${initialCount} heroes`);
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
   * Calculate 12 snap positions evenly distributed across the screen
   */
  private calculateSnapPositions(screenWidth: number, padding: number): void {
    const snapCount = 12;
    const playableWidth = screenWidth - (2 * padding);
    const spacing = playableWidth / (snapCount - 1);

    this.snapPositions = [];
    for (let i = 0; i < snapCount; i++) {
      this.snapPositions.push(padding + i * spacing);
    }
  }

  /**
   * Find the nearest snap position index to a given X coordinate
   */
  private findNearestSnapIndex(x: number): number {
    if (this.snapPositions.length === 0) return 0;

    let nearestIndex = 0;
    let minDistance = Math.abs(x - this.snapPositions[0]);

    for (let i = 0; i < this.snapPositions.length; i++) {
      const distance = Math.abs(x - this.snapPositions[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  }

  /**
   * Move to the next snap position (right)
   */
  moveToNextPosition(): void {
    if (this.currentSnapIndex < this.snapPositions.length - 1) {
      this.currentSnapIndex++;
      this.targetX = this.snapPositions[this.currentSnapIndex];
    }
  }

  /**
   * Move to the previous snap position (left)
   */
  moveToPreviousPosition(): void {
    if (this.currentSnapIndex > 0) {
      this.currentSnapIndex--;
      this.targetX = this.snapPositions[this.currentSnapIndex];
    }
  }

  /**
   * Get all snap positions (for zomboid spawning)
   */
  getSnapPositions(): number[] {
    return [...this.snapPositions];
  }

  /**
   * Get left snap positions (first 6 positions)
   */
  getLeftSnapPositions(): number[] {
    return this.snapPositions.slice(0, 6);
  }

  /**
   * Get right snap positions (last 6 positions)
   */
  getRightSnapPositions(): number[] {
    return this.snapPositions.slice(6, 12);
  }

  /**
   * Set target X position for hero squad (snaps to nearest position)
   */
  setTargetX(x: number): void {
    // Clamp to boundaries first
    const clampedX = Phaser.Math.Clamp(x, this.minX, this.maxX);
    // Find nearest snap position and update index
    this.currentSnapIndex = this.findNearestSnapIndex(clampedX);
    this.targetX = this.snapPositions[this.currentSnapIndex];
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
   * Get current target column index (0-11)
   */
  getTargetColumn(): number {
    return this.currentSnapIndex;
  }

  /**
   * Set target column by index (0-11)
   */
  setTargetColumn(columnIndex: number): void {
    // Clamp to valid column range
    const clampedIndex = Phaser.Math.Clamp(columnIndex, 0, this.snapPositions.length - 1);
    this.currentSnapIndex = clampedIndex;
    this.targetX = this.snapPositions[clampedIndex];
  }

  /**
   * Get column count (always 12)
   */
  getColumnCount(): number {
    return this.snapPositions.length;
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
