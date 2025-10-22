# Story 2.4.1: Implement CollisionManager

**Epic:** 2.4 Collision Detection
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 4 hours
**Status:** ⏸️ NOT STARTED

## Description
Create `src/systems/CollisionManager.ts` with AABB (Axis-Aligned Bounding Box) collision detection to check projectile-zomboid overlaps, handle collision outcomes (damage zomboid, destroy projectile), and emit events for collisions.

## Tasks
- [ ] Create `src/systems/CollisionManager.ts` class
- [ ] Implement AABB collision detection algorithm
- [ ] Check projectile-zomboid overlaps
- [ ] Handle collision outcomes (damage zomboid, destroy projectile)
- [ ] Emit collision events
- [ ] Optimize for performance (spatial partitioning optional)

## Acceptance Criteria
- [ ] Collisions detected accurately (no false positives)
- [ ] Zomboids take damage on hit
- [ ] Projectiles destroyed on hit
- [ ] Events emitted correctly
- [ ] 60 FPS maintained with many entities
- [ ] No missed collisions

## Files Created/Modified
- `src/systems/CollisionManager.ts` (to be created)

## Dependencies
- Story 2.2.1: Create Projectile Entity Class
- Story 2.3.2: Create Zomboid Entity Class

## AABB Collision Algorithm
```typescript
checkAABB(rect1: Bounds, rect2: Bounds): boolean {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}
```

## Testing
```bash
npm run dev
# Fire projectiles at zomboids
# Verify hits register
# Check damage is applied
# Verify no false positives
```

## Next Story
Story 2.4.2: Implement Zomboid Destruction
