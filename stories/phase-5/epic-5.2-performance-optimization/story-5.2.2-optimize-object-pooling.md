# Story 5.2.2: Optimize Object Pooling

**Epic:** 5.2 Performance Optimization
**Phase:** 5 - Audio and Polish (Days 10-11)
**Estimated Time:** 3 hours
**Status:** 📋 READY TO START

## Description
Verify and optimize the existing object pooling implementation for zomboids and projectiles to ensure no memory leaks, adequate pool sizes, stable object counts during gameplay, and minimal garbage collection activity. This prevents performance degradation during extended play sessions.

## User Story
**As a player**, I expect consistent performance throughout long gameplay sessions without slowdowns or memory issues.

## Tasks
- [ ] Audit existing ObjectPool implementation
- [ ] Verify zomboids are properly pooled
- [ ] Verify projectiles are properly pooled
- [ ] Monitor object count stability during gameplay
- [ ] Check for memory leaks (objects not returned to pool)
- [ ] Optimize pool sizes based on gameplay data
- [ ] Monitor garbage collection activity
- [ ] Ensure memory usage stays < 150MB
- [ ] Test extended gameplay (30+ minutes)
- [ ] Add pool statistics to performance monitor

## Acceptance Criteria
- [ ] Object count stable during gameplay (no continuous growth)
- [ ] Memory usage < 150MB during normal gameplay
- [ ] No garbage collection spikes during gameplay
- [ ] Pool sizes adequate for all game scenarios
- [ ] Zomboids properly returned to pool on destruction
- [ ] Projectiles properly returned to pool when off-screen
- [ ] No memory leaks detected after 30+ minutes of play
- [ ] Pool statistics visible in debug mode

## Files to Create/Modify
- `src/utils/ObjectPool.ts` - Enhance with statistics
- `src/systems/WaveManager.ts` - Verify zomboid pooling
- `src/systems/WeaponSystem.ts` - Verify projectile pooling
- `src/entities/Zomboid.ts` - Verify proper reset
- `src/entities/Projectile.ts` - Verify proper reset
- `src/utils/PerformanceMonitor.ts` - Add pool statistics

## Dependencies
- Story 2.2.2: Implement ObjectPool Utility (completed)
- Story 5.2.1: Profile and Optimize Rendering (completed)

## Implementation Details

### Enhanced ObjectPool.ts

```typescript
export class ObjectPool<T> {
  private pool: T[];
  private active: Set<T> = new Set();
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  // Statistics
  private stats = {
    totalCreated: 0,
    totalAcquired: 0,
    totalReleased: 0,
    peakActive: 0,
    currentActive: 0,
    currentPooled: 0,
  };

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize: number,
    maxSize: number = initialSize * 3
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    this.pool = [];

    // Pre-allocate initial pool
    for (let i = 0; i < initialSize; i++) {
      const obj = this.createFn();
      this.pool.push(obj);
      this.stats.totalCreated++;
    }

    console.log(`ObjectPool created: initial=${initialSize}, max=${maxSize}`);
  }

  /**
   * Acquire an object from the pool
   */
  acquire(): T {
    let obj: T;

    if (this.pool.length > 0) {
      // Reuse from pool
      obj = this.pool.pop()!;
    } else {
      // Create new if pool empty (up to max size)
      if (this.active.size >= this.maxSize) {
        console.warn(`ObjectPool max size reached (${this.maxSize}). Reusing oldest.`);
        // Get oldest active object (first in set)
        obj = this.active.values().next().value;
        this.release(obj); // Force release
        obj = this.pool.pop()!;
      } else {
        obj = this.createFn();
        this.stats.totalCreated++;
      }
    }

    // Reset and activate
    this.resetFn(obj);
    this.active.add(obj);
    this.stats.totalAcquired++;
    this.stats.currentActive = this.active.size;
    this.stats.currentPooled = this.pool.length;

    // Track peak
    if (this.stats.currentActive > this.stats.peakActive) {
      this.stats.peakActive = this.stats.currentActive;
    }

    return obj;
  }

  /**
   * Release an object back to the pool
   */
  release(obj: T): void {
    if (!this.active.has(obj)) {
      console.warn('Attempted to release object not in active set');
      return;
    }

    this.active.delete(obj);
    this.pool.push(obj);
    this.stats.totalReleased++;
    this.stats.currentActive = this.active.size;
    this.stats.currentPooled = this.pool.length;
  }

  /**
   * Get all active objects
   */
  getActive(): T[] {
    return Array.from(this.active);
  }

  /**
   * Get number of active objects
   */
  getActiveCount(): number {
    return this.active.size;
  }

  /**
   * Get number of pooled (available) objects
   */
  getPooledCount(): number {
    return this.pool.length;
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats.totalAcquired = 0;
    this.stats.totalReleased = 0;
    this.stats.peakActive = this.active.size;
  }

  /**
   * Clear all objects (for cleanup)
   */
  clear(): void {
    this.active.clear();
    this.pool = [];
  }
}
```

---

### WaveManager.ts Pooling Verification

