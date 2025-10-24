# Story 6.1.2: Performance Testing

**Epic:** 6.1 Comprehensive Testing
**Phase:** 6 - Testing and Bug Fixes (Day 12)
**Estimated Time:** 3 hours
**Status:** 📋 READY TO START

## Description
Conduct comprehensive performance testing to ensure the game maintains 60 FPS, has no memory leaks, and performs well on all target platforms. This includes continuous playtesting, FPS monitoring, memory profiling, and testing on multiple devices to identify any performance degradation over time.

## User Story
**As a performance engineer**, I want to measure and optimize game performance so that players have a smooth, lag-free experience on all devices.

## Tasks
- [ ] Set up performance monitoring tools
  - [ ] Enable browser DevTools performance profiler
  - [ ] Set up FPS counter
  - [ ] Enable memory profiler
  - [ ] Prepare performance data recording
- [ ] Run continuous playtest (30+ minutes)
  - [ ] Play through all 3 chapters continuously
  - [ ] Monitor FPS throughout
  - [ ] Monitor memory usage
  - [ ] Record any performance drops
  - [ ] Check for gradual degradation
- [ ] Test on multiple devices
  - [ ] Desktop (high-end)
  - [ ] Desktop (mid-range)
  - [ ] Mobile (iOS - high-end)
  - [ ] Mobile (iOS - mid-range)
  - [ ] Mobile (Android - high-end)
  - [ ] Mobile (Android - mid-range)
- [ ] Identify performance bottlenecks
  - [ ] Profile rendering performance
  - [ ] Profile collision detection
  - [ ] Profile entity spawning
  - [ ] Profile audio playback
  - [ ] Analyze frame time spikes
- [ ] Test edge cases
  - [ ] Maximum zomboids on screen
  - [ ] Maximum projectiles on screen
  - [ ] All 6 heroes active
  - [ ] Ultimate weapon (tier 6) rapid fire
  - [ ] Multiple scene transitions

## Acceptance Criteria
- [ ] 60 FPS maintained on desktop (high-end and mid-range)
- [ ] 30+ FPS maintained on mobile (acceptable threshold)
- [ ] No FPS drops below 30 on any platform
- [ ] No memory leaks detected (memory stays stable over time)
- [ ] Memory usage < 200 MB on desktop
- [ ] Memory usage < 150 MB on mobile
- [ ] No performance degradation over 30-minute playtest
- [ ] Load times < 2 seconds on all platforms
- [ ] Scene transitions < 500ms
- [ ] Input latency < 50ms
- [ ] Works smoothly on all target platforms

## Performance Testing Tools

### Browser DevTools

**Chrome DevTools:**
```markdown
1. Open Chrome DevTools (F12)
2. Navigate to "Performance" tab
3. Click "Record" button
4. Play game for 1-2 minutes
5. Click "Stop" to view timeline
6. Analyze:
   - FPS (should be 60)
   - Frame time (should be ~16ms)
   - Long tasks (should be minimal)
   - Memory allocations
```

**Memory Profiler:**
```markdown
1. Open Chrome DevTools
2. Navigate to "Memory" tab
3. Take heap snapshot before playing
4. Play for 5 minutes
5. Take heap snapshot after
6. Compare snapshots:
   - Look for retained objects
   - Check for memory growth
   - Identify leak sources
```

**Firefox DevTools:**
- Similar to Chrome
- Use "Performance" tab
- Use "Memory" tool

**Safari DevTools:**
- Web Inspector → Timelines
- Monitor FPS and CPU usage
- Check for memory growth

---

## Test Scenarios

### 1. Continuous Playtest (30 Minutes)

**Test Procedure:**
```markdown
1. Open game in browser
2. Start Performance recording in DevTools
3. Enable FPS counter (Chrome: Ctrl+Shift+P → "Show frames per second")
4. Play continuously for 30 minutes:
   - Complete Chapter 1
   - Complete Chapter 2
   - Complete Chapter 3
   - Restart and replay Chapter 1
5. Stop Performance recording
6. Analyze results

What to monitor:
- FPS: Should stay at 60 (desktop) or 30+ (mobile)
- Memory: Should not grow continuously
- CPU: Should stay below 80%
- Frame time: Should stay around 16ms (60 FPS)
```

