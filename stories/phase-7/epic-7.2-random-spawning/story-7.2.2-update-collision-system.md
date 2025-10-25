# Story: Update Collision Detection for Continuous Positions

**Epic:** Epic 7.2 - Random Zomboid Spawning System
**Story ID:** 7.2.2
**Priority:** High
**Points:** 3
**Status:** 📋 READY TO START

## Description

Verify and optimize collision detection for the new continuous positioning system. With heroes and zomboids now able to be at any X position (not just fixed columns), we need to ensure collision detection remains accurate and performant across the full screen width. This story focuses on testing, validation, and optimization rather than major refactoring.

The current collision system uses circular/rectangular bounding box collision detection which should work with continuous positions, but needs verification and potential optimization for the increased position variety.

## Acceptance Criteria

### Functional Requirements

- [ ] Projectile-zomboid collisions detect accurately at any X position
- [ ] Projectile-timer collisions detect accurately at any X position
- [ ] Collision detection works correctly across full screen width (60px to 660px)
- [ ] No collision detection gaps or dead zones
- [ ] Multiple projectiles can hit the same zomboid (multi-hit still works)
- [ ] Collision response is consistent regardless of position
- [ ] Edge case collisions work (zomboids at screen boundaries)

### Technical Requirements

- [ ] Code follows TypeScript strict mode standards
- [ ] Maintains 60 FPS with continuous collision detection
- [ ] Collision checks are frame-rate independent
- [ ] Spatial optimization if needed (quadtree or grid-based culling)
- [ ] Collision radius/bounds calculations are correct for all entity types
- [ ] No memory leaks or performance degradation over time
- [ ] Collision math handles floating-point positions correctly

### Performance Requirements

- [ ] Collision detection completes in < 2ms per frame (target)
- [ ] Performance scales linearly with entity count
- [ ] No stuttering during high-entity scenarios (50+ zomboids, 100+ projectiles)
- [ ] Memory usage remains stable during gameplay
- [ ] CPU usage does not spike during collision checks

### Game Design Requirements

- [ ] Hit detection feels fair and responsive
- [ ] No phantom hits or misses due to positioning
- [ ] Collision feedback is immediate and consistent
- [ ] Game difficulty is maintained with continuous collisions

## Technical Specifications

### Files to Create/Modify

**New Files:**

- None (optimization of existing system)

**Modified Files:**

- `src/systems/CollisionManager.ts` - Verify collision detection logic, add optimizations if needed

### Current Collision Detection Logic

The CollisionManager currently implements:

```typescript
class CollisionManager {
  /**
   * Check circular collision between two entities
   */
  private checkCircleCollision(
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (r1 + r2);
  }

  /**
   * Process collisions between projectiles and zomboids
   */
  processCollisions(
    projectiles: Projectile[],
    zomboids: Zomboid[]
  ): void {
    // Current implementation loops through all projectiles
    // and checks against all zomboids (O(n*m) complexity)
  }
}
```

### Optimization Strategies

**If Performance Issues Detected:**

1. **Spatial Partitioning (Quadtree)**
```typescript
class CollisionManager {
  private quadtree: Phaser.Structs.QuadTree;

  constructor(scene: Phaser.Scene, bounds: Phaser.Geom.Rectangle) {
    this.quadtree = new Phaser.Structs.QuadTree(bounds, 10, 4);
  }

  processCollisions(projectiles: Projectile[], zomboids: Zomboid[]): void {
    // Clear and rebuild quadtree each frame
    this.quadtree.clear();

    // Insert zomboids into quadtree
    zomboids.forEach(z => this.quadtree.insert(z.getBounds()));

    // Query quadtree for each projectile
    projectiles.forEach(p => {
      const nearby = this.quadtree.retrieve(p.getBounds());
      // Only check collisions with nearby entities
    });
  }
}
```

