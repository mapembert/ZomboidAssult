# Phase 7: Continuous Movement System

**Duration:** Days 14-16 (Estimated 24 hours total)
**Status:** 📋 READY TO START

## Overview
Phase 7 transforms the gameplay from discrete 2-column movement to a continuous movement system. Heroes will be able to slide freely along the X-axis, and zomboids will spawn at random horizontal positions, creating more dynamic and engaging gameplay that requires precise positioning and timing.

## Prerequisites
- ✅ Phase 1: Foundation (Completed)
- ✅ Phase 2: Core Gameplay Mechanics (Completed)
- ✅ Phase 3: Timer Mechanic and Weapon Upgrades (Completed)
- ✅ Phase 4: Wave Progression and Content (Completed)
- ✅ Phase 5: Audio and Polish (Completed)

## Phase Objectives
1. **Continuous Hero Movement** - Replace discrete column movement with smooth X-axis sliding
2. **Touch/Drag Input** - Implement drag-to-move controls for mobile with keyboard smoothing for desktop
3. **Random Zomboid Spawning** - Spawn zomboids at random X positions instead of fixed columns
4. **Updated Collision System** - Adjust collision detection for continuous positioning
5. **Maintain 60 FPS Performance** - Ensure smooth performance with new movement system

---

## Epic 7.1: Continuous Hero Movement System

**Goal:** Enable heroes to move smoothly along the X-axis instead of discrete column switching

### Stories

#### [Story 7.1.1: Implement Continuous Hero Movement](epic-7.1-continuous-movement/story-7.1.1-continuous-hero-movement.md)
**Estimated:** 5 hours

**Key Deliverables:**
- Replace column-based movement with continuous X-position
- Smooth movement with velocity and acceleration
- Boundary constraints (keep heroes on screen)
- Update HeroManager for continuous positioning
- Maintain hero formation/stacking logic

**Files Modified:**
- `src/entities/Hero.ts`
- `src/systems/HeroManager.ts`
- `src/types/ConfigTypes.ts`
- `public/config/game-settings.json`
- `public/config/entities/heroes.json`

---

#### [Story 7.1.2: Implement Drag-to-Move Input System](epic-7.1-continuous-movement/story-7.1.2-drag-input-system.md)
**Estimated:** 4 hours

**Key Deliverables:**
- Pointer/touch drag input for mobile
- Smooth keyboard movement (A/D keys for continuous slide)
- Input smoothing and deadzone handling
- Visual feedback for touch/drag
- Replace discrete left/right toggle with continuous input

**Files Modified:**
- `src/systems/InputManager.ts`
- `src/scenes/GameScene.ts`

---

#### [Story 7.1.3: Update Weapon Targeting for Continuous Movement](epic-7.1-continuous-movement/story-7.1.3-weapon-targeting-update.md)
**Estimated:** 3 hours

**Key Deliverables:**
- Update projectile firing from continuous hero positions
- Ensure projectiles fire from accurate hero X-positions
- Update hero position calculation in HeroManager
- Test weapon accuracy with moving heroes

**Files Modified:**
- `src/systems/WeaponSystem.ts`
- `src/systems/HeroManager.ts`

---

## Epic 7.2: Random Zomboid Spawning System

**Goal:** Replace column-based zomboid spawning with random X-position spawning

### Stories

#### [Story 7.2.1: Implement Random X-Position Zomboid Spawning](epic-7.2-random-spawning/story-7.2.1-random-zomboid-spawning.md)
**Estimated:** 4 hours

**Key Deliverables:**
- Remove column-based spawn logic
- Generate random X positions within play area bounds
- Add spawn zone padding to prevent edge spawning
- Update WaveManager spawn scheduling
- Update chapter configuration format (remove columns)

**Files Modified:**
- `src/systems/WaveManager.ts`
- `src/entities/Zomboid.ts`
- `src/types/ConfigTypes.ts`
- `public/config/chapters/*.json`

---

