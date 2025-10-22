import Phaser from 'phaser';
import type { WeaponType } from '@/types/ConfigTypes';

export class Projectile extends Phaser.GameObjects.Graphics {
  private speed: number = 0;
  private damage: number = 0;
  private size: number = 0;
  private angleRadians: number = 0;

  constructor(scene: Phaser.Scene) {
    super(scene);

    // Add to scene
    scene.add.existing(this);

    // Initially inactive
    this.setActive(false);
    this.setVisible(false);
  }

  /**
   * Fire projectile with weapon configuration
   */
  fire(x: number, y: number, angleDegrees: number, weaponConfig: WeaponType): void {
    // Set position
    this.setPosition(x, y);

    // Convert angle from degrees to radians
    this.angleRadians = Phaser.Math.DegToRad(angleDegrees);

    // Apply weapon properties
    this.speed = weaponConfig.projectileSpeed;
    this.damage = weaponConfig.damage;
    this.size = weaponConfig.projectileSize;

    // Render the projectile
    this.renderCircle(weaponConfig);

    // Activate
    this.setActive(true);
    this.setVisible(true);
  }

  /**
   * Render projectile as a filled circle
   */
  private renderCircle(weaponConfig: WeaponType): void {
    this.clear();

    // Convert hex color string to number
    const color = Phaser.Display.Color.HexStringToColor(weaponConfig.projectileColor).color;

    // Draw filled circle
    this.fillStyle(color, 1);
    this.fillCircle(0, 0, this.size / 2);
  }

  /**
   * Update projectile position based on velocity
   */
  update(delta: number): void {
    if (!this.active) return;

    // Calculate movement based on angle and speed
    // Convert delta from milliseconds to seconds
    const deltaSeconds = delta / 1000;

    // Move based on angle (0 degrees = up, positive = right)
    this.x += Math.sin(this.angleRadians) * this.speed * deltaSeconds;
    this.y -= Math.cos(this.angleRadians) * this.speed * deltaSeconds;

    // Check if off-screen (top boundary)
    if (this.isOffScreen()) {
      this.setActive(false);
      this.setVisible(false);
    }
  }

  /**
   * Check if projectile is off-screen
   */
  isOffScreen(): boolean {
    // Off top of screen
    return this.y < -this.size;
  }

  /**
   * Reset projectile for object pooling
   */
  resetForPool(x: number, y: number, angleDegrees: number, weaponConfig: WeaponType): void {
    this.fire(x, y, angleDegrees, weaponConfig);
  }

  /**
   * Get projectile damage value
   */
  getDamage(): number {
    return this.damage;
  }

  /**
   * Get projectile size
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Get bounds for collision detection
   */
  getBounds(): Phaser.Geom.Rectangle {
    const radius = this.size / 2;
    return new Phaser.Geom.Rectangle(
      this.x - radius,
      this.y - radius,
      this.size,
      this.size
    );
  }
}
