# Story 2.3.1: Implement ShapeRenderer Utility

**Epic:** 2.3 Zomboid Spawning and Movement
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 3 hours
**Status:** ✅ COMPLETED

## Description
Create `src/utils/ShapeRenderer.ts` with static methods to draw circle, square, hexagon, and triangle shapes using Phaser.GameObjects.Graphics. Support fill color and outline rendering.

## Tasks
- [x] Create `src/utils/ShapeRenderer.ts` class with static methods
- [x] Implement drawCircle(graphics, x, y, radius, fillColor, strokeColor, strokeWidth)
- [x] Implement drawSquare(graphics, x, y, width, height, fillColor, strokeColor, strokeWidth)
- [x] Implement drawHexagon(graphics, x, y, radius, fillColor, strokeColor, strokeWidth)
- [x] Implement drawTriangle(graphics, x, y, baseWidth, height, fillColor, strokeColor, strokeWidth)
- [x] Apply fill color + outline to all shapes
- [x] Center all shapes on position (x, y)

## Acceptance Criteria
- [x] All shapes render correctly
- [x] Outlines visible (2-3px width)
- [x] Colors match config values
- [x] Shapes centered on position
- [x] No distortion or alignment issues
- [x] Works with Graphics objects from Phaser

## Files Created/Modified
- `src/utils/ShapeRenderer.ts` ✅ Created

## Dependencies
- Phaser 3 Graphics API ✅

## Implementation Details

### Circle Rendering
```typescript
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
```

### Square Rendering
```typescript
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
  const left = x - width / 2;
  const top = y - height / 2;

  graphics.fillStyle(fillColor, 1);
  graphics.fillRect(left, top, width, height);
  graphics.lineStyle(strokeWidth, strokeColor, 1);
  graphics.strokeRect(left, top, width, height);
}
```

### Hexagon Rendering
```typescript
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

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    points.push({
      x: x + radius * Math.cos(angle),
      y: y + radius * Math.sin(angle),
    });
  }

  graphics.fillStyle(fillColor, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();

  graphics.lineStyle(strokeWidth, strokeColor, 1);
  graphics.strokePath();
}
```

### Triangle Rendering
```typescript
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
    x, y - height / 2,
    x - baseWidth / 2, y + height / 2,
    x + baseWidth / 2, y + height / 2
  );

  graphics.lineStyle(strokeWidth, strokeColor, 1);
  graphics.strokeTriangle(
    x, y - height / 2,
    x - baseWidth / 2, y + height / 2,
    x + baseWidth / 2, y + height / 2
  );
}
```

## Testing Results
✅ TypeScript compilation successful
✅ ESLint checks passed
✅ ShapeRenderer utility class created with all static methods
✅ Circle rendering implemented and centered
✅ Square rendering implemented and centered
✅ Hexagon rendering implemented with 6 vertices
✅ Triangle rendering implemented (upward-pointing)
✅ Fill colors applied correctly
✅ Stroke outlines applied to all shapes
✅ All shapes properly centered on (x, y)

## Next Story
Story 2.3.2: Create Zomboid Entity Class
