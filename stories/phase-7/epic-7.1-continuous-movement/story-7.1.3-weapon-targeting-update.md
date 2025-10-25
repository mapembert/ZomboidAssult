# Story: Update Weapon Targeting for Continuous Movement

**Epic:** Epic 7.1 - Continuous Hero Movement System
**Story ID:** 7.1.3
**Priority:** High
**Points:** 3
**Status:** Draft

## Description

Verify and update the weapon targeting system to work accurately with continuous hero movement from Stories 7.1.1 and 7.1.2. While the WeaponSystem already receives positions as `{x, y}` coordinates and should theoretically work with continuous positions, this story ensures projectiles fire accurately from moving heroes, handles edge cases, and optimizes performance for continuous position updates.

The weapon system currently fires projectiles from hero positions provided by `HeroManager.getHeroPositions()`. With continuous movement, hero positions will update every frame instead of only when switching columns. This story verifies accuracy, tests edge cases (firing while moving, rapid position changes), and ensures no performance degradation.

## Acceptance Criteria

### Functional Requirements

- [ ] Projectiles fire from accurate hero X positions during continuous movement
- [ ] Projectiles fire correctly when heroes are moving (not just stationary)
- [ ] Multiple projectiles from same hero maintain proper spacing during movement
- [ ] Projectile firing remains accurate across full screen width (left edge to right edge)
- [ ] Weapon fire rate is not affected by hero movement
- [ ] Projectile trajectories are correct regardless of hero movement direction
- [ ] Hero position sampling for firing is consistent (no frame-timing issues)

### Technical Requirements

- [ ] Code follows TypeScript strict mode standards
- [ ] Maintains 60 FPS with heroes moving and firing continuously
- [ ] No memory leaks or performance degradation
- [ ] Position data is sampled at correct timing (during fire, not stale data)
- [ ] No floating-point precision errors in projectile spawn positions
- [ ] WeaponSystem efficiently handles position updates every frame

### Game Design Requirements

- [ ] Projectiles visually appear to fire from hero positions (no offset or lag)
- [ ] Firing feels accurate and responsive during movement
- [ ] No visual artifacts (projectiles spawning in wrong positions)
- [ ] Weapon behavior is consistent across all weapon tiers

## Technical Specifications

### Files to Create/Modify

**New Files:**

- None (verification and testing story)

**Modified Files:**

- `src/systems/WeaponSystem.ts` - Verify position sampling, add validation, potential optimization
- `src/systems/HeroManager.ts` - Verify `getHeroPositions()` returns up-to-date positions
- `src/scenes/GameScene.ts` - Verify weapon firing integration with continuous movement

### Class/Interface Definitions

```typescript
// WeaponSystem (verify existing implementation)
class WeaponSystem {
  /**
   * Fire projectiles from multiple positions (hero positions)
   * This method should already work with continuous positions
   */
  fire(positions: { x: number; y: number }[]): void;

  /**
   * Fire projectiles from a single position
   * Verify position parameter is used correctly
   */
  private fireFromPosition(x: number, y: number): void;
}

// HeroManager (verify position data)
class HeroManager {
  /**
   * Get positions of all heroes (for weapon firing)
   * Verify this returns current frame's positions (not cached/stale)
   */
  getHeroPositions(): { x: number; y: number }[];
}

// Projectile (verify spawn position)
class Projectile extends Phaser.GameObjects.Graphics {
  /**
   * Launch projectile from specific position
   * Verify position is set correctly on spawn
   */
  launch(x: number, y: number, velocityY: number, config: ProjectileConfig): void;
}
```

### Integration Points

**Scene Integration:**

- `GameScene.ts`: Verify `weaponSystem.fire(heroManager.getHeroPositions())` is called correctly in update loop
- Ensure weapon firing happens after hero position updates in the frame

**System Dependencies:**

- `HeroManager`: Provides current hero positions (must be up-to-date after movement)
- `WeaponSystem`: Consumes positions and spawns projectiles
- `Projectile`: Spawns at provided positions

**Event Communication:**