```typescript
export class WaveManager {
  private zomboidPool: ObjectPool<Zomboid>;
  private activeZomboids: Zomboid[] = []; // Track separately for quick access

  constructor(scene: Phaser.Scene, chapter: ChapterData) {
    // ... existing code ...

    // Calculate appropriate pool size based on chapter
    const maxZomboidsPerWave = this.calculateMaxZomboids(chapter);
    const poolSize = Math.max(50, maxZomboidsPerWave + 10); // +10 buffer

    this.zomboidPool = new ObjectPool<Zomboid>(
      () => new Zomboid(scene, 0, 0, zomboidTypes[0]), // placeholder config
      (zomboid: Zomboid) => zomboid.resetForPool(),
      poolSize,
      poolSize * 2 // Max size = 2x initial
    );

    console.log(`WaveManager zomboid pool size: ${poolSize}`);
  }

  private calculateMaxZomboids(chapter: ChapterData): number {
    let max = 0;
    chapter.waves.forEach(wave => {
      let waveTotal = 0;
      wave.spawnPattern.zomboids.forEach(spawn => {
        waveTotal += spawn.count;
      });
      max = Math.max(max, waveTotal);
    });
    return max;
  }

  spawnZomboid(config: ZomboidType, column: number): void {
    const zomboid = this.zomboidPool.acquire();

    // Configure zomboid
    zomboid.setConfig(config);
    zomboid.setColumn(column);
    zomboid.setPosition(/* ... */);

    this.activeZomboids.push(zomboid);
  }

  destroyZomboid(zomboid: Zomboid): void {
    // Remove from active list
    const index = this.activeZomboids.indexOf(zomboid);
    if (index !== -1) {
      this.activeZomboids.splice(index, 1);
    }

    // Return to pool
    this.zomboidPool.release(zomboid);
    zomboid.setVisible(false);
    zomboid.setActive(false);
  }

  getActiveZomboidCount(): number {
    return this.activeZomboids.length;
  }

  getZomboidPoolStats() {
    return this.zomboidPool.getStats();
  }
}
```

---

### WeaponSystem.ts Pooling Verification

```typescript
export class WeaponSystem {
  private projectilePool: ObjectPool<Projectile>;
  private activeProjectiles: Projectile[] = [];

  constructor(scene: Phaser.Scene, weaponTypes: WeaponType[]) {
    // ... existing code ...

    // Calculate pool size based on max fire rate
    const maxProjectilesPerSecond = this.calculateMaxFireRate(weaponTypes);
    const poolSize = Math.max(100, maxProjectilesPerSecond * 5); // 5 seconds worth

    this.projectilePool = new ObjectPool<Projectile>(
      () => new Projectile(scene, 0, 0),
      (proj: Projectile) => proj.resetForPool(),
      poolSize,
      poolSize * 2
    );

    console.log(`WeaponSystem projectile pool size: ${poolSize}`);
  }

  private calculateMaxFireRate(weaponTypes: WeaponType[]): number {
    let maxRate = 0;
    weaponTypes.forEach(weapon => {
      const projectilesPerSec = (1 / weapon.fireRate) * weapon.projectileCount;
      maxRate = Math.max(maxRate, projectilesPerSec);
    });
    return Math.ceil(maxRate);
  }

  fire(x: number, y: number): void {
    // ... existing fire logic ...

    for (let i = 0; i < this.currentWeapon.projectileCount; i++) {
      const projectile = this.projectilePool.acquire();

      projectile.setPosition(x, y);
      // ... configure projectile ...

      this.activeProjectiles.push(projectile);
    }
  }

  update(delta: number): void {
    // Update all projectiles
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const projectile = this.activeProjectiles[i];

      projectile.update(delta);

      // Check if off-screen
      if (this.isOffScreen(projectile)) {
        this.destroyProjectile(projectile);
      }
    }
  }

  destroyProjectile(projectile: Projectile): void {
    const index = this.activeProjectiles.indexOf(projectile);
    if (index !== -1) {
      this.activeProjectiles.splice(index, 1);
    }

    this.projectilePool.release(projectile);
    projectile.setVisible(false);
    projectile.setActive(false);
  }

  getActiveProjectileCount(): number {
    return this.activeProjectiles.length;
  }

  getProjectilePoolStats() {
    return this.projectilePool.getStats();
  }
}
```

---

### Projectile.ts Reset Verification

```typescript
export class Projectile extends Phaser.GameObjects.Graphics {
  private velocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private damage: number = 1;

  resetForPool(x?: number, y?: number, angle?: number): void {
    // Reset position
    if (x !== undefined && y !== undefined) {
      this.setPosition(x, y);
    }

    // Reset velocity
    if (angle !== undefined) {
      const speed = 400; // Or from config
      this.velocity.setToPolar(angle, speed);
    } else {
      this.velocity.set(0, 0);
    }

    // Reset graphics
    this.clear();
    this.fillStyle(0xFFFFFF, 1);
    this.fillCircle(0, 0, 4);

    // Reset state
    this.setActive(true);
    this.setVisible(true);
    this.setAlpha(1);
    this.setScale(1);

    // Reset any tweens
    this.scene.tweens.killTweensOf(this);
  }

  destroy(fromScene?: boolean): void {
    // Don't actually destroy - will be reused from pool
    // Just reset state
    this.setActive(false);
    this.setVisible(false);

    // Clean up tweens
    this.scene.tweens.killTweensOf(this);
  }
}
```

