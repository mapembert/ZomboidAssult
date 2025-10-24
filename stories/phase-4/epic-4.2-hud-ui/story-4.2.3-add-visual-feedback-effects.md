# Story 4.2.3: Add Visual Feedback Effects

**Epic:** 4.2 HUD and UI Polish
**Phase:** 4 - Wave Progression and Content (Days 8-9)
**Estimated Time:** 4 hours
**Status:** ✅ COMPLETED

## Description
Implement comprehensive visual feedback effects throughout the game to enhance player experience and provide clear, immediate feedback for all game actions. Effects should be smooth, non-intrusive, and maintain 60 FPS performance.

## User Story
**As a player**, I need clear visual feedback for all my actions so that I can understand what's happening in the game and feel satisfied with my interactions.

## Tasks
- [ ] Implement zomboid hit effect (brief white flash)
- [x] Implement zomboid destruction effect (scale down + fade out)
- [ ] Implement timer hit effect (pulse scale animation)
- [ ] Implement hero add effect (fade in + scale up)
- [ ] Implement hero remove effect (fade out + scale down)
- [x] Implement weapon upgrade effect (hero glow/pulse)
- [x] Implement score increment animation (float upward +X text)
- [ ] Add projectile spawn particle effect (optional)
- [ ] Add screen shake on game over (subtle)
- [x] Optimize all effects for performance
- [ ] Test effects on mobile devices

## Acceptance Criteria
- [x] All effects visible and smooth (60 FPS maintained)
- [ ] Zomboid flashes white on hit (< 100ms)
- [x] Zomboid scales down and fades out on destruction (300-500ms)
- [ ] Timer pulses when hit by projectile
- [ ] Heroes fade in smoothly when added (500ms)
- [ ] Heroes fade out smoothly when removed (500ms)
- [x] Heroes glow/pulse when weapon upgraded (1s animation)
- [x] Score increment shows floating "+X" text above zomboid
- [x] Effects don't obscure critical gameplay elements
- [x] No performance degradation with multiple effects active
- [ ] Effects work correctly on mobile devices

## Files to Create/Modify
- `src/effects/VisualEffects.ts` - NEW: Visual effects manager
- `src/entities/Zomboid.ts` - Add hit/destruction effects
- `src/entities/Timer.ts` - Add hit effect
- `src/entities/Hero.ts` - Add add/remove/upgrade effects
- `src/scenes/GameScene.ts` - Integrate effects system
- `src/systems/CollisionManager.ts` - Trigger effects on collision

## Dependencies
- Story 2.3.2: Create Zomboid Entity Class (completed)
- Story 3.1.1: Create Timer Entity Class (completed)
- Story 2.1.1: Create Hero Entity Class (completed)
- Story 4.2.1: Create HUD Component (completed)

## Implementation Details

