import Phaser from 'phaser';
import type { ChapterData } from '@/types/ConfigTypes';

export class GameScene extends Phaser.Scene {
  private currentChapter: ChapterData | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { chapter?: ChapterData }): void {
    // Get chapter from init data or registry
    this.currentChapter = data.chapter || this.registry.get('selectedChapter') || null;

    if (!this.currentChapter) {
      console.error('GameScene: No chapter data provided!');
      this.scene.start('MenuScene');
      return;
    }

    console.log(`GameScene initialized with chapter: ${this.currentChapter.chapterName}`);
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Dark background
    this.cameras.main.setBackgroundColor('#121212');

    // Game area background (slightly lighter)
    const gameArea = this.add.graphics();
    gameArea.fillStyle(0x1a1a1a, 1);
    gameArea.fillRect(0, 0, width, height);

    // Chapter info at top
    if (this.currentChapter) {
      this.add
        .text(centerX, 40, this.currentChapter.chapterName, {
          fontSize: '32px',
          color: '#03DAC6',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      this.add
        .text(centerX, 80, `${this.currentChapter.waves.length} Waves`, {
          fontSize: '18px',
          color: '#B0B0B0',
        })
        .setOrigin(0.5);
    }

    // Placeholder text
    this.add
      .text(centerX, centerY - 100, 'GAME RUNNING', {
        fontSize: '64px',
        color: '#03DAC6',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY, '(Placeholder Scene)', {
        fontSize: '28px',
        color: '#E0E0E0',
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        centerY + 60,
        'Core gameplay systems will be\nimplemented in Phase 2',
        {
          fontSize: '18px',
          color: '#B0B0B0',
          align: 'center',
        }
      )
      .setOrigin(0.5);

    // Pause/Menu button
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

    // Debug info at bottom
    this.add
      .text(centerX, height - 40, 'Click "MENU" to return to chapter selection', {
        fontSize: '16px',
        color: '#808080',
      })
      .setOrigin(0.5);

    console.log('GameScene created successfully');
  }

  update(_time: number, _delta: number): void {
    // Game loop will be implemented in Phase 2
    // This is where we'll update:
    // - Hero positions
    // - Zomboid movement
    // - Projectile physics
    // - Wave progression
    // - Collision detection
  }

  private returnToMenu(): void {
    console.log('Returning to MenuScene');

    // Clean up any game state here when implemented

    // Transition back to MenuScene
    this.scene.start('MenuScene');
  }
}
