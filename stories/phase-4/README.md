# Phase 4: Wave Progression and Content

**Duration:** Days 8-9 (Estimated 20 hours total)
**Status:** 📋 READY TO START

## Overview
Phase 4 focuses on implementing the complete wave progression system, chapter unlocking mechanics, comprehensive HUD, pause functionality, and visual feedback effects. This phase transforms the game from individual mechanics into a cohesive, polished gameplay experience with clear progression and feedback.

## Prerequisites
- ✅ Phase 1: Foundation (Completed)
- ✅ Phase 2: Core Gameplay Mechanics (Completed)
- ✅ Phase 3: Timer Mechanic and Weapon Upgrades (Completed)

## Phase Objectives
1. **Complete Wave Lifecycle** - Implement wave completion detection, transitions, and progression
2. **Chapter Progression System** - Track player progress, unlock chapters, save data
3. **Professional HUD** - Display all game information clearly and update in real-time
4. **Pause Functionality** - Allow players to pause/resume with proper state management
5. **Visual Polish** - Add satisfying visual feedback for all player actions

---

## Epic 4.1: Wave Completion and Progression

**Goal:** Implement wave transitions and chapter completion with progress tracking

### Stories

#### [Story 4.1.1: Implement Wave Completion Logic](epic-4.1-wave-progression/story-4.1.1-implement-wave-completion-logic.md)
**Estimated:** 3 hours

**Key Deliverables:**
- Wave completion detection (duration-based)
- WaveCompleteOverlay UI component
- Wave statistics tracking (zomboids killed, accuracy, time)
- Smooth transition to next wave (3-second delay)
- Chapter complete trigger on final wave

**Files Created:**
- `src/ui/WaveCompleteOverlay.ts`
- `src/types/GameTypes.ts` (WaveStats interface)

**Files Modified:**
- `src/systems/WaveManager.ts`
- `src/scenes/GameScene.ts`

---

#### [Story 4.1.2: Implement Chapter Progression](epic-4.1-wave-progression/story-4.1.2-implement-chapter-progression.md)
**Estimated:** 4 hours

**Key Deliverables:**
- ProgressManager system for tracking completion
- localStorage save/load functionality
- Sequential chapter unlocking
- ChapterCompleteScene with detailed statistics
- Best score and completion time tracking
- "Continue" button in menu for next uncompleted chapter

**Files Created:**
- `src/systems/ProgressManager.ts`
- `src/scenes/ChapterCompleteScene.ts`

**Files Modified:**
- `src/scenes/GameScene.ts`
- `src/scenes/MenuScene.ts`

---

#### [Story 4.1.3: Test All Chapter Configurations](epic-4.1-wave-progression/story-4.1.3-test-all-chapter-configurations.md)
**Estimated:** 3 hours

**Key Deliverables:**
- Comprehensive testing of all chapter/wave configs
- Verification that spawn patterns match JSON
- Balance testing and recommendations
- Bug documentation
- Performance validation across all content

**Testing Coverage:**
- Chapter 1: "First Contact" (3 waves)
- Chapter 2: "Rising Threat" (2+ waves)
- Chapter 3: (if exists)
- All zomboid types and timer spawns
- Difficulty progression validation

---

## Epic 4.2: HUD and UI Polish

**Goal:** Implement comprehensive HUD and UI elements with professional polish

### Stories

#### [Story 4.2.1: Create HUD Component](epic-4.2-hud-ui/story-4.2.1-create-hud-component.md)
**Estimated:** 4 hours

**Key Deliverables:**
- Comprehensive HUD.ts component
- Score display (top-left, real-time updates)
- Wave info (top-center: Chapter X - Wave Y)
- Time remaining (top-right, countdown timer)
- Hero count (bottom-center, with icon)
- Weapon tier display (bottom-left, name + tier)
- Dark mode styling with semi-transparent panels
- Mobile-responsive sizing
- Flash animations on value changes

**Files Created:**
- `src/ui/HUD.ts`

**Files Modified:**
- `src/scenes/GameScene.ts`
- `src/types/GameTypes.ts` (HUDData interface)

**Visual Specifications:**
```
┌─────────────────────────────────────────────────────────┐
│ [Score: X,XXX]    [Chapter X - Wave X/X]    [Time: X:XX]│
│                                                           │
│                    [GAMEPLAY AREA]                        │
│                                                           │
│ [Weapon: Name]                 [⚡ Heroes: X]            │
│ [Tier X]                                                  │
└─────────────────────────────────────────────────────────┘
```

---

#### [Story 4.2.2: Implement Pause Menu](epic-4.2-hud-ui/story-4.2.2-implement-pause-menu.md)
**Estimated:** 3 hours

**Key Deliverables:**
- PauseMenu.ts component
- ConfirmDialog.ts for destructive actions
- Pause triggers (ESC, P key, pause button)
- Complete game state freezing (physics, timers, animations)
- Semi-transparent dark overlay
- Resume, Restart, Menu buttons
- Keyboard shortcuts (ESC to resume)
- Confirmation dialogs for restart/menu

