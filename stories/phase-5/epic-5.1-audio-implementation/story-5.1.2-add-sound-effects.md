# Story 5.1.2: Add Sound Effects

**Epic:** 5.1 Audio Implementation
**Phase:** 5 - Audio and Polish (Days 10-11)
**Estimated Time:** 4 hours
**Status:** ✅ COMPLETED

## Description
Implement and integrate all sound effects (SFX) throughout the game to provide immediate audio feedback for player actions and game events. This includes sourcing or creating audio files, integrating them with the AudioManager, and ensuring they trigger at the correct times with appropriate volume balancing.

## User Story
**As a player**, I want to hear sound effects for all my actions so that I receive immediate audio feedback and feel more connected to the gameplay.

## Tasks
- [x] Source or create all required SFX files
  - [x] Projectile fire sound
  - [x] Zomboid hit sound
  - [x] Zomboid destroyed sound
  - [x] Timer increment sound
  - [x] Hero add sound
  - [x] Hero remove sound
  - [x] Weapon upgrade sound
  - [x] Wave complete sound
  - [x] Game over sound
- [x] Integrate SFX into GameScene
- [x] Integrate SFX into collision system
- [x] Integrate SFX into timer system
- [x] Integrate SFX into hero manager
- [x] Integrate SFX into weapon system
- [x] Balance volume levels for all SFX
- [x] Test SFX on desktop and mobile
- [x] Ensure no audio lag or overlap issues

## Acceptance Criteria
- [x] All 9 SFX files created and loaded
- [x] SFX plays at correct times for all game events
- [x] No audio lag (< 50ms from event to sound)
- [x] Volume balanced (no sounds too loud/quiet)
- [x] SFX works on desktop browsers (Chrome, Firefox, Safari)
- [x] SFX works on mobile browsers (iOS Safari, Android Chrome)
- [x] Rapid SFX triggering handled gracefully
- [x] No audio stuttering or clipping
- [x] SFX respects volume settings
- [x] Mute works for all SFX

## Files to Create/Modify
- `assets/audio/sfx/*.mp3` - All SFX audio files
- `src/scenes/GameScene.ts` - Trigger SFX on game events
- `src/systems/CollisionManager.ts` - SFX on collisions
- `src/systems/WeaponSystem.ts` - Projectile fire SFX
- `src/systems/HeroManager.ts` - Hero add/remove SFX
- `src/entities/Timer.ts` - Timer increment SFX
- `src/ui/WaveCompleteOverlay.ts` - Wave complete SFX

## Dependencies
- Story 5.1.1: Implement AudioManager System (MUST complete first)
- All game systems that trigger events

## Implementation Details

### SFX Specifications

#### 1. Projectile Fire (`projectile_fire.mp3`)
**Type:** Short electronic "pew" or laser sound
**Duration:** 100-200ms
**Volume:** Low (quiet, since frequent)
**Trigger:** Every time weapon fires
**Frequency:** Very high (multiple per second)

**Recommended Characteristics:**
- Sharp attack, quick decay
- Mid-high frequency (2-4 kHz)
- Slight pitch variation per shot (prevent monotony)

**Free Sound Sources:**
- Freesound.org: Search "laser short" or "pew"
- OpenGameArt.org: Sci-fi weapons pack

---

#### 2. Zomboid Hit (`zomboid_hit.mp3`)
**Type:** Muted impact/thud
**Duration:** 100-150ms
**Volume:** Medium
**Trigger:** Projectile hits zomboid
**Frequency:** High

**Recommended Characteristics:**
- Soft impact
- Low frequency (200-600 Hz)
- No reverb (keep clean)

---

#### 3. Zomboid Destroyed (`zomboid_destroyed.mp3`)
**Type:** Small pop or burst
**Duration:** 200-400ms
**Volume:** Medium-high
**Trigger:** Zomboid health reaches 0
**Frequency:** Medium

**Recommended Characteristics:**
- Quick pop/explosion
- Mid frequency (1-3 kHz)
- Satisfying "completion" feel

---

#### 4. Timer Increment (`timer_increment.mp3`)
**Type:** Digital beep or blip
**Duration:** 50-100ms
**Volume:** Medium
**Trigger:** Projectile hits timer
**Frequency:** Medium

**Recommended Characteristics:**
- Clean, digital sound
- High frequency (3-5 kHz)
- Short and crisp

---

#### 5. Hero Add (`hero_add.mp3`)
**Type:** Ascending chime or power-up sound
**Duration:** 300-500ms
**Volume:** Medium-high
**Trigger:** Timer exits with positive value
**Frequency:** Low

**Recommended Characteristics:**
- Ascending pitch
- Positive, rewarding tone
- Mid-high frequency

---

#### 6. Hero Remove (`hero_remove.mp3`)
**Type:** Descending tone or "loss" sound
**Duration:** 300-500ms
**Volume:** Medium
**Trigger:** Timer exits with negative value
**Frequency:** Low

