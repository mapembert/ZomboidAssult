# Story: Update Weapon Targeting for 12-Column Movement

**Epic:** Epic 7.1 - Smooth Hero Movement System
**Story ID:** 7.1.3
**Priority:** High
**Points:** 3
**Status:** COMPLETED

## Description

Verify and update the weapon targeting system to work accurately with the 12-column discrete positioning system from Stories 7.1.1 and 7.1.2. While the WeaponSystem already receives positions as `{x, y}` coordinates and should theoretically work with any position scheme, this story ensures projectiles fire accurately from heroes as they smoothly animate between column positions, and validates the alignment benefits of the discrete column system.

The weapon system currently fires projectiles from hero positions provided by `HeroManager.getHeroPositions()`. With the 12-column system, heroes snap to discrete columns but smoothly interpolate between them visually. This story verifies that projectiles fire from the correct interpolated positions, tests edge cases (firing during column transitions), and confirms that column alignment improves targeting accuracy against zomboids.

## Acceptance Criteria

### Functional Requirements

- [ ] Projectiles fire from accurate hero X positions during column transitions
- [ ] Projectiles fire correctly when heroes are animating between columns
- [ ] Projectiles fire correctly when heroes are stationary at column positions
- [ ] Multiple projectiles from same hero maintain proper spacing during column changes
- [ ] Projectile firing remains accurate across all 12 column positions (0-11)
- [ ] Weapon fire rate is not affected by hero column changes or interpolation
- [ ] Projectile trajectories are correct regardless of current column or transition state
- [ ] Hero position sampling uses interpolated visual position (not just target column)
- [ ] Column-based positioning improves projectile alignment with zomboid lanes

### Technical Requirements

