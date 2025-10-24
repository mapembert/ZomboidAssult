import Phaser from 'phaser';
import type { ChapterData } from '@/types/ConfigTypes';
import { AudioManager } from '@/systems/AudioManager';

interface GameOverData {
  score: number;
  wave: number;
  chapter: ChapterData;
}

export class GameOverScene extends Phaser.Scene {
  private gameData: GameOverData | null = null;
  private audioManager: AudioManager | null = null;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score?: number; wave?: number; chapter?: ChapterData }): void {
    // Get game over data from init data
    const score = data.score ?? 0;
    const wave = data.wave ?? 1;
    const chapter = data.chapter || this.registry.get('selectedChapter') || null;

    if (!chapter) {
      console.error('GameOverScene: No chapter data provided!');
      this.scene.start('MenuScene');
      return;
    }

    this.gameData = { score, wave, chapter };
    console.log(`GameOverScene initialized with score: ${score}, wave: ${wave}`);
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Initialize AudioManager and transition music
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize(this);

    // Stop game music, start game over music with fade transition
    this.audioManager.stopMusic(800); // 0.8s fade out

    this.time.delayedCall(900, () => {
      if (this.audioManager) {
        this.audioManager.playMusic('gameover_music', 1200); // 1.2s fade in
      }
    });

    // Dark background
    this.cameras.main.setBackgroundColor('#121212');

    // Semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, width, height);

    // Game Over title
    this.add
      .text(centerX, 180, 'GAME OVER', {
        fontSize: '72px',
        color: '#FF5252',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Decorative line under title
    const line1 = this.add.graphics();
    line1.lineStyle(3, 0xff5252, 1);
    line1.lineBetween(centerX - 150, 240, centerX + 150, 240);

    // Display statistics if available
    if (this.gameData) {
      this.displayStatistics(centerX, height);
      this.createButtons(centerX, height);
    } else {
      this.createMenuButton(centerX, height);
    }

    console.log('GameOverScene created successfully');
  }

  private displayStatistics(centerX: number, _height: number): void {
    if (!this.gameData) return;

    const statsY = 340;
    const lineSpacing = 80;

    // Statistics container background
    const bg = this.add.graphics();
    bg.fillStyle(0x1e1e1e, 0.9);
    bg.fillRoundedRect(centerX - 300, statsY - 40, 600, 320, 12);

    // Chapter name
    this.add
      .text(centerX, statsY, this.gameData.chapter.chapterName, {
        fontSize: '28px',
        color: '#03DAC6',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Final Score
    this.add
      .text(centerX, statsY + lineSpacing, 'FINAL SCORE', {
        fontSize: '20px',
        color: '#B0B0B0',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, statsY + lineSpacing + 40, this.gameData.score.toString(), {
        fontSize: '48px',
        color: '#FFFFFF',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Wave Reached
    this.add
      .text(centerX, statsY + lineSpacing * 2 + 60, 'WAVE REACHED', {
        fontSize: '20px',
        color: '#B0B0B0',
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        statsY + lineSpacing * 2 + 100,
        `Wave ${this.gameData.wave} / ${this.gameData.chapter.waves.length}`,
        {
          fontSize: '32px',
          color: '#E0E0E0',
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5);
  }

  private createButtons(centerX: number, height: number): void {
    const buttonY = height - 280;
    const buttonSpacing = 100;

    // Restart Button Container
    const restartButton = this.add.container(centerX, buttonY);

    const restartBg = this.add.graphics();
    restartBg.fillStyle(0x03dac6, 0.9);
    restartBg.fillRoundedRect(-160, -30, 320, 70, 8);

    const restartText = this.add
      .text(0, 0, '↻ RESTART', {
        fontSize: '28px',
        color: '#121212',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    restartButton.add([restartBg, restartText]);
    restartButton.setSize(320, 70);
    restartButton.setInteractive({ useHandCursor: true });

    restartButton.on('pointerover', () => {
      restartBg.clear();
      restartBg.fillStyle(0x04fbe8, 0.9);
      restartBg.fillRoundedRect(-160, -30, 320, 70, 8);
    });

    restartButton.on('pointerout', () => {
      restartBg.clear();
      restartBg.fillStyle(0x03dac6, 0.9);
      restartBg.fillRoundedRect(-160, -30, 320, 70, 8);
    });

    restartButton.on('pointerdown', () => {
      this.restartGame();
    });

    // Menu Button Container
    const menuButton = this.add.container(centerX, buttonY + buttonSpacing);

    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x2e2e2e, 0.9);
    menuBg.fillRoundedRect(-160, -30, 320, 70, 8);

    const menuText = this.add
      .text(0, 0, '← MENU', {
        fontSize: '28px',
        color: '#03DAC6',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    menuButton.add([menuBg, menuText]);
    menuButton.setSize(320, 70);
    menuButton.setInteractive({ useHandCursor: true });

    menuButton.on('pointerover', () => {
      menuBg.clear();
      menuBg.fillStyle(0x3e3e3e, 0.9);
      menuBg.fillRoundedRect(-160, -30, 320, 70, 8);
    });

    menuButton.on('pointerout', () => {
      menuBg.clear();
      menuBg.fillStyle(0x2e2e2e, 0.9);
      menuBg.fillRoundedRect(-160, -30, 320, 70, 8);
    });

    menuButton.on('pointerdown', () => {
      this.returnToMenu();
    });
  }

  private createMenuButton(centerX: number, height: number): void {
    const buttonY = height - 180;

    const menuButton = this.add.container(centerX, buttonY);

    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x2e2e2e, 0.9);
    menuBg.fillRoundedRect(-160, -30, 320, 70, 8);

    const menuText = this.add
      .text(0, 0, '← MENU', {
        fontSize: '28px',
        color: '#03DAC6',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    menuButton.add([menuBg, menuText]);
    menuButton.setSize(320, 70);
    menuButton.setInteractive({ useHandCursor: true });

    menuButton.on('pointerover', () => {
      menuBg.clear();
      menuBg.fillStyle(0x3e3e3e, 0.9);
      menuBg.fillRoundedRect(-160, -30, 320, 70, 8);
    });

    menuButton.on('pointerout', () => {
      menuBg.clear();
      menuBg.fillStyle(0x2e2e2e, 0.9);
      menuBg.fillRoundedRect(-160, -30, 320, 70, 8);
    });

    menuButton.on('pointerdown', () => {
      this.returnToMenu();
    });
  }

  private restartGame(): void {
    if (!this.gameData) {
      console.error('GameOverScene: No game data to restart!');
      this.scene.start('MenuScene');
      return;
    }

    console.log(`Restarting chapter: ${this.gameData.chapter.chapterName}`);

    // Stop game over music before transitioning
    if (this.audioManager) {
      this.audioManager.stopMusic(500);
    }

    // Restart the GameScene with the same chapter
    this.scene.start('GameScene', { chapter: this.gameData.chapter });
  }

  private returnToMenu(): void {
    console.log('Returning to MenuScene');

    // Clean up game data
    this.gameData = null;

    // Stop game over music before transitioning
    if (this.audioManager) {
      this.audioManager.stopMusic(500);
    }

    // Transition back to MenuScene (MenuScene will start its own music)
    this.scene.start('MenuScene');
  }
}
