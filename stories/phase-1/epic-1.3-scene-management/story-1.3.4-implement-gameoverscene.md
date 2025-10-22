# Story 1.3.4: Implement GameOverScene

**Epic:** 1.3 Basic Scene Management
**Phase:** 1 - Foundation (Days 1-2)
**Estimated Time:** 2 hours
**Status:** ⏸️ NOT STARTED

## Description
Create `src/scenes/GameOverScene.ts` to display "Game Over" message, show final score and wave reached, add "Restart" button (reload GameScene), and add "Menu" button (return to MenuScene).

## Tasks
- [ ] Create `src/scenes/GameOverScene.ts`
- [ ] Display "Game Over" message
- [ ] Show final score and wave reached
- [ ] Add "Restart" button (reload GameScene)
- [ ] Add "Menu" button (return to MenuScene)

## Acceptance Criteria
- [ ] Scene receives score/wave data
- [ ] Both buttons work correctly
- [ ] UI matches dark mode theme
- [ ] Smooth transitions

## Files Created/Modified
- `src/scenes/GameOverScene.ts` (to be created)

## Dependencies
- Story 1.3.3: Create Placeholder GameScene (GameScene must be able to trigger game over)
- Story 1.2.1: Create TypeScript Type Definitions (for game state data types)

## Implementation Details
GameOverScene will provide:
1. Game over screen displaying final game statistics
2. Score display showing player's final score
3. Wave information showing how far the player progressed
4. Restart button to replay the same chapter
5. Menu button to return to chapter selection
6. Dark mode theme matching overall game aesthetic

## Scene Data Flow
```
GameScene → GameOverScene.init({ score, wave, chapterData })
GameOverScene displays statistics
Restart button → this.scene.start('GameScene', chapterData)
Menu button → this.scene.start('MenuScene')
```

## UI Layout
- **Top:** "GAME OVER" title
- **Center:**
  - Final Score: [score]
  - Wave Reached: [wave]
  - Chapter: [chapter name]
- **Bottom:**
  - Restart button
  - Menu button
- **Theme:** Dark background (#121212) with cyan accents (#03DAC6)

## Testing
```bash
npm run dev
# Trigger game over condition from GameScene
# GameOverScene should load with statistics
# Score and wave should display correctly
# Restart button should reload GameScene
# Menu button should return to MenuScene
# UI should match dark mode theme
```

## Next Story
Epic 2.1: Hero System (Phase 2 - Core Gameplay Mechanics)
