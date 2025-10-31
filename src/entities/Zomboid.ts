import Phaser from 'phaser';
import { ShapeRenderer } from '@/utils/ShapeRenderer';
import type { ZomboidType } from '@/types/ConfigTypes';

/**
 * Zomboid Entity
 * Represents an enemy that moves downward and can be damaged
 */
export class Zomboid extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics;
  private healthText: Phaser.GameObjects.Text;
  private config: ZomboidType;
  private currentHealth: number;
  private speed: number;
  private columnIndex: number = 0;
  private isDestroying: boolean = false;

  constructor(scene: Phaser.Scene) {
    super(scene);

    // Create graphics object for rendering shape
    this.sprite = new Phaser.GameObjects.Graphics(scene);
    this.add(this.sprite);

    // Create health text
    this.healthText = new Phaser.GameObjects.Text(scene, 0, 0, '', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.healthText.setOrigin(0.5, 0.5);
    this.add(this.healthText);

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
    this.isDestroying = false;

    // Set position
    this.setPosition(x, y);

    // Reset scale and alpha
    this.setScale(1);
    this.setAlpha(1);

    // Render shape
    this.renderShape();

    // Update health text
    this.updateHealthDisplay();

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
   * Update health text display
   */
  private updateHealthDisplay(): void {
    // Only show health for zomboids with more than 1 HP
    if (this.config.health <= 1) {
      this.healthText.setVisible(false);
      return;
    }

    this.healthText.setVisible(true);
    this.healthText.setText(this.currentHealth.toString());

    // Scale font size based on zomboid size
    let fontSize = '16px';
    if (this.config.size === 'boss') {
      fontSize = '32px';
    } else if (this.config.size === 'large') {
      fontSize = '24px';
    } else if (this.config.size === 'medium') {
      fontSize = '20px';
    }
    this.healthText.setFontSize(fontSize);
  }

  /**
   * Update zomboid position (move downward)
   */
  update(delta: number): void {
    if (!this.active || this.isDestroying) return;

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
    if (this.isDestroying) return false;

    this.currentHealth -= amount;

    if (this.currentHealth <= 0) {
      this.playDestructionEffect();
      return true; // Zomboid destroyed
    }

    // Update health display when damaged
    this.updateHealthDisplay();

    return false; // Zomboid still alive
  }

  /**
   * Get current health
   */
  getHealth(): number {
    return this.currentHealth;
  }

  /**
   * Play destruction effect (scale down + fade out)
   */
  private playDestructionEffect(): void {
    this.isDestroying = true;

    // Create tween for destruction effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        // Emit destroyed event with score value
        this.emit('destroyed', this.config.scoreValue);

        // Deactivate
        this.setActive(false);
        this.setVisible(false);
      },
    });
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
    // Stop any active tweens
    this.scene.tweens.killTweensOf(this);
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
    // Stop any active tweens
    this.scene.tweens.killTweensOf(this);
    this.sprite.clear();
    super.destroy(fromScene);
  }
}
