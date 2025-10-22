# Story 5.1.1: Implement AudioManager System

**Epic:** 5.1 Audio Implementation
**Phase:** 5 - Audio and Polish (Days 10-11)
**Estimated Time:** 3 hours
**Status:** 📋 READY TO START

## Description
Create a centralized AudioManager system that handles all audio playback in the game, including sound effects (SFX) and background music. The system should provide volume control, support for multiple audio formats, and work reliably across desktop and mobile browsers.

## User Story
**As a player**, I want to hear audio feedback for my actions and background music so that the game feels more immersive and engaging.

## Tasks
- [ ] Create AudioManager.ts system class
- [ ] Implement audio file loading in BootScene
- [ ] Implement playSFX() method for one-shot sounds
- [ ] Implement playMusic() method for looping background music
- [ ] Implement stopMusic() method
- [ ] Implement volume control (master, SFX, music separately)
- [ ] Add mute/unmute functionality
- [ ] Handle browser audio autoplay restrictions
- [ ] Test audio playback on desktop browsers
- [ ] Test audio playback on mobile browsers (iOS Safari, Chrome)
- [ ] Implement audio sprite support (optional, for performance)

## Acceptance Criteria
- [ ] AudioManager singleton created and accessible
- [ ] All audio files load successfully in BootScene
- [ ] SFX plays on demand with correct volume
- [ ] Music loops seamlessly without gaps
- [ ] Volume controls work for master, SFX, and music
- [ ] Mute/unmute functionality works
- [ ] Audio works on desktop Chrome, Firefox, Safari
- [ ] Audio works on mobile iOS Safari and Android Chrome
- [ ] No audio lag or stuttering
- [ ] User interaction required for mobile autoplay (handled gracefully)

## Files to Create/Modify
- `src/systems/AudioManager.ts` - NEW: Audio management system
- `src/scenes/BootScene.ts` - Load audio files
- `src/scenes/MenuScene.ts` - Play menu music
- `src/scenes/GameScene.ts` - Play game music and SFX
- `config/game-settings.json` - Audio volume settings

## Dependencies
- Story 1.3.1: Implement BootScene (completed)
- config/game-settings.json audio configuration

## Implementation Details

