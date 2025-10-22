# Story 5.2.3: Mobile Testing and Optimization

**Epic:** 5.2 Performance Optimization
**Phase:** 5 - Audio and Polish (Days 10-11)
**Estimated Time:** 4 hours
**Status:** 📋 READY TO START

## Description
Comprehensive testing and optimization for mobile devices (iOS and Android) to ensure the game is playable, responsive, and performs well on mid-range phones. This includes touch input optimization, performance tuning for mobile hardware, battery usage optimization, and cross-browser compatibility testing.

## User Story
**As a mobile player**, I expect the game to run smoothly on my phone with responsive touch controls and reasonable battery usage.

## Tasks
- [ ] Test on iOS device (iPhone 8+, iOS 13+)
- [ ] Test on Android device (Galaxy S9 equivalent, Android 8+)
- [ ] Optimize touch input responsiveness
- [ ] Reduce visual effects for mobile performance
- [ ] Test battery usage during gameplay
- [ ] Test audio playback on mobile browsers
- [ ] Verify screen orientation handling (portrait lock)
- [ ] Test on different screen sizes/resolutions
- [ ] Optimize asset loading for mobile connections
- [ ] Document mobile-specific issues and fixes

## Acceptance Criteria
- [ ] Playable on iOS 13+ (iPhone 8 or newer)
- [ ] Playable on Android 8+ (mid-range devices)
- [ ] Touch input responsive (< 50ms lag)
- [ ] 30+ FPS maintained on mobile devices
- [ ] No excessive battery drain (< 20% per hour)
- [ ] Audio works correctly after user interaction unlock
- [ ] Portrait orientation maintained
- [ ] Game scales correctly on all tested screen sizes
- [ ] Loading time acceptable on 4G connection (< 10s)
- [ ] No mobile-specific bugs

## Files to Create/Modify
- `src/systems/InputManager.ts` - Optimize touch zones
- `src/effects/VisualEffects.ts` - Mobile-specific effect reductions
- `src/scenes/BootScene.ts` - Mobile detection and optimization
- `src/main.ts` - Mobile-specific Phaser configuration
- `src/utils/MobileDetector.ts` - NEW: Mobile device detection

## Dependencies
- Story 5.2.1: Profile and Optimize Rendering (completed)
- Story 5.2.2: Optimize Object Pooling (completed)
- Story 2.1.3: Implement InputManager (completed)

## Implementation Details

### MobileDetector.ts (NEW)

```typescript
export class MobileDetector {
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  static isIOS(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  static isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  static isTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }

  static getDevicePixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  static getScreenSize(): { width: number; height: number } {
    return {
      width: window.screen.width,
      height: window.screen.height,
    };
  }

  static supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  static getPerformanceLevel(): 'low' | 'medium' | 'high' {
    // Heuristic based on device capabilities
    const cores = navigator.hardwareConcurrency || 2;
    const memory = (navigator as any).deviceMemory || 4;
    const pixelRatio = window.devicePixelRatio || 1;

    if (cores >= 6 && memory >= 6) {
      return 'high';
    } else if (cores >= 4 && memory >= 4) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}
```

---

### main.ts Mobile Configuration

```typescript
import { MobileDetector } from './utils/MobileDetector';

const isMobile = MobileDetector.isMobile();
const performanceLevel = MobileDetector.getPerformanceLevel();

const config: Phaser.Types.Core.GameConfig = {
  type: MobileDetector.supportsWebGL() ? Phaser.WEBGL : Phaser.CANVAS,
  parent: 'game-container',
  backgroundColor: '#121212',
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-container',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  fps: {
    target: isMobile ? 30 : 60, // Target 30 FPS on mobile
    forceSetTimeOut: isMobile, // More battery-friendly on mobile
  },
  render: {
    pixelArt: false,
    antialias: !isMobile, // Disable antialiasing on mobile for performance
    roundPixels: isMobile, // Improve rendering performance on mobile
    transparent: false,
    powerPreference: isMobile ? 'low-power' : 'high-performance',
  },
  dom: {
    createContainer: true,
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene, ChapterCompleteScene],
};

// Store mobile status globally
window.GAME_IS_MOBILE = isMobile;
window.GAME_PERFORMANCE_LEVEL = performanceLevel;

const game = new Phaser.Game(config);
```

