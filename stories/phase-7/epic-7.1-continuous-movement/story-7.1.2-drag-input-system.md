# Story: Implement Drag-to-Column Input System

**Epic:** Epic 7.1 - Smooth Hero Movement System
**Story ID:** 7.1.2
**Priority:** High
**Points:** 4
**Status:** Draft

## Description

Replace the discrete left/right input system with column-snapping drag controls for mobile and smooth keyboard movement for desktop. Instead of binary left/right toggle inputs, the InputManager should map drag positions and keyboard input to the nearest of 12 discrete column positions (0-11). This enables intuitive touch controls while maintaining the alignment benefits of discrete positioning for better zomboid targeting.

Currently, InputManager returns boolean values for `isMovingLeft()` and `isMovingRight()`. This story refactors InputManager to provide target column indices based on:
- **Touch/Mouse Drag**: Drag position snaps to nearest column (drag finger/mouse to move heroes to that column)
- **Keyboard**: Column-by-column movement (hold A/D or arrow keys to move between columns)

## Acceptance Criteria

### Functional Requirements

- [ ] Pointer/touch drag snaps heroes to nearest column position (0-11)
- [ ] Drag position is mapped to closest column based on X coordinate
- [ ] Drag starts when pointer is pressed and held (pointerdown)
- [ ] Drag updates to new column while pointer is held and moved (pointermove)
- [ ] Drag ends when pointer is released (pointerup)
- [ ] Keyboard (A/D, Arrow keys) increments/decrements target column
- [ ] Holding left key moves heroes left one column at a time with key repeat
- [ ] Holding right key moves heroes right one column at a time with key repeat
- [ ] Heroes smoothly animate between column positions (handled by HeroManager)
- [ ] InputManager provides `getTargetColumn(): number | null` method for HeroManager
- [ ] InputManager provides column index (0-11) based on current input state
- [ ] Input system is responsive (< 50ms input-to-feedback delay)
- [ ] Column snapping improves alignment with zomboid positions

### Technical Requirements

- [ ] Code follows TypeScript strict mode standards
- [ ] Maintains 60 FPS during input updates
- [ ] No memory leaks or performance degradation
- [ ] Drag X coordinates correctly map to nearest column index (0-11)
- [ ] Column calculation uses same logic as HeroManager (consistent positioning)
- [ ] Touch zones removed (replaced with full-screen drag area)
- [ ] Input snapping provides stable column selection (no flickering between columns)
- [ ] Keyboard input increments/decrements column with proper boundary clamping (0-11)

### Game Design Requirements

- [ ] Drag controls feel natural and intuitive on mobile
- [ ] Column snapping provides clear, predictable positioning
- [ ] Keyboard movement feels responsive (column-by-column stepping)
- [ ] Input deadzone prevents accidental column switches during small drags
- [ ] 12 columns provide sufficient granularity for intuitive drag control
- [ ] Column alignment aids in targeting zomboids effectively
- [ ] Visual feedback clearly indicates target column (Story 7.3.2 will add visuals)
- [ ] Input system works seamlessly with 12-column movement from Story 7.1.1

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

  // Column-based input properties
  private readonly COLUMN_COUNT = 12;
  private isDragging: boolean;
  private dragStartX: number | null;
  private currentDragColumn: number | null; // Column index (0-11) from drag
  private dragZone: Phaser.GameObjects.Zone | null;

  // Column calculation (shared with HeroManager)
  private columnPositions: number[]; // X positions of each column
  private screenWidth: number;
  private boundaryPadding: number;

  // Configuration
  private inputDeadzone: number; // Minimum drag distance to register column change
  private keyRepeatDelay: number; // Delay before key repeat starts (ms)
  private keyRepeatRate: number; // Key repeat rate (ms between repeats)

  constructor(scene: Phaser.Scene);

  /**
   * Get target column from current input (drag or keyboard)
   * Returns column index 0-11, or null if no active input
   */
  getTargetColumn(): number | null;

  /**
   * Map screen X position to nearest column index
   * Used for drag input and column snapping
   */
  private xPositionToColumn(x: number): number;

  /**
   * Check if user is currently dragging
   */
  isDraggingActive(): boolean;

  /**
   * Setup pointer/touch drag input
   */
  private setupDragInput(): void;

  /**
   * Calculate column positions (same algorithm as HeroManager)
   */
  private calculateColumnPositions(): void;

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
   * Handle keyboard input for column-by-column movement
   */
  private handleKeyboardInput(): number | null;

  /**
   * Update method called each frame
   */
  update(delta: number): void;
}

