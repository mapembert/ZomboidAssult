import Phaser from 'phaser';

export interface AudioConfig {
  masterVolume: number; // 0.0 to 1.0
  musicVolume: number; // 0.0 to 1.0
  sfxVolume: number; // 0.0 to 1.0
  muted: boolean;
}

/**
 * AudioManager System
 * Centralized audio management for sound effects and background music
 */
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

  private readonly STORAGE_KEY = 'zomboid_assult_audio';

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

    // Check if audio files are loaded
    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`Music '${key}' not loaded yet.`);
      return;
    }

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

        if (!this.currentMusic) {
          console.error(`Failed to create sound for '${key}'`);
          return;
        }

        this.currentMusic.play();
        this.currentMusicKey = key;

        // Fade in with null check
        if (this.currentMusic && this.scene) {
          this.scene.tweens.add({
            targets: this.currentMusic,
            volume,
            duration: fadeInDuration,
            ease: 'Linear',
            onUpdate: (tween, target: any) => {
              // Safety check during tween
              if (!target || !('volume' in target)) {
                tween.stop();
              }
            },
          });
        }

        console.log(`Playing music: ${key}`);
      } catch (error) {
        console.error(`Failed to play music '${key}':`, error);
        this.currentMusic = null;
        this.currentMusicKey = '';
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

    // Store reference for closure
    const musicToStop = this.currentMusic;
    this.currentMusic = null;
    this.currentMusicKey = '';

    // Fade out with null check
    try {
      this.scene.tweens.add({
        targets: musicToStop,
        volume: 0,
        duration: fadeOutDuration,
        ease: 'Linear',
        onUpdate: (tween, target: any) => {
          // Safety check during tween
          if (!target || !('volume' in target)) {
            tween.stop();
          }
        },
        onComplete: () => {
          if (musicToStop) {
            try {
              musicToStop.stop();
              musicToStop.destroy();
            } catch (error) {
              console.error('Error stopping music:', error);
            }
          }
        },
      });
    } catch (error) {
      console.error('Error creating fade out tween:', error);
      if (musicToStop) {
        try {
          musicToStop.stop();
          musicToStop.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
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
   * Get mute state
   */
  isMuted(): boolean {
    return this.config.muted;
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
    if (this.currentMusic && 'setVolume' in this.currentMusic) {
      const musicVolume = this.config.masterVolume * this.config.musicVolume;
      (this.currentMusic as any).setVolume(musicVolume);
    }
  }

  /**
   * Load config from localStorage
   */
  private loadConfigFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = { ...this.config, ...parsed };
        console.log('Audio config loaded from localStorage');
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
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
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
    const soundManager = this.scene.sound as any;
    if (soundManager.context && soundManager.context.state === 'suspended') {
      soundManager.context.resume().then(() => {
        console.log('Audio context resumed (autoplay unlock)');
      });
    }
  }
}