---

### InputManager.ts Touch Optimization

```typescript
export class InputManager {
  private touchZones: { left: Phaser.GameObjects.Zone; right: Phaser.GameObjects.Zone };
  private lastTouchTime: number = 0;
  private touchThrottle: number = 16; // ~60Hz max for touch

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // ... keyboard setup ...

    // Enhanced touch zones for mobile
    this.setupTouchZones();
  }

  private setupTouchZones(): void {
    const { width, height } = this.scene.scale;
    const isMobile = MobileDetector.isMobile();

    // Make touch zones larger and more accessible on mobile
    const zoneWidth = width / 2;
    const zoneHeight = height;

    // Left zone
    this.touchZones.left = this.scene.add.zone(0, 0, zoneWidth, zoneHeight);
    this.touchZones.left.setOrigin(0, 0);
    this.touchZones.left.setInteractive();

    // Right zone
    this.touchZones.right = this.scene.add.zone(zoneWidth, 0, zoneWidth, zoneHeight);
    this.touchZones.right.setOrigin(0, 0);
    this.touchZones.right.setInteractive();

    // Visual feedback for touch (mobile only)
    if (isMobile) {
      this.addTouchVisualFeedback();
    }

    // Touch event handlers with throttling
    this.touchZones.left.on('pointerdown', () => {
      this.handleTouch('left');
    });

    this.touchZones.right.on('pointerdown', () => {
      this.handleTouch('right');
    });

    // Optional: Show touch zones in debug mode
    if ((window as any).GAME_DEBUG_MODE) {
      this.showTouchZones();
    }
  }

  private handleTouch(direction: 'left' | 'right'): void {
    const now = this.scene.time.now;

    // Throttle touch events to prevent spam
    if (now - this.lastTouchTime < this.touchThrottle) {
      return;
    }

    this.lastTouchTime = now;

    if (direction === 'left') {
      this.leftPressed = true;
      this.rightPressed = false;
    } else {
      this.rightPressed = true;
      this.leftPressed = false;
    }

    // Clear after short delay (prevent sticky input)
    this.scene.time.delayedCall(100, () => {
      this.leftPressed = false;
      this.rightPressed = false;
    });
  }

  private addTouchVisualFeedback(): void {
    // Add subtle visual feedback for touches
    this.touchZones.left.on('pointerdown', () => {
      const feedback = this.scene.add.graphics();
      feedback.fillStyle(0x03DAC6, 0.1);
      feedback.fillRect(0, 0, this.touchZones.left.width, this.touchZones.left.height);
      feedback.setDepth(5);

      this.scene.tweens.add({
        targets: feedback,
        alpha: 0,
        duration: 150,
        onComplete: () => feedback.destroy(),
      });
    });

    this.touchZones.right.on('pointerdown', () => {
      const feedback = this.scene.add.graphics();
      feedback.fillStyle(0x03DAC6, 0.1);
      feedback.fillRect(this.touchZones.right.x, 0, this.touchZones.right.width, this.touchZones.right.height);
      feedback.setDepth(5);

      this.scene.tweens.add({
        targets: feedback,
        alpha: 0,
        duration: 150,
        onComplete: () => feedback.destroy(),
      });
    });
  }

  private showTouchZones(): void {
    const leftDebug = this.scene.add.graphics();
    leftDebug.lineStyle(2, 0xFF0000, 0.5);
    leftDebug.strokeRect(0, 0, this.touchZones.left.width, this.touchZones.left.height);

    const rightDebug = this.scene.add.graphics();
    rightDebug.lineStyle(2, 0x00FF00, 0.5);
    rightDebug.strokeRect(this.touchZones.right.x, 0, this.touchZones.right.width, this.touchZones.right.height);
  }
}
```

---

### VisualEffects.ts Mobile Optimization

