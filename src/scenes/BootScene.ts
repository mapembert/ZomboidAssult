import Phaser from 'phaser';
import { ConfigLoader } from '@/systems/ConfigLoader';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  async create(): Promise<void> {
    // Placeholder text
    this.add
      .text(360, 640, 'Zomboid Assult\nLoading...', {
        fontSize: '48px',
        color: '#03DAC6',
        align: 'center',
      })
      .setOrigin(0.5);

    console.log('BootScene created successfully');

    // Test ConfigLoader
    const loader = ConfigLoader.getInstance();
    try {
      await loader.loadAllConfigs();
      console.log('✅ All configs loaded successfully!');
      console.log('Game Settings:', loader.getGameSettings());
      console.log('Zomboid Type (basic_circle_small):', loader.getZomboidType('basic_circle_small'));
      console.log('Weapon Type (single_gun):', loader.getWeaponType('single_gun'));
      console.log('Chapter (chapter-01):', loader.getChapter('chapter-01'));
    } catch (error) {
      console.error('❌ Config loading failed:', error);
    }
  }
}
