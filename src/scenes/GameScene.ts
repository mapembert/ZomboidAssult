import Phaser from 'phaser';
import type { ChapterData } from '@/types/ConfigTypes';
import { ConfigLoader } from '@/systems/ConfigLoader';
import { HeroManager } from '@/systems/HeroManager';
import { InputManager } from '@/systems/InputManager';
import { WeaponSystem } from '@/systems/WeaponSystem';
import { WaveManager } from '@/systems/WaveManager';
import { CollisionManager } from '@/systems/CollisionManager';
import { WaveCompleteOverlay } from '@/ui/WaveCompleteOverlay';
import { ProgressManager } from '@/systems/ProgressManager';
import { HUD, HUDData } from '@/ui/HUD';
import { PauseMenu, PauseMenuData } from '@/ui/PauseMenu';
import { AudioManager } from '@/systems/AudioManager';
import Logger from '@/utils/Logger';

export class GameScene extends Phaser.Scene {
  private currentChapter: ChapterData | null = null;
  private heroManager: HeroManager | null = null;
  private inputManager: InputManager | null = null;
  private weaponSystem: WeaponSystem | null = null;
  private waveManager: WaveManager | null = null;
  private collisionManager: CollisionManager | null = null;
  private hud: HUD | null = null;
  private pauseMenu: PauseMenu | null = null;
  private audioManager: AudioManager | null = null;

  // Game state
  private score: number = 0;
  private gameActive: boolean = true;
  private isPaused: boolean = false;
  private safeZoneHeight: number = 150;
  private waveCompleteOverlay: WaveCompleteOverlay | null = null;
  private isTransitioningWaves: boolean = false;
  private chapterStartTime: number = 0;
  private totalZomboidsKilled: number = 0;
  private hudUpdateInterval: number = 100; // Update every 100ms
  private lastHudUpdate: number = 0;

  // Movement cooldown for snap positions
  private movementCooldown: number = 150; // milliseconds between position changes
  private lastMovementTime: number = 0;

