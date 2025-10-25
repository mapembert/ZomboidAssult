# Story: Implement Drag-to-Move Input System

**Epic:** Epic 7.1 - Continuous Hero Movement System
**Story ID:** 7.1.2
**Priority:** High
**Points:** 4
**Status:** Draft

## Description

Replace the discrete left/right input system with continuous drag-to-move controls for mobile and smooth keyboard movement for desktop. Instead of binary left/right toggle inputs, the InputManager should provide continuous X-position targets that map directly to screen coordinates. This enables precise hero positioning and creates intuitive touch controls for mobile players while maintaining responsive keyboard controls for desktop.

Currently, InputManager returns boolean values for `isMovingLeft()` and `isMovingRight()`. This story refactors InputManager to provide continuous target X positions based on:
- **Touch/Mouse Drag**: Direct position mapping (drag finger/mouse to move heroes to that X position)
- **Keyboard**: Smooth continuous movement (hold A/D or arrow keys for continuous slide)

## Acceptance Criteria

### Functional Requirements

- [ ] Pointer/touch drag moves heroes to the dragged X position on screen
- [ ] Drag starts when pointer is pressed and held (pointerdown)
- [ ] Drag updates continuously while pointer is held and moved (pointermove)
- [ ] Drag ends when pointer is released (pointerup)
- [ ] Keyboard (A/D, Arrow keys) provides continuous movement velocity instead of discrete toggles
- [ ] Holding left key moves heroes continuously left at constant velocity
- [ ] Holding right key moves heroes continuously right at constant velocity
- [ ] Releasing movement key smoothly decelerates heroes to stop
- [ ] InputManager provides `getTargetX(): number | null` method for HeroManager
- [ ] InputManager provides `getMovementVelocity(): number` method as alternative input
- [ ] Input system is responsive (< 50ms input-to-feedback delay)

### Technical Requirements

- [ ] Code follows TypeScript strict mode standards
- [ ] Maintains 60 FPS during continuous input updates
- [ ] No memory leaks or performance degradation
- [ ] Input coordinates correctly map to game world coordinates
- [ ] Touch zones removed (replaced with full-screen drag area)
- [ ] Input smoothing prevents jitter on low-precision touch devices
- [ ] Keyboard input uses configurable velocity multiplier

### Game Design Requirements

- [ ] Drag controls feel natural and intuitive on mobile
- [ ] Keyboard movement feels responsive but controllable
- [ ] Input deadzone prevents accidental micro-adjustments
- [ ] Visual feedback clearly indicates active drag state (Story 7.3.2 will add visuals)
- [ ] Input system works seamlessly with hero movement physics from Story 7.1.1

## Technical Specifications

### Files to Create/Modify

**New Files:**

- None (refactoring existing InputManager)

**Modified Files:**

- `src/systems/InputManager.ts` - Replace boolean left/right input with continuous position/velocity methods, add drag detection and tracking
- `src/scenes/GameScene.ts` - Update input polling to use new continuous input methods (`getTargetX()` or `getMovementVelocity()`)
- `public/config/game-settings.json` - Add input configuration (keyboard velocity, deadzone, smoothing)

### Class/Interface Definitions

```typescript
// Updated InputManager system
class InputManager {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
  private leftKey: Phaser.Input.Keyboard.Key | null;
  private rightKey: Phaser.Input.Keyboard.Key | null;

  // New drag input properties
  private isDragging: boolean;
  private dragStartX: number | null;
  private currentDragX: number | null;
  private dragZone: Phaser.GameObjects.Zone | null;

  // Configuration
  private keyboardVelocity: number; // Pixels per second when key held
  private inputDeadzone: number; // Minimum drag distance to register (pixels)
  private smoothingFactor: number; // Input smoothing (0-1, higher = more smoothing)

  // Smoothed values
  private smoothedDragX: number | null;

  constructor(scene: Phaser.Scene);

  /**
   * Get target X position from drag input (null if not dragging)
   * Used for direct position control
   */
  getTargetX(): number | null;

  /**
   * Get movement velocity from keyboard input
   * Returns: negative (moving left), positive (moving right), 0 (no input)
   * Used for velocity-based control
   */
  getMovementVelocity(): number;

  /**
   * Check if user is currently dragging
   */
  isDraggingActive(): boolean;

  /**
   * Setup pointer/touch drag input
   */
  private setupDragInput(): void;

  /**
   * Handle pointer down event
   */
  private onPointerDown(pointer: Phaser.Input.Pointer): void;

  /**
   * Handle pointer move event
   */
  private onPointerMove(pointer: Phaser.Input.Pointer): void;

  /**
   * Handle pointer up event
   */
  private onPointerUp(pointer: Phaser.Input.Pointer): void;

  /**
   * Apply input smoothing to reduce jitter
   */
  private smoothInput(targetX: number): number;

  /**
   * Update method called each frame
   */
  update(delta: number): void;
}

// Updated GameSettings interface
interface GameSettings {
  // ... existing fields ...
  input: {
    keyboardVelocity: number; // Pixels per second for keyboard movement
    dragDeadzone: number; // Minimum drag distance in pixels
    inputSmoothing: number; // Smoothing factor 0-1 (0 = no smoothing, 1 = max smoothing)
  };
}
```