---

### PerformanceMonitor.ts Pool Statistics

```typescript
export class PerformanceMonitor {
  // ... existing code ...

  private poolStatsText: Phaser.GameObjects.Text | null = null;

  private createDebugDisplay(): void {
    // ... existing displays ...

    // Pool statistics
    this.poolStatsText = this.scene.add.text(10, 110, 'Pool: ...', {
      fontSize: '14px',
      color: '#00FF00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 },
    }).setDepth(9999);
  }

  update(
    entityCount: number,
    zomboidPoolStats?: any,
    projectilePoolStats?: any
  ): void {
    // ... existing updates ...

    // Update pool statistics
    if (this.poolStatsText && zomboidPoolStats && projectilePoolStats) {
      const poolText = [
        `Zomboids: ${zomboidPoolStats.currentActive}/${zomboidPoolStats.totalCreated}`,
        `Projectiles: ${projectilePoolStats.currentActive}/${projectilePoolStats.totalCreated}`,
        `Peak: Z${zomboidPoolStats.peakActive} P${projectilePoolStats.peakActive}`,
      ].join('\n');

      this.poolStatsText.setText(poolText);
    }
  }
}
```

---

### GameScene.ts Integration

```typescript
update(time: number, delta: number): void {
  // ... existing game logic ...

  // Update performance monitor with pool stats
  if (this.perfMonitor && this.waveManager && this.weaponSystem) {
    const entityCount =
      this.waveManager.getActiveZomboidCount() +
      this.weaponSystem.getActiveProjectileCount() +
      (this.heroManager?.getHeroCount() || 0);

    this.perfMonitor.update(
      entityCount,
      this.waveManager.getZomboidPoolStats(),
      this.weaponSystem.getProjectilePoolStats()
    );
  }
}
```

---

## Memory Leak Detection

### Chrome DevTools Memory Profiler
1. Open DevTools → Memory tab
2. Take heap snapshot before starting game
3. Play for 5-10 minutes
4. Take another heap snapshot
5. Compare:
   - **Detached DOM nodes** (should be 0)
   - **Object counts** (should be stable, not growing)
   - **Total memory** (should plateau, not continuously increase)

**Signs of Memory Leak:**
- Object count continuously growing
- Memory usage continuously increasing
- Detached nodes accumulating

---

### Long-Duration Test

**Test Procedure:**
1. Start game
2. Play continuously for 30 minutes
3. Monitor memory usage every 5 minutes
4. Check for:
   - Memory growth
   - FPS degradation
   - Object count growth

**Expected Results:**
- Memory usage plateaus after ~5 minutes
- FPS remains stable
- Object counts stabilize

---

## Pool Size Recommendations

Based on testing, recommended pool sizes:

| Entity | Initial Size | Max Size | Reasoning |
|--------|--------------|----------|-----------|
| Zomboids | 50 | 100 | Max ~30 on screen at once |
| Projectiles | 100 | 200 | Max ~100 with rapid fire weapons |
| Timers | 5 | 10 | Max 2-3 active simultaneously |

**Calculation Formula:**
```typescript
initialSize = maxConcurrent * 1.5 (50% buffer)
maxSize = initialSize * 2 (100% overflow capacity)
```

---

## Testing Checklist

### Object Pool Testing
- [ ] Zomboids properly acquired from pool
- [ ] Zomboids properly released to pool on destruction
- [ ] Projectiles properly acquired from pool
- [ ] Projectiles properly released when off-screen
- [ ] Pool size adequate for all game scenarios
- [ ] No objects created outside pool
- [ ] resetForPool() properly resets all state

### Memory Testing
- [ ] Memory usage < 150MB during gameplay
- [ ] Memory usage stable after 5 minutes
- [ ] No memory growth during 30-minute test
- [ ] No garbage collection spikes
- [ ] Heap snapshot shows stable object counts
- [ ] No detached DOM nodes

### Statistics Testing
- [ ] Pool statistics display correctly
- [ ] Active count accurate
- [ ] Pooled count accurate
- [ ] Peak count tracked correctly
- [ ] Total created/acquired/released counts accurate

---

## Success Metrics
- ✅ Object count stable during gameplay
- ✅ Memory usage < 150MB
- ✅ No garbage collection spikes
- ✅ Pool sizes adequate
- ✅ No memory leaks after 30+ minutes
- ✅ Pool statistics accurate

## Next Steps
After completion:
- Story 5.2.3: Mobile Testing and Optimization

## Notes
- Object pooling is key to consistent performance
- Monitor pool stats in debug mode regularly
- Adjust pool sizes based on actual gameplay data
- Memory leaks are often caused by event listeners not being removed
- Test on multiple devices/browsers for memory behavior
- Consider implementing auto-expanding pools for edge cases