**Recommended Characteristics:**
- Descending pitch
- Negative, warning tone
- Mid-low frequency

---

#### 7. Weapon Upgrade (`weapon_upgrade.mp3`)
**Type:** Ascending chime with sparkle
**Duration:** 800-1200ms
**Volume:** High
**Trigger:** Weapon tier increases
**Frequency:** Very low

**Recommended Characteristics:**
- Multi-layered ascending sound
- Triumphant, celebratory
- High frequency sparkles

---

#### 8. Wave Complete (`wave_complete.mp3`)
**Type:** Success chime or victory fanfare (short)
**Duration:** 1000-1500ms
**Volume:** High
**Trigger:** Wave duration completes
**Frequency:** Very low

**Recommended Characteristics:**
- Musical, triumphant
- Clear ending
- Positive emotional impact

---

#### 9. Game Over (`game_over.mp3`)
**Type:** Descending tone or defeat sound
**Duration:** 1000-1500ms
**Volume:** Medium
**Trigger:** Zomboid reaches bottom or all heroes lost
**Frequency:** Very low

**Recommended Characteristics:**
- Descending pitch
- Somber, final tone
- Low-mid frequency

---

### GameScene.ts Integration

```typescript
import { AudioManager } from '@/systems/AudioManager';

export class GameScene extends Phaser.Scene {
  private audioManager: AudioManager | null = null;

  create(): void {
    // ... existing setup ...

    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize(this);

    // Set up event listeners for SFX
    this.events.on('zomboid_destroyed', this.onZomboidDestroyed, this);
    this.events.on('timer_hit', this.onTimerHit, this);
    this.events.on('hero_added', this.onHeroAdded, this);
    this.events.on('hero_removed', this.onHeroRemoved, this);
    this.events.on('weapon_upgraded', this.onWeaponUpgraded, this);
    this.events.on('wave_complete', this.onWaveComplete, this);
    this.events.on('game_over', this.onGameOver, this);
  }

  private onZomboidDestroyed(): void {
    this.audioManager?.playSFX('zomboid_destroyed');
    // ... existing code ...
  }

  private onTimerHit(): void {
    this.audioManager?.playSFX('timer_increment');
  }

  private onHeroAdded(): void {
    this.audioManager?.playSFX('hero_add', { volume: 0.6 });
  }

  private onHeroRemoved(): void {
    this.audioManager?.playSFX('hero_remove', { volume: 0.6 });
  }

  private onWeaponUpgraded(): void {
    this.audioManager?.playSFX('weapon_upgrade', { volume: 0.7 });
  }

  private onWaveComplete(): void {
    this.audioManager?.playSFX('wave_complete', { volume: 0.8 });
  }

  private onGameOver(): void {
    this.audioManager?.playSFX('game_over', { volume: 0.7 });
  }
}
```

### CollisionManager.ts Integration

```typescript
import { AudioManager } from '@/systems/AudioManager';

export class CollisionManager {
  private audioManager: AudioManager;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize(scene);
  }

  checkProjectileZomboidCollisions(projectiles: Projectile[], zomboids: Zomboid[]): void {
    projectiles.forEach((projectile) => {
      zomboids.forEach((zomboid) => {
        if (this.checkCollision(projectile, zomboid)) {
          // Play hit sound
          this.audioManager.playSFX('zomboid_hit', { volume: 0.3 });

          const destroyed = zomboid.takeDamage(projectile.getDamage());
          projectile.destroy();

          if (destroyed) {
            // Destroyed sound played via event in GameScene
            this.scene.events.emit('zomboid_destroyed', zomboid);
          }
        }
      });
    });
  }

  checkProjectileTimerCollisions(projectiles: Projectile[], timers: Timer[]): void {
    projectiles.forEach((projectile) => {
      timers.forEach((timer) => {
        if (this.checkCollision(projectile, timer)) {
          // Play timer increment sound
          this.scene.events.emit('timer_hit');

          timer.incrementCounter(1);
          projectile.destroy();
        }
      });
    });
  }
}
```

### WeaponSystem.ts Integration

```typescript
import { AudioManager } from '@/systems/AudioManager';

export class WeaponSystem {
  private audioManager: AudioManager;
  private lastFireSoundTime: number = 0;
  private fireSoundThrottle: number = 50; // ms, prevent overlap

  constructor(scene: Phaser.Scene, weaponTypes: WeaponType[]) {
    // ... existing constructor ...

    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize(scene);
  }

  fire(x: number, y: number): void {
    // ... existing fire logic ...

    // Play projectile fire sound (throttled)
    const now = this.scene.time.now;
    if (now - this.lastFireSoundTime >= this.fireSoundThrottle) {
      this.audioManager.playSFX('projectile_fire', {
        volume: 0.2,
        detune: Phaser.Math.Between(-100, 100), // Pitch variation
      });
      this.lastFireSoundTime = now;
    }
  }

  upgradeWeapon(): void {
    // ... existing upgrade logic ...

    // Emit upgrade event (sound played in GameScene)
    this.scene.events.emit('weapon_upgraded');
  }
}
```

