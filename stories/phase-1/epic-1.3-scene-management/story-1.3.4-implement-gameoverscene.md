# Story 1.3.4: Implement GameOverScene

**Epic:** 1.3 Basic Scene Management
**Phase:** 1 - Foundation (Days 1-2)
**Estimated Time:** 2 hours
**Status:** ✅ COMPLETED

## Description
Create `src/scenes/GameOverScene.ts` to display "Game Over" message, show final score and wave reached, add "Restart" button (reload GameScene), and add "Menu" button (return to MenuScene).

## Tasks
- [x] Create `src/scenes/GameOverScene.ts`
- [x] Display "Game Over" message
- [x] Show final score and wave reached
- [x] Add "Restart" button (reload GameScene)
- [x] Add "Menu" button (return to MenuScene)

## Acceptance Criteria
- [x] Scene receives score/wave data
- [x] Both buttons work correctly
- [x] UI matches dark mode theme
- [x] Smooth transitions

## Files Created/Modified
- `src/scenes/GameOverScene.ts`
- `src/main.ts` (added GameOverScene to scene list)
- `src/scenes/GameScene.ts` (added test button to trigger game over)

## Dependencies
- Story 1.3.3: Create Placeholder GameScene (GameScene must be able to trigger game over)
- Story 1.2.1: Create TypeScript Type Definitions (for game state data types)

## Implementation Details
GameOverScene provides:
1. Game over screen displaying final game statistics
2. Score display showing player's final score
3. Wave information showing how far the player progressed
4. Restart button to replay the same chapter
5. Menu button to return to chapter selection
6. Dark mode theme matching overall game aesthetic (#121212 background, #03DAC6 accents, #FF5252 for Game Over title)

### Features Implemented:
- **Data Handling:** Receives score, wave, and chapter data via init method
- **UI Components:**
  - Red "GAME OVER" title with stroke effect
  - Semi-transparent dark overlay
  - Statistics container showing chapter name, score, and wave progress
  - Interactive buttons with hover effects
- **Navigation:**
  - Restart button (cyan) - restarts same chapter
  - Menu button (gray) - returns to chapter selection
- **Fallback Handling:** If no data provided, shows basic screen with menu button only

## Scene Data Flow
```
GameScene → GameOverScene.init({ score, wave, chapter })
GameOverScene displays statistics
Restart button → this.scene.start('GameScene', { chapter })
Menu button → this.scene.start('MenuScene')
```

## UI Layout
- **Top (Y: 180):** "GAME OVER" title in red (#FF5252)
- **Center (Y: 340-660):**
  - Statistics container with rounded background
  - Chapter name in cyan
  - Final Score label and value
  - Wave Reached label and value (e.g., "Wave 2 / 3")
- **Bottom (Y: height - 280):**
  - Restart button (cyan background)
  - Menu button (gray background)
- **Theme:** Dark background (#121212) with semi-transparent overlay

## Testing
```bash
npm run dev
# Navigate to any chapter from MenuScene
# Click "TEST GAME OVER" button in GameScene
# GameOverScene should load with random test statistics
# Score and wave should display correctly
# Restart button should reload GameScene with same chapter
# Menu button should return to MenuScene
# UI should match dark mode theme
# All buttons should have hover effects
```

All tests pass:
- ✅ TypeScript compiles without errors
- ✅ ESLint passes with no warnings
- ✅ Scene registered in main.ts
- ✅ Game over can be triggered from GameScene
- ✅ Statistics display correctly
- ✅ Restart functionality works
- ✅ Menu navigation works
- ✅ UI matches dark mode theme

## Next Story
Epic 2.1: Hero System (Phase 2 - Core Gameplay Mechanics)