**Files Created:**
- `src/ui/PauseMenu.ts`
- `src/ui/ConfirmDialog.ts`

**Files Modified:**
- `src/scenes/GameScene.ts`
- `src/ui/HUD.ts` (pause button)

**Features:**
- Physics pause/resume
- Tween pause/resume
- Timer pause/resume
- State preservation
- Cannot pause during transitions

---

#### [Story 4.2.3: Add Visual Feedback Effects](epic-4.2-hud-ui/story-4.2.3-add-visual-feedback-effects.md)
**Estimated:** 4 hours

**Key Deliverables:**
- VisualEffects.ts manager class
- Zomboid hit effect (white flash + pulse)
- Zomboid destruction effect (scale down + fade + particle burst)
- Timer hit effect (pulse + ripple)
- Hero add/remove effects (fade in/out + scale)
- Weapon upgrade effect (glow pulse on heroes)
- Score increment animation (floating "+X" text)
- Impact ripples on collisions
- Screen shake on game over
- Particle burst system

**Files Created:**
- `src/effects/VisualEffects.ts`

**Files Modified:**
- `src/entities/Zomboid.ts`
- `src/entities/Timer.ts`
- `src/entities/Hero.ts`
- `src/scenes/GameScene.ts`
- `src/systems/CollisionManager.ts`

**Effect Timing Reference:**
| Effect | Duration | Purpose |
|--------|----------|---------|
| Hit flash | 80ms | Instant feedback |
| Pulse scale | 150ms | Hit confirmation |
| Destruction | 300ms | Satisfying elimination |
| Fade in/out | 400-500ms | Smooth transitions |
| Glow pulse | 800ms × 3 | Upgrade celebration |
| Floating text | 1000ms | Score feedback |

---

## Technical Architecture

### New Systems Introduced

#### ProgressManager
```typescript
class ProgressManager {
  // Singleton for game progress tracking
  - loadProgress(): GameProgress
  - saveProgress(): void
  - isChapterUnlocked(id): boolean
  - onChapterComplete(id, stats): void
  - getChapterProgress(id): ChapterProgress
  - resetProgress(): void
}
```

#### HUD Component
```typescript
class HUD extends Phaser.GameObjects.Container {
  - updateData(data: Partial<HUDData>): void
  - flashHeroCount(): void
  - flashWeaponUpgrade(): void
  - showLowTimeWarning(): void
  - hide(): void
  - show(): void
}
```

#### VisualEffects Manager
```typescript
class VisualEffects {
  - flashWhite(obj, duration): void
  - pulseScale(obj, scale, duration): void
  - destroyEffect(obj, callback): void
  - fadeIn(obj, duration): void
  - fadeOut(obj, callback, duration): void
  - glowPulse(obj, duration, repeat): void
  - floatingText(x, y, text, color, size): void
  - screenShake(intensity, duration): void
  - impactRipple(x, y, color): void
  - particleBurst(x, y, color, count): void
}
```

### Data Structures

#### WaveStats
```typescript
interface WaveStats {
  zomboidsSpawned: number;
  zomboidsKilled: number;
  timersSpawned: number;
  timersCompleted: number;
  duration: number;
  timeElapsed: number;
}
```

#### ChapterProgress
```typescript
interface ChapterProgress {
  chapterId: string;
  completed: boolean;
  unlocked: boolean;
  bestScore: number;
  completionTime: number;
  zomboidsKilled: number;
  highestWeaponTier: number;
  playCount: number;
  firstCompletedDate: string | null;
  lastPlayedDate: string | null;
}
```

#### GameProgress
```typescript
interface GameProgress {
  chapters: Record<string, ChapterProgress>;
  totalScore: number;
  totalPlayTime: number;
  lastUpdated: string;
}
```

---

## Implementation Order

### Recommended Sequence
1. **Story 4.1.1** - Wave completion logic (foundation for progression)
2. **Story 4.1.2** - Chapter progression system (builds on wave completion)
3. **Story 4.2.1** - HUD component (visual framework)
4. **Story 4.2.2** - Pause menu (QoL feature)
5. **Story 4.2.3** - Visual effects (polish layer)
6. **Story 4.1.3** - Testing (validation and balance)

### Parallel Work Opportunities
- Stories 4.2.1 and 4.1.1 can be developed in parallel
- Stories 4.2.2 and 4.2.3 can be developed in parallel (after 4.2.1)

---

## Testing Strategy

### Unit Testing
- [ ] ProgressManager save/load functionality
- [ ] WaveManager completion detection
- [ ] HUD data updates
- [ ] Effect cleanup (no memory leaks)

### Integration Testing
- [ ] Wave → Wave transition preserves state
- [ ] Chapter → Chapter unlock sequence
- [ ] Pause → Resume preserves exact state
- [ ] Effects trigger on correct events

