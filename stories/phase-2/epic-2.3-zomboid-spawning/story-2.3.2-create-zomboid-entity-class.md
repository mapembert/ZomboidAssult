# Story 2.3.2: Create Zomboid Entity Class

**Epic:** 2.3 Zomboid Spawning and Movement
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 4 hours
**Status:** ✅ COMPLETED

## Description
Create `src/entities/Zomboid.ts` entity class to load zomboid config (shape, size, color, health, speed), render shape using ShapeRenderer, implement downward movement, add takeDamage() method, and add resetForPool() method for object pooling.

## Tasks
- [x] Create `src/entities/Zomboid.ts` class extending Phaser.GameObjects.Container
- [x] Load zomboid config (shape, size, color, health, speed)
- [x] Render shape using ShapeRenderer utility
- [x] Implement downward movement
- [x] Add takeDamage(amount) method
- [x] Add resetForPool() method
- [x] Track health and destroy when health reaches 0
- [x] Support all shape types (circle, square, hexagon)

## Acceptance Criteria
- [x] All zomboid types render correctly (circle/square/hexagon)
- [x] Movement speed matches config (e.g., 50 px/s)
- [x] Health decrements on damage
- [x] Destroyed when health reaches 0
- [x] Can be reset for pooling
- [x] Colors match config (fill + outline)
- [x] Shape sizes match config

## Files Created/Modified
- `src/entities/Zomboid.ts` ✅ Created

## Dependencies
- Story 2.3.1: Implement ShapeRenderer Utility ✅
- Story 1.2.2: Implement ConfigLoader System ✅
- `public/config/entities/zomboids.json` ✅

## Implementation Details

### Zomboid Entity Structure
```typescript
export class Zomboid extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics;
  private config: ZomboidType;
  private currentHealth: number;
  private speed: number;
  private columnIndex: number;

  spawn(x: number, y: number, config: ZomboidType, columnIndex: number): void;
  update(delta: number): void;
  takeDamage(amount: number): boolean;
  resetForPool(x: number, y: number, config: ZomboidType, columnIndex: number): void;
  isOffScreen(): boolean;
  getBounds(): Phaser.Geom.Rectangle;
}
```

### Shape Rendering
```typescript
private renderShape(): void {
  this.sprite.clear();

  const fillColor = Phaser.Display.Color.HexStringToColor(this.config.color).color;
  const strokeColor = Phaser.Display.Color.HexStringToColor(this.config.outlineColor).color;
  const strokeWidth = 2;

  switch (this.config.shape) {
    case 'circle':
      ShapeRenderer.drawCircle(this.sprite, 0, 0, this.config.radius || 15, fillColor, strokeColor, strokeWidth);
      break;
    case 'square':
      ShapeRenderer.drawSquare(this.sprite, 0, 0, this.config.width || 30, this.config.height || 30, fillColor, strokeColor, strokeWidth);
      break;
    case 'hexagon':
      ShapeRenderer.drawHexagon(this.sprite, 0, 0, this.config.radius || 18, fillColor, strokeColor, strokeWidth);
      break;
  }
}
```

### Movement Implementation
```typescript
update(delta: number): void {
  if (!this.active) return;

  const deltaSeconds = delta / 1000;
  this.y += this.speed * deltaSeconds;

  if (this.isOffScreen()) {
    this.setActive(false);
    this.setVisible(false);
  }
}
```

### Damage System
```typescript
takeDamage(amount: number): boolean {
  this.currentHealth -= amount;

  if (this.currentHealth <= 0) {
    this.destroy();
    return true; // Zomboid destroyed
  }

  return false; // Zomboid still alive
}
```

## Configuration
From `public/config/entities/zomboids.json`:
- **Shapes:** circle, square, hexagon ✅
- **Sizes:** small (15-18px), medium (25px), large (35px) ✅
- **Health:** 1-6 HP ✅
- **Speed:** 35-60 px/s ✅
- **Colors:** Red circles, yellow squares, green hexagons ✅

## Testing Results
✅ TypeScript compilation successful
✅ ESLint checks passed
✅ Zomboid class created extending Phaser.GameObjects.Container
✅ ShapeRenderer integration working for all shapes
✅ Circle zomboids render correctly
✅ Square zomboids render correctly
✅ Hexagon zomboids render correctly
✅ Downward movement implemented
✅ takeDamage() method functional
✅ Health tracking working
✅ resetForPool() method for object pooling
✅ isOffScreen() detection working
✅ getBounds() for collision detection
✅ Column index tracking
✅ Score value tracking

## Next Story
Story 2.3.3: Implement WaveManager System
