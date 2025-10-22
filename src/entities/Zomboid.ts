import Phaser from 'phaser';
import { ShapeRenderer } from '@/utils/ShapeRenderer';
import type { ZomboidType } from '@/types/ConfigTypes';

/**
 * Zomboid Entity
 * Represents an enemy that moves downward and can be damaged
 */
export class Zomboid extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics;
  private config: ZomboidType;
  private currentHealth: number;
  private speed: number;
  private columnIndex: number = 0;

  constructor(scene: Phaser.Scene) {
    super(scene);

    // Create graphics object for rendering shape
    this.sprite = new Phaser.GameObjects.Graphics(scene);
    this.add(this.sprite);

    // Add to scene
    scene.add.existing(this);

    // Initialize with dummy config (will be set properly in spawn())
    this.config = {
      id: '',
      shape: 'circle',
      size: 'small',
      radius: 15,
      color: '#FF5252',
      outlineColor: '#FF8A80',
      health: 1,
      speed: 50,
      scoreValue: 10,
    };
    this.currentHealth = 1;
    this.speed = 50;

    // Initially inactive
    this.setActive(false);
    this.setVisible(false);
  }

  /**
   * Spawn zomboid with configuration
   */
  spawn(x: number, y: number, config: ZomboidType, columnIndex: number): void {
    this.config = config;
    this.currentHealth = config.health;
    this.speed = config.speed;
    this.columnIndex = columnIndex;

    // Set position
    this.setPosition(x, y);

    // Render shape
    this.renderShape();

    // Activate
    this.setActive(true);
    this.setVisible(true);
  }

  /**
   * Render shape based on zomboid type
   */
  private renderShape(): void {
    this.sprite.clear();

    // Convert hex colors to numbers
    const fillColor = Phaser.Display.Color.HexStringToColor(this.config.color).color;
    const strokeColor = Phaser.Display.Color.HexStringToColor(this.config.outlineColor).color;
    const strokeWidth = 2;

    switch (this.config.shape) {
      case 'circle':
        ShapeRenderer.drawCircle(
          this.sprite,
          0,
          0,
          this.config.radius || 15,
          fillColor,
          strokeColor,
          strokeWidth
        );
        break;

      case 'square':
        ShapeRenderer.drawSquare(
          this.sprite,
          0,
          0,
          this.config.width || 30,
          this.config.height || 30,
          fillColor,
          strokeColor,
          strokeWidth
        );
        break;

      case 'hexagon':
        ShapeRenderer.drawHexagon(
          this.sprite,
          0,
          0,
          this.config.radius || 18,
          fillColor,
          strokeColor,
          strokeWidth
        );
        break;
    }
  }

  /**
   * Update zomboid position (move downward)
   */
  update(delta: number): void {
    if (!this.active) return;

    // Move downward based on speed
    const deltaSeconds = delta / 1000;
    this.y += this.speed * deltaSeconds;

    // Check if off-screen (bottom boundary)
    if (this.isOffScreen()) {
      this.setActive(false);
      this.setVisible(false);
    }
  }

  /**
   * Apply damage to zomboid
   */
  takeDamage(amount: number): boolean {
    this.currentHealth -= amount;

    if (this.currentHealth <= 0) {
      this.destroy();
      return true; // Zomboid destroyed
    }

    return false; // Zomboid still alive
  }

  /**
   * Check if zomboid is off-screen (bottom)
   */
  isOffScreen(): boolean {
    const screenHeight = this.scene.scale.height;
    const maxSize = Math.max(
      this.config.radius || 0,
      this.config.width || 0,
      this.config.height || 0
    );
    return this.y > screenHeight + maxSize;
  }

  /**
   * Reset for object pooling
   */
  resetForPool(x: number, y: number, config: ZomboidType, columnIndex: number): void {
    this.spawn(x, y, config, columnIndex);
  }

  /**
   * Get current health
   */
  getCurrentHealth(): number {
    return this.currentHealth;
  }

  /**
   * Get maximum health
   */
  getMaxHealth(): number {
    return this.config.health;
  }

  /**
   * Get score value
   */
  getScoreValue(): number {
    return this.config.scoreValue;
  }

  /**
   * Get column index
   */
  getColumnIndex(): number {
    return this.columnIndex;
  }

  /**
   * Get bounds for collision detection
   */
  getBounds(): Phaser.Geom.Rectangle {
    let size = 0;

    switch (this.config.shape) {
      case 'circle':
      case 'hexagon':
        size = (this.config.radius || 15) * 2;
        break;
      case 'square':
        size = Math.max(this.config.width || 30, this.config.height || 30);
        break;
    }

    return new Phaser.Geom.Rectangle(this.x - size / 2, this.y - size / 2, size, size);
  }

  /**
   * Cleanup
   */
  destroy(fromScene?: boolean): void {
    this.sprite.clear();
    super.destroy(fromScene);
  }
}