### HeroManager.ts Integration

```typescript
export class HeroManager {
  addHero(count: number): void {
    // ... existing add logic ...

    // Emit event for each hero added
    for (let i = 0; i < count; i++) {
      this.scene.events.emit('hero_added');
    }
  }

  removeHero(count: number): void {
    // ... existing remove logic ...

    // Emit event for each hero removed
    for (let i = 0; i < count; i++) {
      this.scene.events.emit('hero_removed');
    }
  }
}
```

### Volume Balancing Guide

**Relative Volume Levels (0.0 to 1.0):**
```typescript
const SFX_VOLUMES = {
  projectile_fire: 0.2,     // Very quiet (frequent)
  zomboid_hit: 0.3,         // Quiet (frequent)
  zomboid_destroyed: 0.5,   // Medium (common)
  timer_increment: 0.4,     // Medium-low (occasional)
  hero_add: 0.6,            // Medium-high (rare, important)
  hero_remove: 0.6,         // Medium-high (rare, important)
  weapon_upgrade: 0.7,      // High (very rare, celebrate!)
  wave_complete: 0.8,       // Very high (rare, important)
  game_over: 0.7,           // High (rare, finale)
};
```

**Balancing Strategy:**
1. **Frequency-based:** More frequent sounds = quieter
2. **Importance-based:** More important events = louder
3. **Overlap consideration:** Sounds that may overlap should be quieter

## Audio Asset Sources

### Free Resources
1. **Freesound.org**
   - Community-contributed sounds
   - Search terms: "laser", "impact", "beep", "power up", "victory"
   - License: Check per-file (CC0, CC-BY)

2. **OpenGameArt.org**
   - Game-focused audio packs
   - Search: "sci-fi weapons", "UI sounds"
   - License: Various open licenses

3. **ZapSplat.com**
   - Large library, free with attribution
   - Search categories: Game sounds, Sci-fi

4. **Bfxr.net** or **jfxr.frozenfractal.com**
   - Generate retro game sounds online
   - Customize and export as WAV
   - Perfect for quick prototyping

### Creating Custom SFX (Optional)
Use tools like:
- **Audacity** (free) - Record and edit
- **LMMS** (free) - Synthesize sounds
- **Garage Band** (Mac) - Create musical sounds

## Testing Checklist

### Functional Testing
- [x] Projectile fire plays on weapon fire
- [x] Zomboid hit plays on projectile collision
- [x] Zomboid destroyed plays when health reaches 0
- [x] Timer increment plays when timer hit
- [x] Hero add plays when heroes added
- [x] Hero remove plays when heroes removed
- [x] Weapon upgrade plays on weapon tier increase
- [x] Wave complete plays on wave end
- [x] Game over plays when game ends

### Volume Testing
- [x] No SFX too loud (check wave complete, weapon upgrade)
- [x] Projectile fire not overwhelming during rapid fire
- [x] All SFX audible but not jarring
- [x] Balance between SFX and music maintained

### Technical Testing
- [x] No audio lag (< 50ms)
- [x] Rapid fire doesn't cause stuttering
- [x] Multiple zomboid deaths handled smoothly
- [x] SFX respects volume slider
- [x] Mute button silences all SFX
- [x] SFX works on iOS Safari
- [x] SFX works on Android Chrome

### Edge Case Testing
- [x] Max weapon tier (mega_machine_gun) rapid fire
- [x] 10+ zomboids destroyed simultaneously
- [x] Timer hit during weapon fire
- [x] Hero add/remove during destruction sounds
- [x] Wave complete while SFX playing

## Performance Considerations

### Throttling Frequent SFX
```typescript
// Example: Limit projectile fire sound to once per 50ms
if (now - this.lastFireSoundTime >= 50) {
  this.audioManager.playSFX('projectile_fire');
  this.lastFireSoundTime = now;
}
```

### Limiting Simultaneous Sounds
Phaser automatically limits concurrent sounds, but keep it reasonable:
- Max ~5-10 simultaneous SFX
- Prioritize important sounds (hero add > zomboid hit)

### Audio File Optimization
- Use MP3 at 128 kbps (good quality, small file)
- Keep SFX files < 50 KB each
- Trim silence from start/end of audio files

## Success Metrics
- ✅ All 9 SFX implemented and working
- ✅ Audio lag < 50ms from trigger to playback
- ✅ Volume balanced across all SFX
- ✅ No stuttering or clipping
- ✅ Works reliably on desktop and mobile
- ✅ Enhances gameplay experience

## Next Steps
After completion:
- Story 5.1.3: Add Background Music

## Notes
- Start with placeholder/generated sounds from bfxr
- Can polish/replace sounds later based on feedback
- Consider pitch variation for repeated sounds (projectile fire)
- May want to add sound toggle per-category in settings
- Test with headphones and speakers
- Volume balancing is subjective - iterate based on playtesting
