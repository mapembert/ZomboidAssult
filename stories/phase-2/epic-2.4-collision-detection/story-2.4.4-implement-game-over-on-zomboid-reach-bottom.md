# Story 2.4.4: Implement Game Over on Zomboid Reach Bottom

**Epic:** 2.4 Collision Detection
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 2 hours
**Status:** ✅ COMPLETED

## Description
Check zomboid Y position every frame, trigger game over if zomboid reaches safe zone (Y > screenHeight - safeZoneHeight), display "Game Over - Zomboid Reached Bottom" message, and transition to GameOverScene with final score and wave data.

## Tasks
- [x] Check zomboid Y position every frame
- [x] Trigger game over if zomboid reaches safe zone
- [x] Stop spawning zomboids after game over
- [x] Stop projectile firing after game over
- [x] Pass final score to GameOverScene
- [x] Pass wave reached to GameOverScene
- [x] Clean scene transition

## Acceptance Criteria
- [x] Game over triggers correctly when zomboid reaches bottom
- [x] Final score passed to GameOverScene
- [x] Wave number passed correctly
- [x] No zomboids spawn after game over
- [x] No projectiles fire after game over
- [x] Clean scene transition (no errors)
- [x] Safe zone boundary correct (from config)

## Files Created/Modified
- `src/scenes/GameScene.ts` (modify to add game over logic)

## Dependencies
- Story 2.3.4: Integrate Wave System in GameScene
- Story 2.4.3: Integrate Collision Detection in GameScene
- Story 1.3.4: Implement GameOverScene

## Safe Zone Configuration
From `config/game-settings.json`:
- `safeZoneHeight`: 100px from bottom
- If zomboid Y > (screenHeight - 100), trigger game over

## Game Over Logic
```typescript
checkGameOver(): void {
  for (const zomboid of this.activeZomboids) {
    if (zomboid.y > this.scale.height - this.safeZoneHeight) {
      this.triggerGameOver();
      break;
    }
  }
}

triggerGameOver(): void {
  this.gameActive = false;
  this.scene.start('GameOverScene', {
    score: this.score,
    wave: this.currentWave,
    chapter: this.currentChapter
  });
}
```

## Testing
```bash
npm run dev
# Let zomboid reach bottom
# Verify game over triggers
# Check GameOverScene receives data
# Verify score and wave display correctly
```

## Next Epic
Epic 3.1: Countdown Timer Mechanic (Phase 3)