**Expected Results:**
- FPS stable throughout
- Memory usage plateaus (not continuous growth)
- No sudden spikes or freezes
- Game remains responsive

**Red Flags:**
- FPS drops below 30
- Memory grows continuously (leak)
- CPU usage spikes to 100%
- Frame time exceeds 33ms regularly

---

### 2. FPS Monitoring

**Desktop Target:** 60 FPS
**Mobile Target:** 30+ FPS

**Test on different scenarios:**

```markdown
Scenario 1: Light Load (Wave 1)
- Expected FPS: 60 (desktop), 60 (mobile)
- Few zomboids, low projectile count

Scenario 2: Medium Load (Wave 3-4)
- Expected FPS: 60 (desktop), 45+ (mobile)
- More zomboids, moderate projectiles

Scenario 3: Heavy Load (Wave 5, Ultimate Weapon)
- Expected FPS: 60 (desktop), 30+ (mobile)
- Maximum zomboids, rapid fire weapon

Scenario 4: Stress Test
- Expected FPS: 45+ (desktop), 30+ (mobile)
- Intentionally create worst-case scenario:
  - Ultimate weapon (tier 6) at 6 heroes
  - Boss zomboid waves
  - Multiple timers on screen
```

**Measuring FPS:**

1. **Chrome Built-in:**
   - Press `Ctrl+Shift+P`
   - Type "Show frames per second"
   - FPS meter appears in top-right

2. **stats.js Library (if implemented):**
   ```typescript
   // Add to GameScene
   import Stats from 'stats.js';

   create() {
     const stats = new Stats();
     stats.showPanel(0); // 0: fps, 1: ms, 2: mb
     document.body.appendChild(stats.dom);

     this.events.on('postupdate', () => {
       stats.update();
     });
   }
   ```

3. **Manual Calculation:**
   ```typescript
   // In GameScene
   private fpsCounter = 0;
   private fpsTime = 0;

   update(time: number, delta: number) {
     this.fpsCounter++;
     this.fpsTime += delta;

     if (this.fpsTime >= 1000) {
       console.log(`FPS: ${this.fpsCounter}`);
       this.fpsCounter = 0;
       this.fpsTime = 0;
     }
   }
   ```

---

### 3. Memory Profiling

**Test for Memory Leaks:**

```markdown
Step 1: Baseline Measurement
1. Open game
2. Take heap snapshot (DevTools → Memory → Take snapshot)
3. Note initial memory usage (e.g., 45 MB)

Step 2: Short Play Session
1. Play for 5 minutes
2. Complete 1-2 chapters
3. Take second snapshot
4. Compare with baseline
   - Expected: Small increase (< 20 MB)
   - Red flag: Large increase (> 50 MB)

Step 3: Return to Menu
1. Return to MenuScene
2. Wait 10 seconds (allow GC to run)
3. Take third snapshot
4. Compare with baseline
   - Expected: Return close to baseline
   - Red flag: Significantly higher than baseline

Step 4: Long Play Session
1. Play for 30 minutes
2. Take snapshots every 5 minutes
3. Plot memory growth over time
   - Expected: Sawtooth pattern (growth then GC)
   - Red flag: Continuous upward trend

Step 5: Heap Analysis
1. In DevTools, compare snapshots
2. Look for "Detached DOM nodes"
3. Look for retained Phaser objects
4. Identify leak sources:
   - Event listeners not removed
   - Tweens not stopped
   - Sounds not destroyed
   - Graphics not cleared
```

**Memory Usage Targets:**

| Platform | Initial | During Gameplay | After 30 min |
|----------|---------|----------------|--------------|
| Desktop  | < 50 MB | < 150 MB       | < 200 MB     |
| Mobile   | < 40 MB | < 100 MB       | < 150 MB     |

**Common Memory Leak Sources:**
- Event listeners not removed in scene shutdown
- Phaser.Sound objects not destroyed
- Phaser.Tweens not stopped/destroyed
- Graphics objects not cleared
- Timers not removed
- Object pools not properly recycled

---

### 4. Multi-Device Testing

**Test on these device categories:**

#### Desktop - High-End
**Specs:** Intel i7/AMD Ryzen 7, 16GB RAM, Dedicated GPU
**Expected FPS:** 60
**Expected Memory:** < 150 MB
**Test Duration:** 30 minutes

