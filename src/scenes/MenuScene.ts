import Phaser from 'phaser';
import { ConfigLoader } from '@/systems/ConfigLoader';
import type { ChapterData } from '@/types/ConfigTypes';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

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

    console.log('MenuScene created successfully');
  }

  private getAvailableChapters(loader: ConfigLoader): ChapterData[] {
    const chapters: ChapterData[] = [];
    const chapterIds = ['chapter-01', 'chapter-02', 'chapter-03'];

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

    chapters.forEach((chapter, index) => {
      const yPos = startY + index * spacing;

      // Chapter container background
      const bg = this.add.graphics();
      bg.fillStyle(0x1e1e1e, 0.9);
      bg.fillRoundedRect(centerX - 350, yPos - 10, 700, 120, 8);

      // Hover effect for background
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

      // Chapter name
      this.add
        .text(centerX - 330, yPos + 10, chapter.chapterName, {
          fontSize: '32px',
          color: '#03DAC6',
          fontStyle: 'bold',
        })
        .setOrigin(0, 0);

      // Chapter description
      this.add
        .text(centerX - 330, yPos + 50, chapter.description || 'No description available', {
          fontSize: '18px',
          color: '#B0B0B0',
          wordWrap: { width: 500 },
        })
        .setOrigin(0, 0);

      // Difficulty/Wave count info
      const waveCount = chapter.waves.length;
      this.add
        .text(centerX + 300, yPos + 30, `${waveCount} Waves`, {
          fontSize: '20px',
          color: '#E0E0E0',
        })
        .setOrigin(1, 0);

      // Play icon/button
      const playButton = this.add
        .text(centerX + 320, yPos + 60, '▶ PLAY', {
          fontSize: '18px',
          color: '#03DAC6',
          fontStyle: 'bold',
        })
        .setOrigin(1, 0)
        .setInteractive({ useHandCursor: true });

      playButton.on('pointerover', () => {
        playButton.setColor('#04FBE8');
      });

      playButton.on('pointerout', () => {
        playButton.setColor('#03DAC6');
      });

      playButton.on('pointerdown', () => {
        this.startChapter(chapter);
      });
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
}
