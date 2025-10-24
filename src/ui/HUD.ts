import Phaser from 'phaser';

export interface HUDData {
  score: number;
  chapterName: string;
  chapterNumber: number;
  waveNumber: number;
  totalWaves: number;
  timeRemaining: number;
  heroCount: number;
  weaponName: string;
  weaponTier: number;
}

export class HUD extends Phaser.GameObjects.Container {
  // Text elements
  private scoreText!: Phaser.GameObjects.Text;
  private waveInfoText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private heroCountText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;

  // Background panels
  private scorePanel!: Phaser.GameObjects.Graphics;
  private wavePanel!: Phaser.GameObjects.Graphics;
  private timePanel!: Phaser.GameObjects.Graphics;
  private heroPanel!: Phaser.GameObjects.Graphics;
  private weaponPanel!: Phaser.GameObjects.Graphics;

  // Current data
  private currentData: HUDData;

  constructor(scene: Phaser.Scene, initialData: HUDData) {
    super(scene, 0, 0);

    this.currentData = initialData;

    this.createPanels();
    this.createTextElements();
    this.updateDisplay();

    scene.add.existing(this);
    this.setDepth(1000); // Ensure HUD is always on top
  }

  /**
   * Create background panels for HUD elements
   */
  private createPanels(): void {
    const panelColor = 0x1e1e1e;
    const panelAlpha = 0.85;
    const panelRadius = 8;
    const { width, height } = this.scene.scale;

    // Score panel (top-left)
    this.scorePanel = this.scene.add.graphics();
    this.scorePanel.fillStyle(panelColor, panelAlpha);
    this.scorePanel.fillRoundedRect(10, 10, 200, 50, panelRadius);
    this.add(this.scorePanel);

    // Wave info panel (top-center)
    this.wavePanel = this.scene.add.graphics();
    this.wavePanel.fillStyle(panelColor, panelAlpha);
    this.wavePanel.fillRoundedRect(width / 2 - 150, 10, 300, 50, panelRadius);
    this.add(this.wavePanel);

    // Time remaining panel (top-right)
    this.timePanel = this.scene.add.graphics();
    this.timePanel.fillStyle(panelColor, panelAlpha);
    this.timePanel.fillRoundedRect(width - 210, 10, 200, 50, panelRadius);
    this.add(this.timePanel);

    // Hero count panel (bottom-center)
    this.heroPanel = this.scene.add.graphics();
    this.heroPanel.fillStyle(panelColor, panelAlpha);
    this.heroPanel.fillRoundedRect(width / 2 - 100, height - 70, 200, 60, panelRadius);
    this.add(this.heroPanel);

    // Weapon panel (bottom-left)
    this.weaponPanel = this.scene.add.graphics();
    this.weaponPanel.fillStyle(panelColor, panelAlpha);
    this.weaponPanel.fillRoundedRect(10, height - 70, 220, 60, panelRadius);
    this.add(this.weaponPanel);
  }

  /**
   * Create text elements for HUD
   */
  private createTextElements(): void {
    const { width, height } = this.scene.scale;

    // Score text (top-left)
    this.scoreText = this.scene.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#E0E0E0',
      fontStyle: 'bold',
    });
    this.add(this.scoreText);

    // Wave info text (top-center)
    this.waveInfoText = this.scene.add.text(width / 2, 35, '', {
      fontSize: '20px',
      color: '#03DAC6',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);
    this.add(this.waveInfoText);

    // Time remaining text (top-right)
    this.timeText = this.scene.add.text(width - 200, 20, '', {
      fontSize: '24px',
      color: '#E0E0E0',
      fontStyle: 'bold',
    });
    this.add(this.timeText);

    // Hero count text (bottom-center)
    this.heroCountText = this.scene.add.text(width / 2, height - 40, '', {
      fontSize: '28px',
      color: '#03DAC6',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(this.heroCountText);

    // Weapon text (bottom-left)
    this.weaponText = this.scene.add.text(20, height - 60, '', {
      fontSize: '18px',
      color: '#E0E0E0',
    });
    this.add(this.weaponText);
  }

  /**
   * Update HUD with new data
   */
  updateData(data: Partial<HUDData>): void {
    this.currentData = { ...this.currentData, ...data };
    this.updateDisplay();
  }

  /**
   * Update all text displays
   */
  private updateDisplay(): void {
    // Score
    this.scoreText.setText(`Score: ${this.formatNumber(this.currentData.score)}`);

    // Wave info
    this.waveInfoText.setText(
      `${this.currentData.chapterName}\nWave ${this.currentData.waveNumber}/${this.currentData.totalWaves}`
    );

    // Time remaining
    const timeStr = this.formatTime(this.currentData.timeRemaining);
    const timeColor = this.currentData.timeRemaining < 10 ? '#FF5252' : '#E0E0E0';
    this.timeText.setText(`Time: ${timeStr}`);
    this.timeText.setColor(timeColor);

    // Hero count
    this.heroCountText.setText(`⚡ Heroes: ${this.currentData.heroCount}`);

    // Weapon info
    this.weaponText.setText(
      `Weapon: ${this.currentData.weaponName}\nTier ${this.currentData.weaponTier + 1}`
    );
  }

  /**
   * Format number with commas (e.g., 1000 -> 1,000)
   */
  private formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Format time as MM:SS
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Show low time warning animation
   */
  showLowTimeWarning(): void {
    if (this.currentData.timeRemaining < 10 && this.currentData.timeRemaining > 0) {
      // Pulse animation for time panel
      this.scene.tweens.add({
        targets: this.timePanel,
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * Flash hero count on change
   */
  flashHeroCount(): void {
    this.scene.tweens.add({
      targets: this.heroCountText,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  /**
   * Flash weapon display on upgrade
   */
  flashWeaponUpgrade(): void {
    this.scene.tweens.add({
      targets: this.weaponText,
      scale: 1.15,
      duration: 300,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // Color flash
    const originalColor = this.weaponText.style.color;
    this.weaponText.setColor('#FFEA00');
    this.scene.time.delayedCall(300, () => {
      this.weaponText.setColor(originalColor);
    });
  }

  /**
   * Hide HUD (for transitions, pause, etc.)
   */
  hide(): void {
    this.setVisible(false);
  }

  /**
   * Show HUD
   */
  show(): void {
    this.setVisible(true);
  }
}