#### Desktop - Mid-Range
**Specs:** Intel i5/AMD Ryzen 5, 8GB RAM, Integrated GPU
**Expected FPS:** 60
**Expected Memory:** < 150 MB
**Test Duration:** 15 minutes

#### Mobile - iOS High-End
**Device:** iPhone 13 Pro or newer
**Expected FPS:** 60
**Expected Memory:** < 120 MB
**Test Duration:** 15 minutes

#### Mobile - iOS Mid-Range
**Device:** iPhone 11 or similar
**Expected FPS:** 30+
**Expected Memory:** < 100 MB
**Test Duration:** 10 minutes

#### Mobile - Android High-End
**Device:** Samsung Galaxy S21 or newer
**Expected FPS:** 45+
**Expected Memory:** < 120 MB
**Test Duration:** 15 minutes

#### Mobile - Android Mid-Range
**Device:** Budget Android device (2-3 years old)
**Expected FPS:** 30+
**Expected Memory:** < 100 MB
**Test Duration:** 10 minutes

**Device Testing Checklist:**
```markdown
For each device:
- [ ] Install/open game
- [ ] Note initial load time
- [ ] Play Chapter 1 completely
- [ ] Monitor FPS (use DevTools remote debugging)
- [ ] Check for frame drops
- [ ] Test touch/click responsiveness
- [ ] Check audio playback
- [ ] Test scene transitions
- [ ] Monitor battery drain (mobile)
- [ ] Check for overheating (mobile)
- [ ] Document performance issues
```

---

### 5. Performance Bottleneck Analysis

**Identify and analyze bottlenecks:**

#### Rendering Performance
```markdown
Potential Issues:
- Too many draw calls
- Large textures
- Complex graphics rendering
- Inefficient particle effects

How to Test:
1. Open DevTools Performance tab
2. Record while playing
3. Look at "Rendering" section
4. Identify long tasks
5. Check "Paint" and "Composite Layers"

Optimization Checks:
- [ ] Sprites use texture atlas (reduces draw calls)
- [ ] Graphics objects cleared when not needed
- [ ] No unnecessary repaints
- [ ] Culling enabled for off-screen objects
```

#### Collision Detection
```markdown
Potential Issues:
- O(n²) collision checks
- Checking all objects every frame
- No spatial partitioning

How to Test:
1. Add performance markers:
   ```typescript
   performance.mark('collision-start');
   this.collisionManager.update();
   performance.mark('collision-end');
   performance.measure('collision', 'collision-start', 'collision-end');
   ```
2. Check time spent in collision detection
3. Should be < 2ms per frame

Optimization Checks:
- [ ] Using Phaser's built-in collision (optimized)
- [ ] Not checking destroyed objects
- [ ] Efficient collision bounds
```

#### Entity Spawning
```markdown
Potential Issues:
- Creating new objects every spawn
- Not using object pools
- Heavy instantiation logic

How to Test:
1. Profile during wave with heavy spawning
2. Look for GC pauses
3. Check object creation rate

Optimization Checks:
- [ ] Object pools implemented
- [ ] Minimal object creation during gameplay
- [ ] Efficient initialization
```

#### Audio Playback
```markdown
Potential Issues:
- Loading audio during gameplay
- Too many simultaneous sounds
- Audio context overhead

How to Test:
1. Monitor audio performance
2. Check for audio lag
3. Test with music + many SFX

Optimization Checks:
- [ ] All audio preloaded in BootScene
- [ ] SFX throttled appropriately
- [ ] Audio context properly managed
```

---

## Performance Metrics Dashboard

**Create a performance tracking sheet:**

