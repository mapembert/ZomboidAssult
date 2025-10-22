# Story 3.1.3: Implement Projectile-Timer Collision

**Epic:** 3.1 Countdown Timer Mechanic
**Phase:** 3 - Timer and Upgrade Systems (Days 6-7)
**Estimated Time:** 3 hours
**Status:** ✅ COMPLETED

## Description
Extend `src/systems/CollisionManager.ts` to detect collisions between projectiles and timers, increment timer counter on hit, destroy the colliding projectile, and update timer visual immediately to reflect the new counter value.

## Tasks
- [ ] Add checkProjectileTimerCollisions() method to CollisionManager
- [ ] Implement AABB collision detection between projectiles and timers
- [ ] Call timer.incrementCounter() on collision
- [ ] Destroy projectile after collision
- [ ] Return projectile to object pool
- [ ] Emit 'timer_hit' event with timer and increment data
- [ ] Update timer visual immediately (color change if crosses 0)
- [ ] Add collision check to GameScene update loop

## Acceptance Criteria
- [ ] Shooting timer increments counter correctly
- [ ] Visual update is instant (no lag)
- [ ] Counter increment matches timer config incrementValue
- [ ] Projectile destroyed on hit
- [ ] Color changes if counter crosses 0 threshold
- [ ] Multiple projectiles can hit same timer
- [ ] Collision detection accurate (no false positives/negatives)
- [ ] No performance impact at 60 FPS

## Files Created/Modified
- `src/systems/CollisionManager.ts` (modified)
- `src/scenes/GameScene.ts` (modified to call new collision check)

## Dependencies
- Story 3.1.1: Create Timer Entity Class (Timer.incrementCounter method)
- Story 3.1.2: Implement Timer Spawning in WaveManager (active timers array)
- Story 2.4.1: Implement CollisionManager (base collision system)
- Story 2.2.1: Create Projectile Entity Class
- Story 2.2.2: Implement ObjectPool Utility (projectile pooling)

## Implementation Details

### Collision Detection Method
```typescript
class CollisionManager {
  // Existing methods...

  static checkProjectileTimerCollisions(
    projectiles: Projectile[],
    timers: Timer[],
    projectilePool: ObjectPool<Projectile>,
    scene: Phaser.Scene
  ): void {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      const pBounds = projectile.getBounds();

      for (const timer of timers) {
        const tBounds = timer.getBounds();

        if (this.checkAABB(pBounds, tBounds)) {
          // Handle collision
          const incrementValue = timer.getIncrementValue();
          timer.incrementCounter(incrementValue);

          // Emit event for audio/visual feedback
          scene.events.emit('timer_hit', {
            timer: timer,
            newValue: timer.getCounterValue(),
            incrementValue: incrementValue
          });

          // Destroy projectile
          projectile.setActive(false);
          projectile.setVisible(false);
          projectiles.splice(i, 1);
          projectilePool.release(projectile);

          break; // One projectile hits one timer
        }
      }
    }
  }
}
```

### Timer Bounds Calculation
Timer entity must implement getBounds():
```typescript
// In Timer.ts
getBounds(): Phaser.Geom.Rectangle {
  return new Phaser.Geom.Rectangle(
    this.x - this.config.sprite.width / 2,
    this.y - this.config.sprite.height / 2,
    this.config.sprite.width,
    this.config.sprite.height
  );
}
```

### Integration in GameScene
```typescript
// In GameScene.update()
update(time: number, delta: number): void {
  // Existing updates...

  // Check projectile-timer collisions
  if (this.waveManager) {
    const activeTimers = this.waveManager.getActiveTimers();
    CollisionManager.checkProjectileTimerCollisions(
      this.weaponSystem.getActiveProjectiles(),
      activeTimers,
      this.weaponSystem.getProjectilePool(),
      this
    );
  }
}
```

### Visual Feedback Flow
1. Projectile hits timer
2. Timer.incrementCounter() called
3. Timer updates internal counter value
4. Timer.renderShape() called automatically
5. Color recalculated based on new value
6. Graphics redrawn with new color
7. Counter text updated
8. User sees instant visual change

### Event Data Structure
```typescript
interface TimerHitEvent {
  timer: Timer;
  newValue: number;
  incrementValue: number;
}
```

## Testing Checklist
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Projectile-timer collision detected accurately
- [ ] Counter increments by configured amount
- [ ] Projectile destroyed after hit
- [ ] Timer visual updates immediately
- [ ] Color change works when crossing 0
- [ ] Multiple hits on same timer work
- [ ] No performance degradation
- [ ] No console errors

## Audio/Visual Feedback (Future Enhancement)
This story emits 'timer_hit' event which can be used in Phase 5 for:
- Digital beep sound effect
- Timer pulse/scale animation
- Particle effect at collision point

## Next Story
Story 3.1.4: Implement Timer Exit and Hero Modification