```typescript
import { MobileDetector } from '@/utils/MobileDetector';

export class VisualEffects {
  private scene: Phaser.Scene;
  private isMobile: boolean;
  private performanceLevel: 'low' | 'medium' | 'high';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isMobile = MobileDetector.isMobile();
    this.performanceLevel = MobileDetector.getPerformanceLevel();
  }

  particleBurst(x: number, y: number, color: number = 0xFFFFFF, count: number = 8): void {
    // Reduce particle count on mobile/low-end devices
    let actualCount = count;

    if (this.isMobile || this.performanceLevel === 'low') {
      actualCount = Math.ceil(count / 2); // 50% reduction
    } else if (this.performanceLevel === 'medium') {
      actualCount = Math.ceil(count * 0.75); // 25% reduction
    }

    for (let i = 0; i < actualCount; i++) {
      // ... existing particle creation ...
    }
  }

  glowPulse(
    gameObject: Phaser.GameObjects.GameObject,
    duration: number = 1000,
    repeat: number = 2
  ): void {
    // Simplify effect on mobile
    if (this.isMobile) {
      // Simpler scale pulse instead of glow
      this.pulseScale(gameObject, 1.15, duration / 3);
      return;
    }

    // ... existing glow implementation ...
  }

  // Mobile-optimized screen shake
  screenShake(intensity: number = 5, duration: number = 300): void {
    const actualIntensity = this.isMobile ? intensity * 0.5 : intensity;
    const actualDuration = this.isMobile ? duration * 0.75 : duration;

    this.scene.cameras.main.shake(actualDuration, actualIntensity / 1000);
  }
}
```

---

### BootScene.ts Mobile Asset Optimization

```typescript
export class BootScene extends Phaser.Scene {
  preload(): void {
    const isMobile = MobileDetector.isMobile();

    // Show loading screen
    this.createLoadingScreen();

    // Load configs (lightweight, always load)
    this.loadConfigs();

    // Load audio (conditional based on device)
    if (!isMobile || MobileDetector.getPerformanceLevel() !== 'low') {
      this.loadAudioAssets();
    } else {
      console.log('Skipping audio on low-performance device');
    }

    // Monitor loading progress
    this.load.on('progress', (value: number) => {
      this.updateLoadingProgress(value);
    });

    this.load.on('complete', () => {
      console.log(`Assets loaded. Mobile: ${isMobile}`);
    });
  }

  create(): void {
    const isMobile = MobileDetector.isMobile();

    // Store mobile status in registry
    this.registry.set('isMobile', isMobile);
    this.registry.set('performanceLevel', MobileDetector.getPerformanceLevel());

    // Mobile-specific setup
    if (isMobile) {
      this.setupMobileOptimizations();
    }

    // Transition to menu
    this.scene.start('MenuScene');
  }

  private setupMobileOptimizations(): void {
    // Prevent default touch behaviors (like pull-to-refresh)
    document.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    // Lock orientation to portrait
    if (screen.orientation && (screen.orientation as any).lock) {
      (screen.orientation as any).lock('portrait').catch((err: any) => {
        console.warn('Could not lock orientation:', err);
      });
    }

    // Prevent zoom on double-tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Add to home screen prompt (PWA)
    this.setupAddToHomeScreen();
  }

  private setupAddToHomeScreen(): void {
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('Add to Home Screen prompt available');
    });
  }
}
```

---

## Mobile Device Testing Matrix

### iOS Testing
| Device | iOS Version | Screen | Status | Notes |
|--------|-------------|--------|--------|-------|
| iPhone 8 | 13+ | 4.7" | ⬜ | Minimum target |
| iPhone X | 13+ | 5.8" | ⬜ | Notch handling |
| iPhone 12 | 14+ | 6.1" | ⬜ | Modern baseline |
| iPad Mini | 13+ | 7.9" | ⬜ | Tablet testing |

### Android Testing
| Device | Android Version | Screen | Status | Notes |
|--------|----------------|--------|--------|-------|
| Galaxy S9 | 8+ | 5.8" | ⬜ | Minimum target |
| Pixel 4 | 10+ | 5.7" | ⬜ | Stock Android |
| OnePlus 7 | 9+ | 6.4" | ⬜ | High refresh rate |