2. **Grid-Based Culling**
```typescript
class CollisionManager {
  private gridCellSize: number = 100; // pixels

  private getGridCell(x: number, y: number): string {
    const col = Math.floor(x / this.gridCellSize);
    const row = Math.floor(y / this.gridCellSize);
    return `${col},${row}`;
  }

  processCollisions(projectiles: Projectile[], zomboids: Zomboid[]): void {
    // Group zomboids by grid cell
    const zomboidGrid = new Map<string, Zomboid[]>();
    zomboids.forEach(z => {
      const cell = this.getGridCell(z.x, z.y);
      if (!zomboidGrid.has(cell)) zomboidGrid.set(cell, []);
      zomboidGrid.get(cell)!.push(z);
    });

    // Check projectiles only against zomboids in same/adjacent cells
    projectiles.forEach(p => {
      const cell = this.getGridCell(p.x, p.y);
      const nearbyZomboids = this.getNearbyZomboids(cell, zomboidGrid);
      // Check collisions with nearby zomboids only
    });
  }
}
```

3. **Early Exit Optimization**
```typescript
processCollisions(projectiles: Projectile[], zomboids: Zomboid[]): void {
  // Filter out inactive/destroyed entities first
  const activeProjectiles = projectiles.filter(p => p.active);
  const activeZomboids = zomboids.filter(z => z.active && z.health > 0);

  // Sort by Y position for potential early exit
  activeZomboids.sort((a, b) => a.y - b.y);

  for (const projectile of activeProjectiles) {
    if (!projectile.active) continue; // Skip if already hit something

    for (const zomboid of activeZomboids) {
      // Early exit if zomboid is too far below projectile
      if (zomboid.y > projectile.y + 100) break;

      if (this.checkCollision(projectile, zomboid)) {
        this.handleCollision(projectile, zomboid);
        if (!projectile.active) break; // Projectile destroyed, no need to check more
      }
    }
  }
}
```

## Implementation Tasks

### Dev Agent Record

**Tasks:**

- [ ] Review current `CollisionManager.ts` implementation
- [ ] Verify collision detection works at continuous X positions (not just columns)
- [ ] Test collision accuracy at screen boundaries (x=60 and x=660)
- [ ] Test collision accuracy at center positions (x=360)
- [ ] Test collision accuracy with moving heroes (projectiles from any X)
- [ ] Performance profile collision detection with 50 zomboids + 100 projectiles
- [ ] Measure collision detection time per frame (target < 2ms)
- [ ] Identify performance bottlenecks if any
- [ ] Implement spatial optimization if needed (quadtree or grid)
- [ ] Add collision debug visualization (optional, for testing)
- [ ] Test projectile-timer collisions with random timer positions
- [ ] Test multi-hit scenarios (multiple projectiles hitting same zomboid)
- [ ] Verify collision radii are correct for all entity types
- [ ] Test edge cases: zomboids at exact boundaries, overlapping entities
- [ ] Performance regression testing (compare to column-based system)
- [ ] Memory leak testing (long gameplay sessions)

**Debug Log:**
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| | | | |

**Completion Notes:**

<!-- Only note deviations from requirements, keep under 50 words -->

**Change Log:**

<!-- Only requirement changes during implementation -->

## Game Design Context

**GDD Reference:** Core Gameplay Mechanics - Collision Detection System (Phase 7 Verification)

**Game Mechanic:** Continuous Position Collision Detection

**Player Experience Goal:** Players should trust that their shots will hit zomboids accurately regardless of positioning. Collision detection must be precise and consistent across the entire play area. No frustrating "phantom misses" due to edge positions or floating-point rounding errors.

**Performance Target:**

- Collision detection: < 2ms per frame (at 60 FPS = 16.67ms budget)
- Support up to 50 zomboids + 100 projectiles simultaneously
- No frame drops during collision-heavy scenarios

## Testing Requirements

### Unit Tests

**Test Files:**

- `tests/systems/CollisionManager.test.ts`

**Test Scenarios:**

- Collision detection at left boundary (x=60)
- Collision detection at right boundary (x=660)
- Collision detection at center (x=360)
- Collision detection at arbitrary position (x=234.5)
- No collision when entities are far apart
- Collision when entities barely overlap (edge case)
- Collision with floating-point positions (e.g., x=123.456)
- Multiple projectiles hitting same zomboid
- Projectile hitting multiple zomboids (if applicable)

### Performance Tests

**Benchmark Scenarios:**

1. **Low Entity Count**: 10 zomboids, 20 projectiles
   - Expected: < 0.5ms per frame
   - Baseline performance measurement

2. **Medium Entity Count**: 30 zomboids, 50 projectiles
   - Expected: < 1ms per frame
   - Typical gameplay scenario

3. **High Entity Count**: 50 zomboids, 100 projectiles
   - Expected: < 2ms per frame
   - Stress test scenario