### AudioManager.ts (NEW)
```typescript
import Phaser from 'phaser';

export interface AudioConfig {
  masterVolume: number;  // 0.0 to 1.0
  musicVolume: number;   // 0.0 to 1.0
  sfxVolume: number;     // 0.0 to 1.0
  muted: boolean;
}

export class AudioManager {
  private static instance: AudioManager | null = null;
  private scene: Phaser.Scene | null = null;

  // Audio configuration
  private config: AudioConfig = {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    muted: false,
  };

  // Currently playing music
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private currentMusicKey: string = '';

  // Audio registry
  private sfxRegistry: Map<string, boolean> = new Map();
  private musicRegistry: Map<string, boolean> = new Map();

  private constructor() {
    // Private constructor for singleton
    this.loadConfigFromStorage();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize AudioManager with scene context
   */
  initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    console.log('AudioManager initialized');
  }

  /**
   * Register a sound effect
   */
  registerSFX(key: string): void {
    this.sfxRegistry.set(key, true);
  }

  /**
   * Register background music
   */
  registerMusic(key: string): void {
    this.musicRegistry.set(key, true);
  }

  /**
   * Play a sound effect
   */
  playSFX(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (!this.scene || this.config.muted) return;

    if (!this.sfxRegistry.has(key)) {
      console.warn(`SFX '${key}' not registered. Did you forget to load it?`);
      return;
    }

    const volume = this.config.masterVolume * this.config.sfxVolume;

    try {
      this.scene.sound.play(key, {
        volume,
        ...config,
      });
    } catch (error) {
      console.error(`Failed to play SFX '${key}':`, error);
    }
  }

  /**
   * Play background music (looping)
   */
  playMusic(key: string, fadeInDuration: number = 1000): void {
    if (!this.scene || this.config.muted) return;

    // Don't restart if same music is already playing
    if (this.currentMusicKey === key && this.currentMusic?.isPlaying) {
      return;
    }

    // Stop current music with fade out
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.stopMusic(fadeInDuration / 2);
    }

    // Wait for fade out, then start new music
    this.scene.time.delayedCall(fadeInDuration / 2, () => {
      if (!this.scene || !this.musicRegistry.has(key)) {
        console.warn(`Music '${key}' not registered.`);
        return;
      }

      const volume = this.config.masterVolume * this.config.musicVolume;

      try {
        this.currentMusic = this.scene.sound.add(key, {
          loop: true,
          volume: 0, // Start at 0 for fade in
        });

        this.currentMusic.play();
        this.currentMusicKey = key;

        // Fade in
        this.scene.tweens.add({
          targets: this.currentMusic,
          volume,
          duration: fadeInDuration,
          ease: 'Linear',
        });

        console.log(`Playing music: ${key}`);
      } catch (error) {
        console.error(`Failed to play music '${key}':`, error);
      }
    });
  }

  /**
   * Stop current music
   */
  stopMusic(fadeOutDuration: number = 500): void {
    if (!this.scene || !this.currentMusic) return;

    if (!this.currentMusic.isPlaying) {
      this.currentMusic = null;
      this.currentMusicKey = '';
      return;
    }

    // Fade out
    this.scene.tweens.add({
      targets: this.currentMusic,
      volume: 0,
      duration: fadeOutDuration,
      ease: 'Linear',
      onComplete: () => {
        if (this.currentMusic) {
          this.currentMusic.stop();
          this.currentMusic.destroy();
          this.currentMusic = null;
          this.currentMusicKey = '';
        }
      },
    });
  }

  /**
   * Pause current music
   */
  pauseMusic(): void {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause();
    }
  }

  /**
   * Resume paused music
   */
  resumeMusic(): void {
    if (this.currentMusic && this.currentMusic.isPaused) {
      this.currentMusic.resume();
    }
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.config.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.updateVolumes();
    this.saveConfigToStorage();
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.config.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.updateVolumes();
    this.saveConfigToStorage();
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(volume: number): void {
    this.config.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.saveConfigToStorage();
  }

  /**
   * Toggle mute
   */
  toggleMute(): void {
    this.config.muted = !this.config.muted;

    if (this.config.muted) {
      this.pauseMusic();
    } else {
      this.resumeMusic();
    }

    this.saveConfigToStorage();
  }

  /**
   * Get current audio configuration
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * Update all active sound volumes
   */
  private updateVolumes(): void {
    if (!this.scene) return;

    // Update current music volume
    if (this.currentMusic) {
      const musicVolume = this.config.masterVolume * this.config.musicVolume;
      this.currentMusic.setVolume(musicVolume);
    }
  }

  /**
   * Load config from localStorage
   */
  private loadConfigFromStorage(): void {
    try {
      const saved = localStorage.getItem('zomboid_assult_audio');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = { ...this.config, ...parsed };
        console.log('Audio config loaded from storage');
      }
    } catch (error) {
      console.error('Failed to load audio config:', error);
    }
  }

  /**
   * Save config to localStorage
   */
  private saveConfigToStorage(): void {
    try {
      localStorage.setItem('zomboid_assult_audio', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save audio config:', error);
    }
  }

  /**
   * Handle browser autoplay restrictions (call on user interaction)
   */
  unlockAudio(): void {
    if (!this.scene) return;

    // Resume audio context if suspended (common in mobile browsers)
    if (this.scene.sound.context && this.scene.sound.context.state === 'suspended') {
      this.scene.sound.context.resume().then(() => {
        console.log('Audio context resumed (autoplay unlock)');
      });
    }
  }
}
```