// Updated GameSettings interface
interface GameSettings {
  // ... existing fields ...
  input: {
    dragDeadzone: number; // Minimum drag distance in pixels to register column change
    keyRepeatDelay: number; // Delay before key repeat (milliseconds)
    keyRepeatRate: number; // Time between key repeats (milliseconds)
  };
}
```

### Integration Points

**Scene Integration:**

- `GameScene.ts`: Update `update()` loop to get column input from InputManager
- `GameScene.ts`: Call `heroManager.setTargetColumn(inputManager.getTargetColumn())` when input is active
- `GameScene.ts`: Input system provides discrete column indices (0-11)

**System Dependencies:**

- `HeroManager`: Receives target column index from InputManager
- `Hero`: No direct dependency (HeroManager handles column-to-position conversion and interpolation)
- Column calculation must be consistent between InputManager and HeroManager

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

**Player Experience Goal:** Players should feel direct, intuitive control over hero positioning through column selection. Touch input should snap to clear, predictable column positions that align with zomboid lanes. Keyboard input should provide responsive column-by-column stepping. The 12-column system balances granular control with automatic alignment for better targeting, without requiring tutorial.

**Balance Parameters:**

- `dragDeadzone`: 5 pixels (prevents accidental column switches during small movements)
- `keyRepeatDelay`: 150 milliseconds (delay before key repeat kicks in)
- `keyRepeatRate`: 100 milliseconds (time between column steps when holding key)

## Testing Requirements

### Unit Tests

**Test Files:**

- `tests/systems/InputManager.test.ts`

**Test Scenarios:**

- `getTargetColumn()` returns null when not dragging and no keyboard input
- `getTargetColumn()` returns correct column index (0-11) when dragging
- `xPositionToColumn()` correctly maps X coordinates to nearest column
- Drag starts only after moving beyond deadzone threshold
- Column index increments when right key pressed (clamped to 11)
- Column index decrements when left key pressed (clamped to 0)
- Pointer up event clears drag state
- Column positions match HeroManager's column positions exactly

### Game Testing

**Manual Test Cases:**

1. **Touch Drag Column Snap Test (Mobile)**
   - Expected: Dragging finger snaps heroes to nearest column position
   - Performance: Column selection is responsive and predictable
   - Verification: Drag across screen, heroes snap to each of 12 columns

2. **Keyboard Column Stepping Test (Desktop)**
   - Expected: Holding A/D moves heroes column-by-column with key repeat
   - Performance: Column steps are consistent and responsive
   - Verification: Hold right key, verify heroes step through columns 0→1→2...→11

3. **Column Alignment Test**
   - Expected: Drag and keyboard input result in identical column positions
   - Edge Case: InputManager and HeroManager column calculations match
   - Verification: Drag to column 5, then use keyboard, verify same X position

4. **Deadzone Test**
   - Expected: Small drags (< 5px) within same column don't trigger column change
   - Edge Case: Tapping screen briefly doesn't switch columns
   - Verification: Tap screen near column boundary, heroes stay in current column

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
- Calculate column positions using same algorithm as HeroManager (consistency critical)
- Column mapping formula: `columnIndex = Math.round((x - padding) / columnSpacing)`
- Keyboard increments/decrements column index with boundary clamping (0-11)
- Use Phaser's key repeat events for smooth keyboard column stepping
- Deadzone prevents column flicker when dragging near column boundaries

**Design Decisions:**

- **Full-screen drag zone**: Entire screen is draggable (no restricted zones). Simplifies mobile UX.
- **Column snapping**: Both drag and keyboard snap to same 12 discrete columns. Consistent behavior across input methods.
- **Instant column switch on drag**: Drag immediately snaps to column under finger (no smoothing delay in InputManager, smoothing happens in HeroManager)
- **Deadzone on drag**: Prevents accidental column switches when user taps or makes tiny adjustments.
- **Shared column logic**: InputManager and HeroManager use identical column calculation to ensure positions match perfectly.

**Future Considerations:**

- Story 7.3.2 will add visual drag indicator (line or ghost hero showing drag target)
- May want to add haptic feedback on mobile for drag start/end
- Consider adding "snap to center" gesture (double-tap to center heroes)
- Could add input sensitivity multiplier for accessibility options
- Future: Multi-touch support for additional controls (e.g., drag to move + tap to pause)