- [ ] Code follows TypeScript strict mode standards
- [ ] Maintains 60 FPS with heroes changing columns and firing
- [ ] No memory leaks or performance degradation
- [ ] Position data uses current interpolated X position (not just target column position)
- [ ] No floating-point precision errors in projectile spawn positions
- [ ] WeaponSystem efficiently handles smooth position updates during column transitions
- [ ] `getHeroPositions()` returns interpolated visual positions (current frame's rendered X)

### Game Design Requirements

- [ ] Projectiles visually appear to fire from current hero positions (no offset or lag)
- [ ] Firing feels accurate and responsive during column transitions
- [ ] Projectiles fire from smooth interpolated positions (not snapped to columns mid-animation)
- [ ] Column alignment benefits are evident (better hit rates when aligned with zomboids)
- [ ] No visual artifacts (projectiles spawning in wrong positions)
- [ ] Weapon behavior is consistent across all weapon tiers and all 12 columns

## Technical Specifications

### Files to Create/Modify

**New Files:**

- None (verification and testing story)

**Modified Files:**

- `src/systems/WeaponSystem.ts` - Verify position sampling, add validation, potential optimization
- `src/systems/HeroManager.ts` - Verify `getHeroPositions()` returns current interpolated positions (not just column positions)
- `src/scenes/GameScene.ts` - Verify weapon firing integration with 12-column movement system

### Class/Interface Definitions

```typescript
// WeaponSystem (verify existing implementation)
class WeaponSystem {
  /**
   * Fire projectiles from multiple positions (hero positions)
   * This method should work with both discrete columns and interpolated positions
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
   * IMPORTANT: Must return current interpolated visual positions (currentX)
   * NOT just target column positions, to ensure projectiles fire from visible hero location
   */
  getHeroPositions(): { x: number; y: number }[];

  /**
   * Get current interpolated X position (used during column transitions)
   */
  private getCurrentX(): number;
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
- Ensure weapon firing happens after hero position/interpolation updates in the frame
- Ensure `getHeroPositions()` returns interpolated X positions (not snapped column positions)

**System Dependencies:**

- `HeroManager`: Provides current interpolated hero positions (must reflect smooth animation state)
- `WeaponSystem`: Consumes positions and spawns projectiles
- `Projectile`: Spawns at provided positions
- Column system provides discrete alignment benefits while maintaining smooth visual firing

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

**GDD Reference:** Weapon System Integration (Phase 7 - 12-Column Movement)

**Game Mechanic:** Projectile Firing from Column-Based Positions with Smooth Interpolation

**Player Experience Goal:** Players should perceive projectiles as firing directly from hero positions with zero visual lag or offset. Firing should feel accurate and responsive during both column transitions and when stationary at columns. The discrete column system should provide noticeable alignment benefits with zomboid lanes, improving hit accuracy. The weapon system should seamlessly integrate with the smooth interpolation between columns.

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

2. **Column Transition Firing Test**
   - Expected: Projectiles fire from current interpolated position during column transitions
   - Performance: No visual lag between hero animation and projectile spawn
   - Verification: Fire continuously while moving between columns, projectiles spawn at smooth interpolated positions

3. **Rapid Column Change Firing Test**
   - Expected: Projectiles fire accurately during rapid column changes
   - Edge Case: Column change mid-fire doesn't cause projectile position errors or snapping
   - Verification: Rapidly switch columns (keyboard or drag) while firing, verify smooth projectile spawning

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

- **7.1.1**: 12-Column Hero Movement (MUST be completed first)
  - Heroes must have 12 discrete column positions with smooth interpolation
  - `HeroManager` must maintain both target column and interpolated currentX position
  - `getHeroPositions()` must return interpolated positions for accurate firing
- **7.1.2**: Drag-to-Column Input System (RECOMMENDED to be completed first)
  - Enables testing firing during column transitions and drag input
  - Can test with keyboard column stepping if not completed

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

- `getHeroPositions()` implementation must return interpolated `currentX` positions (not target column positions)
  - Use hero's visual position during smooth transitions for accurate projectile spawning
  - This should be fine for performance (< 0.1ms for 20 heroes)
  - If performance issues arise, consider caching positions and invalidating on movement
- `WeaponSystem.fire()` already accepts `positions: {x, y}[]` array
- `fireFromPosition()` already uses x parameter correctly
- `Projectile.launch()` should already set position correctly (verify in testing)
- The integration should "just work" if `getHeroPositions()` returns interpolated positions correctly
- Column-based positioning provides alignment with zomboid lanes, improving targeting effectiveness

**Design Decisions:**

- **Interpolated position firing**: Projectiles fire from smooth interpolated positions (not snapped column positions) to maintain visual accuracy
- **No special column handling in WeaponSystem**: Weapon system is agnostic to column logic (position-based API)
- **Column alignment benefits**: The 12-column discrete system naturally aligns heroes with zomboid lanes
- **Verification over modification**: This story is primarily verification and testing rather than major code changes.

**Future Considerations:**

- If performance profiling shows `getHeroPositions()` is a bottleneck, consider:
  - Caching position array and invalidating on hero movement
  - Using a pre-allocated array to avoid garbage collection
- Consider adding visual debug mode showing projectile spawn points (useful for troubleshooting)
- Future weapons might need special handling for continuous movement (e.g., spread patterns based on movement direction)

**Expected Outcome:**

This story should require minimal code changes. The existing weapon system API is already position-based, so it should work transparently with the 12-column movement system as long as `getHeroPositions()` returns interpolated visual positions. The value of this story is:
1. **Verification**: Confirming `getHeroPositions()` returns interpolated positions (not just column positions)
2. **Testing**: Comprehensive testing during column transitions and stationary positions
3. **Validation**: Confirming column alignment improves targeting accuracy
4. **Performance**: Ensuring no degradation with smooth interpolation updates
5. **Documentation**: Capturing the integration verification for future reference

Key validation: Projectiles must fire from smooth interpolated hero positions during column transitions, not snap to discrete column positions mid-animation.

If testing reveals issues, additional implementation tasks will be added to address them.