### Browser Testing
| Browser | Platform | Status | Notes |
|---------|----------|--------|-------|
| Safari | iOS 13+ | ⬜ | Primary iOS browser |
| Chrome | Android 8+ | ⬜ | Primary Android browser |
| Firefox | Android 8+ | ⬜ | Alternative browser |
| Samsung Internet | Android 8+ | ⬜ | Popular on Samsung devices |

---

## Mobile-Specific Issues to Test

### Touch Input
- [ ] Touch zones responsive (no dead zones)
- [ ] No input lag (< 50ms)
- [ ] No accidental double-taps
- [ ] Touch feedback visible
- [ ] Works with screen protectors

### Performance
- [ ] 30+ FPS during gameplay
- [ ] No frame drops during heavy waves
- [ ] Loading time < 10 seconds on 4G
- [ ] Memory usage < 150MB
- [ ] Battery drain < 20% per hour

### Audio
- [ ] Audio unlocks on first interaction
- [ ] Music plays after unlock
- [ ] SFX plays correctly
- [ ] No audio lag
- [ ] Works with silent mode

### Display
- [ ] Portrait orientation locked
- [ ] Scales correctly on all screen sizes
- [ ] No UI clipping or overflow
- [ ] Readable text sizes
- [ ] HUD elements accessible

### Browser Compatibility
- [ ] Works in Safari (iOS)
- [ ] Works in Chrome (Android)
- [ ] Works in Firefox (Android)
- [ ] No console errors
- [ ] PWA installable

---

## Battery Usage Optimization

### Techniques
1. **Reduce FPS target** (30 instead of 60)
2. **Use setTimeout instead of requestAnimationFrame** (less CPU intensive)
3. **Reduce particle effects**
4. **Limit audio playback**
5. **Pause when tab hidden**

```typescript
// In GameScene
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    this.pauseGame();
  } else {
    this.resumeGame();
  }
});
```

---

## Testing Checklist

### Pre-Deployment Testing
- [ ] Test on actual iOS device (not just simulator)
- [ ] Test on actual Android device (not just emulator)
- [ ] Test on various screen sizes
- [ ] Test touch input responsiveness
- [ ] Test audio playback
- [ ] Test battery usage (30+ minutes)
- [ ] Test on slow network (3G/4G)
- [ ] Test orientation handling

### Performance Testing
- [ ] Profile FPS on mobile device
- [ ] Monitor memory usage
- [ ] Check battery drain rate
- [ ] Verify loading times
- [ ] Test during heavy waves

### User Experience Testing
- [ ] Controls feel responsive
- [ ] Text readable on small screens
- [ ] HUD not too crowded
- [ ] Touch targets large enough
- [ ] Game feels smooth

---

## Known Mobile Limitations

### iOS
- Audio requires user interaction to unlock
- Cannot programmatically enter fullscreen
- Screen orientation lock may not work in all browsers
- PWA limited compared to Android

### Android
- Wide variety of devices/browsers
- Some browsers may not support WebGL
- Audio autoplay policies vary by browser
- Performance varies significantly by device

---

## Success Metrics
- ✅ Playable on iOS 13+ and Android 8+
- ✅ Touch input responsive (< 50ms lag)
- ✅ 30+ FPS on mid-range devices
- ✅ Battery usage < 20% per hour
- ✅ Audio works correctly
- ✅ All screen sizes supported

## Next Steps
After Phase 5 completion:
- **Phase 6: Testing and Bug Fixes** (Day 12)
- Story 6.1.1: Functional Testing
- Story 6.1.2: Performance Testing
- Story 6.1.3: Bug Fixing

## Notes
- Always test on real devices, not just emulators
- iOS Safari has stricter limitations than Android Chrome
- Battery usage highly dependent on device and brightness
- Consider providing "low performance mode" toggle in settings
- Mobile users may prefer shorter gameplay sessions
- Touch zones should be large (minimum 44x44 pixels)
- Test with different hand sizes/grip styles
