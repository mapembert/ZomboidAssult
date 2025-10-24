# Story 6.1.3: Bug Fixing

**Epic:** 6.1 Comprehensive Testing
**Phase:** 6 - Testing and Bug Fixes (Day 12)
**Estimated Time:** 5 hours
**Status:** 📋 READY TO START

## Description
Fix all critical and high-priority bugs identified during functional testing (Story 6.1.1) and performance testing (Story 6.1.2). Document all bugs, prioritize them by severity, implement fixes, verify the fixes work, and document any known issues or limitations. This is the final polishing phase before release.

## User Story
**As a developer**, I want to fix all critical bugs and document known issues so that the game is stable, playable, and ready for release.

## Tasks
- [ ] Review bug reports from Stories 6.1.1 and 6.1.2
  - [ ] Compile complete list of all bugs
  - [ ] Categorize by severity (critical, major, minor)
  - [ ] Prioritize bugs by impact and effort
  - [ ] Create tracking document
- [ ] Fix all critical bugs (must fix)
  - [ ] Game crashes
  - [ ] Data loss or corruption
  - [ ] Game-breaking issues
  - [ ] Security vulnerabilities
- [ ] Fix high-priority bugs (should fix)
  - [ ] Incorrect game logic
  - [ ] Major visual issues
  - [ ] Significant audio problems
  - [ ] Performance below 30 FPS
- [ ] Fix medium-priority bugs (nice to fix)
  - [ ] Minor visual glitches
  - [ ] Small audio issues
  - [ ] UI/UX improvements
  - [ ] Minor logic errors
- [ ] Document known issues
  - [ ] List unfixed low-priority bugs
  - [ ] Document workarounds
  - [ ] Note browser/device-specific issues
  - [ ] Update README with limitations
- [ ] Verify all fixes
  - [ ] Re-test each fixed bug
  - [ ] Ensure no regressions
  - [ ] Update test results
  - [ ] Final smoke test
- [ ] Update documentation
  - [ ] Update README.md
  - [ ] Update CHANGELOG.md
  - [ ] Document known issues
  - [ ] Add troubleshooting guide

## Acceptance Criteria
- [ ] Zero critical bugs remaining
- [ ] All high-priority bugs fixed
- [ ] 80%+ of medium-priority bugs fixed
- [ ] All fixes verified and tested
- [ ] No regressions introduced by fixes
- [ ] Known issues documented in README
- [ ] Game stable and fully playable
- [ ] All changes committed to git
- [ ] Version tagged for release

## Bug Tracking and Management

### Bug Report Template

```markdown
## Bug Report #[ID]

**Title:** [Short descriptive title]
**Severity:** [Critical / Major / Minor]
**Priority:** [P0 / P1 / P2 / P3]
**Status:** [Open / In Progress / Fixed / Won't Fix]

### Description
[Detailed description of the bug]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Platform: [Desktop/Mobile]
- Browser: [Chrome/Firefox/Safari/etc.]
- Version: [Browser version]
- Device: [Device name if mobile]

### Screenshots/Videos
[Link to screenshots or videos]

### Console Errors
```
[Paste console errors here]
```

### Additional Notes
[Any other relevant information]

### Fix
**Implemented By:** [Developer name]
**Date Fixed:** [Date]
**Files Changed:** [List of files]
**Solution:** [Description of fix]
**Verified By:** [Tester name]
```

---

### Bug Severity Definitions

#### Critical (P0) - Must Fix Immediately
**Definition:** Bugs that make the game unplayable or cause data loss

**Examples:**
- Game crashes on startup
- Game crashes during normal gameplay
- Data corruption or loss
- Security vulnerabilities
- Complete feature failure (no collision detection, etc.)

**Timeline:** Fix immediately
**Assignee:** Lead developer

---

#### Major (P1) - Should Fix Before Release
**Definition:** Bugs that significantly impact gameplay or user experience

**Examples:**
- Incorrect game logic (wrong scoring, wave progression broken)
- Major visual issues (sprites not rendering, UI broken)
- Audio completely broken
- Performance below 30 FPS on target devices
- Scene transitions broken

**Timeline:** Fix within 1-2 hours
**Assignee:** Primary developer

---

#### Minor (P2) - Nice to Fix
**Definition:** Bugs that have minor impact on experience

**Examples:**
- Small visual glitches
- Typos in text
- Minor audio issues (wrong volume)
- Performance between 30-60 FPS
- Minor UI issues

