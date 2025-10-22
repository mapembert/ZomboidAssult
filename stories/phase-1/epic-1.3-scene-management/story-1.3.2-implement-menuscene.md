# Story 1.3.2: Implement MenuScene

**Epic:** 1.3 Basic Scene Management
**Phase:** 1 - Foundation (Days 1-2)
**Estimated Time:** 3 hours
**Status:** ✅ COMPLETED

## Description
Create `src/scenes/MenuScene.ts` to display game title "Zomboid Assult", show chapter list with names and descriptions, implement "Start Chapter" button, and pass selected ChapterData to GameScene.

## Tasks
- [x] Create `src/scenes/MenuScene.ts`
- [x] Display game title "Zomboid Assult"
- [x] Show chapter list with names and descriptions
- [x] Implement "Start Chapter" button
- [x] Pass selected ChapterData to GameScene

## Acceptance Criteria
- [x] All chapters listed
- [x] Clicking chapter starts GameScene
- [x] Chapter data passed correctly
- [x] UI matches dark mode theme

## Files Created/Modified
- `src/scenes/MenuScene.ts`

## Dependencies
- Story 1.3.1: Implement BootScene (required to transition from BootScene)
- Story 1.2.2: Implement ConfigLoader System (required for chapter data)

## Implementation Details
MenuScene provides the main menu interface:
1. Displays the game title prominently
2. Lists all available chapters with their descriptions
3. Allows player to select a chapter
4. Transitions to GameScene with selected chapter data
5. Follows dark mode color scheme (#121212 background, #03DAC6 accents)

## UI Layout
- **Top:** Game title "Zomboid Assult"
- **Center:** Chapter selection list (scrollable if needed)
- **Each Chapter:** Name, description, and start button
- **Theme:** Dark background with cyan accents

## Testing
```bash
npm run dev
# MenuScene should load after BootScene
# All chapters should be visible
# Clicking a chapter should start GameScene
# Chapter data should be passed correctly
```

## Next Story
Story 1.3.3: Create Placeholder GameScene