#### [Story 7.2.2: Update Collision Detection for Continuous Positions](epic-7.2-random-spawning/story-7.2.2-update-collision-system.md)
**Estimated:** 3 hours

**Key Deliverables:**
- Ensure collision detection works with continuous X positions
- Update projectile-zomboid collision logic
- Update projectile-timer collision logic
- Test collision accuracy across full screen width
- Performance optimization for collision checks

**Files Modified:**
- `src/systems/CollisionManager.ts`

---

## Epic 7.3: Continuous Movement Polish

**Goal:** Polish and balance the new continuous movement system

### Stories

#### [Story 7.3.1: Balance Movement Parameters](epic-7.3-movement-polish/story-7.3.1-balance-movement.md)
**Estimated:** 2 hours

**Key Deliverables:**
- Tune hero movement speed
- Adjust acceleration/deceleration curves
- Configure input sensitivity
- Set appropriate boundary padding
- Update zomboid spawn distribution

**Files Modified:**
- `public/config/game-settings.json`
- `public/config/entities/heroes.json`

---

#### [Story 7.3.2: Add Visual Feedback for Movement](epic-7.3-movement-polish/story-7.3.2-movement-visual-feedback.md)
**Estimated:** 3 hours

**Key Deliverables:**
- Add drag indicator for touch input
- Show movement boundaries (visual guides)
- Hero movement trail effect (optional polish)
- Update tutorial/instruction text
- Add touch input help overlay

**Files Modified:**
- `src/scenes/GameScene.ts`
- `src/systems/HeroManager.ts`

---

## Testing Requirements

### Functional Testing
- [ ] Heroes move smoothly across entire X-axis
- [ ] Touch drag controls work on mobile devices
- [ ] Keyboard smooth movement works on desktop
- [ ] Heroes stay within screen boundaries
- [ ] Hero formation/stacking works with continuous movement
- [ ] Zomboids spawn at random X positions
- [ ] No zomboids spawn off-screen or in unsafe zones
- [ ] Projectiles fire accurately from moving heroes
- [ ] Collisions detect properly across all positions
- [ ] Performance maintains 60 FPS with continuous movement

### Cross-Platform Testing
- [ ] iOS Safari - Touch drag works smoothly
- [ ] Android Chrome - Touch drag works smoothly
- [ ] Desktop Chrome - Keyboard movement works smoothly
- [ ] Desktop Firefox - Keyboard movement works smoothly
- [ ] Desktop Safari - Keyboard movement works smoothly

### Balance Testing
- [ ] Hero movement speed feels responsive
- [ ] Zomboid spawn distribution feels fair
- [ ] Game difficulty is balanced with new movement
- [ ] Test with all weapon tiers
- [ ] Test across all chapters

## Performance Requirements
- Maintain 60 FPS on desktop
- Maintain 30+ FPS on mobile devices
- No input lag or stuttering
- Smooth movement transitions
- Efficient collision detection

## Migration Notes

**Breaking Changes:**
- Chapter configuration format changes (remove `columns` array)
- Hero positioning system completely refactored
- Input system replaced (no more discrete left/right)

**Migration Steps:**
1. Update all chapter JSON files to remove column specifications
2. Update game-settings.json with continuous movement parameters
3. Update heroes.json with movement speed parameters
4. Test all existing chapters with new system
5. Rebalance chapters as needed

## Success Criteria
- [ ] Heroes move continuously along X-axis
- [ ] Touch/drag input feels natural and responsive
- [ ] Zomboids spawn at varied random positions
- [ ] All collisions detect accurately
- [ ] Performance remains at 60 FPS
- [ ] Game balance is maintained or improved
- [ ] Tutorial/help text updated for new controls
- [ ] All existing chapters work with new system

---

**Epic Progress:**
- Epic 7.1: Continuous Hero Movement System - 0/3 stories
- Epic 7.2: Random Zomboid Spawning System - 0/2 stories
- Epic 7.3: Continuous Movement Polish - 0/2 stories

**Total Stories:** 7 stories (24 hours estimated)