**Timeline:** Fix if time allows
**Assignee:** Any developer

---

#### Enhancement (P3) - Future Work
**Definition:** Improvements or features, not actual bugs

**Examples:**
- Feature requests
- Quality of life improvements
- Optional optimizations
- Nice-to-have features

**Timeline:** Post-launch
**Assignee:** Backlog

---

## Bug Fixing Workflow

### Step 1: Triage and Prioritization

```markdown
1. Review all bug reports from testing
2. Categorize each by severity
3. Assign priority (P0-P3)
4. Estimate effort (small/medium/large)
5. Create fixing order:
   - P0 (Critical) first
   - P1 (Major) second
   - P2 (Minor) if time allows
   - P3 (Enhancement) to backlog
```

**Prioritization Matrix:**

| Severity | Impact | Priority | Action |
|----------|--------|----------|--------|
| Critical | High | P0 | Fix immediately |
| Major | Medium-High | P1 | Fix before release |
| Minor | Low-Medium | P2 | Fix if time allows |
| Enhancement | Low | P3 | Post-launch |

---

### Step 2: Fixing Process

For each bug:

```markdown
1. **Reproduce the bug**
   - Follow steps to reproduce
   - Verify bug exists
   - Understand root cause

2. **Analyze the issue**
   - Check related code
   - Review error logs
   - Identify problematic logic

3. **Develop a fix**
   - Write minimal change to fix bug
   - Avoid introducing new bugs
   - Consider edge cases

4. **Test the fix**
   - Verify bug is fixed
   - Test related functionality
   - Check for regressions
   - Test on all platforms

5. **Document the fix**
   - Update bug report
   - Add code comments
   - Update CHANGELOG
   - Commit with descriptive message

6. **Close bug report**
   - Mark as "Fixed"
   - Add verification notes
   - Link to commit
```

---

### Step 3: Regression Testing

After each fix, test:

```markdown
- [ ] The specific bug is fixed
- [ ] Related functionality still works
- [ ] No new bugs introduced
- [ ] Performance not degraded
- [ ] All scenes still work
- [ ] Audio still works
- [ ] Quick smoke test (5 minutes)
```

---

## Common Bug Categories and Fixes

### 1. Collision Detection Bugs

**Common Issues:**
- Collisions not detected
- False positive collisions
- Collision callbacks not firing
- Performance issues with many collisions

**Typical Fixes:**
```typescript
// Issue: Destroyed objects still in collision checks
// Fix: Filter out destroyed objects
const activeZomboids = this.zomboids.filter(z => z.active);
this.physics.overlap(projectiles, activeZomboids, callback);

// Issue: Collision bounds incorrect
// Fix: Set proper bounds
zomboid.setSize(radius * 2, radius * 2);
zomboid.setCircle(radius);

// Issue: Callbacks not firing
// Fix: Ensure proper callback context
this.physics.overlap(a, b, this.onCollision, null, this);
```

---

### 2. Memory Leak Bugs

**Common Issues:**
- Event listeners not removed
- Tweens not destroyed
- Sounds not cleaned up
- Graphics not cleared

**Typical Fixes:**
```typescript
// Issue: Event listeners leak
// Fix: Remove in shutdown
shutdown(): void {
  this.events.off('some_event', this.handler, this);
  this.input.off('pointerdown', this.onClick, this);
}

// Issue: Tweens not destroyed
// Fix: Stop and destroy tweens
shutdown(): void {
  this.tweens.killAll();
}

// Issue: Sounds not destroyed
// Fix: Destroy sounds properly
shutdown(): void {
  if (this.music) {
    this.music.stop();
    this.music.destroy();
  }
}

// Issue: Graphics leak
// Fix: Clear and destroy
shutdown(): void {
  this.children.each((child) => {
    if (child instanceof Phaser.GameObjects.Graphics) {
      child.clear();
      child.destroy();
    }
  });
}
```

---

### 3. Audio Bugs

**Common Issues:**
- Audio not playing
- Volume too loud/quiet
- Audio not stopping
- Audio not looping correctly

**Typical Fixes:**
```typescript
// Issue: Audio not playing on mobile
// Fix: Unlock audio on first interaction
this.input.once('pointerdown', () => {
  this.audioManager.unlockAudio();
});

// Issue: Volume incorrect
// Fix: Apply correct volume calculation
const volume = this.config.masterVolume * this.config.sfxVolume;
this.sound.play(key, { volume });

// Issue: Music not looping
// Fix: Set loop property
this.sound.add(key, { loop: true });

// Issue: Overlapping music
// Fix: Stop current before playing new
if (this.currentMusic) {
  this.currentMusic.stop();
}
this.currentMusic = this.sound.add(key, { loop: true });
```