### BootScene.ts Modifications
```typescript
import { AudioManager } from '@/systems/AudioManager';

export class BootScene extends Phaser.Scene {
  create(): void {
    // ... existing config loading ...

    // Initialize AudioManager
    const audioManager = AudioManager.getInstance();
    audioManager.initialize(this);

    // Load audio files
    this.loadAudioAssets();

    // ... transition to MenuScene ...
  }

  private loadAudioAssets(): void {
    const audioManager = AudioManager.getInstance();

    // Sound Effects (will be implemented in Story 5.1.2)
    const sfxKeys = [
      'projectile_fire',
      'zomboid_hit',
      'zomboid_destroyed',
      'timer_increment',
      'hero_add',
      'hero_remove',
      'weapon_upgrade',
      'wave_complete',
      'game_over',
    ];

    sfxKeys.forEach(key => {
      // Load audio file (placeholder paths, actual files in Story 5.1.2)
      this.load.audio(key, `assets/audio/sfx/${key}.mp3`);
      audioManager.registerSFX(key);
    });

    // Background Music (will be implemented in Story 5.1.3)
    const musicKeys = [
      'menu_music',
      'game_music',
      'gameover_music',
    ];

    musicKeys.forEach(key => {
      this.load.audio(key, `assets/audio/music/${key}.mp3`);
      audioManager.registerMusic(key);
    });

    console.log('Audio assets queued for loading');
  }
}
```

### MenuScene.ts Modifications
```typescript
import { AudioManager } from '@/systems/AudioManager';

export class MenuScene extends Phaser.Scene {
  create(): void {
    // ... existing menu creation ...

    // Play menu music
    const audioManager = AudioManager.getInstance();
    audioManager.initialize(this);
    audioManager.playMusic('menu_music', 1500);

    // Unlock audio on first user interaction (mobile)
    this.input.once('pointerdown', () => {
      audioManager.unlockAudio();
    });

    // Add mute button
    this.createMuteButton();
  }

  private createMuteButton(): void {
    const { width } = this.scale;
    const audioManager = AudioManager.getInstance();
    const config = audioManager.getConfig();

    const muteText = this.add.text(
      width - 60,
      30,
      config.muted ? '🔇' : '🔊',
      { fontSize: '32px' }
    );

    muteText.setInteractive({ useHandCursor: true });
    muteText.on('pointerdown', () => {
      audioManager.toggleMute();
      const newConfig = audioManager.getConfig();
      muteText.setText(newConfig.muted ? '🔇' : '🔊');
    });
  }
}
```

### GameScene.ts Modifications
```typescript
import { AudioManager } from '@/systems/AudioManager';

export class GameScene extends Phaser.Scene {
  private audioManager: AudioManager | null = null;

  create(): void {
    // ... existing scene setup ...

    // Initialize audio
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize(this);

    // Stop menu music, start game music
    this.audioManager.stopMusic(500);
    this.audioManager.playMusic('game_music', 1000);
  }

  // Example SFX usage (will be fully implemented in Story 5.1.2)
  private onZomboidDestroyed(): void {
    if (this.audioManager) {
      this.audioManager.playSFX('zomboid_destroyed');
    }
    // ... existing code ...
  }
}
```

### game-settings.json Update
```json
{
  "gameSettings": {
    "screenWidth": 720,
    "screenHeight": 1280,
    "columnCount": 2,
    "backgroundColor": "#121212",
    "fps": 60,
    "debugMode": false
  },
  "gameplay": {
    "playerStartColumn": 0,
    "safeZoneHeight": 150,
    "spawnZoneHeight": 100,
    "gameOverOnZomboidReachBottom": true
  },
  "audio": {
    "masterVolume": 0.7,
    "musicVolume": 0.5,
    "sfxVolume": 0.8,
    "muted": false
  }
}
```

## Browser Autoplay Handling

