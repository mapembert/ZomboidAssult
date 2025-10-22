import Phaser from 'phaser';

/**
 * ShapeRenderer Utility
 * Static methods for rendering shapes with fill and outline
 */
export class ShapeRenderer {
  /**
   * Draw a circle centered at (x, y)
   */
  static drawCircle(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
    fillColor: number,
    strokeColor: number,
    strokeWidth: number
  ): void {
    graphics.fillStyle(fillColor, 1);
    graphics.fillCircle(x, y, radius);
    graphics.lineStyle(strokeWidth, strokeColor, 1);
    graphics.strokeCircle(x, y, radius);
  }

  /**
   * Draw a square centered at (x, y)
   */
  static drawSquare(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: number,
    strokeColor: number,
    strokeWidth: number
  ): void {
    // Center the square on (x, y)
    const left = x - width / 2;
    const top = y - height / 2;

    graphics.fillStyle(fillColor, 1);
    graphics.fillRect(left, top, width, height);
    graphics.lineStyle(strokeWidth, strokeColor, 1);
    graphics.strokeRect(left, top, width, height);
  }

  /**
   * Draw a hexagon centered at (x, y)
   */
  static drawHexagon(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
    fillColor: number,
    strokeColor: number,
    strokeWidth: number
  ): void {
    const points: { x: number; y: number }[] = [];

    // Calculate 6 vertices
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      points.push({
        x: x + radius * Math.cos(angle),
        y: y + radius * Math.sin(angle),
      });
    }

    // Draw filled hexagon
    graphics.fillStyle(fillColor, 1);
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();

    // Draw outline
    graphics.lineStyle(strokeWidth, strokeColor, 1);
    graphics.strokePath();
  }

  /**
   * Draw a triangle centered at (x, y)
   */
  static drawTriangle(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    baseWidth: number,
    height: number,
    fillColor: number,
    strokeColor: number,
    strokeWidth: number
  ): void {
    graphics.fillStyle(fillColor, 1);
    graphics.fillTriangle(
      x,
      y - height / 2, // Top point
      x - baseWidth / 2,
      y + height / 2, // Bottom left
      x + baseWidth / 2,
      y + height / 2 // Bottom right
    );

    graphics.lineStyle(strokeWidth, strokeColor, 1);
    graphics.strokeTriangle(
      x,
      y - height / 2,
      x - baseWidth / 2,
      y + height / 2,
      x + baseWidth / 2,
      y + height / 2
    );
  }
}
