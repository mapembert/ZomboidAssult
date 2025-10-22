# Zomboid Assault - Implementation Roadmap

## Overview
This document provides a structured development plan for implementing the Zomboid Assault prototype. The plan is organized into phases, epics, and stories that can be executed sequentially or assigned to team members.

---

## Phase 1: Foundation (Days 1-2)

### Epic 1.1: Project Setup
**Goal:** Establish development environment and project structure

#### Story 1.1.1: Initialize Project
- Create package.json with Phaser 3 + TypeScript dependencies
- Set up Vite build configuration
- Configure TypeScript (strict mode enabled)
- Create project directory structure
- Set up ESLint and Prettier
- Create README.md with setup instructions

**Acceptance Criteria:**
- `npm install` runs without errors
- `npm run dev` starts development server
- TypeScript compiles with no errors
- Directory structure matches architecture document

**Estimated Time:** 2 hours

---

#### Story 1.1.2: Create Phaser Game Instance
- Create `src/main.ts` entry point
- Configure Phaser game instance (720x1280 portrait, WebGL + Canvas fallback)
- Set up Arcade Physics
- Create placeholder BootScene
- Verify game renders in browser

**Acceptance Criteria:**
- Game canvas renders at correct size
- Dark background (#121212) displays
- Phaser debug info shows 60 FPS
- No console errors

**Estimated Time:** 2 hours

---

### Epic 1.2: Configuration System
**Goal:** Load and parse all JSON configuration files

#### Story 1.2.1: Create TypeScript Type Definitions
- Create `src/types/ConfigTypes.ts`
- Define interfaces: GameSettings, ZomboidType, WeaponType, TimerType, HeroConfig, WaveData, ChapterData
- Create `src/types/GameTypes.ts` for runtime types

**Acceptance Criteria:**
- All JSON structures have matching TypeScript interfaces
- No TypeScript compilation errors
- Types exported and importable

**Estimated Time:** 1.5 hours

---

#### Story 1.2.2: Implement ConfigLoader System
- Create `src/systems/ConfigLoader.ts`
- Implement methods: loadGameSettings, loadZomboidTypes, loadWeaponTypes, loadTimerTypes, loadHeroConfig, loadChapter
- Add error handling for missing/malformed JSON
- Test loading all existing config files

**Acceptance Criteria:**
- All JSON files load successfully
- Typed data structures returned
- Error messages display for invalid JSON
- Config data accessible in scenes

**Estimated Time:** 3 hours

---

### Epic 1.3: Basic Scene Management
**Goal:** Implement scene flow (Boot → Menu → Game → GameOver)

#### Story 1.3.1: Implement BootScene
- Create `src/scenes/BootScene.ts`
- Load all JSON configs using ConfigLoader
- Display loading progress bar
- Transition to MenuScene on complete
- Handle loading errors gracefully

**Acceptance Criteria:**
- All configs load successfully
- Progress bar shows loading status
- Transitions to MenuScene automatically
- Loading errors display to user

**Estimated Time:** 2 hours

---

#### Story 1.3.2: Implement MenuScene
- Create `src/scenes/MenuScene.ts`
- Display game title "Zomboid Assault"
- Show chapter list with names and descriptions
- Implement "Start Chapter" button
- Pass selected ChapterData to GameScene

**Acceptance Criteria:**
- All chapters listed
- Clicking chapter starts GameScene
- Chapter data passed correctly
- UI matches dark mode theme

**Estimated Time:** 3 hours

---

#### Story 1.3.3: Create Placeholder GameScene
- Create `src/scenes/GameScene.ts`
- Accept ChapterData from MenuScene
- Display placeholder text "Game Running"
- Add pause button (returns to MenuScene)
- Set up dark background

**Acceptance Criteria:**
- Scene receives chapter data
- Background renders correctly
- Pause button works
- No errors in console

**Estimated Time:** 1.5 hours

---

#### Story 1.3.4: Implement GameOverScene
- Create `src/scenes/GameOverScene.ts`
- Display "Game Over" message
- Show final score and wave reached
- Add "Restart" button (reload GameScene)
- Add "Menu" button (return to MenuScene)

**Acceptance Criteria:**
- Scene receives score/wave data
- Both buttons work correctly
- UI matches dark mode theme
- Smooth transitions

**Estimated Time:** 2 hours

---

## Phase 2: Core Gameplay Mechanics (Days 3-5)

### Epic 2.1: Hero System
**Goal:** Implement player hero movement and rendering

#### Story 2.1.1: Create Hero Entity Class
- Create `src/entities/Hero.ts`
- Implement triangle shape rendering using Graphics
- Load HeroConfig from JSON
- Apply dark mode colors (#03DAC6 fill, #18FFFF outline)
- Add position update methods

**Acceptance Criteria:**
- Hero renders as triangle at specified position
- Colors match design spec
- Outline visible (2-3px width)
- Hero updates position smoothly

**Estimated Time:** 3 hours

---

#### Story 2.1.2: Implement HeroManager System
- Create `src/systems/HeroManager.ts`
- Calculate column positions (X: SCREEN_WIDTH / 4 and 3 * SCREEN_WIDTH / 4)
- Implement moveLeft() and moveRight() methods
- Handle hero count management (add/remove heroes)
- Position heroes evenly within column

**Acceptance Criteria:**
- Heroes start in left column
- Movement between columns works
- Multiple heroes spaced evenly
- Heroes never go below minHeroCount (1)

**Estimated Time:** 4 hours

---

#### Story 2.1.3: Implement InputManager
- Create `src/systems/InputManager.ts`
- Set up keyboard input (Arrow keys, A/D)
- Set up touch input (left/right screen zones)
- Abstract input to isMovingLeft() / isMovingRight() methods
- Handle both input methods simultaneously

**Acceptance Criteria:**
- Keyboard input works on desktop
- Touch zones work on mobile
- Input detected reliably
- No input lag

**Estimated Time:** 3 hours

---

#### Story 2.1.4: Integrate Hero Movement in GameScene
- Instantiate HeroManager in GameScene
- Connect InputManager to HeroManager
- Update hero positions every frame
- Display hero count in debug text

**Acceptance Criteria:**
- Heroes render on screen
- Movement responds to input instantly
- Hero count updates when modified
- 60 FPS maintained

**Estimated Time:** 2 hours

---

### Epic 2.2: Weapon and Projectile System
**Goal:** Implement auto-firing weapon system

#### Story 2.2.1: Create Projectile Entity Class
- Create `src/entities/Projectile.ts`
- Render as small circle using Graphics
- Implement upward movement
- Add resetForPool() for object pooling
- Apply weapon config (color, size, speed)

**Acceptance Criteria:**
- Projectiles render correctly
- Move upward at configured speed
- Destroy when off-screen
- Can be reset for pooling

**Estimated Time:** 2.5 hours

---

#### Story 2.2.2: Implement ObjectPool Utility
- Create `src/utils/ObjectPool.ts`
- Implement acquire() and release() methods
- Pre-allocate objects in constructor
- Track active vs. pooled objects

**Acceptance Criteria:**
- Pool creates initial objects
- acquire() returns available object
- release() returns object to pool
- No memory leaks

**Estimated Time:** 2 hours

---

#### Story 2.2.3: Implement WeaponSystem
- Create `src/systems/WeaponSystem.ts`
- Load weapon configs from JSON
- Implement auto-fire logic (fire based on fireRate)
- Apply weapon properties (projectileCount, spread, damage)
- Use projectile object pool

**Acceptance Criteria:**
- Weapon fires at correct rate
- Projectile count matches weapon config
- Spread angle applied correctly
- Upgrades change weapon properties

**Estimated Time:** 4 hours

---

#### Story 2.2.4: Integrate Weapon System in GameScene
- Instantiate WeaponSystem in GameScene
- Fire projectiles from each hero position
- Update projectiles every frame
- Remove off-screen projectiles

**Acceptance Criteria:**
- Projectiles fire continuously upward
- Fire from all hero positions
- Correct fire rate maintained
- 60 FPS maintained

**Estimated Time:** 2.5 hours

---

### Epic 2.3: Zomboid Spawning and Movement
**Goal:** Spawn zomboids from JSON config and move them downward

#### Story 2.3.1: Implement ShapeRenderer Utility
- Create `src/utils/ShapeRenderer.ts`
- Implement drawCircle() static method
- Implement drawSquare() static method
- Implement drawHexagon() static method
- Apply fill color + outline

**Acceptance Criteria:**
- All shapes render correctly
- Outlines visible
- Colors match config
- Shapes centered on position

**Estimated Time:** 3 hours

---

#### Story 2.3.2: Create Zomboid Entity Class
- Create `src/entities/Zomboid.ts`
- Load zomboid config (shape, size, color, health, speed)
- Render shape using ShapeRenderer
- Implement downward movement
- Add takeDamage() method
- Add resetForPool() method

**Acceptance Criteria:**
- All zomboid types render correctly
- Movement speed matches config
- Health decrements on damage
- Destroyed when health reaches 0

**Estimated Time:** 4 hours

---

#### Story 2.3.3: Implement WaveManager System
- Create `src/systems/WaveManager.ts`
- Parse WaveData from chapter config
- Build spawn schedule from wave config
- Implement zomboid spawning at scheduled times
- Use zomboid object pool
- Track wave duration

**Acceptance Criteria:**
- Zomboids spawn according to config
- Spawn rate matches config values
- Column assignment works correctly
- Wave duration tracked accurately

**Estimated Time:** 5 hours

---

#### Story 2.3.4: Integrate Wave System in GameScene
- Instantiate WaveManager with selected chapter
- Start first wave on scene init
- Update zomboid positions every frame
- Display wave info in HUD (wave number, time remaining)

**Acceptance Criteria:**
- First wave starts automatically
- Zomboids descend at correct speed
- Wave timer counts down
- Zomboid variety matches config

**Estimated Time:** 3 hours

---

### Epic 2.4: Collision Detection
**Goal:** Detect and handle projectile-zomboid collisions

#### Story 2.4.1: Implement CollisionManager
- Create `src/systems/CollisionManager.ts`
- Implement AABB collision detection
- Check projectile-zomboid overlaps
- Handle collision outcomes (damage zomboid, destroy projectile)
- Emit events for collisions

**Acceptance Criteria:**
- Collisions detected accurately
- Zomboids take damage on hit
- Projectiles destroyed on hit
- No false positive collisions

**Estimated Time:** 4 hours

---

#### Story 2.4.2: Implement Zomboid Destruction
- Add destruction logic to Zomboid class
- Play destruction effect (scale down + fade out)
- Return zomboid to pool
- Update score on destruction
- Emit zomboid_destroyed event

**Acceptance Criteria:**
- Zomboids destroyed when health reaches 0
- Visual feedback on destruction
- Score increments correctly
- No memory leaks

**Estimated Time:** 2.5 hours

---

#### Story 2.4.3: Integrate Collision Detection in GameScene
- Call CollisionManager.checkProjectileZomboidCollisions() every frame
- Listen for zomboid_destroyed events
- Update score display
- Track destroyed zomboids per wave

**Acceptance Criteria:**
- Shooting zomboids works correctly
- Score updates in real-time
- Different zomboid types award correct scores
- Performance maintained (60 FPS)

**Estimated Time:** 2 hours

---

#### Story 2.4.4: Implement Game Over on Zomboid Reach Bottom
- Check zomboid Y position every frame
- Trigger game over if zomboid reaches safe zone
- Display "Game Over - Zomboid Reached Bottom" message
- Transition to GameOverScene

**Acceptance Criteria:**
- Game over triggers correctly
- Final score passed to GameOverScene
- No zomboids spawn after game over
- Clean scene transition

**Estimated Time:** 2 hours

---

## Phase 3: Timer and Upgrade Systems (Days 6-7)

### Epic 3.1: Countdown Timer Mechanic
**Goal:** Implement countdown timer entity and hero modification

#### Story 3.1.1: Create Timer Entity Class
- Create `src/entities/Timer.ts`
- Render thin vertical rectangle (full column height)
- Display counter value as centered text
- Implement incrementCounter() method
- Update color based on value (negative=red, positive=blue)

**Acceptance Criteria:**
- Timer renders as thin vertical box
- Counter text visible and centered
- Color changes at value 0
- Descends at configured speed

**Estimated Time:** 4 hours

---

#### Story 3.1.2: Implement Timer Spawning in WaveManager
- Parse timer spawn data from wave config
- Spawn timers at scheduled times
- Assign to correct column
- Track active timers

**Acceptance Criteria:**
- Timers spawn at correct times
- Correct column assignment
- Timer config loaded correctly
- Multiple timers can be active

**Estimated Time:** 2.5 hours

---

#### Story 3.1.3: Implement Projectile-Timer Collision
- Add checkProjectileTimerCollisions() to CollisionManager
- Increment timer counter on hit
- Destroy projectile on hit
- Update timer visual immediately

**Acceptance Criteria:**
- Shooting timer increments counter
- Visual update is instant
- Counter increment matches config
- Projectile destroyed on hit

**Estimated Time:** 3 hours

---

#### Story 3.1.4: Implement Timer Exit and Hero Modification
- Detect when timer exits screen (Y > SCREEN_HEIGHT)
- Call timer.onExitScreen() to get final value
- Pass value to HeroManager.addHero() or removeHero()
- Update hero count display

**Acceptance Criteria:**
- Positive values add heroes
- Negative values remove heroes
- Hero count never drops below 1
- Visual update immediate

**Estimated Time:** 3 hours

---

### Epic 3.2: Weapon Upgrade System
**Goal:** Implement weapon progression and upgrades

#### Story 3.2.1: Implement Weapon Upgrade Logic
- Add upgradeWeapon() method to WeaponSystem
- Load next tier weapon from config
- Apply new weapon properties
- Display upgrade notification

**Acceptance Criteria:**
- Weapon tier increases on upgrade
- New projectile properties applied
- Visual feedback shows upgrade
- Upgrade persists through waves

**Estimated Time:** 2.5 hours

---

#### Story 3.2.2: Create Weapon Upgrade Timer Type
- Use existing weapon_upgrade_timer config
- Modify Timer class to support upgrade outcome
- Trigger weapon upgrade on positive exit value
- Display "Weapon Upgraded!" message

**Acceptance Criteria:**
- Upgrade timer works like hero timer
- Weapon upgrades on positive exit
- All weapon tiers accessible
- Visual feedback clear

**Estimated Time:** 2 hours

---

#### Story 3.2.3: Test All Weapon Tiers
- Verify single_gun fires 1 projectile
- Verify double_gun fires 2 projectiles with spread
- Verify triple_gun fires 3 projectiles
- Verify pulse_laser fires 5 projectiles with wide spread
- Verify mega_machine_gun fires rapidly

**Acceptance Criteria:**
- All weapon configs load correctly
- Projectile counts match config
- Spread angles correct
- Fire rates accurate
- Visual distinction clear

**Estimated Time:** 3 hours

---

## Phase 4: Wave Progression and Content (Days 8-9)

### Epic 4.1: Wave Completion and Progression
**Goal:** Implement wave transitions and chapter completion

#### Story 4.1.1: Implement Wave Completion Logic
- Check wave duration elapsed
- Check all zomboids destroyed (optional)
- Display "Wave Complete!" message
- Transition to next wave or chapter complete screen

**Acceptance Criteria:**
- Wave completes after duration
- Clear visual feedback
- Score persists between waves
- Smooth transition

**Estimated Time:** 3 hours

---

#### Story 4.1.2: Implement Chapter Progression
- Track chapter completion
- Save progress to localStorage
- Unlock next chapter
- Display chapter complete screen with stats

**Acceptance Criteria:**
- Chapters unlock sequentially
- Progress saved correctly
- Stats display accurately
- Can replay completed chapters

**Estimated Time:** 4 hours

---

#### Story 4.1.3: Test All Chapter Configs
- Play through Chapter 1 (3 waves)
- Play through Chapter 2 (2 waves)
- Play through Chapter 3 (2 waves)
- Verify spawn patterns match config
- Verify difficulty progression

**Acceptance Criteria:**
- All chapters playable
- Wave configs load correctly
- Difficulty increases appropriately
- No config errors

**Estimated Time:** 3 hours

---

### Epic 4.2: HUD and UI Polish
**Goal:** Implement comprehensive HUD and UI elements

#### Story 4.2.1: Create HUD Component
- Create `src/ui/HUD.ts`
- Display score (top-left)
- Display wave info (top-center): "Chapter X - Wave Y"
- Display time remaining (top-right)
- Display hero count (bottom-center)
- Display current weapon (bottom-left)

**Acceptance Criteria:**
- All HUD elements visible
- Updates in real-time
- Dark mode styling
- Readable font sizes

**Estimated Time:** 4 hours

---

#### Story 4.2.2: Implement Pause Menu
- Create `src/ui/PauseMenu.ts`
- Pause game on ESC or pause button
- Display semi-transparent overlay
- Show Resume, Restart, Menu buttons
- Freeze game state

**Acceptance Criteria:**
- Pause works reliably
- Game state frozen
- All buttons functional
- Overlay darkens screen

**Estimated Time:** 3 hours

---

#### Story 4.2.3: Add Visual Feedback Effects
- Zomboid hit effect (flash white briefly)
- Timer hit effect (pulse scale)
- Hero add/remove effect (fade in/out)
- Weapon upgrade effect (hero glow)
- Score increment animation (float upward)

**Acceptance Criteria:**
- All effects visible and smooth
- No performance impact
- Effects don't obscure gameplay
- Timing feels responsive

**Estimated Time:** 4 hours

---

## Phase 5: Audio and Polish (Days 10-11)

### Epic 5.1: Audio Implementation
**Goal:** Add sound effects and background music

#### Story 5.1.1: Implement AudioManager System
- Create `src/systems/AudioManager.ts`
- Load audio files in BootScene
- Implement playSFX() method
- Implement playMusic() method
- Apply volume settings from config

**Acceptance Criteria:**
- All audio files load
- SFX plays on demand
- Music loops correctly
- Volume controls work

**Estimated Time:** 3 hours

---

#### Story 5.1.2: Add Sound Effects
- Projectile fire: short "pew" sound
- Zomboid hit: muted impact
- Zomboid destroyed: small pop
- Timer increment: digital beep
- Upgrade acquired: ascending chime
- Game over: descending tone
- Wave complete: success chime

**Acceptance Criteria:**
- All SFX play at correct times
- No audio lag
- Volume balanced
- Works on mobile browsers

**Estimated Time:** 4 hours

---

#### Story 5.1.3: Add Background Music
- Menu scene: ambient electronic loop
- Game scene: minimal techno/dark ambient
- Game over scene: somber tone
- Music fades between scenes

**Acceptance Criteria:**
- Music loops seamlessly
- Transitions smooth
- Can be muted
- Works on all platforms

**Estimated Time:** 3 hours

---

### Epic 5.2: Performance Optimization
**Goal:** Ensure 60 FPS on target devices

#### Story 5.2.1: Profile and Optimize Rendering
- Use Chrome DevTools Performance profiler
- Identify render bottlenecks
- Optimize shape rendering (cache graphics)
- Reduce draw calls where possible

**Acceptance Criteria:**
- 60 FPS on desktop Chrome
- 30+ FPS on mid-range mobile
- No frame drops during heavy waves
- Profiler shows < 16ms frame time

**Estimated Time:** 4 hours

---

#### Story 5.2.2: Optimize Object Pooling
- Ensure all zomboids/projectiles pooled
- Verify no object leaks
- Increase pool sizes if needed
- Monitor memory usage

**Acceptance Criteria:**
- Object count stable during play
- Memory usage < 150MB
- No garbage collection spikes
- Pool sizes adequate

**Estimated Time:** 3 hours

---

#### Story 5.2.3: Mobile Testing and Optimization
- Test on iOS device (Safari)
- Test on Android device (Chrome)
- Optimize touch input responsiveness
- Reduce battery usage (limit particles)

**Acceptance Criteria:**
- Playable on iOS 13+
- Playable on Android 8+
- Touch input reliable
- No excessive battery drain

**Estimated Time:** 4 hours

---

## Phase 6: Testing and Bug Fixes (Day 12)

### Epic 6.1: Comprehensive Testing
**Goal:** Test all features and fix critical bugs

#### Story 6.1.1: Functional Testing
- Test all chapters and waves
- Test all input methods
- Test all collision types
- Test hero add/remove edge cases
- Test weapon upgrades
- Test pause/resume
- Test scene transitions

**Acceptance Criteria:**
- All features work as designed
- No critical bugs
- Edge cases handled gracefully
- Error messages clear

**Estimated Time:** 4 hours

---

#### Story 6.1.2: Performance Testing
- Run continuous playtest (30+ minutes)
- Monitor FPS and memory
- Test on multiple devices
- Identify any performance degradation

**Acceptance Criteria:**
- No performance degradation over time
- No memory leaks
- 60 FPS maintained
- Works on all target platforms

**Estimated Time:** 3 hours

---

#### Story 6.1.3: Bug Fixing
- Fix all critical bugs
- Fix high-priority bugs
- Document known issues
- Update README with known limitations

**Acceptance Criteria:**
- Zero critical bugs
- Major bugs fixed
- Known issues documented
- Game stable and playable

**Estimated Time:** 5 hours

---

## Post-Launch Enhancements (Future Iterations)

### Epic: Endless Mode
- Implement procedurally generated waves
- Increase difficulty infinitely
- Track high scores
- Add leaderboard

### Epic: Additional Chapters
- Create chapters 4-10
- Introduce new zomboid types
- Add boss waves
- Implement special events

### Epic: Power-Up Variety
- Add shield power-up
- Add slow-motion power-up
- Add screen-clear bomb
- Add score multiplier

### Epic: Meta-Progression
- Permanent upgrades between runs
- Unlock system for weapons
- Achievement system
- Daily challenges

---

## Summary

**Total Estimated Time:** 12 days (96 hours)

**Key Milestones:**
- Day 2: Foundation complete, configs loading
- Day 5: Core gameplay loop playable
- Day 7: Full mechanics implemented
- Day 9: All content complete
- Day 11: Audio and polish complete
- Day 12: Testing complete, ready for release

**Success Criteria:**
- All 3 chapters playable
- 60 FPS performance
- Works on desktop and mobile
- All mechanics functional
- Audio implemented
- Dark mode theme complete

---

## Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |
| 2025-10-21 | 1.0 | Initial implementation roadmap | BMad Orchestrator |
