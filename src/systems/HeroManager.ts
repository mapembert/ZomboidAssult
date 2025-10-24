import Phaser from 'phaser';
import { Hero } from '@/entities/Hero';
import type { HeroConfig, GameSettings } from '@/types/ConfigTypes';

export class HeroManager {
  private scene: Phaser.Scene;
  private heroes: Hero[];
  private config: HeroConfig;
  private gameSettings: GameSettings;
  private currentColumn: number;
  private columnPositions: number[];

  constructor(scene: Phaser.Scene, config: HeroConfig, gameSettings: GameSettings) {
    this.scene = scene;
    this.config = config;
    this.gameSettings = gameSettings;
    this.heroes = [];
    this.currentColumn = gameSettings.gameplay.playerStartColumn;

    // Calculate column positions
    // Left column: SCREEN_WIDTH / 4
    // Right column: (3 * SCREEN_WIDTH) / 4
    const screenWidth = gameSettings.gameSettings.screenWidth;
    this.columnPositions = [
      screenWidth / 4,      // Left column (180px)
      (3 * screenWidth) / 4 // Right column (540px)
    ];

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
    const hero = new Hero(this.scene, 0, 0, this.config, this.currentColumn);
    this.heroes.push(hero);
    return hero;
  }

  /**
   * Move all heroes to the left column
   */
  moveLeft(): void {
    this.currentColumn = 0;
    this.heroes.forEach(hero => hero.moveToColumn(0));
    this.repositionHeroes();
  }

  /**
   * Move all heroes to the right column
   */
  moveRight(): void {
    this.currentColumn = 1;
    this.heroes.forEach(hero => hero.moveToColumn(1));
    this.repositionHeroes();
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
   * Reposition all heroes in current column with even spacing
   */
  repositionHeroes(): void {
    if (this.heroes.length === 0) return;

    const screenHeight = this.gameSettings.gameSettings.screenHeight;
    const spacing = this.config.heroConfig.spacing;
    const positionFromBottom = this.config.heroConfig.positionFromBottom;
    const columnX = this.columnPositions[this.currentColumn];

    // Calculate vertical positions
    const totalHeight = (this.heroes.length - 1) * spacing;
    const startY = screenHeight - positionFromBottom - totalHeight / 2;

    // Position each hero
    this.heroes.forEach((hero, index) => {
      const y = startY + index * spacing;
      hero.setPosition(columnX, y);
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
   * Get current column index
   */
  getCurrentColumn(): number {
    return this.currentColumn;
  }

  /**
   * Update all heroes
   */
  update(delta: number): void {
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