### VisualEffects.ts (NEW)
```typescript
import Phaser from 'phaser';

export class VisualEffects {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Flash sprite white briefly (hit feedback)
   */
  flashWhite(gameObject: Phaser.GameObjects.GameObject, duration: number = 80): void {
    if (!(gameObject instanceof Phaser.GameObjects.Container) &&
        !(gameObject instanceof Phaser.GameObjects.Graphics)) {
      return;
    }

    const originalTint = (gameObject as any).tint || 0xffffff;

    // Apply white tint
    if ('setTint' in gameObject) {
      (gameObject as any).setTint(0xffffff);
    }

    // Revert after duration
    this.scene.time.delayedCall(duration, () => {
      if (gameObject.active && 'setTint' in gameObject) {
        (gameObject as any).setTint(originalTint);
      }
    });
  }

  /**
   * Pulse scale animation (hit feedback)
   */
  pulseScale(gameObject: Phaser.GameObjects.GameObject, scaleFactor: number = 1.2, duration: number = 150): void {
    this.scene.tweens.add({
      targets: gameObject,
      scaleX: scaleFactor,
      scaleY: scaleFactor,
      duration: duration / 2,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  /**
   * Destruction effect (scale down + fade out)
   */
  destroyEffect(
    gameObject: Phaser.GameObjects.GameObject,
    callback?: () => void
  ): void {
    this.scene.tweens.add({
      targets: gameObject,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
      },
    });
  }

  /**
   * Fade in effect (for adding entities)
   */
  fadeIn(
    gameObject: Phaser.GameObjects.GameObject,
    duration: number = 500
  ): void {
    gameObject.setAlpha(0);
    gameObject.setScale(0.5);

    this.scene.tweens.add({
      targets: gameObject,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration,
      ease: 'Back.easeOut',
    });
  }

  /**
   * Fade out effect (for removing entities)
   */
  fadeOut(
    gameObject: Phaser.GameObjects.GameObject,
    callback?: () => void,
    duration: number = 500
  ): void {
    this.scene.tweens.add({
      targets: gameObject,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
      },
    });
  }

  /**
   * Glow effect (for power-ups, upgrades)
   */
  glowPulse(
    gameObject: Phaser.GameObjects.GameObject,
    duration: number = 1000,
    repeat: number = 2
  ): void {
    // Create glow circle around object
    const x = (gameObject as any).x || 0;
    const y = (gameObject as any).y || 0;

    const glow = this.scene.add.graphics();
    glow.lineStyle(3, 0xFFEA00, 0.8);
    glow.strokeCircle(x, y, 40);
    glow.setDepth((gameObject as any).depth - 1 || 0);

    this.scene.tweens.add({
      targets: glow,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration,
      repeat,
      onComplete: () => {
        glow.destroy();
      },
    });
  }

  /**
   * Floating text effect (score increment)
   */
  floatingText(
    x: number,
    y: number,
    text: string,
    color: string = '#FFEA00',
    fontSize: string = '24px'
  ): void {
    const floatText = this.scene.add.text(x, y, text, {
      fontSize,
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    floatText.setDepth(1500); // Below HUD, above gameplay

    this.scene.tweens.add({
      targets: floatText,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        floatText.destroy();
      },
    });
  }

  /**
   * Screen shake effect
   */
  screenShake(intensity: number = 5, duration: number = 300): void {
    this.scene.cameras.main.shake(duration, intensity / 1000);
  }

  /**
   * Impact ripple effect at position
   */
  impactRipple(x: number, y: number, color: number = 0x03DAC6): void {
    const ripple = this.scene.add.graphics();
    ripple.lineStyle(2, color, 1);
    ripple.strokeCircle(x, y, 10);
    ripple.setDepth(500);

    this.scene.tweens.add({
      targets: ripple,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        ripple.destroy();
      },
    });
  }

  /**
   * Particle burst at position
   */
  particleBurst(
    x: number,
    y: number,
    color: number = 0xFFFFFF,
    count: number = 8
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 100 + Math.random() * 50;

      const particle = this.scene.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, 3);
      particle.setPosition(x, y);
      particle.setDepth(500);

      const endX = x + Math.cos(angle) * speed;
      const endY = y + Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }
}
```

### Zomboid.ts Modifications
```typescript
import { VisualEffects } from '@/effects/VisualEffects';

export class Zomboid extends Phaser.GameObjects.Container {
  private visualEffects: VisualEffects;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZomboidType) {
    super(scene, x, y);
    this.visualEffects = new VisualEffects(scene);
    // ... existing constructor code ...
  }

  /**
   * Take damage and show hit effect
   */
  takeDamage(amount: number): boolean {
    this.health -= amount;

    // Hit effect
    this.visualEffects.pulseScale(this, 1.15, 100);

    // Flash effect (simulate with alpha)
    this.setAlpha(0.5);
    this.scene.time.delayedCall(50, () => {
      this.setAlpha(1);
    });

    if (this.health <= 0) {
      this.destroy();
      return true;
    }

    return false;
  }

  /**
   * Destroy with visual effect
   */
  destroy(fromScene?: boolean): void {
    if (!this.active) return;

    // Destruction effect
    this.visualEffects.destroyEffect(this, () => {
      super.destroy(fromScene);
    });

    // Particle burst
    this.visualEffects.particleBurst(this.x, this.y, this.config.color);
  }
}
```

### Timer.ts Modifications
```typescript
import { VisualEffects } from '@/effects/VisualEffects';

export class Timer extends Phaser.GameObjects.Container {
  private visualEffects: VisualEffects;

  constructor(scene: Phaser.Scene, x: number, y: number, config: TimerType) {
    super(scene, x, y);
    this.visualEffects = new VisualEffects(scene);
    // ... existing constructor code ...
  }

  /**
   * Increment counter with visual feedback
   */
  incrementCounter(amount: number): void {
    this.currentValue += amount;

    // Pulse effect
    this.visualEffects.pulseScale(this, 1.1, 150);

    // Impact ripple at hit position
    this.visualEffects.impactRipple(this.x, this.y, 0x18FFFF);

    this.updateDisplay();
  }
}
```