### Integration Points

**Scene Integration:**

- `GameScene.ts`: Update `update()` loop to get continuous input from InputManager
- `GameScene.ts`: Call `heroManager.setTargetX(inputManager.getTargetX())` when dragging
- `GameScene.ts`: Alternative: Use velocity-based input with `heroManager.setVelocity(inputManager.getMovementVelocity())`

**System Dependencies:**

- `HeroManager`: Receives target X position or velocity from InputManager
- `Hero`: No direct dependency (HeroManager handles position updates)

**Event Communication:**

- Emits: `input_drag_start` when drag begins (for visual feedback in Story 7.3.2)
- Emits: `input_drag_end` when drag ends (for visual feedback)
- Emits: `input_drag_move` with X position during drag (optional, for debug/feedback)

## Implementation Tasks

### Dev Agent Record

**Tasks:**

- [ ] Remove old touch zone system from `InputManager.ts` (left/right half zones)
- [ ] Add drag input properties to InputManager (`isDragging`, `dragStartX`, `currentDragX`, `smoothedDragX`)
- [ ] Implement `setupDragInput()` to create full-screen interactive zone
- [ ] Implement `onPointerDown(pointer)` to start drag tracking (store start position)
- [ ] Implement `onPointerMove(pointer)` to update drag position (with deadzone check)
- [ ] Implement `onPointerUp(pointer)` to end drag tracking (clear drag state)
- [ ] Implement `smoothInput(targetX)` using linear interpolation for smoothing
- [ ] Implement `getTargetX()` to return smoothed drag X position (or null if not dragging)
- [ ] Update keyboard input handling to return velocity instead of boolean
- [ ] Implement `getMovementVelocity()` using keyboard state and configured velocity
- [ ] Add `isDraggingActive()` helper method
- [ ] Update `InputManager.update(delta)` to apply smoothing each frame
- [ ] Remove deprecated `isMovingLeft()` and `isMovingRight()` methods
- [ ] Add input configuration to `GameSettings` interface in `ConfigTypes.ts`
- [ ] Update `public/config/game-settings.json` with input settings (keyboardVelocity: 600, dragDeadzone: 5, inputSmoothing: 0.2)
- [ ] Update `GameScene.ts` to use new input methods with HeroManager
- [ ] Add input event emissions for drag start/end/move
- [ ] Test drag input on touch device (smooth position tracking)
- [ ] Test keyboard velocity input (continuous smooth movement)
- [ ] Test input smoothing (no jitter on rapid touch movements)
- [ ] Test deadzone (ignores small accidental drags < 5px)
- [ ] Performance testing (60 FPS maintained with continuous input)

**Debug Log:**
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| | | | |

**Completion Notes:**

<!-- Only note deviations from requirements, keep under 50 words -->

**Change Log:**

<!-- Only requirement changes during implementation -->

## Game Design Context

**GDD Reference:** Core Gameplay Mechanics - Continuous Movement Input (Phase 7)

**Game Mechanic:** Drag-to-Move Input System

**Player Experience Goal:** Players should feel direct, 1:1 control over hero positioning. Touch input should feel like directly "grabbing" and moving the heroes. Keyboard input should provide smooth, consistent movement without discrete snapping. The input system should be immediately intuitive without tutorial for mobile players.

**Balance Parameters:**

- `keyboardVelocity`: 600 pixels/second (slower than max hero speed of 800, allows for acceleration feel)
- `dragDeadzone`: 5 pixels (prevents tiny accidental movements)
- `inputSmoothing`: 0.2 (20% smoothing, balances responsiveness vs jitter reduction)