  // Input keys
  private pauseKey: Phaser.Input.Keyboard.Key | undefined;
  private escKey: Phaser.Input.Keyboard.Key | undefined;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { chapter?: ChapterData }): void {
    this.currentChapter = data.chapter || this.registry.get('selectedChapter') || null;

    if (!this.currentChapter) {
      console.error('GameScene: No chapter data provided!');
      this.scene.start('MenuScene');
      return;
    }

    // Clear logs at the start of each chapter
    const logger = Logger.getInstance();
    logger.clear();

    // Reset all game state variables when scene initializes
    this.score = 0;
    this.gameActive = true;
    this.isTransitioningWaves = false;
    this.chapterStartTime = 0;
    this.totalZomboidsKilled = 0;
    this.waveCompleteOverlay = null;

    console.log('GameScene initialized with chapter: ' + this.currentChapter.chapterName);
    console.log('Logs cleared for new chapter');
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    this.cameras.main.setBackgroundColor('#121212');

    const gameArea = this.add.graphics();
    gameArea.fillStyle(0x1a1a1a, 1);
    gameArea.fillRect(0, 0, width, height);

    // Initialize AudioManager
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize(this);

    // Stop menu music (no game music - only ambient SFX during gameplay)
    this.audioManager.stopMusic(500);

    const loader = ConfigLoader.getInstance();
    const heroConfig = loader.getHeroConfig();
    const gameSettings = loader.getGameSettings();
    const weaponTypes = loader.getWeaponTypes();

    // Load safe zone height from game settings
    if (gameSettings && gameSettings.gameplay) {
      this.safeZoneHeight = gameSettings.gameplay.safeZoneHeight || 150;
    }

    if (heroConfig && gameSettings) {
      this.heroManager = new HeroManager(this, heroConfig, gameSettings);
      this.inputManager = new InputManager(this);
    }

    if (weaponTypes && weaponTypes.length > 0) {
      this.weaponSystem = new WeaponSystem(this, weaponTypes);
    }

    // Initialize WaveManager (requires heroManager for snap positions)
    if (this.currentChapter && this.currentChapter.waves.length > 0 && this.heroManager) {
      this.waveManager = new WaveManager(this, this.currentChapter.waves, this.heroManager);

      // Track chapter start time
      this.chapterStartTime = this.time.now;
      this.totalZomboidsKilled = 0;

      // Notify ProgressManager of chapter start
      if (this.currentChapter) {
        const progressManager = ProgressManager.getInstance();
        progressManager.onChapterStart(this.currentChapter.chapterId);
      }

      // Start first wave
      this.waveManager.startWave(0);
    }

    // Initialize CollisionManager
    this.collisionManager = new CollisionManager(this);

    // Create HUD
    if (this.currentChapter && this.waveManager && this.heroManager && this.weaponSystem) {
      const chapterNumber = parseInt(this.currentChapter.chapterId.split('-')[1]);
      const weapon = this.weaponSystem.getCurrentWeapon();

      const initialData: HUDData = {
        score: this.score,
        chapterName: this.currentChapter.chapterName,
        chapterNumber: chapterNumber,
        waveNumber: 1,
        totalWaves: this.currentChapter.waves.length,
        timeRemaining: this.waveManager.getWaveTimeRemaining(),
        heroCount: this.heroManager.getHeroCount(),
        weaponName: weapon.name,
        weaponTier: weapon.tier,
      };

      this.hud = new HUD(this, initialData);
    }

    // Listen for collision events
    this.events.on('collision', this.handleCollision, this);

    // Listen for timer exit events
    this.events.on('timer_exited', this.handleTimerExit, this);

    // Listen for instant timer completion events
    this.events.on('timer_completed', this.handleTimerCompleted, this);

    // Listen for weapon upgrade events
    this.events.on('weapon_upgraded', this.handleWeaponUpgrade, this);

    // Listen for wave complete events
    this.events.on('wave_complete', this.handleWaveComplete, this);

    // Listen for hero add/remove events (for audio)
    this.events.on('hero_added', this.handleHeroAdded, this);
    this.events.on('hero_removed', this.handleHeroRemoved, this);

    // Set up pause keys
    if (this.input.keyboard) {
      this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
      this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

      this.pauseKey.on('down', () => this.togglePause());
      this.escKey.on('down', () => {
        if (this.isPaused) {
          this.unpause();
        } else {
          this.togglePause();
        }
      });
    }

    // Create pause button
    const pauseButton = this.add
      .text(width - 20, 20, '⏸', {
        fontSize: '32px',
        color: '#E0E0E0',
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    pauseButton.setDepth(1000);

    pauseButton.on('pointerover', () => {
      pauseButton.setColor('#03DAC6');
    });

    pauseButton.on('pointerout', () => {
      pauseButton.setColor('#E0E0E0');
    });

    pauseButton.on('pointerdown', () => {
      this.togglePause();
    });

    this.add
      .text(centerX, height - 60, 'Use Arrow Keys or A/D to move', {
        fontSize: '16px',
        color: '#808080',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, height - 40, 'Touch left/right half of screen on mobile', {
        fontSize: '14px',
        color: '#606060',
        align: 'center',
      })
      .setOrigin(0.5);

    console.log('GameScene created successfully with Hero, Weapon, and Wave systems');
  }

  update(time: number, delta: number): void {
    // Skip all updates if paused
    if (this.isPaused) return;

    // Only update game logic if game is active or transitioning
    if (!this.gameActive && !this.isTransitioningWaves) return;

    if (this.heroManager && this.inputManager) {
      // Discrete snap position movement with cooldown
      const currentTime = time;
      const canMove = currentTime - this.lastMovementTime >= this.movementCooldown;

      const isMovingLeft = this.inputManager.isMovingLeft();
      const isMovingRight = this.inputManager.isMovingRight();

      // Move continuously while button is held (with cooldown)
      if (canMove) {
        if (isMovingLeft) {
          this.heroManager.moveToPreviousPosition();
          this.lastMovementTime = currentTime;
        } else if (isMovingRight) {
          this.heroManager.moveToNextPosition();
          this.lastMovementTime = currentTime;
        }
      }

      this.heroManager.update(delta);
    }

    if (this.weaponSystem && this.heroManager && !this.isTransitioningWaves) {
      const heroPositions = this.heroManager.getHeroPositions();
      this.weaponSystem.fire(heroPositions);
      this.weaponSystem.update(time, delta);
    }

    if (this.waveManager && !this.isTransitioningWaves) {
      this.waveManager.update(time, delta);

      // Check if any zomboid reached the bottom immediately after wave update
      // WaveManager only removes zomboids that are off-screen (past screenHeight + maxSize)
      // Safe zone is at screenHeight - safeZoneHeight, so we should catch them before removal
      this.checkGameOver();
    }

    // Check collisions between projectiles and zomboids
    if (this.collisionManager && this.weaponSystem && this.waveManager) {
      const projectiles = this.weaponSystem.getActiveProjectiles();
      const zomboids = this.waveManager.getActiveZomboids();
      const timers = this.waveManager.getActiveTimers();

      this.collisionManager.processCollisions(projectiles, zomboids);
      this.collisionManager.processTimerCollisions(projectiles, timers);
    }

    // Update HUD periodically (throttled to 10 FPS for performance)
    if (time - this.lastHudUpdate >= this.hudUpdateInterval) {
      this.updateHUD();
      this.lastHudUpdate = time;
    }
  }

  /**
   * Update HUD with latest game data
   */
  private updateHUD(): void {
    if (!this.hud || !this.waveManager || !this.heroManager || !this.weaponSystem) return;

    const timeRemaining = this.waveManager.getWaveTimeRemaining();
    const weapon = this.weaponSystem.getCurrentWeapon();

    this.hud.updateData({
      score: this.score,
      timeRemaining: timeRemaining,
      heroCount: this.heroManager.getHeroCount(),
      weaponName: weapon.name,
      weaponTier: weapon.tier,
      waveNumber: this.waveManager.getCurrentWaveNumber(),
    });

    // Show low time warning
    if (timeRemaining < 10) {
      this.hud.showLowTimeWarning();
    }
  }

  /**
   * Toggle pause state
   */
  private togglePause(): void {
    if (this.isTransitioningWaves) {
      // Don't allow pause during wave transitions
      return;
    }

    if (this.isPaused) {
      this.unpause();
    } else {
      this.pause();
    }
  }

  /**
   * Pause the game
   */
  private pause(): void {
    if (this.isPaused) return;

    this.isPaused = true;
    this.gameActive = false;

    // Pause physics
    this.physics.pause();

    // Pause all tweens
    this.tweens.pauseAll();

    // Pause all timers
    this.time.paused = true;

    // Create pause menu
    const weapon = this.weaponSystem?.getCurrentWeapon();
    const menuData: PauseMenuData = {
      score: this.score,
      chapterName: this.currentChapter?.chapterName || '',
      waveNumber: this.waveManager?.getCurrentWaveNumber() || 1,
      totalWaves: this.currentChapter?.waves.length || 1,
      heroCount: this.heroManager?.getHeroCount() || 1,
      weaponTier: weapon?.tier || 0,
    };

    this.pauseMenu = new PauseMenu(this, menuData, {
      onResume: () => this.unpause(),
      onRestart: () => this.restartChapter(),
      onMenu: () => this.returnToMenu(),
    });

    console.log('Game paused');
  }

  /**
   * Unpause the game
   */
  private unpause(): void {
    if (!this.isPaused) return;

    // Resume physics
    this.physics.resume();

    // Resume tweens
    this.tweens.resumeAll();

    // Resume timers
    this.time.paused = false;

    // Destroy pause menu
    if (this.pauseMenu) {
      this.pauseMenu.destroy();
      this.pauseMenu = null;
    }

    this.isPaused = false;
    this.gameActive = true;

    console.log('Game resumed');
  }

  /**
   * Restart the current chapter
   */
  private restartChapter(): void {
    console.log('Restarting chapter...');

    // Unpause before restarting
    if (this.time.paused) {
      this.time.paused = false;
    }
    this.physics.resume();
    this.tweens.resumeAll();

    this.scene.restart({ chapter: this.currentChapter });
  }

  /**
   * Handle collision events from CollisionManager
   */
  private handleCollision(data: { projectile: unknown; zomboid: unknown; destroyed: boolean; score: number }): void {
    if (data.destroyed) {
      // Zomboid was destroyed, add score
      this.score += data.score;

      // Update HUD immediately on score change
      if (this.hud) {
        this.hud.updateData({ score: this.score });
      }

      // Track zomboid kill in wave stats and chapter stats
      if (this.waveManager) {
        this.waveManager.onZomboidDestroyed();
      }
      this.totalZomboidsKilled++;
    }
  }

  /**
   * Handle timer exit events from WaveManager
   */
  private handleTimerExit(data: { timerType: string; finalValue: number; column: number; resetHeroCount?: boolean; weaponTier?: number }): void {
    console.log(`Timer exited: ${data.timerType} with value ${data.finalValue}, resetHeroCount: ${data.resetHeroCount}, weaponTier: ${data.weaponTier}`);
    this.processTimerEffect(data.timerType, data.finalValue, false, data.resetHeroCount, data.weaponTier);
  }

  /**
   * Handle instant timer completion events
   */
  private handleTimerCompleted(data: {
    timerId: string;
    timerType: string;
    finalValue: number;
    column: number;
    instant: boolean;
    instantReward?: string;
    instantRewardCount?: number;
    resetHeroCount?: boolean;
    weaponTier?: number;
  }): void {
    console.log(`Timer completed instantly: ${data.timerType} with value ${data.finalValue}, resetHeroCount: ${data.resetHeroCount}, weaponTier: ${data.weaponTier}`);

    // Process instant reward if configured
    if (data.instantReward && data.instantRewardCount !== undefined) {
      this.processInstantReward(data.instantReward, data.instantRewardCount, data.resetHeroCount, data.weaponTier);
    } else {
      // Fallback to old behavior with new parameters
      this.processTimerEffect(data.timerType, data.finalValue, true, data.resetHeroCount, data.weaponTier);
    }
  }

  /**
   * Process instant reward from timer completion
   */
  private processInstantReward(rewardType: string, rewardCount: number, resetHeroCount?: boolean, weaponTier?: number): void {
    if (rewardType === 'hero') {
      // Add heroes
      this.heroManager?.addHero(rewardCount);
      const heroText = rewardCount === 1 ? 'Hero' : 'Heroes';
      this.showFeedback(`⚡ +${rewardCount} ${heroText}!`, 0x00B0FF);

      // Update HUD and flash hero count
      if (this.hud && this.heroManager) {
        this.hud.updateData({ heroCount: this.heroManager.getHeroCount() });
        this.hud.flashHeroCount();
      }
    } else if (rewardType === 'weapon_upgrade') {
      // Reset hero count if configured
      console.log(`DEBUG (InstantReward): resetHeroCount=${resetHeroCount}, type=${typeof resetHeroCount}, heroManager=${!!this.heroManager}`);
      if (resetHeroCount && this.heroManager) {
        const previousCount = this.heroManager.getHeroCount();
        this.heroManager.setHeroCount(1);
        console.log(`Hero count reset from ${previousCount} to 1 for weapon upgrade`);
      } else {
        console.log(`DEBUG (InstantReward): Hero reset SKIPPED - resetHeroCount: ${resetHeroCount}, heroManager exists: ${!!this.heroManager}`);
      }

      // Upgrade weapon
      let upgraded: boolean;
      if (weaponTier !== undefined) {
        // Upgrade to specific tier
        upgraded = this.weaponSystem?.upgradeToTier(weaponTier) || false;
      } else {
        // Normal upgrade (tier + 1)
        upgraded = this.weaponSystem?.upgradeWeapon() || false;
      }

      if (upgraded) {
        this.showFeedback('⚡ Weapon Upgraded!', 0xFFEA00);

        // Update HUD and flash weapon display
        if (this.hud && this.weaponSystem) {
          const weapon = this.weaponSystem.getCurrentWeapon();
          this.hud.updateData({
            weaponName: weapon.name,
            weaponTier: weapon.tier,
            heroCount: this.heroManager?.getHeroCount() || 1
          });
          this.hud.flashWeaponUpgrade();

          if (resetHeroCount) {
            this.hud.flashHeroCount();
          }
        }
      } else {
        this.showFeedback('⚡ Max Weapon Tier!', 0xFF5252);
      }
    }
  }

  /**
   * Process timer effect (shared logic for exit and instant completion)
   */
  private processTimerEffect(timerType: string, finalValue: number, isInstant: boolean, resetHeroCount?: boolean, weaponTier?: number): void {
    const prefix = isInstant ? '⚡ ' : '';

    // Handle hero_add_timer (hero count modification)
    if (timerType === 'hero_add_timer' || timerType === 'rapid_hero_timer') {
      if (finalValue > 0) {
        // Positive value: add heroes
        this.heroManager?.addHero(finalValue);
        this.showFeedback(`${prefix}+${finalValue} Heroes!`, 0x00B0FF);

        // Update HUD and flash hero count
        if (this.hud && this.heroManager) {
          this.hud.updateData({ heroCount: this.heroManager.getHeroCount() });
          this.hud.flashHeroCount();
        }
      } else if (finalValue < 0) {
        // Negative value: remove heroes
        this.heroManager?.removeHero(Math.abs(finalValue));
        this.showFeedback(`${prefix}${finalValue} Heroes`, 0xFF1744);

        // Update HUD and flash hero count
        if (this.hud && this.heroManager) {
          this.hud.updateData({ heroCount: this.heroManager.getHeroCount() });
          this.hud.flashHeroCount();
        }
      } else {
        // Zero value: timer was neutralized, no effect
        // This happens when player successfully shoots a negative timer to 0
        this.showFeedback(`${prefix}Timer Neutralized!`, 0x757575);
      }
    }
    // Handle weapon_upgrade_timer
    else if (timerType === 'weapon_upgrade_timer') {
      if (finalValue >= 0) {
        // Reset hero count if configured
        console.log(`DEBUG: resetHeroCount=${resetHeroCount}, type=${typeof resetHeroCount}, heroManager=${!!this.heroManager}`);
        if (resetHeroCount && this.heroManager) {
          const previousCount = this.heroManager.getHeroCount();
          this.heroManager.setHeroCount(1);
          console.log(`Hero count reset from ${previousCount} to 1 for weapon upgrade`);
        } else {
          console.log(`DEBUG: Hero reset SKIPPED - resetHeroCount: ${resetHeroCount}, heroManager exists: ${!!this.heroManager}`);
        }

        // Zero or positive: attempt to upgrade weapon
        let upgraded: boolean;

        if (weaponTier !== undefined) {
          // Upgrade to specific tier
          upgraded = this.weaponSystem?.upgradeToTier(weaponTier) || false;
        } else {
          // Normal upgrade (tier + 1)
          upgraded = this.weaponSystem?.upgradeWeapon() || false;
        }

        if (upgraded) {
          this.showFeedback(`${prefix}Weapon Upgraded!`, 0xFFEA00);

          // Update HUD and flash weapon display
          if (this.hud && this.weaponSystem) {
            const weapon = this.weaponSystem.getCurrentWeapon();
            this.hud.updateData({
              weaponName: weapon.name,
              weaponTier: weapon.tier,
              heroCount: this.heroManager?.getHeroCount() || 1
            });
            this.hud.flashWeaponUpgrade();

            if (resetHeroCount) {
              this.hud.flashHeroCount();
            }
          }
        } else {
          // Already at max tier
          this.showFeedback(`${prefix}Max Weapon Tier!`, 0xFF5252);
        }
      } else {
        // Negative values don't upgrade
        this.showFeedback(`${prefix}Weapon Not Upgraded`, 0xCF6679);
      }
    }
  }

  /**
   * Handle weapon upgrade events
   */
  private handleWeaponUpgrade(data: { tier: number; weaponName: string; weaponId: string }): void {
    console.log(`Weapon upgraded to tier ${data.tier}: ${data.weaponName}`);

    // Play weapon upgrade sound
    this.audioManager?.playSFX('weapon_upgrade', { volume: 0.7 });

    // Update HUD and flash weapon display
    if (this.hud && this.weaponSystem) {
      const weapon = this.weaponSystem.getCurrentWeapon();
      this.hud.updateData({ weaponName: weapon.name, weaponTier: weapon.tier });
      this.hud.flashWeaponUpgrade();
    }

    // Show weapon name notification below the main upgrade message
    const { width, height } = this.scale;
    const weaponNameText = this.add.text(
      width / 2,
      height / 2 + 50,
      data.weaponName,
      {
        fontSize: '24px',
        color: '#FFEA00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    weaponNameText.setOrigin(0.5);

    this.tweens.add({
      targets: weaponNameText,
      y: weaponNameText.y - 80,
      alpha: 0,
      duration: 1800,
      ease: 'Power2',
      onComplete: () => weaponNameText.destroy()
    });
  }

  /**
   * Show visual feedback for timer effects
   */
  private showFeedback(text: string, color: number): void {
    const { width, height } = this.scale;
    const feedback = this.add.text(
      width / 2,
      height / 2,
      text,
      {
        fontSize: '32px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    feedback.setOrigin(0.5);

    this.tweens.add({
      targets: feedback,
      y: feedback.y - 100,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => feedback.destroy()
    });
  }

  /**
   * Handle hero added events (for audio)
   */
  private handleHeroAdded(_data: { count: number }): void {
    this.audioManager?.playSFX('hero_add', { volume: 0.6 });
  }

  /**
   * Handle hero removed events (for audio)
   */
  private handleHeroRemoved(_data: { count: number }): void {
    this.audioManager?.playSFX('hero_remove', { volume: 0.6 });
  }

  /**
   * Check if any zomboid reached the bottom (game over condition)
   */
  private checkGameOver(): void {
    if (!this.waveManager || !this.gameActive) return;

    const zomboids = this.waveManager.getActiveZomboids();
    const threshold = this.scale.height - this.safeZoneHeight;

    for (const zomboid of zomboids) {
      if (zomboid.y > threshold) {
        this.triggerGameOver();
        break;
      }
    }
  }

  /**
   * Trigger game over and transition to GameOverScene
   */
  private triggerGameOver(): void {
    this.gameActive = false;

    console.log('Game Over! Zomboid reached the bottom.');

    // Play game over sound
    this.audioManager?.playSFX('game_over', { volume: 0.7 });

    // Transition to GameOverScene with score and wave data
    this.scene.start('GameOverScene', {
      score: this.score,
      wave: this.waveManager?.getCurrentWaveNumber() || 1,
      chapter: this.currentChapter,
    });
  }

  /**
   * Handle wave complete event from WaveManager
   */
  private handleWaveComplete(data: {
    waveNumber: number;
    stats: import('@/types/GameTypes').WaveStats;
    hasNextWave: boolean;
  }): void {
    if (!this.waveManager) return;

    this.isTransitioningWaves = true;
    this.gameActive = false;

    console.log(`Wave ${data.waveNumber} complete! Has next wave: ${data.hasNextWave}`);

    // Play wave complete sound
    this.audioManager?.playSFX('wave_complete', { volume: 0.8 });

    // Display wave complete overlay
    this.waveCompleteOverlay = new WaveCompleteOverlay(this, data.waveNumber, data.stats);

    // Wait 3 seconds, then transition
    this.time.delayedCall(3000, () => {
      if (this.waveCompleteOverlay) {
        this.waveCompleteOverlay.fadeOut(() => {
          this.transitionToNextWave(data.hasNextWave);
        });
      } else {
        this.transitionToNextWave(data.hasNextWave);
      }
    });
  }

  /**
   * Transition to next wave or chapter complete
   */
  private transitionToNextWave(hasNextWave: boolean): void {
    if (!this.waveManager) return;

    if (hasNextWave) {
      // Start next wave
      this.waveManager.startNextWave();

      // Update HUD with new wave number
      if (this.hud) {
        this.hud.updateData({
          waveNumber: this.waveManager.getCurrentWaveNumber(),
          timeRemaining: this.waveManager.getWaveTimeRemaining(),
        });
      }

      // Resume game
      this.isTransitioningWaves = false;
      this.gameActive = true;
    } else {
      // Chapter complete - transition to chapter complete screen (Story 4.1.2)
      this.onChapterComplete();
    }
  }

  /**
   * Handle chapter completion
   */
  private onChapterComplete(): void {
    if (!this.currentChapter || !this.weaponSystem) return;

    const completionTime = (this.time.now - this.chapterStartTime) / 1000; // in seconds
    const weaponTier = this.weaponSystem.getCurrentWeapon().tier;

    console.log('Chapter Complete!');

    // Transition to ChapterCompleteScene with statistics
    this.scene.start('ChapterCompleteScene', {
      chapter: this.currentChapter,
      score: this.score,
      completionTime,
      zomboidsKilled: this.totalZomboidsKilled,
      weaponTier,
    });
  }

  private returnToMenu(): void {
    console.log('Returning to MenuScene');
    this.shutdown();
    this.scene.start('MenuScene');
  }

  shutdown(): void {
    // Remove event listeners
    this.events.off('collision', this.handleCollision, this);
    this.events.off('timer_exited', this.handleTimerExit, this);
    this.events.off('timer_completed', this.handleTimerCompleted, this);
    this.events.off('weapon_upgraded', this.handleWeaponUpgrade, this);
    this.events.off('wave_complete', this.handleWaveComplete, this);

    if (this.heroManager) {
      this.heroManager.destroy();
      this.heroManager = null;
    }

    if (this.inputManager) {
      this.inputManager.destroy();
      this.inputManager = null;
    }

    if (this.weaponSystem) {
      this.weaponSystem.destroy();
      this.weaponSystem = null;
    }

    if (this.waveManager) {
      this.waveManager.destroy();
      this.waveManager = null;
    }

    if (this.collisionManager) {
      this.collisionManager.destroy();
      this.collisionManager = null;
    }

    if (this.hud) {
      this.hud.destroy();
      this.hud = null;
    }
  }
}
