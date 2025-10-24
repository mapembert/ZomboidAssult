# Story 6.1.1: Functional Testing

**Epic:** 6.1 Comprehensive Testing
**Phase:** 6 - Testing and Bug Fixes (Day 12)
**Estimated Time:** 4 hours
**Status:** ⚠️ USER TESTING REQUIRED

> **NOTE:** This story requires MANUAL TESTING by the user. This is not a development task but a comprehensive test execution checklist. The user must play the game and verify all features work correctly, documenting any bugs found.

## Description
Conduct comprehensive functional testing of all game features, systems, and mechanics to ensure everything works as designed. This includes testing all chapters, waves, input methods, collision detection, hero management, weapon upgrades, pause/resume functionality, and scene transitions. Document any issues found and verify edge cases are handled gracefully.

## User Story
**As a QA tester**, I want to systematically test all game features so that I can identify and document any bugs or issues before release.

## Quick Start Guide for Testing

**To begin testing:**

1. **Build the game:**
   ```bash
   npm run build
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Navigate to: http://localhost:5173
   - Open browser console (F12) to watch for errors

4. **Follow the test execution checklist below**
   - Check off each item as you test it
   - Document any bugs you find
   - Take screenshots/videos of issues

5. **Record your findings:**
   - Use the "Test Report Template" at the bottom of this file
   - Categorize bugs by severity (Critical/Major/Minor)
   - Create bug reports for Story 6.1.3 (Bug Fixing)

**Tip:** Test on multiple browsers (Chrome, Firefox, Safari) and at least one mobile device.

---

## Tasks
- [ ] Test all 3 chapters and their waves
  - [ ] Chapter 1: Test all waves (1-5)
  - [ ] Chapter 2: Test all waves
  - [ ] Chapter 3: Test all waves
  - [ ] Verify wave progression and difficulty scaling
  - [ ] Test wave completion transitions
- [ ] Test all input methods
  - [ ] Mouse click controls (desktop)
  - [ ] Touch controls (mobile)
  - [ ] Keyboard controls (if implemented)
  - [ ] Test input responsiveness
  - [ ] Test swipe gestures for hero movement
- [ ] Test all collision types
  - [ ] Projectile vs Zomboid collision
  - [ ] Projectile vs Timer collision
  - [ ] Zomboid reaching bottom of screen
  - [ ] Multiple simultaneous collisions
- [ ] Test hero add/remove edge cases
  - [ ] Adding heroes when at maximum
  - [ ] Removing heroes when at minimum (1)
  - [ ] Removing heroes with game over
  - [ ] Timer adding multiple heroes
  - [ ] Timer removing multiple heroes
- [ ] Test weapon upgrades
  - [ ] All 6 weapon tiers (single → ultimate)
  - [ ] Weapon upgrade progression
  - [ ] Weapon stats application
  - [ ] Projectile behavior per weapon
  - [ ] Fire rate changes
- [ ] Test pause/resume functionality
  - [ ] Pause button works
  - [ ] Game actually pauses (no movement)
  - [ ] Resume button works
  - [ ] Audio pauses/resumes correctly
  - [ ] No state corruption after resume
- [ ] Test scene transitions
  - [ ] Menu → Game transition
  - [ ] Game → Game Over transition
  - [ ] Game → Chapter Complete transition
  - [ ] Game Over → Menu transition
  - [ ] Game Over → Restart transition
  - [ ] Chapter Complete → Menu transition
  - [ ] Chapter Complete → Next Chapter transition

## Acceptance Criteria
- [ ] All 3 chapters complete successfully
- [ ] All wave configurations load and run correctly
- [ ] All input methods work on both desktop and mobile
- [ ] All collision detection works accurately
- [ ] Hero add/remove handles all edge cases without crashes
- [ ] All 6 weapon tiers upgrade correctly
- [ ] Pause/resume works without state corruption
- [ ] All scene transitions are smooth and error-free
- [ ] No critical bugs found
- [ ] Edge cases handled gracefully with proper error messages
- [ ] Game remains playable throughout testing
- [ ] No crashes or freezes during normal gameplay

## Testing Methodology

### 1. Chapter and Wave Testing

**Test each chapter systematically:**

```markdown
For each chapter (1, 2, 3):
  1. Start chapter from menu
  2. Play through each wave
  3. Verify zomboid spawn patterns
  4. Verify wave duration
  5. Verify wave completion overlay
  6. Check score accumulation
  7. Test wave progression to next wave
  8. Complete final wave
  9. Verify chapter complete screen
  10. Verify next chapter unlocks (if applicable)