## Testing Requirements

### Unit Tests

**Test Files:**

- `tests/systems/InputManager.test.ts`

**Test Scenarios:**

- `getTargetX()` returns null when not dragging
- `getTargetX()` returns pointer X position when dragging
- Drag starts only after moving beyond deadzone threshold
- `getMovementVelocity()` returns negative value when left key pressed
- `getMovementVelocity()` returns positive value when right key pressed
- `getMovementVelocity()` returns 0 when no keys pressed
- Input smoothing reduces jitter in rapid position changes
- Pointer up event clears drag state

### Game Testing

**Manual Test Cases:**

1. **Touch Drag Test (Mobile)**
   - Expected: Dragging finger moves heroes to finger position smoothly
   - Performance: No lag between finger position and hero movement
   - Verification: Drag across full screen width, heroes follow continuously

2. **Keyboard Continuous Movement Test (Desktop)**
   - Expected: Holding A/D moves heroes continuously at constant speed
   - Performance: Movement speed is consistent (600 px/s)
   - Verification: Hold A key for 1 second, measure distance traveled (~600px)

3. **Input Smoothing Test**
   - Expected: Rapid jerky finger movements result in smooth hero movement
   - Edge Case: Quick back-and-forth drag doesn't cause jitter
   - Verification: Drag finger in zigzag pattern, heroes move smoothly

4. **Deadzone Test**
   - Expected: Small drags (< 5px) don't trigger movement
   - Edge Case: Tapping screen briefly doesn't move heroes
   - Verification: Tap screen without dragging, heroes stay in place

5. **Cross-Platform Input Test**
   - Expected: Drag works on iOS/Android, keyboard works on desktop
   - Performance: Both input methods feel responsive and natural
   - Verification: Test on multiple devices/browsers

### Performance Tests

**Metrics to Verify:**

- Frame rate maintains 60 FPS during continuous drag input
- Input processing completes in < 0.5ms per frame
- No garbage collection during drag (input doesn't allocate new objects each frame)
- Smooth input transitions (no visible stuttering or lag)

## Dependencies

**Story Dependencies:**

- **7.1.1**: Continuous Hero Movement (MUST be completed first)
  - HeroManager must have `setTargetX()` or velocity-based movement methods
  - Hero must support continuous X positioning

**Technical Dependencies:**

- `InputManager.ts`: Existing input system
- Phaser 3 Input System: Pointer events, keyboard keys
- `GameSettings`: Configuration structure

**Asset Dependencies:**

- No new assets required
- Configuration file: `public/config/game-settings.json`

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Unit tests written and passing
- [ ] Manual game testing completed on mobile and desktop
- [ ] Performance targets met (60 FPS)
- [ ] No linting errors
- [ ] Configuration file updated with input parameters
- [ ] Drag-to-move works smoothly on touch devices
- [ ] Keyboard movement is smooth and continuous
- [ ] Input smoothing prevents jitter
- [ ] Deadzone prevents accidental micro-movements
- [ ] Old discrete left/right input methods removed
- [ ] GameScene updated to use new input methods

## Notes

**Implementation Notes:**

- Use Phaser's built-in pointer tracking: `scene.input.on('pointerdown', callback)`
- Store pointer.x directly for drag position (already in screen coordinates)
- Smoothing formula: `smoothedX = smoothedX + (targetX - smoothedX) * smoothingFactor`
- Keyboard velocity should be negative for left (-600), positive for right (+600)
- Consider clamping drag X to screen bounds in InputManager (prevents invalid positions)
- Input smoothing should run in `update()` method using delta time

**Design Decisions:**

- **Full-screen drag zone**: Entire screen is draggable (no restricted zones). Simplifies mobile UX.
- **Velocity vs Position input**: Keyboard provides velocity, drag provides position. Allows different feel for different input methods.
- **Smoothing applied in InputManager**: Keeps HeroManager simple. InputManager handles raw input quality.
- **Deadzone on drag**: Prevents accidental movement when user taps pause button or UI elements near gameplay area.

**Future Considerations:**

- Story 7.3.2 will add visual drag indicator (line or ghost hero showing drag target)
- May want to add haptic feedback on mobile for drag start/end
- Consider adding "snap to center" gesture (double-tap to center heroes)
- Could add input sensitivity multiplier for accessibility options
- Future: Multi-touch support for additional controls (e.g., drag to move + tap to pause)
