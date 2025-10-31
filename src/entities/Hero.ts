import Phaser from 'phaser';
import type { HeroConfig } from '@/types/ConfigTypes';

export class Hero extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics;
  private config: HeroConfig['heroConfig'];
  private targetX: number; // Target X position for continuous movement

  constructor(scene: Phaser.Scene, x: number, y: number, config: HeroConfig) {
    super(scene, x, y);

    this.config = config.heroConfig;
    this.targetX = x; // Initialize to starting position

    // Create graphics object for triangle rendering
    this.sprite = new Phaser.GameObjects.Graphics(scene);
    this.add(this.sprite);

    // Render the hero shape
    this.renderShape();

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Render the hero as an upward-pointing triangle
   */
  renderShape(): void {
    const { baseWidth, height, color, outlineColor, outlineWidth } = this.config.sprite;

    // Clear previous graphics
    this.sprite.clear();

    // Convert hex color strings to numbers
    const fillColor = Phaser.Display.Color.HexStringToColor(color).color;
    const strokeColor = Phaser.Display.Color.HexStringToColor(outlineColor).color;

    // Draw filled triangle (upward-pointing)
    this.sprite.fillStyle(fillColor, 1);
    this.sprite.fillTriangle(
      0, -height / 2,           // Top point
      -baseWidth / 2, height / 2,  // Bottom left
      baseWidth / 2, height / 2    // Bottom right
    );

    // Draw outline
    this.sprite.lineStyle(outlineWidth, strokeColor, 1);
    this.sprite.strokeTriangle(
      0, -height / 2,
      -baseWidth / 2, height / 2,
      baseWidth / 2, height / 2
    );
  }

  /**
   * Set the target X position for this hero
   */
  setTargetX(x: number): void {
    this.targetX = x;
  }

  /**
   * Get current target X position
   */
  getTargetX(): number {
    return this.targetX;
  }

  /**
   * Update method called every frame
   */
  update(_delta: number): void {
    // Position updates will be handled by HeroManager
    // This method is here for future animation or state updates
  }

  /**
   * Cleanup when hero is destroyed
   */
  destroy(fromScene?: boolean): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
    super.destroy(fromScene);
  }
}
