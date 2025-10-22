import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Placeholder text
    this.add
      .text(360, 640, 'Zomboid Assult\nLoading...', {
        fontSize: '48px',
        color: '#03DAC6',
        align: 'center',
      })
      .setOrigin(0.5);

    console.log('BootScene created successfully');
  }
}
