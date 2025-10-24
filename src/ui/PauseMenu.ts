import Phaser from 'phaser';
import { ConfirmDialog } from './ConfirmDialog';

export interface PauseMenuData {
  score: number;
  chapterName: string;
  waveNumber: number;
  totalWaves: number;
  heroCount: number;
  weaponTier: number;
}

export class PauseMenu extends Phaser.GameObjects.Container {
  private overlay!: Phaser.GameObjects.Graphics;
  private panel!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;

  private onResume: () => void;
  private onRestart: () => void;
  private onMenu: () => void;

  constructor(
    scene: Phaser.Scene,
    data: PauseMenuData,
    callbacks: {
      onResume: () => void;
      onRestart: () => void;
      onMenu: () => void;
    }
  ) {
    super(scene, 0, 0);

    this.onResume = callbacks.onResume;
    this.onRestart = callbacks.onRestart;
    this.onMenu = callbacks.onMenu;

    this.createOverlay();
    this.createPanel();
    this.createTitle();
    this.createStats(data);
    this.createButtons();

    scene.add.existing(this);
    this.setDepth(2000); // Above HUD (HUD is at 1000)

    // Fade in animation
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 200,
      ease: 'Power2',
    });
  }

  /**
   * Create dark semi-transparent overlay
   */
  private createOverlay(): void {
    const { width, height } = this.scene.scale;

    this.overlay = this.scene.add.graphics();
    this.overlay.fillStyle(0x000000, 0.75);
    this.overlay.fillRect(0, 0, width, height);
    this.add(this.overlay);
  }

  /**
   * Create main pause menu panel
   */
  private createPanel(): void {
    const { width, height } = this.scene.scale;
    const panelWidth = Math.min(500, width - 40);
    const panelHeight = Math.min(600, height - 100);
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    this.panel = this.scene.add.graphics();
    this.panel.fillStyle(0x1a1a1a, 1);
    this.panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    this.panel.lineStyle(2, 0x03DAC6, 1);
    this.panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    this.add(this.panel);
  }

  /**
   * Create "Paused" title
   */
  private createTitle(): void {
    const { width, height } = this.scene.scale;
    const centerX = width / 2;
    const titleY = height / 2 - 220;

    this.titleText = this.scene.add.text(centerX, titleY, 'PAUSED', {
      fontSize: '56px',
      color: '#03DAC6',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(this.titleText);
  }

  /**
   * Create game statistics display
   */
  private createStats(data: PauseMenuData): void {
    const { width, height } = this.scene.scale;
    const centerX = width / 2;
    const statsY = height / 2 - 120;

    const statsStr = [
      `Chapter: ${data.chapterName}`,
      `Wave: ${data.waveNumber} / ${data.totalWaves}`,
      ``,
      `Score: ${this.formatNumber(data.score)}`,
      `Heroes: ${data.heroCount}`,
      `Weapon Tier: ${data.weaponTier + 1}`,
    ].join('\n');

    this.statsText = this.scene.add.text(centerX, statsY, statsStr, {
      fontSize: '22px',
      color: '#E0E0E0',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5);
    this.add(this.statsText);
  }

  /**
   * Create menu buttons
   */
  private createButtons(): void {
    const { width, height } = this.scene.scale;
    const centerX = width / 2;
    const buttonStartY = height / 2 + 30;
    const buttonSpacing = 80;

    // Resume button
    this.createButton(
      centerX,
      buttonStartY,
      'Resume',
      0x03DAC6,
      () => this.handleResume()
    );

    // Restart button
    this.createButton(
      centerX,
      buttonStartY + buttonSpacing,
      'Restart',
      0xFF9800,
      () => this.handleRestart()
    );

    // Menu button
    this.createButton(
      centerX,
      buttonStartY + buttonSpacing * 2,
      'Main Menu',
      0xF44336,
      () => this.handleMenu()
    );

    // ESC hint
    const hintText = this.scene.add.text(
      centerX,
      height / 2 + 220,
      'Press ESC to resume',
      {
        fontSize: '16px',
        color: '#888888',
      }
    ).setOrigin(0.5);
    this.add(hintText);
  }

  /**
   * Create a button with hover effects
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    color: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-120, -30, 240, 60, 10);

    const label = this.scene.add.text(0, 0, text, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(240, 60);
    button.setInteractive({ useHandCursor: true });

    // Click handler
    button.on('pointerdown', callback);

    // Hover effects
    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color, 0.8);
      bg.fillRoundedRect(-120, -30, 240, 60, 10);
      this.scene.tweens.add({
        targets: button,
        scale: 1.05,
        duration: 100,
        ease: 'Back.easeOut',
      });
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 10);
      this.scene.tweens.add({
        targets: button,
        scale: 1.0,
        duration: 100,
      });
    });

    this.add(button);
    return button;
  }

  /**
   * Handle resume button
   */
  private handleResume(): void {
    this.fadeOut(() => {
      this.onResume();
      this.destroy();
    });
  }

  /**
   * Handle restart button (with confirmation)
   */
  private handleRestart(): void {
    new ConfirmDialog(
      this.scene,
      'Restart Chapter',
      'Are you sure you want to restart?\nCurrent progress will be lost.',
      () => {
        // Confirmed
        this.fadeOut(() => {
          this.onRestart();
          this.destroy();
        });
      },
      () => {
        // Cancelled - do nothing
      }
    );
  }

  /**
   * Handle menu button (with confirmation)
   */
  private handleMenu(): void {
    new ConfirmDialog(
      this.scene,
      'Return to Menu',
      'Are you sure you want to quit?\nCurrent progress will be lost.',
      () => {
        // Confirmed
        this.fadeOut(() => {
          this.onMenu();
          this.destroy();
        });
      },
      () => {
        // Cancelled - do nothing
      }
    );
  }

  /**
   * Fade out and destroy
   */
  private fadeOut(callback?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
      },
    });
  }

  /**
   * Format number with commas
   */
  private formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
