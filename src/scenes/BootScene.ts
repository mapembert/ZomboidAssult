import Phaser from 'phaser';
import { ConfigLoader } from '@/systems/ConfigLoader';

export class BootScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private percentText!: Phaser.GameObjects.Text;
  private loadingMessage!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Title
    this.add
      .text(centerX, centerY - 150, 'Zomboid Assault', {
        fontSize: '48px',
        color: '#03DAC6',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Loading text
    this.loadingText = this.add
      .text(centerX, centerY - 50, 'Loading...', {
        fontSize: '24px',
        color: '#E0E0E0',
      })
      .setOrigin(0.5);

    // Progress box (background)
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x1e1e1e, 0.8);
    this.progressBox.fillRect(centerX - 160, centerY, 320, 30);

    // Progress bar (foreground)
    this.progressBar = this.add.graphics();

    // Percentage text
    this.percentText = this.add
      .text(centerX, centerY + 15, '0%', {
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Loading message
    this.loadingMessage = this.add
      .text(centerX, centerY + 60, 'Initializing...', {
        fontSize: '16px',
        color: '#B0B0B0',
      })
      .setOrigin(0.5);

    // Start loading configs
    this.loadGameConfigs();
  }

  private async loadGameConfigs(): Promise<void> {
    const loader = ConfigLoader.getInstance();

    try {
      // Define loading steps with messages
      const loadingSteps = [
        { fn: () => loader.loadGameSettings(), message: 'Loading game settings...' },
        { fn: () => loader.loadZomboidTypes(), message: 'Loading zomboid types...' },
        { fn: () => loader.loadWeaponTypes(), message: 'Loading weapon types...' },
        { fn: () => loader.loadTimerTypes(), message: 'Loading timer types...' },
        { fn: () => loader.loadHeroConfig(), message: 'Loading hero config...' },
        { fn: () => loader.getAllChapters(), message: 'Loading chapters...' },
      ];

      const totalSteps = loadingSteps.length;

      // Load each config sequentially with progress updates
      for (let i = 0; i < totalSteps; i++) {
        const step = loadingSteps[i];
        this.updateLoadingMessage(step.message);

        await step.fn();

        const progress = (i + 1) / totalSteps;
        this.updateProgress(progress);

        // Small delay for visual feedback
        await this.delay(100);
      }

      // All configs loaded successfully
      this.updateLoadingMessage('Complete!');
      console.log('✅ All configurations loaded successfully');

      // Wait a moment before transitioning
      await this.delay(500);

      // Transition to MenuScene
      this.scene.start('MenuScene');
    } catch (error) {
      console.error('❌ Failed to load game configurations:', error);
      this.showError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  private updateProgress(progress: number): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Clear previous progress bar
    this.progressBar.clear();

    // Draw new progress bar
    this.progressBar.fillStyle(0x03dac6, 1);
    this.progressBar.fillRect(centerX - 160, centerY, 320 * progress, 30);

    // Update percentage text
    const percent = Math.floor(progress * 100);
    this.percentText.setText(`${percent}%`);
  }

  private updateLoadingMessage(message: string): void {
    this.loadingMessage.setText(message);
  }

  private showError(errorMessage: string): void {
    // Clear existing UI
    this.loadingText.setVisible(false);
    this.progressBar.setVisible(false);
    this.progressBox.setVisible(false);
    this.percentText.setVisible(false);
    this.loadingMessage.setVisible(false);

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Error message
    this.add
      .text(centerX, centerY - 50, 'Loading Failed', {
        fontSize: '32px',
        color: '#FF5252',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY, errorMessage, {
        fontSize: '18px',
        color: '#E0E0E0',
        align: 'center',
        wordWrap: { width: 600 },
      })
      .setOrigin(0.5);

    // Retry button
    const retryButton = this.add
      .text(centerX, centerY + 80, 'Retry', {
        fontSize: '24px',
        color: '#03DAC6',
        backgroundColor: '#1E1E1E',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    retryButton.on('pointerdown', () => {
      this.scene.restart();
    });

    retryButton.on('pointerover', () => {
      retryButton.setStyle({ backgroundColor: '#2E2E2E' });
    });

    retryButton.on('pointerout', () => {
      retryButton.setStyle({ backgroundColor: '#1E1E1E' });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