---

### 4. Scene Transition Bugs

**Common Issues:**
- Black screen during transition
- Scene not loading
- Data not passing between scenes
- Music not transitioning

**Typical Fixes:**
```typescript
// Issue: Data not passed
// Fix: Pass data object
this.scene.start('GameScene', { chapter: this.selectedChapter });

// Issue: Previous scene not cleaned up
// Fix: Implement shutdown()
shutdown(): void {
  // Clean up resources
  this.audioManager.stopMusic();
  this.events.removeAllListeners();
}

// Issue: Scene loading too long
// Fix: Preload in BootScene
preload(): void {
  this.load.image('all_assets');
  this.load.audio('all_audio');
}
```

---

### 5. Input Bugs

**Common Issues:**
- Input not responding
- Double-click issues
- Touch not working on mobile
- Input lag

**Typical Fixes:**
```typescript
// Issue: Input not responding
// Fix: Ensure interactive set
this.setInteractive({ useHandCursor: true });

// Issue: Double-click
// Fix: Add debouncing
private lastClickTime = 0;
onClick(): void {
  const now = this.scene.time.now;
  if (now - this.lastClickTime < 300) return; // 300ms debounce
  this.lastClickTime = now;
  // Handle click
}

// Issue: Touch not working
// Fix: Use 'pointerdown' instead of 'click'
this.on('pointerdown', this.onClick, this);

// Issue: Input lag
// Fix: Direct input, not tween
this.input.on('pointermove', (pointer) => {
  this.player.x = pointer.x;
});
```

---

### 6. Performance Bugs

**Common Issues:**
- FPS drops
- Memory leaks
- Slow collision detection
- Rendering bottleneck

**Typical Fixes:**
```typescript
// Issue: Too many draw calls
// Fix: Use texture atlas
this.load.atlas('sprites', 'sprites.png', 'sprites.json');

// Issue: Collision checking all objects
// Fix: Check only active objects
const active = this.zomboids.filter(z => z.active);
this.physics.overlap(projectiles, active, callback);

// Issue: Creating objects every frame
// Fix: Use object pool
class ProjectilePool {
  private pool: Projectile[] = [];

  get(): Projectile {
    return this.pool.pop() || new Projectile();
  }

  release(obj: Projectile): void {
    obj.reset();
    this.pool.push(obj);
  }
}

// Issue: Heavy update logic
// Fix: Throttle or cache calculations
private cachedValue: number;
private lastCalculation = 0;

update(time: number): void {
  if (time - this.lastCalculation > 100) { // Update every 100ms
    this.cachedValue = this.expensiveCalculation();
    this.lastCalculation = time;
  }
}
```

---

### 7. UI/Visual Bugs

**Common Issues:**
- Text rendering incorrectly
- Graphics not clearing
- Sprites not displaying
- Positioning issues

**Typical Fixes:**
```typescript
// Issue: Text cut off
// Fix: Set word wrap
this.add.text(x, y, text, {
  fontSize: '20px',
  wordWrap: { width: 400 }
});

// Issue: Graphics not clearing
// Fix: Clear before redrawing
draw(): void {
  this.graphics.clear();
  this.graphics.fillStyle(0xff0000);
  this.graphics.fillRect(x, y, w, h);
}

// Issue: Sprite not showing
// Fix: Ensure loaded and visible
if (!this.textures.exists('sprite_key')) {
  console.error('Texture not loaded');
}
this.sprite.setVisible(true);

// Issue: Positioning wrong on mobile
// Fix: Use scale manager
const centerX = this.scale.width / 2;
const centerY = this.scale.height / 2;
```

---

## Testing After Fixes

### Smoke Test Checklist

After all fixes, run quick smoke test:

```markdown
- [ ] Game loads without errors
- [ ] MenuScene displays correctly
- [ ] Can start Chapter 1
- [ ] Gameplay works (heroes move, shoot, collide)
- [ ] Audio plays (music + SFX)
- [ ] Can complete wave
- [ ] Can complete chapter
- [ ] Game Over works
- [ ] Can restart
- [ ] Can return to menu
- [ ] No console errors
- [ ] Performance acceptable (30+ FPS)
```

