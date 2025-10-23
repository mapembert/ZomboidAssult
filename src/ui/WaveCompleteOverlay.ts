import Phaser from 'phaser';
import type { WaveStats } from '@/types/GameTypes';

/**
 * WaveCompleteOverlay
 * UI component displayed when a wave is completed
 * Shows wave statistics and transitions to next wave
 */
export class WaveCompleteOverlay extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private titleText: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private nextWaveText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, waveNumber: number, stats: WaveStats) {
    super(scene, 0, 0);

    const { width, height } = scene.scale;

    // Semi-transparent dark overlay
    this.background = scene.add.graphics();
    this.background.fillStyle(0x000000, 0.8);
    this.background.fillRect(0, 0, width, height);
    this.add(this.background);

    // "Wave Complete!" title
    this.titleText = scene.add.text(width / 2, height / 3, 'Wave Complete!', {
      fontSize: '48px',
      color: '#03DAC6',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(this.titleText);

    // Wave statistics
    const accuracy = stats.zomboidsSpawned > 0
      ? Math.round((stats.zomboidsKilled / stats.zomboidsSpawned) * 100)
      : 0;

    const statsStr = [
      `Wave ${waveNumber}`,
      ``,
      `Zomboids Destroyed: ${stats.zomboidsKilled} / ${stats.zomboidsSpawned}`,
      `Accuracy: ${accuracy}%`,
      `Time: ${Math.floor(stats.timeElapsed)}s`,
    ].join('\n');

    this.statsText = scene.add.text(width / 2, height / 2, statsStr, {
      fontSize: '24px',
      color: '#E0E0E0',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);
    this.add(this.statsText);

    // Next wave message
    this.nextWaveText = scene.add.text(
      width / 2,
      height * 0.7,
      'Next wave starting...',
      {
        fontSize: '20px',
        color: '#B0B0B0',
      }
    ).setOrigin(0.5);
    this.add(this.nextWaveText);

    // Fade in animation
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
    });

    scene.add.existing(this);
  }

  /**
   * Fade out and destroy overlay
   */
  fadeOut(callback?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
        if (callback) callback();
      },
    });
  }
}
