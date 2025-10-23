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

export class GameScene extends Phaser.Scene {
  private currentChapter: ChapterData | null = null;
  private heroManager: HeroManager | null = null;
  private inputManager: InputManager | null = null;
  private weaponSystem: WeaponSystem | null = null;
  private waveManager: WaveManager | null = null;
  private collisionManager: CollisionManager | null = null;
  private heroCountText: Phaser.GameObjects.Text | null = null;
  private weaponText: Phaser.GameObjects.Text | null = null;
  private waveInfoText: Phaser.GameObjects.Text | null = null;
  private scoreText: Phaser.GameObjects.Text | null = null;

  // Game state
  private score: number = 0;
  private gameActive: boolean = true;
  private safeZoneHeight: number = 150;
  private waveCompleteOverlay: WaveCompleteOverlay | null = null;
  private isTransitioningWaves: boolean = false;
  private chapterStartTime: number = 0;
  private totalZomboidsKilled: number = 0;

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

    console.log('GameScene initialized with chapter: ' + this.currentChapter.chapterName);
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    this.cameras.main.setBackgroundColor('#121212');

    const gameArea = this.add.graphics();
    gameArea.fillStyle(0x1a1a1a, 1);
    gameArea.fillRect(0, 0, width, height);

    if (this.currentChapter) {
      this.add
        .text(centerX, 40, this.currentChapter.chapterName, {
          fontSize: '32px',
          color: '#03DAC6',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      this.add
        .text(centerX, 80, this.currentChapter.waves.length + ' Waves', {
          fontSize: '18px',
          color: '#B0B0B0',
        })
        .setOrigin(0.5);
    }

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

      this.heroCountText = this.add.text(20, 120, '', {
        fontSize: '18px',
        color: '#E0E0E0',
      });

      this.updateHeroCountDisplay();
    }

    if (weaponTypes && weaponTypes.length > 0) {
      this.weaponSystem = new WeaponSystem(this, weaponTypes);

      this.weaponText = this.add.text(20, 150, '', {
        fontSize: '18px',
        color: '#E0E0E0',
      });

      this.updateWeaponDisplay();
    }

    // Initialize WaveManager
    if (this.currentChapter && this.currentChapter.waves.length > 0) {
      this.waveManager = new WaveManager(this, this.currentChapter.waves);

      // Create wave info text
      this.waveInfoText = this.add.text(20, 180, '', {
        fontSize: '18px',
        color: '#E0E0E0',
      });

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
      this.updateWaveDisplay();
    }

    // Initialize CollisionManager
    this.collisionManager = new CollisionManager(this);

    // Create score display
    this.scoreText = this.add.text(20, 210, 'Score: 0', {
      fontSize: '18px',
      color: '#E0E0E0',
    });

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

    const pauseButton = this.add
      .text(width - 20, 20, '⏸ MENU', {
        fontSize: '20px',
        color: '#03DAC6',
        backgroundColor: '#2e2e2e',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    pauseButton.on('pointerover', () => {
      pauseButton.setBackgroundColor('#3e3e3e');
    });

    pauseButton.on('pointerout', () => {
      pauseButton.setBackgroundColor('#2e2e2e');
    });

    pauseButton.on('pointerdown', () => {
      this.returnToMenu();
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
    // Only update game logic if game is active or transitioning
    if (!this.gameActive && !this.isTransitioningWaves) return;

    if (this.heroManager && this.inputManager) {
      if (this.inputManager.isMovingLeft()) {
        this.heroManager.moveLeft();
      } else if (this.inputManager.isMovingRight()) {
        this.heroManager.moveRight();
      }

      this.heroManager.update(delta);
      this.updateHeroCountDisplay();
    }

    if (this.weaponSystem && this.heroManager && !this.isTransitioningWaves) {
      const heroPositions = this.heroManager.getHeroPositions();
      this.weaponSystem.fire(heroPositions);
      this.weaponSystem.update(time, delta);
    }

    if (this.waveManager && !this.isTransitioningWaves) {
      this.waveManager.update(time, delta);
      this.updateWaveDisplay();

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
  }

  private updateHeroCountDisplay(): void {
    if (this.heroCountText && this.heroManager) {
      this.heroCountText.setText('Heroes: ' + this.heroManager.getHeroCount());
    }
  }

  private updateWeaponDisplay(): void {
    if (this.weaponText && this.weaponSystem) {
      const weapon = this.weaponSystem.getCurrentWeapon();
      this.weaponText.setText('Weapon: ' + weapon.name + ' (Tier ' + weapon.tier + ')');
    }
  }

  private updateWaveDisplay(): void {
    if (this.waveInfoText && this.waveManager) {
      const waveNum = this.waveManager.getCurrentWaveNumber();
      const totalWaves = this.waveManager.getTotalWaveCount();
      const timeRemaining = Math.ceil(this.waveManager.getWaveTimeRemaining());
      this.waveInfoText.setText('Wave ' + waveNum + '/' + totalWaves + ' - Time: ' + timeRemaining + 's');
    }
  }

  /**
   * Handle collision events from CollisionManager
   */
  private handleCollision(data: { projectile: unknown; zomboid: unknown; destroyed: boolean; score: number }): void {
    if (data.destroyed) {
      // Zomboid was destroyed, add score
      this.score += data.score;
      this.updateScoreDisplay();

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
  private handleTimerExit(data: { timerType: string; finalValue: number; column: number }): void {
    console.log(`Timer exited: ${data.timerType} with value ${data.finalValue}`);
    this.processTimerEffect(data.timerType, data.finalValue, false);
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
  }): void {
    console.log(`Timer completed instantly: ${data.timerType} with value ${data.finalValue}`);

    // Process instant reward if configured
    if (data.instantReward && data.instantRewardCount !== undefined) {
      this.processInstantReward(data.instantReward, data.instantRewardCount);
    } else {
      // Fallback to old behavior
      this.processTimerEffect(data.timerType, data.finalValue, true);
    }
  }

  /**
   * Process instant reward from timer completion
   */
  private processInstantReward(rewardType: string, rewardCount: number): void {
    if (rewardType === 'hero') {
      // Add heroes
      this.heroManager?.addHero(rewardCount);
      const heroText = rewardCount === 1 ? 'Hero' : 'Heroes';
      this.showFeedback(`⚡ +${rewardCount} ${heroText}!`, 0x00B0FF);
    } else if (rewardType === 'weapon_upgrade') {
      // Upgrade weapon
      const upgraded = this.weaponSystem?.upgradeWeapon();

      if (upgraded) {
        this.showFeedback('⚡ Weapon Upgraded!', 0xFFEA00);
      } else {
        this.showFeedback('⚡ Max Weapon Tier!', 0xFF5252);
      }
    }
  }

  /**
   * Process timer effect (shared logic for exit and instant completion)
   */
  private processTimerEffect(timerType: string, finalValue: number, isInstant: boolean): void {
    const prefix = isInstant ? '⚡ ' : '';

    // Handle hero_add_timer (hero count modification)
    if (timerType === 'hero_add_timer' || timerType === 'rapid_hero_timer') {
      if (finalValue > 0) {
        // Positive value: add heroes
        this.heroManager?.addHero(finalValue);
        this.showFeedback(`${prefix}+${finalValue} Heroes!`, 0x00B0FF);
      } else if (finalValue < 0) {
        // Negative value: remove heroes
        this.heroManager?.removeHero(Math.abs(finalValue));
        this.showFeedback(`${prefix}${finalValue} Heroes`, 0xFF1744);
      } else {
        // Zero value: timer was neutralized, no effect
        // This happens when player successfully shoots a negative timer to 0
        this.showFeedback(`${prefix}Timer Neutralized!`, 0x757575);
      }
    }
    // Handle weapon_upgrade_timer
    else if (timerType === 'weapon_upgrade_timer') {
      if (finalValue >= 0) {
        // Zero or positive: attempt to upgrade weapon
        const upgraded = this.weaponSystem?.upgradeWeapon();

        if (upgraded) {
          this.showFeedback(`${prefix}Weapon Upgraded!`, 0xFFEA00);
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

    // Update weapon display
    this.updateWeaponDisplay();

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
   * Update score display
   */
  private updateScoreDisplay(): void {
    if (this.scoreText) {
      this.scoreText.setText('Score: ' + this.score);
    }
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
      this.updateWaveDisplay();

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

    this.heroCountText = null;
    this.weaponText = null;
    this.waveInfoText = null;
    this.scoreText = null;
  }
}
