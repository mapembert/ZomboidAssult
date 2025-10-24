import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { ChapterCompleteScene } from './scenes/ChapterCompleteScene';
import Logger from './utils/Logger';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  backgroundColor: '#121212',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene, ChapterCompleteScene],
};

// Hide loading screen
const loadingEl = document.getElementById('loading');
if (loadingEl) {
  loadingEl.style.display = 'none';
}

// Initialize logger and expose to window for easy access
Logger.getInstance(); // Initialize the logger
(window as any).Logger = Logger;

// Create game instance
const game = new Phaser.Game(config);

// Fullscreen button handler
const fullscreenBtn = document.getElementById('fullscreen-btn');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    const container = document.getElementById('game-container');
    if (container) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        // iOS Safari
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).mozRequestFullScreen) {
        // Firefox
        (container as any).mozRequestFullScreen();
      } else if ((container as any).msRequestFullscreen) {
        // IE/Edge
        (container as any).msRequestFullscreen();
      }
    }
  });
}

// Detect if running in standalone mode (added to home screen)
if (window.matchMedia('(display-mode: standalone)').matches) {
  document.body.classList.add('standalone');
}

export default game;

// Register Service Worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered:', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}
