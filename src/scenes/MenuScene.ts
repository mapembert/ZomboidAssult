import Phaser from 'phaser';
import { ConfigLoader } from '@/systems/ConfigLoader';
import { ProgressManager, ChapterProgress } from '@/systems/ProgressManager';
import { AudioManager } from '@/systems/AudioManager';
import type { ChapterData } from '@/types/ConfigTypes';

export class MenuScene extends Phaser.Scene {
  private audioManager: AudioManager | null = null;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Initialize AudioManager
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize(this);

    // Play menu music
    this.audioManager.playMusic('menu_music', 1500);

    // Unlock audio on first user interaction (mobile browsers)
    this.input.once('pointerdown', () => {
      this.audioManager?.unlockAudio();
    });

    // Title
    this.add
      .text(centerX, 80, 'Zomboid Assault', {
        fontSize: '64px',
        color: '#03DAC6',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(centerX, 150, 'Select Your Chapter', {
        fontSize: '24px',
        color: '#E0E0E0',
      })
      .setOrigin(0.5);

    // Get chapters from ConfigLoader
    const loader = ConfigLoader.getInstance();
    const chapters = this.getAvailableChapters(loader);

    if (chapters.length === 0) {
      this.showNoChaptersMessage(centerX, height);
      return;
    }

    // Display chapter selection buttons
    this.displayChapterList(chapters, centerX);

    // Add mute button
    this.createMuteButton();

    console.log('MenuScene created successfully');
  }

  private getAvailableChapters(loader: ConfigLoader): ChapterData[] {
    const chapters: ChapterData[] = [];
    const baseChapterIds = ['chapter-01', 'chapter-02', 'chapter-03'];

    // Include test chapter if unlockAllChapters is enabled
    const chapterIds = loader.isUnlockAllChaptersEnabled()
      ? [...baseChapterIds, 'chapter-test-upgrades']
      : baseChapterIds;

    for (const id of chapterIds) {
      const chapter = loader.getChapter(id);
      if (chapter) {
        chapters.push(chapter);
      }
    }

    return chapters;
  }

  private displayChapterList(chapters: ChapterData[], centerX: number): void {
    const startY = 220;
    const spacing = 140;
    const progressManager = ProgressManager.getInstance();

    chapters.forEach((chapter, index) => {
      const yPos = startY + index * spacing;
      const progress = progressManager.getChapterProgress(chapter.chapterId);
      const isUnlocked = progressManager.isChapterUnlocked(chapter.chapterId);

      if (!isUnlocked) {
        this.createLockedChapter(centerX, yPos, chapter);
      } else {
        this.createUnlockedChapter(centerX, yPos, chapter, progress);
      }
    });

    // Instructions at bottom
    this.add
      .text(centerX, this.scale.height - 40, 'Click on a chapter to begin', {
        fontSize: '16px',
        color: '#808080',
        align: 'center',
      })
      .setOrigin(0.5);
  }

  private createLockedChapter(centerX: number, yPos: number, chapter: ChapterData): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, 0.5);
    bg.fillRoundedRect(centerX - 350, yPos - 10, 700, 120, 8);

    this.add.text(centerX - 280, yPos + 10, chapter.chapterName, {
      fontSize: '32px',
      color: '#505050',
    }).setOrigin(0, 0);

    this.add.text(centerX - 280, yPos + 50, '🔒 Complete previous chapter to unlock', {
      fontSize: '18px',
      color: '#707070',
    }).setOrigin(0, 0);
  }

  private createUnlockedChapter(centerX: number, yPos: number, chapter: ChapterData, progress: ChapterProgress): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x1e1e1e, 0.9);
    bg.fillRoundedRect(centerX - 350, yPos - 10, 700, 120, 8);

    bg.setInteractive(
      new Phaser.Geom.Rectangle(centerX - 350, yPos - 10, 700, 120),
      Phaser.Geom.Rectangle.Contains
    );

    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2e2e2e, 0.9);
      bg.fillRoundedRect(centerX - 350, yPos - 10, 700, 120, 8);
    });

    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1e1e1e, 0.9);
      bg.fillRoundedRect(centerX - 350, yPos - 10, 700, 120, 8);
    });

    bg.on('pointerdown', () => {
      this.startChapter(chapter);
    });

    const checkmark = progress.completed ? '✓ ' : '';
    this.add.text(centerX - 330, yPos + 10, checkmark + chapter.chapterName, {
      fontSize: '32px',
      color: progress.completed ? '#4CAF50' : '#03DAC6',
      fontStyle: 'bold',
    }).setOrigin(0, 0);

    this.add.text(centerX - 330, yPos + 50, chapter.description || 'No description available', {
      fontSize: '18px',
      color: '#B0B0B0',
      wordWrap: { width: 500 },
    }).setOrigin(0, 0);

    if (progress.completed && progress.bestScore > 0) {
      this.add.text(centerX + 300, yPos + 10, `Best: ${progress.bestScore}`, {
        fontSize: '16px',
        color: '#FFEA00',
      }).setOrigin(1, 0);
    }

    const waveCount = chapter.waves.length;
    this.add.text(centerX + 300, yPos + 35, `${waveCount} Waves`, {
      fontSize: '20px',
      color: '#E0E0E0',
    }).setOrigin(1, 0);

    const playButton = this.add.text(centerX + 320, yPos + 65, '▶ PLAY', {
      fontSize: '18px',
      color: '#03DAC6',
      fontStyle: 'bold',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => {
      playButton.setColor('#04FBE8');
    });

    playButton.on('pointerout', () => {
      playButton.setColor('#03DAC6');
    });

    playButton.on('pointerdown', () => {
      this.startChapter(chapter);
    });
  }

  private startChapter(chapter: ChapterData): void {
    console.log(`Starting chapter: ${chapter.chapterName} (${chapter.chapterId})`);

    // Store selected chapter in registry for GameScene to access
    this.registry.set('selectedChapter', chapter);

    // Transition to GameScene
    this.scene.start('GameScene', { chapter });
  }

  private showNoChaptersMessage(centerX: number, height: number): void {
    this.add
      .text(centerX, height / 2, 'No chapters available!\nPlease check your configuration files.', {
        fontSize: '24px',
        color: '#FF5252',
        align: 'center',
      })
      .setOrigin(0.5);
  }

  private createMuteButton(): void {
    const { width } = this.scale;
    const audioManager = AudioManager.getInstance();
    const config = audioManager.getConfig();

    const muteText = this.add
      .text(width - 60, 30, config.muted ? '🔇' : '🔊', { fontSize: '32px' })
      .setInteractive({ useHandCursor: true });

    muteText.on('pointerdown', () => {
      audioManager.toggleMute();
      const newConfig = audioManager.getConfig();
      muteText.setText(newConfig.muted ? '🔇' : '🔊');
    });

    muteText.on('pointerover', () => {
      muteText.setScale(1.1);
    });

    muteText.on('pointerout', () => {
      muteText.setScale(1);
    });
  }
}