```

**Expected Results:**
- All waves load correctly
- Zomboids spawn according to config
- Wave timer counts down correctly
- Wave complete overlay displays
- Score updates correctly
- Chapter completion unlocks next chapter

**Edge Cases to Test:**
- Skip to last wave of chapter (if possible)
- Complete chapter with minimum heroes (1)
- Complete chapter with maximum heroes
- Complete chapter with all weapon tiers

---

### 2. Input Method Testing

**Desktop Testing:**
```markdown
1. Open game in browser (Chrome, Firefox, Safari)
2. Test mouse click to move heroes
3. Verify hero follows mouse position
4. Test rapid clicking
5. Test clicking near screen edges
6. Test clicking during wave transitions
```

**Mobile Testing:**
```markdown
1. Open game on mobile device
2. Test touch to move heroes
3. Test touch-and-hold
4. Test rapid tapping
5. Test swipe gestures
6. Test multi-touch (if applicable)
7. Test landscape vs portrait orientation
```

**Expected Results:**
- Heroes move smoothly to click/touch position
- No input lag (< 50ms)
- Input works during all game states
- No missed inputs

**Edge Cases:**
- Click/touch during scene transition
- Click/touch outside game canvas
- Simultaneous clicks (desktop)
- Multi-touch (mobile)

---

### 3. Collision Detection Testing

**Test scenarios:**

```typescript
// Projectile vs Zomboid
1. Fire projectile at single zomboid
   - Expected: Hit registered, zomboid takes damage
2. Fire projectile at multiple zomboids in line
   - Expected: Projectile destroyed on first hit
3. Fire spread weapon at zomboid cluster
   - Expected: Multiple zomboids hit simultaneously
4. Test projectile missing zomboid
   - Expected: Projectile continues off-screen

// Projectile vs Timer
1. Fire projectile at timer
   - Expected: Timer increments, projectile destroyed
2. Fire multiple projectiles at timer
   - Expected: Each hit increments timer
3. Hit timer with positive value
   - Expected: Heroes added on timer exit
4. Hit timer with negative value
   - Expected: Heroes removed on timer exit

// Zomboid reaching bottom
1. Let zomboid reach bottom
   - Expected: Game over triggered
2. Destroy zomboid before reaching bottom
   - Expected: No game over
```

**Expected Results:**
- All collision types detected accurately
- Collision responses execute correctly
- No false positives or negatives
- Performance remains stable with many collisions

**Edge Cases:**
- 10+ simultaneous collisions
- Projectile hitting multiple timers
- Zomboid destroyed exactly at bottom boundary
- Timer exiting screen during collision

---

### 4. Hero Add/Remove Testing

**Test scenarios:**

```markdown
Normal Operations:
1. Start with 2 heroes (default)
2. Add heroes via positive timer
   - Expected: Heroes increase, max at 6
3. Remove heroes via negative timer
   - Expected: Heroes decrease, min at 1

Edge Cases:
1. Add heroes when at maximum (6)
   - Expected: Heroes stay at 6, no overflow
2. Remove heroes to reach minimum (1)
   - Expected: 1 hero remains
3. Remove heroes below minimum
   - Expected: Game over triggered
4. Add multiple heroes in quick succession
   - Expected: All additions processed correctly