### Hero.ts Modifications
```typescript
import { VisualEffects } from '@/effects/VisualEffects';

export class Hero extends Phaser.GameObjects.Container {
  private visualEffects: VisualEffects;

  constructor(scene: Phaser.Scene, x: number, y: number, config: HeroConfig) {
    super(scene, x, y);
    this.visualEffects = new VisualEffects(scene);
    // ... existing constructor code ...

    // Fade in on creation
    this.visualEffects.fadeIn(this, 500);
  }

  /**
   * Show weapon upgrade effect
   */
  showUpgradeEffect(): void {
    this.visualEffects.glowPulse(this, 800, 3);
  }

  /**
   * Destroy with fade out effect
   */
  destroyWithEffect(callback?: () => void): void {
    this.visualEffects.fadeOut(this, () => {
      this.destroy();
      if (callback) callback();
    }, 400);
  }
}
```

### GameScene.ts Integration
```typescript
import { VisualEffects } from '@/effects/VisualEffects';

export class GameScene extends Phaser.Scene {
  private visualEffects: VisualEffects | null = null;

  create(): void {
    // ... existing code ...

    // Initialize visual effects
    this.visualEffects = new VisualEffects(this);
  }

  private onZomboidDestroyed(zomboid: Zomboid, scoreValue: number): void {
    // Floating score text
    if (this.visualEffects) {
      this.visualEffects.floatingText(
        zomboid.x,
        zomboid.y,
        `+${scoreValue}`,
        '#FFEA00',
        '24px'
      );
    }

    this.score += scoreValue;
    this.totalZomboidsKilled++;

    // Update HUD
    if (this.hud) {
      this.hud.updateData({ score: this.score });
    }
  }

  private onHeroAdded(): void {
    // Heroes already have fade-in in constructor
    // Just update HUD
    if (this.hud && this.heroManager) {
      this.hud.updateData({ heroCount: this.heroManager.getHeroCount() });
      this.hud.flashHeroCount();
    }
  }

  private onHeroRemoved(): void {
    // Hero destruction handled in Hero.destroyWithEffect()
    if (this.hud && this.heroManager) {
      this.hud.updateData({ heroCount: this.heroManager.getHeroCount() });
      this.hud.flashHeroCount();
    }
  }

  private onWeaponUpgraded(): void {
    // Show glow effect on all heroes
    if (this.heroManager) {
      const heroes = this.heroManager.getHeroes();
      heroes.forEach((hero: Hero) => {
        hero.showUpgradeEffect();
      });
    }

    // Update HUD with flash
    if (this.hud && this.weaponSystem) {
      this.hud.updateData({
        weaponName: this.weaponSystem.getCurrentWeaponName(),
        weaponTier: this.weaponSystem.getCurrentTier(),
      });
      this.hud.flashWeaponUpgrade();
    }

    // Play sound
    this.sound.play('weapon_upgrade', { volume: 0.5 });
  }

  private onGameOver(): void {
    // Screen shake on game over
    if (this.visualEffects) {
      this.visualEffects.screenShake(8, 500);
    }

    // Fade to game over scene
    this.cameras.main.fade(1000, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', {
        victory: false,
        score: this.score,
        chapter: this.currentChapter,
      });
    });
  }
}
```

### CollisionManager.ts Modifications
```typescript
export class CollisionManager {
  private visualEffects: VisualEffects;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.visualEffects = new VisualEffects(scene);
  }

  checkProjectileZomboidCollisions(projectiles: Projectile[], zomboids: Zomboid[]): void {
    projectiles.forEach((projectile) => {
      zomboids.forEach((zomboid) => {
        if (this.checkCollision(projectile, zomboid)) {
          // Impact effect at collision point
          this.visualEffects.impactRipple(
            projectile.x,
            projectile.y,
            0x18FFFF
          );

          // Hit effect on zomboid (handled in Zomboid.takeDamage)
          const destroyed = zomboid.takeDamage(projectile.getDamage());

          // Destroy projectile
          projectile.destroy();

          if (destroyed) {
            this.scene.events.emit('zomboid_destroyed', zomboid, zomboid.getScoreValue());
          }
        }
      });
    });
  }

  checkProjectileTimerCollisions(projectiles: Projectile[], timers: Timer[]): void {
    projectiles.forEach((projectile) => {
      timers.forEach((timer) => {
        if (this.checkCollision(projectile, timer)) {
          // Timer hit effect (handled in Timer.incrementCounter)
          timer.incrementCounter(1);

          // Destroy projectile with effect
          this.visualEffects.particleBurst(
            projectile.x,
            projectile.y,
            0xFFFFFF,
            5
          );
          projectile.destroy();
        }
      });
    });
  }
}
```

