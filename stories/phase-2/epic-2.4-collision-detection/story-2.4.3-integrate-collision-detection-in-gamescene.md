# Story 2.4.3: Integrate Collision Detection in GameScene

**Epic:** 2.4 Collision Detection
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 2 hours
**Status:** ⏸️ NOT STARTED

## Description
Call CollisionManager.checkProjectileZomboidCollisions() every frame in GameScene, listen for zomboid_destroyed events, update score display, and track destroyed zomboids per wave.

## Tasks
- [ ] Instantiate CollisionManager in GameScene
- [ ] Call checkProjectileZomboidCollisions() every frame in update()
- [ ] Listen for zomboid_destroyed events
- [ ] Update score display in HUD
- [ ] Track destroyed zomboids per wave
- [ ] Maintain 60 FPS with collision checks

## Acceptance Criteria
- [ ] Shooting zomboids works correctly
- [ ] Score updates in real-time
- [ ] Different zomboid types award correct scores
- [ ] Performance maintained (60 FPS)
- [ ] No missed collisions
- [ ] Score persists across waves

## Files Created/Modified
- `src/scenes/GameScene.ts` (modify to add collision detection)

## Dependencies
- Story 2.4.1: Implement CollisionManager
- Story 2.4.2: Implement Zomboid Destruction
- Story 2.2.4: Integrate Weapon System in GameScene
- Story 2.3.4: Integrate Wave System in GameScene

## HUD Updates
```
Chapter Name
Wave 1/3 - Time: 25s
Score: 1250
Heroes: 1
Weapon: Single Gun
```

## Testing
```bash
npm run dev
# Shoot zomboids
# Verify score increases
# Check correct point values
# Verify FPS stays at 60
```

## Next Story
Story 2.4.4: Implement Game Over on Zomboid Reach Bottom