- No new events required
- Verify existing events still work (projectile_fire sound, etc.)

## Implementation Tasks

### Dev Agent Record

**Tasks:**

- [ ] Review `WeaponSystem.fire()` method to verify position parameter usage
- [ ] Review `WeaponSystem.fireFromPosition()` to verify X position is correctly passed to projectiles
- [ ] Review `Projectile.launch()` to verify spawn position is set accurately
- [ ] Review `HeroManager.getHeroPositions()` to confirm it returns live hero positions (not cached)
- [ ] Verify `GameScene.update()` calls hero update before weapon fire (correct order)
- [ ] Add position validation in `WeaponSystem.fire()` (optional: log warnings for invalid positions)
- [ ] Test projectile firing while heroes are stationary at various X positions
- [ ] Test projectile firing while heroes are moving left continuously
- [ ] Test projectile firing while heroes are moving right continuously
- [ ] Test projectile firing during rapid direction changes (left→right→left)
- [ ] Test projectile firing at extreme positions (near left boundary, near right boundary)
- [ ] Test projectile spacing consistency during movement (multi-projectile weapons)
- [ ] Verify no visual lag between hero position and projectile spawn position
- [ ] Performance test: 10+ heroes moving and firing continuously (60 FPS maintained)
- [ ] Performance test: Measure `getHeroPositions()` execution time (should be < 0.1ms)
- [ ] Edge case test: Fire immediately after rapid drag input change
- [ ] Visual regression test: Compare projectile accuracy before/after continuous movement

**Debug Log:**
| Task | File | Change | Reverted? |
|------|------|--------|-----------|
| | | | |

**Completion Notes:**

<!-- Only note deviations from requirements, keep under 50 words -->

**Change Log:**

<!-- Only requirement changes during implementation -->

## Game Design Context

**GDD Reference:** Weapon System Integration (Phase 7 Continuous Movement)

**Game Mechanic:** Projectile Firing from Continuous Positions

**Player Experience Goal:** Players should perceive projectiles as firing directly from hero positions with zero visual lag or offset. Firing should feel accurate and responsive regardless of hero movement state. The weapon system should be transparent to continuous movement changes.

**Balance Parameters:**

- No balance changes required (weapon stats unchanged)
- Verify existing parameters work correctly:
  - Projectile spacing: 15px (horizontal spread for multi-projectile weapons)
  - Fire rate: Per weapon tier (0.1s to 0.5s)
  - Projectile speed: Per weapon tier (600-1200 px/s)

## Testing Requirements

### Unit Tests

**Test Files:**

- `tests/systems/WeaponSystem.test.ts`
- `tests/systems/HeroManager.test.ts`

**Test Scenarios:**

- `getHeroPositions()` returns array with correct number of positions (matching hero count)
- `getHeroPositions()` returns positions matching individual hero x/y properties
- `fire()` spawns projectiles at provided positions (no offset)
- `fireFromPosition()` correctly uses x parameter for projectile spawn
- Projectile spacing calculation works correctly at any X position
- Position data is not stale (fresh positions each call)

### Game Testing

**Manual Test Cases:**

1. **Stationary Firing Test**
   - Expected: Projectiles fire from hero positions at various X positions (left, center, right)
   - Performance: Visual alignment is perfect (no offset)
   - Verification: Position heroes at x=100, x=360, x=620, verify projectiles spawn at those exact X positions

2. **Moving While Firing Test**
   - Expected: Projectiles fire from current hero position even while moving
   - Performance: No visual lag between hero movement and projectile spawn
   - Verification: Drag heroes left while holding fire, projectiles should follow hero position

3. **Rapid Movement Firing Test**
   - Expected: Projectiles fire accurately during rapid left/right movement changes
   - Edge Case: Direction change mid-fire doesn't cause projectile position errors
   - Verification: Rapidly alternate left/right keyboard input while firing, verify projectiles spawn correctly

4. **Boundary Position Firing Test**
   - Expected: Projectiles fire correctly when heroes are at movement boundaries
   - Edge Case: Firing at minX and maxX positions works without clipping or offset
   - Verification: Move heroes to left boundary, fire. Move to right boundary, fire. Check accuracy.

