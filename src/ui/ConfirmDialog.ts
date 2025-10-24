import Phaser from 'phaser';

export class ConfirmDialog extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel: () => void
  ) {
    super(scene, 0, 0);

    const { width, height } = scene.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Dark overlay
    const overlay = scene.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, width, height);
    this.add(overlay);

    // Dialog panel
    const panelWidth = Math.min(400, width - 40);
    const panelHeight = 250;
    const panel = scene.add.graphics();
    panel.fillStyle(0x2a2a2a, 1);
    panel.fillRoundedRect(centerX - panelWidth / 2, centerY - panelHeight / 2, panelWidth, panelHeight, 10);
    panel.lineStyle(2, 0xFF9800, 1);
    panel.strokeRoundedRect(centerX - panelWidth / 2, centerY - panelHeight / 2, panelWidth, panelHeight, 10);
    this.add(panel);

    // Title
    const titleText = scene.add.text(centerX, centerY - 80, title, {
      fontSize: '28px',
      color: '#FF9800',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(titleText);

    // Message
    const messageText = scene.add.text(centerX, centerY - 20, message, {
      fontSize: '18px',
      color: '#E0E0E0',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);
    this.add(messageText);

    // Confirm button
    const confirmBtn = this.createButton(centerX - 80, centerY + 60, 'Yes', 0xFF9800, () => {
      onConfirm();
      this.destroy();
    });
    this.add(confirmBtn);

    // Cancel button
    const cancelBtn = this.createButton(centerX + 80, centerY + 60, 'No', 0x666666, () => {
      onCancel();
      this.destroy();
    });
    this.add(cancelBtn);

    scene.add.existing(this);
    this.setDepth(2100); // Above pause menu

    // Fade in
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 150,
    });
  }

  private createButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const button = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-60, -20, 120, 40, 6);

    const label = this.scene.add.text(0, 0, text, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(120, 40);
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', callback);

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color, 0.8);
      bg.fillRoundedRect(-60, -20, 120, 40, 6);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-60, -20, 120, 40, 6);
    });

    return button;
  }
}
