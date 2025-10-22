# Story 2.4.3: Integrate Collision Detection in GameScene

**Epic:** 2.4 Collision Detection
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 2 hours
**Status:** ✅ COMPLETED

## Description
Call CollisionManager.checkProjectileZomboidCollisions() every frame in GameScene, listen for zomboid_destroyed events, update score display, and track destroyed zomboids per wave.

## Tasks
- [x] Instantiate CollisionManager in GameScene
- [x] Call checkProjectileZomboidCollisions() every frame in update()
- [x] Listen for zomboid_destroyed events
- [x] Update score display in HUD
- [x] Track destroyed zomboids per wave
- [x] Maintain 60 FPS with collision checks

## Acceptance Criteria
- [x] Shooting zomboids works correctly
- [x] Score updates in real-time
- [x] Different zomboid types award correct scores
- [x] Performance maintained (60 FPS)
- [x] No missed collisions
- [x] Score persists across waves

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
