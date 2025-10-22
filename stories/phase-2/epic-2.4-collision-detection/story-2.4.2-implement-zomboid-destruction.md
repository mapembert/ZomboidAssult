# Story 2.4.2: Implement Zomboid Destruction

**Epic:** 2.4 Collision Detection
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 2.5 hours
**Status:** ⏸️ NOT STARTED

## Description
Add destruction logic to Zomboid class with visual effect (scale down + fade out), return zomboid to pool, update score on destruction, and emit zomboid_destroyed event.

## Tasks
- [ ] Add destruction logic to Zomboid class
- [ ] Play destruction effect (scale down + fade out)
- [ ] Return zomboid to pool after destruction
- [ ] Update score on destruction
- [ ] Emit zomboid_destroyed event
- [ ] Award correct score value based on zomboid type

## Acceptance Criteria
- [ ] Zomboids destroyed when health reaches 0
- [ ] Visual feedback on destruction (tween animation)
- [ ] Score increments correctly
- [ ] No memory leaks (pooling works)
- [ ] Events emitted properly
- [ ] Different zomboid types award correct scores

## Files Created/Modified
- `src/entities/Zomboid.ts` (modify to add destruction)

## Dependencies
- Story 2.3.2: Create Zomboid Entity Class
- Story 2.4.1: Implement CollisionManager

## Destruction Effect
```typescript
destroy(): void {
  // Tween: scale to 0 and fade out
  this.scene.tweens.add({
    targets: this,
    scaleX: 0,
    scaleY: 0,
    alpha: 0,
    duration: 200,
    onComplete: () => {
      this.emit('destroyed', this.scoreValue);
      // Return to pool
    }
  });
}
```

## Testing
```bash
npm run dev
# Shoot zomboids until destroyed
# Verify destruction animation
# Check score updates
# Verify no memory leaks
```

## Next Story
Story 2.4.3: Integrate Collision Detection in GameScene