5. Remove multiple heroes in quick succession
   - Expected: All removals processed correctly
6. Add/remove during scene transition
   - Expected: Handled gracefully or queued
```

**Expected Results:**
- Hero count always between 1 and 6
- Hero visuals update correctly
- Hero positions maintained
- Game over triggers at 0 heroes
- No crashes on edge cases

---

### 5. Weapon Upgrade Testing

**Test all weapon tiers:**

```markdown
For each tier (1-6):
  1. Verify weapon stats (fireRate, projectileCount, damage, spread)
  2. Fire weapon and observe projectiles
  3. Count projectiles fired
  4. Measure fire rate
  5. Verify projectile color/size
  6. Test against zomboids
  7. Upgrade to next tier
  8. Verify upgrade sound plays
  9. Verify visual indicator updates

Weapon Tiers to Test:
- Tier 1: Single Gun (1 projectile, 0.4s fire rate)
- Tier 2: Double Gun (2 projectiles, 20° spread)
- Tier 3: Triple Gun (3 projectiles, 30° spread)
- Tier 4: Pulse Laser (5 projectiles, 50° spread, cyan)
- Tier 5: Mega Machine Gun (1 projectile, 0.05s fire rate)
- Tier 6: Ultimate Gun (1 large projectile, high damage)
```

**Expected Results:**
- Each tier has unique stats
- Projectile count matches config
- Fire rate matches config
- Spread angle correct
- Damage applied correctly
- Upgrade progression works

**Edge Cases:**
- Upgrade during active firing
- Upgrade multiple tiers rapidly
- Reach max tier (6)
- Attempt upgrade beyond tier 6

---

### 6. Pause/Resume Testing

**Test scenarios:**

```markdown
1. Pause during gameplay
   - Expected: All movement stops
   - Expected: Pause overlay displays
   - Expected: Music pauses

2. Resume from pause
   - Expected: Movement resumes exactly where paused
   - Expected: No position jumps
   - Expected: Music resumes

3. Pause during wave transition
   - Expected: Pause works, wave transition completes on resume

4. Pause during zomboid destruction
   - Expected: Animation completes on resume

5. Long pause (5+ minutes)
   - Expected: Resume works, no timeout

6. Pause/resume rapidly (stress test)
   - Expected: No crashes, state consistent
```

**Expected Results:**
- Pause freezes all game logic
- Audio pauses correctly
- Visual overlay clear
- Resume restores exact state
- No memory leaks during pause
- No performance degradation after resume

---

### 7. Scene Transition Testing

**Test all transitions:**

```markdown
Menu → Game:
1. Select chapter from menu
2. Verify loading
3. Verify GameScene starts correctly
4. Verify music transition

Game → Game Over:
1. Trigger game over (zomboid reaches bottom or 0 heroes)
2. Verify game over screen displays
3. Verify final score shown
4. Verify music transition

Game → Chapter Complete:
1. Complete all waves in chapter
2. Verify chapter complete screen
3. Verify statistics displayed
4. Verify next chapter unlocked

Game Over → Restart:
1. Click restart button
2. Verify GameScene restarts with same chapter
3. Verify initial state correct

Game Over → Menu:
1. Click menu button
2. Verify MenuScene loads
3. Verify progress saved