### Desktop Browsers
Most desktop browsers allow autoplay of muted content. Music requires user interaction.

### Mobile Browsers
**iOS Safari:**
- Requires user interaction before any audio can play
- Call `unlockAudio()` on first touch/click

**Android Chrome:**
- Allows autoplay after user interaction with the page
- Same unlock approach works

**Implementation:**
```typescript
// In MenuScene or first interactive scene
this.input.once('pointerdown', () => {
  const audioManager = AudioManager.getInstance();
  audioManager.unlockAudio();
});
```

## Testing Checklist

### Desktop Testing
- [ ] Chrome: Audio plays correctly
- [ ] Firefox: Audio plays correctly
- [ ] Safari: Audio plays correctly
- [ ] Edge: Audio plays correctly
- [ ] Volume controls work
- [ ] Mute/unmute works
- [ ] Music loops seamlessly

### Mobile Testing
- [ ] iOS Safari: Audio unlocks on interaction
- [ ] iOS Safari: Music plays after unlock
- [ ] Android Chrome: Audio works
- [ ] Android Firefox: Audio works
- [ ] Touch unlock works reliably
- [ ] No audio lag on mobile

### Functional Testing
- [ ] SFX plays at correct volume
- [ ] Music plays at correct volume
- [ ] Master volume affects both SFX and music
- [ ] Music fades in smoothly
- [ ] Music fades out smoothly
- [ ] Music transitions between scenes
- [ ] Pause/resume music works
- [ ] Settings persist in localStorage
- [ ] No audio glitches or pops

## Edge Cases to Handle
- [ ] Audio context suspended (mobile browsers)
- [ ] Missing audio files (graceful fallback)
- [ ] localStorage disabled (use in-memory config)
- [ ] Multiple scenes playing music simultaneously
- [ ] Rapid SFX triggering (should not overlap badly)
- [ ] Scene transitions during audio fade

## Performance Considerations
- Use audio sprites for frequently played SFX (reduces file count)
- Limit simultaneous SFX playback (max ~5-10)
- Use compressed audio formats (MP3 for compatibility, OGG for quality)
- Preload all audio in BootScene
- Clean up stopped audio objects

## Audio File Format Recommendations

### Sound Effects
- **Format:** MP3 (best compatibility)
- **Bitrate:** 128 kbps
- **Length:** < 2 seconds
- **File size:** < 50 KB each

### Background Music
- **Format:** MP3 or OGG (provide both for fallback)
- **Bitrate:** 128-192 kbps
- **Length:** 60-120 seconds (loopable)
- **File size:** < 2 MB each

### Directory Structure
```
assets/audio/
├── sfx/
│   ├── projectile_fire.mp3
│   ├── zomboid_hit.mp3
│   ├── zomboid_destroyed.mp3
│   ├── timer_increment.mp3
│   ├── hero_add.mp3
│   ├── hero_remove.mp3
│   ├── weapon_upgrade.mp3
│   ├── wave_complete.mp3
│   └── game_over.mp3
└── music/
    ├── menu_music.mp3
    ├── game_music.mp3
    └── gameover_music.mp3
```

## Success Metrics
- ✅ AudioManager singleton works reliably
- ✅ All audio loads without errors
- ✅ SFX plays on demand
- ✅ Music loops seamlessly
- ✅ Volume controls functional
- ✅ Works on desktop and mobile
- ✅ No audio lag or stuttering
- ✅ Settings persist across sessions

## Next Steps
After completion:
- Story 5.1.2: Add Sound Effects (implement all SFX)
- Story 5.1.3: Add Background Music (create/source music tracks)

## Notes
- Audio files will be placeholder/silent in this story
- Actual SFX creation/sourcing in Story 5.1.2
- Actual music creation/sourcing in Story 5.1.3
- Consider using free audio libraries (freesound.org, OpenGameArt)
- May want to add audio visualization in debug mode
- Consider adding positional audio for zomboids in future
