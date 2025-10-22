import Phaser from 'phaser';
import type { TimerType } from '@/types/ConfigTypes';

export class Timer extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private counterText: Phaser.GameObjects.Text;
  private config: TimerType;
  private counter: number;
  private columnIndex: number;

  constructor(scene: Phaser.Scene, x: number, y: number, timerConfig: TimerType, columnIndex: number = 0) {
    super(scene, x, y);

    this.config = timerConfig;
    this.counter = timerConfig.startValue;
    this.columnIndex = columnIndex;

    // Create graphics object for rectangle rendering
    this.background = new Phaser.GameObjects.Graphics(scene);
    this.add(this.background);

    // Create text for counter display
    this.counterText = new Phaser.GameObjects.Text(scene, 0, 0, this.formatCounter(), {
      fontSize: `${this.config.fontSize}px`,
      color: this.config.fontColor,
      fontStyle: 'bold',
      align: 'center'
    });
    this.counterText.setOrigin(0.5, 0.5);
    this.add(this.counterText);

    // Render the timer shape
    this.renderShape();

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Render the timer as a horizontal barrier
   */
  renderShape(): void {
    const { width, height, negativeColor, positiveColor, neutralColor } = this.config;

    // Clear previous graphics
    this.background.clear();

    // Determine color based on counter value
    let fillColorHex: string;
    if (this.counter < 0) {
      fillColorHex = negativeColor;
    } else if (this.counter > 0) {
      fillColorHex = positiveColor;
    } else {
      fillColorHex = neutralColor;
    }

    // Convert hex color string to number
    const fillColor = Phaser.Display.Color.HexStringToColor(fillColorHex).color;

    // Draw horizontal barrier rectangle
    this.background.fillStyle(fillColor, 0.9);
    this.background.fillRect(
      -width / 2,
      -height / 2,
      width,
      height
    );

    // Draw outline
    this.background.lineStyle(3, 0x18FFFF, 1);
    this.background.strokeRect(
      -width / 2,
      -height / 2,
      width,
      height
    );

    // Update counter text
    this.counterText.setText(this.formatCounter());

    // Update text color for visibility
    this.counterText.setColor('#FFFFFF');
  }

  /**
   * Format counter value for display
   */
  private formatCounter(): string {
    if (this.counter > 0) {
      return `+${this.counter}`;
    }
    return `${this.counter}`;
  }

  /**
   * Increment the counter by the configured amount
   */
  incrementCounter(amount?: number): void {
    const incrementValue = amount !== undefined ? amount : this.config.increment;
    this.counter += incrementValue;
    this.renderShape();
  }

  /**
   * Get current counter value
   */
  getCounterValue(): number {
    return this.counter;
  }

  /**
   * Get timer type/id
   */
  getTimerType(): string {
    return this.config.id;
  }

  /**
   * Get column index
   */
  getColumnIndex(): number {
    return this.columnIndex;
  }

  /**
   * Get increment value from config
   */
  getIncrementValue(): number {
    return this.config.increment;
  }

  /**
   * Called when timer exits screen - returns final counter value
   */
  onExitScreen(): number {
    return this.counter;
  }

  /**
   * Get bounds for collision detection
   */
  getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      this.x - this.config.width / 2,
      this.y - this.config.height / 2,
      this.config.width,
      this.config.height
    );
  }

  /**
   * Update method called every frame
   */
  update(delta: number): void {
    // Move downward at configured speed (convert delta from ms to seconds)
    const movement = this.config.speed * (delta / 1000);
    this.y += movement;
  }

  /**
   * Reset timer for object pooling
   */
  resetForPool(x: number, y: number, timerConfig: TimerType, columnIndex: number): void {
    this.x = x;
    this.y = y;
    this.config = timerConfig;
    this.counter = timerConfig.startValue;
    this.columnIndex = columnIndex;
    this.setActive(true);
    this.setVisible(true);
    this.renderShape();
  }

  /**
   * Cleanup when timer is destroyed
   */
  destroy(fromScene?: boolean): void {
    if (this.background) {
      this.background.destroy();
    }
    if (this.counterText) {
      this.counterText.destroy();
    }
    super.destroy(fromScene);
  }
}
