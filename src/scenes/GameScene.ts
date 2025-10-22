import Phaser from 'phaser';
import type { ChapterData } from '@/types/ConfigTypes';
import { ConfigLoader } from '@/systems/ConfigLoader';
import { HeroManager } from '@/systems/HeroManager';
import { InputManager } from '@/systems/InputManager';
import { WeaponSystem } from '@/systems/WeaponSystem';
import { WaveManager } from '@/systems/WaveManager';

export class GameScene extends Phaser.Scene {
  private currentChapter: ChapterData | null = null;
  private heroManager: HeroManager | null = null;
  private inputManager: InputManager | null = null;
  private weaponSystem: WeaponSystem | null = null;
  private waveManager: WaveManager | null = null;
  private heroCountText: Phaser.GameObjects.Text | null = null;
  private weaponText: Phaser.GameObjects.Text | null = null;
  private waveInfoText: Phaser.GameObjects.Text | null = null;

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

      // Start first wave
      this.waveManager.startWave(0);
      this.updateWaveDisplay();
    }

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
    if (this.heroManager && this.inputManager) {
      if (this.inputManager.isMovingLeft()) {
        this.heroManager.moveLeft();
      } else if (this.inputManager.isMovingRight()) {
        this.heroManager.moveRight();
      }

      this.heroManager.update(delta);
      this.updateHeroCountDisplay();
    }

    if (this.weaponSystem && this.heroManager) {
      const heroPositions = this.heroManager.getHeroPositions();
      this.weaponSystem.fire(heroPositions);
      this.weaponSystem.update(time, delta);
    }

    if (this.waveManager) {
      this.waveManager.update(time, delta);
      this.updateWaveDisplay();
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

  private returnToMenu(): void {
    console.log('Returning to MenuScene');
    this.shutdown();
    this.scene.start('MenuScene');
  }

  shutdown(): void {
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

    this.heroCountText = null;
    this.weaponText = null;
    this.waveInfoText = null;
  }
}