**Time:** 5-10 minutes
**Must Pass:** All checklist items

---

### Full Regression Test

After critical fixes, run full test:

```markdown
- [ ] All functional tests from Story 6.1.1
- [ ] All performance tests from Story 6.1.2
- [ ] Verify each fixed bug
- [ ] Check for new bugs
- [ ] Test on multiple browsers
- [ ] Test on mobile device
```

**Time:** 30-60 minutes
**Run after:** P0 and P1 fixes

---

## Known Issues Documentation

### README.md Update

Add "Known Issues" section:

```markdown
## Known Issues

### Desktop
- [Issue 1]: [Description and workaround]
- [Issue 2]: [Description and workaround]

### Mobile
- [Issue 1]: [Description and workaround]
- [Issue 2]: [Description and workaround]

### Browser-Specific
- Safari: [Issue and workaround]
- Firefox: [Issue and workaround]

### Planned Fixes
- [Issue to be fixed in next version]
- [Issue to be fixed in next version]
```

---

### CHANGELOG.md Update

Document all fixes:

```markdown
## [1.0.0] - 2025-10-24

### Fixed
- Fixed collision detection not working on edge cases (#12)
- Fixed memory leak in GameScene shutdown (#15)
- Fixed audio not playing on iOS Safari (#18)
- Fixed scene transition black screen (#22)
- Fixed input lag on mobile devices (#25)
- Fixed FPS drops during heavy waves (#30)

### Known Issues
- Minor visual glitch on Safari when transitioning scenes
- Audio unlock required on first tap (mobile browsers)
- Performance may vary on older mobile devices

### Improvements
- Optimized collision detection performance
- Improved memory management
- Enhanced mobile touch responsiveness
```

---

## Verification Checklist

Before marking bug as fixed:

```markdown
- [ ] Bug reproduced on original report
- [ ] Fix implemented and tested
- [ ] Bug no longer reproduces
- [ ] Related functionality still works
- [ ] No regressions introduced
- [ ] Tested on all affected platforms
- [ ] Code reviewed (if team)
- [ ] Fix committed to git
- [ ] Bug report updated
- [ ] CHANGELOG updated
```

---

## Git Workflow for Bug Fixes

### Commit Message Format

```bash
# For bug fixes
git commit -m "fix: [Brief description] (#bug-id)

[Detailed description of the fix]

Fixes #[bug-id]"

# Example
git commit -m "fix: Collision detection not firing on destroyed objects (#15)

Added check to filter out destroyed zomboids before collision detection.
This prevents callbacks from firing on inactive objects.

Fixes #15"
```

### Branching Strategy (Optional)

```bash
# Create bug fix branch
git checkout -b fix/collision-detection-#15

# Make changes and commit
git add .
git commit -m "fix: Collision detection issue"

# Merge back to main
git checkout main
git merge fix/collision-detection-#15
git branch -d fix/collision-detection-#15
```

---

## Success Metrics
- ✅ Zero critical (P0) bugs
- ✅ Zero major (P1) bugs
- ✅ 80%+ minor (P2) bugs fixed
- ✅ All fixes verified and tested
- ✅ No regressions introduced
- ✅ Known issues documented
- ✅ Game stable and playable
- ✅ CHANGELOG updated
- ✅ README updated
- ✅ Ready for release

## Final Release Checklist

Before marking Phase 6 complete:

```markdown
- [ ] All critical bugs fixed
- [ ] All high-priority bugs fixed
- [ ] Full smoke test passed
- [ ] Performance targets met
- [ ] Works on all target platforms
- [ ] Documentation updated (README, CHANGELOG)
- [ ] Known issues documented
- [ ] Code committed to git
- [ ] Version tagged (v1.0.0)
- [ ] Build tested (npm run build)
- [ ] Deployment tested
- [ ] Final QA sign-off
```

---

## Notes
- Focus on P0 and P1 bugs first
- Don't let perfect be the enemy of good (P2 bugs can wait)
- Document everything, even if not fixed
- Test thoroughly after each fix
- Commit frequently with clear messages
- Keep CHANGELOG updated
- Every fix should be verified by a tester (or self-verify)
- When in doubt, fix it - bugs rarely fix themselves
- Be realistic about time - you may not fix everything

## Next Steps
After completion:
- **Release v1.0.0!**
- Monitor for post-launch issues
- Plan post-launch enhancements
- Consider Epic: Endless Mode
- Consider Epic: Additional Chapters