Chapter Complete → Next Chapter:
1. Click "Next Chapter" button
2. Verify next chapter loads
3. Verify correct wave configurations
```

**Expected Results:**
- All transitions smooth
- No visual glitches
- Music transitions correctly
- Game state preserved correctly
- Loading times acceptable (< 2s)

**Edge Cases:**
- Transition during active collisions
- Rapid scene switching
- Transition with maximum entities on screen
- Transition during audio playback

---

## Test Execution Checklist

### Pre-Testing Setup
- [ ] Build latest version: `npm run build`
- [ ] Clear browser cache
- [ ] Open browser console for error monitoring
- [ ] Prepare test data recording sheet
- [ ] Set up screen recording (optional)

### Desktop Testing (Chrome)
- [ ] Run all chapter tests
- [ ] Run all input tests
- [ ] Run all collision tests
- [ ] Run all hero management tests
- [ ] Run all weapon upgrade tests
- [ ] Run all pause/resume tests
- [ ] Run all scene transition tests
- [ ] Document all issues found

### Desktop Testing (Firefox)
- [ ] Repeat all tests from Chrome
- [ ] Note any browser-specific issues

### Desktop Testing (Safari)
- [ ] Repeat all tests
- [ ] Note any Safari-specific issues (especially audio)

### Mobile Testing (iOS Safari)
- [ ] Run all tests with touch input
- [ ] Test portrait and landscape orientations
- [ ] Test with audio unlock
- [ ] Note performance on mobile

### Mobile Testing (Android Chrome)
- [ ] Run all tests with touch input
- [ ] Test orientations
- [ ] Note performance differences

### Post-Testing
- [ ] Compile list of all bugs found
- [ ] Categorize bugs by severity (critical, major, minor)
- [ ] Create bug reports for each issue
- [ ] Prioritize bug fixes for Story 6.1.3

---

## Bug Severity Classification

### Critical (Must Fix)
- Game crashes
- Data loss
- Game unplayable
- Security vulnerabilities

### Major (Should Fix)
- Incorrect game logic
- Major visual issues
- Audio completely broken
- Performance below 30 FPS

### Minor (Nice to Fix)
- Minor visual glitches
- Typos in text
- Small audio issues
- Performance between 30-60 FPS

### Enhancement (Future)
- Feature requests
- Quality of life improvements
- Optional optimizations

---

## Test Report Template

```markdown
## Functional Testing Report

**Date:** [Date]
**Tester:** [Name]
**Build Version:** [Version]
**Platform:** [Desktop/Mobile]
**Browser:** [Browser Name/Version]

### Summary
- Tests Passed: X/Y
- Tests Failed: Z
- Critical Bugs: N
- Major Bugs: M
- Minor Bugs: O

### Chapter Testing
- Chapter 1: [PASS/FAIL]
- Chapter 2: [PASS/FAIL]
- Chapter 3: [PASS/FAIL]

### Input Testing
- Mouse Input: [PASS/FAIL]
- Touch Input: [PASS/FAIL]
- Keyboard Input: [PASS/FAIL/N/A]

### Collision Testing
- Projectile vs Zomboid: [PASS/FAIL]
- Projectile vs Timer: [PASS/FAIL]
- Zomboid vs Bottom: [PASS/FAIL]

### Hero Management
- Add Heroes: [PASS/FAIL]
- Remove Heroes: [PASS/FAIL]
- Edge Cases: [PASS/FAIL]

### Weapon Upgrades
- All Tiers: [PASS/FAIL]
- Upgrade Progression: [PASS/FAIL]

### Pause/Resume
- Pause: [PASS/FAIL]
- Resume: [PASS/FAIL]
- State Consistency: [PASS/FAIL]

### Scene Transitions
- All Transitions: [PASS/FAIL]

### Issues Found
1. [Bug Title] - [Severity] - [Description]
2. ...

### Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

---

## Success Metrics
- ✅ 100% of critical tests pass
- ✅ 95%+ of major tests pass
- ✅ All edge cases handled without crashes
- ✅ No critical bugs found
- ✅ Game playable on all target platforms
- ✅ Smooth experience across all tested browsers/devices

## Next Steps
After completion:
- Story 6.1.2: Performance Testing
- Story 6.1.3: Bug Fixing

## Notes
- Focus on critical path testing first (chapters, waves, core gameplay)
- Document every issue, no matter how small
- Take screenshots/videos of visual bugs
- Record console errors for all crashes
- Test on real devices, not just emulators
- Use incognito/private mode to avoid cache issues
- Clear localStorage between test runs if needed
