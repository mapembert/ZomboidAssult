# Story 2.2.1: Create Projectile Entity Class

**Epic:** 2.2 Weapon and Projectile System
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 2.5 hours
**Status:** ✅ COMPLETED

## Description
Create `src/entities/Projectile.ts` entity class that renders as a small circle using Phaser Graphics, implements upward movement, supports object pooling via resetForPool() method, and applies weapon configuration (color, size, speed, damage).

## Tasks
- [x] Create `src/entities/Projectile.ts` class extending Phaser.GameObjects.Graphics
- [x] Render as small circle (radius from weapon config)
- [x] Implement upward movement using velocity
- [x] Add resetForPool() method for object pooling
- [x] Apply weapon config (color, size, speed, damage)
- [x] Add bounds checking (destroy when off-screen)
- [x] Store damage value for collision system
- [x] Implement update() method for position updates

## Acceptance Criteria
- [x] Projectiles render correctly as circles
- [x] Move upward at configured speed (e.g., 400 px/s)
- [x] Destroy when off-screen (Y < -projectileSize)
- [x] Can be reset for pooling (position, angle, active state)
- [x] Circle color matches weapon config
- [x] Circle size matches weapon config
- [x] Damage value accessible for collision detection
- [x] No memory leaks

## Files Created/Modified
- `src/entities/Projectile.ts` ✅ Created

## Dependencies
- Story 1.2.1: Create TypeScript Type Definitions (WeaponType interface) ✅
- Story 1.2.2: Implement ConfigLoader System (for weapon configs) ✅
- `config/entities/weapons.json` (weapon configurations) ✅

## Implementation Details

### Projectile Entity Structure
The Projectile class:
1. Extends `Phaser.GameObjects.Graphics` for efficient circle rendering ✅
2. Stores velocity, damage, and weapon properties ✅
3. Supports angle-based firing for spread patterns ✅
4. Is poolable (reset and reuse instances) ✅
5. Self-destructs when leaving screen bounds ✅

### Circle Rendering
```typescript
// Render filled circle with weapon color
this.clear();
this.fillStyle(Phaser.Display.Color.HexStringToColor(weaponConfig.projectileColor).color);
this.fillCircle(0, 0, weaponConfig.projectileSize / 2);
```

### Movement Implementation
Projectiles move based on angle and speed:
```typescript
// In update method
this.x += Math.sin(this.angleRadians) * this.speed * (delta / 1000);
this.y -= Math.cos(this.angleRadians) * this.speed * (delta / 1000);

// Check if off-screen (top boundary)
if (this.y < -this.size) {
  this.setActive(false);
  this.setVisible(false);
}
```

### Object Pooling Support
Implemented resetForPool() to reuse projectile instances:
```typescript
resetForPool(x: number, y: number, angleDegrees: number, weaponConfig: WeaponType): void {
  this.fire(x, y, angleDegrees, weaponConfig);
}
```

### Class Interface
```typescript
class Projectile extends Phaser.GameObjects.Graphics {
  private speed: number;
  private damage: number;
  private size: number;
  private angleRadians: number;

  constructor(scene: Phaser.Scene);

  fire(x: number, y: number, angleDegrees: number, weaponConfig: WeaponType): void;
  update(delta: number): void;
  resetForPool(x: number, y: number, angleDegrees: number, weaponConfig: WeaponType): void;
  getDamage(): number;
  getSize(): number;
  isOffScreen(): boolean;
  getBounds(): Phaser.Geom.Rectangle;
}
```

### Angle and Spread
For weapon spread, projectiles fire at angles:
- Center projectile: angle = 0 (straight up)
- Left spread: angle < 0 (tilted left)
- Right spread: angle > 0 (tilted right)

Example for 3 projectiles with 30° spread:
- Projectile 1: angle = -15°
- Projectile 2: angle = 0°
- Projectile 3: angle = +15°

### Performance Optimization
- Uses Graphics instead of Sprites (no texture loading) ✅
- Pools projectiles (create once, reuse many times) ✅
- Disables physics (uses manual position updates) ✅
- Clears graphics before redrawing ✅

## Weapon Configuration Examples
From `config/entities/weapons.json`:

**Single Gun (Tier 1):**
- `projectileSpeed`: 400 px/s
- `projectileColor`: "#FFFFFF" (white)
- `projectileSize`: 8px diameter
- `damage`: 1

**Pulse Laser (Tier 4):**
- `projectileSpeed`: 500 px/s
- `projectileColor`: "#00E5FF" (cyan)
- `projectileSize`: 12px diameter
- `damage`: 2

**Mega Machine Gun (Tier 5):**
- `projectileSpeed`: 600 px/s
- `projectileColor`: "#FFEA00" (yellow)
- `projectileSize`: 6px diameter
- `damage`: 1

## Testing Results
✅ TypeScript compilation successful
✅ ESLint checks passed
✅ Projectile class created with all required methods
✅ Circle rendering implemented with weapon config colors
✅ Movement system working with angle-based trajectories
✅ Object pooling support via resetForPool()
✅ Off-screen bounds checking functional
✅ getBounds() method added for collision detection

## Next Story
Story 2.2.2: Implement ObjectPool Utility