4. **Extreme Entity Count**: 100 zomboids, 200 projectiles
   - Expected: < 5ms per frame
   - Edge case stress test

**Performance Profiling:**
- Use browser DevTools Performance profiler
- Measure `processCollisions()` execution time
- Identify any hotspots or optimization opportunities
- Compare performance to column-based system baseline

### Game Testing

**Manual Test Cases:**

1. **Full Width Collision Test**
   - Expected: Projectiles hit zomboids across entire screen width
   - Performance: No dead zones or gaps
   - Verification: Move heroes to 10 different X positions, fire at zomboids

2. **Boundary Collision Test**
   - Expected: Collisions work at screen edges (x≈60 and x≈660)
   - Edge Case: Zomboids at exact boundary positions
   - Verification: Spawn zomboids at edges, fire from hero at edges

3. **Rapid Fire Collision Test**
   - Expected: All projectiles from rapid fire detect collisions
   - Performance: No missed hits due to performance lag
   - Verification: Use highest fire rate weapon at max zomboid count

4. **Timer Collision Test**
   - Expected: Timers can be hit at any X position
   - Edge Case: Timers at screen edges
   - Verification: Test timer spawns across full width

5. **Long Session Stability Test**
   - Expected: Collision detection remains accurate after 30+ minutes
   - Performance: No memory leaks or performance degradation
   - Verification: Play continuous waves for extended period

## Dependencies

**Story Dependencies:**

- **7.1.1**: Continuous Hero Movement (MUST be completed)
  - Heroes fire projectiles from continuous X positions
- **7.2.1**: Random Zomboid Spawning (MUST be completed)
  - Zomboids spawn at random X positions to test against

**Technical Dependencies:**

- `CollisionManager.ts`: Existing collision system
- `Projectile.ts`: Projectile entity with position data
- `Zomboid.ts`: Zomboid entity with position/bounds data
- `Timer.ts`: Timer entity with position/bounds data
- Phaser 3 framework: Geometry utilities, QuadTree (if needed)

**Asset Dependencies:**

- No new assets required

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Unit tests written and passing
- [ ] Performance benchmarks completed and meet targets
- [ ] Manual game testing completed across all scenarios
- [ ] Performance targets met (< 2ms collision detection)
- [ ] No linting errors
- [ ] Collision detection verified across full screen width
- [ ] Edge case testing completed (boundaries, overlaps)
- [ ] No regression in collision accuracy or performance
- [ ] Memory leak testing passed (30+ minute sessions)
- [ ] Code committed to development branch
- [ ] Changes pushed to remote repository

## Notes

**Implementation Notes:**

- Current collision system likely works fine with continuous positions
- Main focus is verification and optimization, not major refactoring
- Use browser DevTools Performance tab for profiling
- Consider adding debug visualization for collision bounds during testing
- Phaser has built-in `Phaser.Geom.Intersects` utilities for various shapes
- QuadTree implementation available in Phaser: `Phaser.Structs.QuadTree`

**Design Decisions:**

- **Verify before optimize**: Test current system first, only optimize if needed
- **Spatial partitioning threshold**: Only implement if collision time > 2ms
- **Maintain current collision math**: Circular/rectangular collision is proven and simple
- **No physics engine**: Continue using custom collision (Phaser Physics would be overkill)

**Optimization Decision Tree:**

1. Test current system performance
2. If < 2ms: No optimization needed, mark complete
3. If 2-5ms: Implement early exit optimization or grid culling
4. If > 5ms: Implement full quadtree spatial partitioning
5. Re-test and verify improvement

**Future Considerations:**

- Could add collision pooling to reduce GC pressure
- Could add collision prediction for fast-moving projectiles
- Could implement broad-phase/narrow-phase collision pipeline
- Story 7.3.1 may adjust entity counts based on performance limits

**Testing Tools:**

- Use `console.time('collisions')` and `console.timeEnd('collisions')` for quick profiling
- Chrome DevTools Performance profiler for detailed analysis
- Phaser's built-in FPS meter for frame-rate monitoring
- Consider adding `/debug collision` command to visualize collision bounds

**Performance Baseline:**

Before making changes, establish baseline metrics:
- Collision time per frame in column-based system
- Frame rate stability in column-based system
- Memory usage in column-based system
- Use these as comparison points for continuous system
