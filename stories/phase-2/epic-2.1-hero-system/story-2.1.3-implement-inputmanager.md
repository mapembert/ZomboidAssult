# Story 2.1.3: Implement InputManager

**Epic:** 2.1 Hero System
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 3 hours
**Status:** ✅ COMPLETED

## Description
Create `src/systems/InputManager.ts` to abstract player input from both keyboard (Arrow keys, A/D) and touch (left/right screen zones). Provides simple boolean methods isMovingLeft() and isMovingRight() that work seamlessly across desktop and mobile platforms.

## Tasks
- [x] Create `src/systems/InputManager.ts` class
- [x] Set up keyboard input (Arrow Left/Right, A/D keys)
- [x] Set up touch input zones (left half / right half of screen)
- [x] Implement isMovingLeft() method
- [x] Implement isMovingRight() method
- [x] Handle both input methods simultaneously
- [x] Add visual debug zones (optional, togglable)
- [x] Ensure no input conflicts or lag

## Acceptance Criteria
- [x] Keyboard input works on desktop (Arrow keys and A/D)
- [x] Touch zones work on mobile (left half = left, right half = right)
- [x] isMovingLeft() returns true when left input detected
- [x] isMovingRight() returns true when right input detected
- [x] No input lag (< 16ms response time)
- [x] Both input methods can work simultaneously
- [x] Input state updates every frame
- [x] Touch zones cover full screen height

## Files Created/Modified
- `src/systems/InputManager.ts` ✅ Created

## Dependencies
- Phaser 3 Input system (built-in)
- Story 1.1.2: Create Phaser Game Instance (game must be running)

## Implementation Details

### Keyboard Input
Uses Phaser's keyboard input system:
- Cursor keys (Arrow Left/Right)
- WASD alternative (A/D keys)
- Polled each frame via isDown property

### Touch Input Zones
Two invisible zones covering screen halves:
- Left zone: 0 to screenWidth/2 (360px)
- Right zone: screenWidth/2 to screenWidth (360px-720px)
- Full screen height (0 to 1280px)
- Behind all other UI elements (depth: -1)

### Class Implementation
```typescript
class InputManager {
  private scene: Phaser.Scene;
  private cursors: CursorKeys | null;
  private leftKey: Key | null;
  private rightKey: Key | null;
  private touchZones: { left: Zone, right: Zone } | null;
  private touchLeft: boolean;
  private touchRight: boolean;

  constructor(scene)
  isMovingLeft(): boolean
  isMovingRight(): boolean
  showDebugZones(show: boolean): void
  update(): void
  destroy(): void
}
```

## Testing Results
✅ TypeScript compiles without errors
✅ ESLint passes with no warnings
✅ Keyboard input works (Arrow keys and A/D)
✅ Touch zones properly sized and positioned
✅ No input lag detected
✅ Debug visualization works
✅ Proper cleanup on destroy

## Next Story
Story 2.1.4: Integrate Hero Movement in GameScene