5. **Multi-Hero Firing Test**
   - Expected: With 10+ heroes, all projectiles fire from accurate positions
   - Performance: No performance degradation with many heroes moving and firing
   - Verification: Max out heroes (20), move continuously, fire continuously, verify 60 FPS and accuracy

6. **Multi-Projectile Weapon Test**
   - Expected: Tier 3+ weapons fire multiple projectiles with correct spacing from moving heroes
   - Performance: Spacing remains consistent during movement
   - Verification: Upgrade to tier 3 (3 projectiles), move while firing, verify spacing is 15px

### Performance Tests

**Metrics to Verify:**

- Frame rate maintains 60 FPS with heroes moving and firing continuously
- `getHeroPositions()` executes in < 0.1ms (array mapping should be fast)
- No garbage collection spikes from position array creation (reuse if needed)
- Projectile spawn overhead remains constant (< 0.5ms per spawn)
- Total weapon system update time < 2ms per frame (even with 20 heroes firing)

## Dependencies

**Story Dependencies:**

- **7.1.1**: Continuous Hero Movement (MUST be completed first)
  - Heroes must have continuous X positions
  - `HeroManager.repositionHeroes()` must update hero positions continuously
- **7.1.2**: Drag-to-Move Input System (RECOMMENDED to be completed first)
  - Enables testing firing during actual movement
  - Can test with keyboard input if not completed

**Technical Dependencies:**

- `WeaponSystem.ts`: Existing weapon system
- `HeroManager.ts`: Existing hero manager
- `Projectile.ts`: Existing projectile entity
- `GameScene.ts`: Existing game scene

**Asset Dependencies:**

- No new assets required
- Existing projectile graphics and weapon configurations

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Unit tests written and passing
- [ ] Manual game testing completed across all scenarios
- [ ] Performance targets met (60 FPS)
- [ ] No linting errors
- [ ] Projectiles fire accurately from moving heroes
- [ ] No visual lag or offset between hero position and projectile spawn
- [ ] Weapon system performs efficiently with continuous position updates
- [ ] All weapon tiers tested and verified working
- [ ] Edge cases tested (boundaries, rapid movement, multi-projectiles)
- [ ] No regression in existing weapon functionality

## Notes

**Implementation Notes:**

- Current `getHeroPositions()` implementation (lines 178-183 in HeroManager.ts) uses `.map()` to create new array each call
  - This should be fine for performance (< 0.1ms for 20 heroes)
  - If performance issues arise, consider caching positions and invalidating on movement
- `WeaponSystem.fire()` already accepts `positions: {x, y}[]` array (line 63)
- `fireFromPosition()` already uses x parameter correctly (lines 88-89)
- `Projectile.launch()` should already set position correctly (verify in testing)
- The integration should "just work" if Stories 7.1.1 and 7.1.2 are implemented correctly

**Design Decisions:**

- **No position caching**: Hero positions are sampled fresh each fire call. Simpler and more accurate.
- **No special handling needed**: Weapon system is agnostic to discrete vs continuous movement (position-based API).
- **Verification over modification**: This story is primarily verification and testing rather than major code changes.

**Future Considerations:**

- If performance profiling shows `getHeroPositions()` is a bottleneck, consider:
  - Caching position array and invalidating on hero movement
  - Using a pre-allocated array to avoid garbage collection
- Consider adding visual debug mode showing projectile spawn points (useful for troubleshooting)
- Future weapons might need special handling for continuous movement (e.g., spread patterns based on movement direction)

**Expected Outcome:**

This story should require minimal code changes. The existing weapon system API is already position-based, so it should work transparently with continuous movement. The value of this story is:
1. **Verification**: Confirming the integration works correctly
2. **Testing**: Comprehensive testing of edge cases and scenarios
3. **Performance**: Ensuring no degradation with continuous updates
4. **Documentation**: Capturing the integration verification for future reference

If testing reveals issues, additional implementation tasks will be added to address them.