### User Testing
- [ ] Play through all chapters completely
- [ ] Test pause/resume frequently
- [ ] Verify progress saves across sessions
- [ ] Test on mobile devices
- [ ] Validate all visual effects feel good

### Performance Testing
- [ ] 60 FPS maintained with all effects active
- [ ] Memory usage stable (< 200MB)
- [ ] localStorage operations fast (< 10ms)
- [ ] Effect count manageable (< 50 active tweens)

---

## Success Criteria

### Functional Requirements
- ✅ Waves complete and transition smoothly
- ✅ Chapter progression tracked and saved
- ✅ Chapters unlock sequentially
- ✅ HUD displays all information accurately
- ✅ Pause/resume works perfectly
- ✅ All visual effects implemented and polished

### Technical Requirements
- ✅ 60 FPS maintained at all times
- ✅ No memory leaks
- ✅ Progress saves reliably to localStorage
- ✅ Mobile responsive (720x1280 minimum)
- ✅ No bugs in wave transitions
- ✅ State preservation on pause/resume

### User Experience Requirements
- ✅ Clear visual feedback for all actions
- ✅ Smooth, polished transitions
- ✅ Intuitive HUD layout
- ✅ Accessible pause menu
- ✅ Satisfying effects
- ✅ Progression feels rewarding

---

## Known Challenges

### Challenge 1: State Preservation on Pause
**Issue:** Ensuring all game systems properly freeze and resume
**Solution:** Centralized pause state, physics.pause(), tweens.pauseAll(), time.paused

### Challenge 2: LocalStorage Reliability
**Issue:** localStorage can be disabled or full
**Solution:** Try-catch wrappers, fallback to in-memory storage, clear error messages

### Challenge 3: Effect Performance
**Issue:** Multiple simultaneous effects can impact performance
**Solution:** Effect pooling, limit concurrent effects, optimize tweens, reduce mobile effects

### Challenge 4: Wave Transition Timing
**Issue:** Ensuring smooth transitions without bugs
**Solution:** Transition flag, disable updates during transition, cleanup before next wave

---

## Post-Phase 4 Checklist

Before moving to Phase 5 (Audio and Polish):
- [ ] All 6 stories completed and tested
- [ ] Wave progression working end-to-end
- [ ] Chapter unlocking validated
- [ ] Progress saves and loads correctly
- [ ] HUD displays all information
- [ ] Pause/resume bug-free
- [ ] Visual effects polished
- [ ] All chapters playable
- [ ] Performance targets met (60 FPS)
- [ ] Mobile testing completed
- [ ] Balance recommendations documented

---

## Next Phase

**Phase 5: Audio and Polish (Days 10-11)**
- Epic 5.1: Audio Implementation
  - Story 5.1.1: Implement AudioManager System
  - Story 5.1.2: Add Sound Effects
  - Story 5.1.3: Add Background Music
- Epic 5.2: Performance Optimization
  - Story 5.2.1: Profile and Optimize Rendering
  - Story 5.2.2: Optimize Object Pooling
  - Story 5.2.3: Mobile Testing and Optimization

---

## File Structure Summary

```
stories/phase-4/
├── README.md (this file)
├── epic-4.1-wave-progression/
│   ├── story-4.1.1-implement-wave-completion-logic.md
│   ├── story-4.1.2-implement-chapter-progression.md
│   └── story-4.1.3-test-all-chapter-configurations.md
└── epic-4.2-hud-ui/
    ├── story-4.2.1-create-hud-component.md
    ├── story-4.2.2-implement-pause-menu.md
    └── story-4.2.3-add-visual-feedback-effects.md
```

**Total Stories:** 6
**Total Estimated Time:** 20 hours
**Epic Count:** 2

---

## Resources

### Design References
- [Zomboid Assult Prototype Design](../../docs/zomboid-assult-prototype-design.md)
- [Game Architecture Document](../../docs/game-architecture.md)
- [Implementation Roadmap](../../docs/implementation-roadmap.md)

### Related Phases
- [Phase 1: Foundation](../phase-1/)
- [Phase 2: Core Gameplay Mechanics](../phase-2/)
- [Phase 3: Timer and Upgrade Systems](../phase-3/)

### External Documentation
- [Phaser 3 Tweens Documentation](https://photonstorm.github.io/phaser3-docs/Phaser.Tweens.html)
- [Phaser 3 Container Documentation](https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Container.html)
- [localStorage API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |
| 2025-10-22 | 1.0 | Initial Phase 4 documentation with all stories | Alex (Game Designer) |

---

## Notes

- All stories include detailed implementation code examples
- Each story has comprehensive acceptance criteria and testing checklists
- Visual effects timing can be adjusted based on playtesting feedback
- HUD layout is mobile-responsive and configurable
- Progress system supports unlimited chapters (scales with JSON configs)
- Consider adding settings menu in pause screen for future iteration
- May want to add tutorial tooltips for first-time players in future