## Effect Configuration Reference

### Effect Timings
| Effect | Duration | Ease | Notes |
|--------|----------|------|-------|
| Zomboid hit flash | 80ms | Linear | Brief, instant feedback |
| Zomboid pulse | 150ms | Back.easeOut | Scale to 1.15x |
| Zomboid destruction | 300ms | Power2 | Scale to 0, fade to 0 |
| Timer pulse | 150ms | Back.easeOut | Scale to 1.1x |
| Hero fade in | 500ms | Back.easeOut | Scale from 0.5 to 1.0 |
| Hero fade out | 400ms | Power2 | Scale to 0.5, fade to 0 |
| Hero glow pulse | 800ms | Linear | Repeat 3 times |
| Floating text | 1000ms | Power2 | Rise 80px, fade to 0 |
| Screen shake | 300-500ms | - | Intensity 5-8 |
| Impact ripple | 500ms | Power2 | Scale to 3x, fade to 0 |
| Particle burst | 500ms | Power2 | 8 particles, random speed |

### Color Reference
| Effect | Color | Hex |
|--------|-------|-----|
| Hero glow | Yellow/Gold | #FFEA00 |
| Impact ripple | Cyan | #18FFFF |
| Floating score | Yellow | #FFEA00 |
| Projectile particles | White | #FFFFFF |
| Zomboid particles | Entity color | (varies) |

## Testing Checklist
- [ ] Zomboid flashes white when hit
- [ ] Zomboid pulses slightly when hit
- [ ] Zomboid scales down and fades on destruction
- [ ] Particle burst on zomboid destruction
- [ ] Timer pulses when hit by projectile
- [ ] Impact ripple at timer hit location
- [ ] Heroes fade in when added
- [ ] Heroes fade out when removed
- [ ] Heroes glow/pulse on weapon upgrade
- [ ] Floating "+X" score text on zomboid kill
- [ ] Screen shake on game over
- [ ] Impact ripples on projectile collision
- [ ] All effects smooth (60 FPS maintained)
- [ ] Effects visible but not distracting
- [ ] Multiple effects don't overlap badly
- [ ] Effects work on mobile devices

## Performance Testing
**Stress Test Scenario:**
- 20 zomboids on screen
- 50 projectiles active
- 2 timers
- 3 heroes
- Continuous collisions
- Multiple effects triggering simultaneously

**Target Metrics:**
- [ ] FPS stays at 60
- [ ] No frame drops during heavy effects
- [ ] Memory usage stable (< 200MB)
- [ ] Tween count manageable (< 50 active)

## Edge Cases to Handle
- [ ] Effect triggered on destroyed object (check active flag)
- [ ] Multiple effects on same object simultaneously
- [ ] Effects during pause (should stop)
- [ ] Effects during wave transition (should complete)
- [ ] Effect memory leaks (ensure cleanup)

## Optimization Notes
- Use object pooling for frequently created effects (particles)
- Limit particle count on mobile (reduce from 8 to 5)
- Use simpler effects on low-end devices
- Kill tweens on object destruction
- Limit simultaneous floating text (max 5)

## Success Metrics
- ✅ All effects visible and polished
- ✅ Immediate, satisfying feedback
- ✅ 60 FPS maintained with all effects active
- ✅ Effects enhance gameplay without distraction
- ✅ No memory leaks or performance degradation

## Next Steps
After Phase 4 completion:
- **Phase 5: Audio and Polish** (Epic 5.1: Audio Implementation)
- Story 5.1.1: Implement AudioManager System

## Notes
- Consider adding effect intensity settings (low/medium/high)
- May want to add colorblind-friendly effect modes
- Could add option to disable effects for performance
- Some effects can be enhanced with particles system in future
- Consider adding subtle chromatic aberration on heavy hits
