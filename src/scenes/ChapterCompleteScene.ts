import Phaser from 'phaser';
import type { ChapterData } from '@/types/ConfigTypes';
import { ProgressManager } from '@/systems/ProgressManager';
import { ConfigLoader } from '@/systems/ConfigLoader';
import { AudioManager } from '@/systems/AudioManager';

/**
 * ChapterCompleteScene
 * Displayed when a player completes all waves in a chapter
 * Shows statistics and unlocks the next chapter
 */
export class ChapterCompleteScene extends Phaser.Scene {
  private chapter: ChapterData | null = null;
  private score: number = 0;
  private completionTime: number = 0;
  private zomboidsKilled: number = 0;
  private weaponTier: number = 0;
  private audioManager: AudioManager | null = null;

  constructor() {
    super({ key: 'ChapterCompleteScene' });
  }

  init(data: {
    chapter: ChapterData;
    score: number;
    completionTime: number;
    zomboidsKilled: number;
    weaponTier: number;
  }): void {
    this.chapter = data.chapter;
    this.score = data.score || 0;
    this.completionTime = data.completionTime || 0;
    this.zomboidsKilled = data.zomboidsKilled || 0;
    this.weaponTier = data.weaponTier || 0;

    // Save progress
    if (this.chapter) {
      const progressManager = ProgressManager.getInstance();
      progressManager.onChapterComplete(
        this.chapter.chapterId,
        this.score,
        this.completionTime,
        this.zomboidsKilled,
        this.weaponTier
      );
    }
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Initialize AudioManager
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize(this);

    // Play wave complete SFX
    this.audioManager.playSFX('wave_complete', { volume: 0.8 });

    // Stop any game music, then transition to menu music
    this.audioManager.stopMusic(500);
    this.time.delayedCall(600, () => {
      if (this.audioManager) {
        this.audioManager.playMusic('menu_music', 1000);
      }
    });

    // Background
    this.cameras.main.setBackgroundColor('#121212');

    // Title
    this.add.text(centerX, 100, 'Chapter Complete!', {
      fontSize: '48px',
      color: '#03DAC6',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Chapter name
    if (this.chapter) {
      this.add.text(centerX, 160, this.chapter.chapterName, {
        fontSize: '28px',
        color: '#E0E0E0',
      }).setOrigin(0.5);
    }

    // Statistics panel
    const statsY = 240;
    const stats = [
      `Final Score: ${this.score}`,
      `Time: ${this.formatTime(this.completionTime)}`,
      `Zomboids Destroyed: ${this.zomboidsKilled}`,
      `Weapon Tier Reached: ${this.weaponTier + 1}`,
    ];

    this.add.text(centerX, statsY, stats.join('\n'), {
      fontSize: '24px',
      color: '#E0E0E0',
      align: 'center',
      lineSpacing: 12,
    }).setOrigin(0.5);

    // Check if new chapter unlocked
    const progressManager = ProgressManager.getInstance();
    const chapterNumber = this.chapter ? parseInt(this.chapter.chapterId.split('-')[1]) : 0;
    const nextChapterId = `chapter-${String(chapterNumber + 1).padStart(2, '0')}`;
    const nextChapterProgress = progressManager.getChapterProgress(nextChapterId);

    if (nextChapterProgress.unlocked && nextChapterProgress.playCount === 0) {
      // New chapter just unlocked!
      this.add.text(centerX, statsY + 140, 'New Chapter Unlocked!', {
        fontSize: '28px',
        color: '#FFEA00',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    // Buttons
    const buttonY = height - 200;

    this.createButton(centerX - 150, buttonY, 'Replay', () => {
      this.scene.start('GameScene', { chapter: this.chapter });
    });

    this.createButton(centerX + 150, buttonY, 'Menu', () => {
      this.scene.start('MenuScene');
    });

    // Next chapter button (if available)
    if (nextChapterProgress.unlocked) {
      this.createButton(centerX, buttonY + 80, 'Next Chapter', () => {
        // Load next chapter and start
        const loader = ConfigLoader.getInstance();
        const nextChapter = loader.getChapter(nextChapterId);

        if (nextChapter) {
          this.scene.start('GameScene', { chapter: nextChapter });
        }
      });
    }

    // Fade in animation
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x03DAC6, 1);
    bg.fillRoundedRect(-80, -25, 160, 50, 8);

    const label = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: '#121212',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(160, 50);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerdown', callback);

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x18FFFF, 1);
      bg.fillRoundedRect(-80, -25, 160, 50, 8);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x03DAC6, 1);
      bg.fillRoundedRect(-80, -25, 160, 50, 8);
    });
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