```markdown
## Performance Test Results

### Test Information
- Date: [Date]
- Build Version: [Version]
- Tester: [Name]

### Desktop Performance (Chrome)
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| FPS (Average) | 60 | [X] | ✅/⚠️/❌ |
| FPS (Minimum) | 45 | [X] | ✅/⚠️/❌ |
| Memory (Initial) | < 50 MB | [X] MB | ✅/⚠️/❌ |
| Memory (After 30min) | < 200 MB | [X] MB | ✅/⚠️/❌ |
| Load Time | < 2s | [X]s | ✅/⚠️/❌ |
| Scene Transition | < 500ms | [X]ms | ✅/⚠️/❌ |

### Mobile Performance (iOS)
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| FPS (Average) | 30+ | [X] | ✅/⚠️/❌ |
| FPS (Minimum) | 25 | [X] | ✅/⚠️/❌ |
| Memory (Initial) | < 40 MB | [X] MB | ✅/⚠️/❌ |
| Memory (After 15min) | < 150 MB | [X] MB | ✅/⚠️/❌ |
| Load Time | < 3s | [X]s | ✅/⚠️/❌ |

### Bottleneck Analysis
| System | Time per Frame | Status | Notes |
|--------|---------------|--------|-------|
| Rendering | < 10ms | ✅/⚠️/❌ | [notes] |
| Collision | < 2ms | ✅/⚠️/❌ | [notes] |
| Update Logic | < 3ms | ✅/⚠️/❌ | [notes] |
| Audio | < 1ms | ✅/⚠️/❌ | [notes] |

### Issues Found
1. [Issue description] - [Severity] - [Impact]
2. ...

### Recommendations
1. [Optimization recommendation]
2. ...
```

---

## Edge Case Performance Tests

### Test 1: Maximum Zomboids
```markdown
Setup:
- Create wave with 50+ zomboids
- All spawning simultaneously

Expected:
- FPS: 45+ (desktop), 30+ (mobile)
- No freezing
- Smooth rendering

Test:
- [ ] Spawn maximum zomboids
- [ ] Monitor FPS
- [ ] Check collision performance
- [ ] Verify game remains playable
```

### Test 2: Maximum Projectiles
```markdown
Setup:
- 6 heroes with Ultimate weapon (tier 6)
- Rapid fire

Expected:
- FPS: 50+ (desktop), 30+ (mobile)
- Projectiles render smoothly
- Audio not overwhelming

Test:
- [ ] Fire maximum projectiles
- [ ] Monitor FPS
- [ ] Check rendering performance
- [ ] Verify audio throttling
```

### Test 3: Scene Transition Stress
```markdown
Setup:
- Transition between scenes rapidly
- With maximum entities on screen

Expected:
- Transitions < 500ms
- No crashes
- No memory leaks

Test:
- [ ] Rapid scene switching (10 times)
- [ ] Monitor memory
- [ ] Check for cleanup
- [ ] Verify state consistency
```

### Test 4: Extended Play Session
```markdown
Setup:
- Play for 1+ hour
- Complete multiple chapters

Expected:
- No performance degradation
- Memory stable
- FPS consistent

Test:
- [ ] Play for 60 minutes
- [ ] Record FPS every 10 minutes
- [ ] Monitor memory every 10 minutes
- [ ] Check for gradual slowdown
```

---

## Performance Optimization Checklist

If performance issues found, check:

### Rendering Optimizations
- [ ] Texture atlas used for sprites
- [ ] Minimal draw calls
- [ ] Off-screen culling enabled
- [ ] Graphics cleared when not needed
- [ ] No unnecessary camera effects

### Game Loop Optimizations
- [ ] Update logic efficient
- [ ] No heavy calculations in update()
- [ ] Collision checks optimized
- [ ] Object pools implemented
- [ ] Destroyed objects removed from arrays

### Memory Optimizations
- [ ] Event listeners removed on shutdown
- [ ] Tweens stopped and destroyed
- [ ] Sounds destroyed properly
- [ ] Graphics cleared
- [ ] Timers removed

### Audio Optimizations
- [ ] Audio preloaded
- [ ] SFX throttled
- [ ] Max concurrent sounds limited
- [ ] Audio cleaned up properly

---

## Success Metrics
- ✅ 60 FPS maintained on desktop
- ✅ 30+ FPS maintained on mobile
- ✅ No memory leaks detected
- ✅ Memory usage within targets
- ✅ No performance degradation over 30 minutes
- ✅ Load times < 2 seconds
- ✅ Game playable on all target devices
- ✅ No critical performance issues

## Next Steps
After completion:
- Story 6.1.3: Bug Fixing
- Address any performance issues found
- Implement optimizations if needed

## Notes
- Focus on worst-case scenarios (maximum entities, longest playtime)
- Test on real devices, not just emulators
- Use browser's performance profiler for detailed analysis
- Record all performance metrics for comparison
- Some performance variation is normal
- Prioritize desktop 60 FPS, mobile 30+ FPS
- Memory leaks are critical issues that must be fixed
