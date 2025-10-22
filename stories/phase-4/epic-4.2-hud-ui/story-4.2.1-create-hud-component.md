# Story 4.2.1: Create Comprehensive HUD Component

**Epic:** 4.2 HUD and UI Polish
**Phase:** 4 - Wave Progression and Content (Days 8-9)
**Estimated Time:** 4 hours
**Status:** 📋 READY TO START

## Description
Create a comprehensive, polished HUD (Heads-Up Display) component that displays all critical game information in an organized, readable manner following the dark mode design aesthetic. The HUD should update in real-time and be non-intrusive to gameplay.

## User Story
**As a player**, I need to see my score, current wave, time remaining, hero count, and weapon status at all times so that I can make informed decisions during gameplay.

## Tasks
- [ ] Create HUD.ts class as reusable UI component
- [ ] Implement score display (top-left)
- [ ] Implement wave info display (top-center): "Chapter X - Wave Y"
- [ ] Implement time remaining display (top-right)
- [ ] Implement hero count display (bottom-center)
- [ ] Implement weapon tier display (bottom-left)
- [ ] Apply dark mode styling to all elements
- [ ] Add subtle background panels for readability
- [ ] Implement real-time value updates
- [ ] Add number formatting (commas for large scores)
- [ ] Ensure mobile-responsive sizing
- [ ] Test visibility against game background

## Acceptance Criteria
- [ ] All HUD elements visible and positioned correctly
- [ ] Score updates in real-time when zomboids destroyed
- [ ] Wave info displays correct chapter and wave number
- [ ] Time remaining counts down each second
- [ ] Hero count updates when heroes added/removed
- [ ] Weapon tier displays current weapon name
- [ ] Dark mode styling matches design specification
- [ ] Text readable at all times (contrast sufficient)
- [ ] No overlap with gameplay elements
- [ ] Font sizes appropriate for mobile and desktop
- [ ] No performance impact (< 1ms per frame)

## Files to Create/Modify
- `src/ui/HUD.ts` - NEW: Main HUD component
- `src/scenes/GameScene.ts` - Integrate HUD component
- `src/types/GameTypes.ts` - Add HUDData interface

## Dependencies
- Story 2.1.2: Implement HeroManager System (completed)
- Story 2.2.3: Implement WeaponSystem (completed)
- Story 2.3.3: Implement WaveManager System (completed)
- Design specification from docs/zomboid-assult-prototype-design.md

## Implementation Details

### HUD.ts (NEW)
```typescript
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
  private scoreText: Phaser.GameObjects.Text;
  private waveInfoText: Phaser.GameObjects.Text;
  private timeText: Phaser.GameObjects.Text;
  private heroCountText: Phaser.GameObjects.Text;
  private weaponText: Phaser.GameObjects.Text;

  // Background panels
  private scorePanel: Phaser.GameObjects.Graphics;
  private wavePanel: Phaser.GameObjects.Graphics;
  private timePanel: Phaser.GameObjects.Graphics;
  private heroPanel: Phaser.GameObjects.Graphics;
  private weaponPanel: Phaser.GameObjects.Graphics;

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

    // Score panel (top-left)
    this.scorePanel = this.scene.add.graphics();
    this.scorePanel.fillStyle(panelColor, panelAlpha);
    this.scorePanel.fillRoundedRect(10, 10, 200, 50, panelRadius);
    this.add(this.scorePanel);

    // Wave info panel (top-center)
    const { width } = this.scene.scale;
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
    const { height } = this.scene.scale;
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
```

### GameScene.ts Integration
```typescript
import { HUD, HUDData } from '@/ui/HUD';

export class GameScene extends Phaser.Scene {
  private hud: HUD | null = null;
  private hudUpdateInterval: number = 100; // Update every 100ms
  private lastHudUpdate: number = 0;

  create(): void {
    // ... existing code ...

    // Create HUD
    if (this.currentChapter && this.waveManager && this.heroManager && this.weaponSystem) {
      const initialData: HUDData = {
        score: this.score,
        chapterName: this.currentChapter.chapterName,
        chapterNumber: parseInt(this.currentChapter.id.split('-')[1]),
        waveNumber: 1,
        totalWaves: this.currentChapter.waves.length,
        timeRemaining: this.waveManager.getRemainingTime(),
        heroCount: this.heroManager.getHeroCount(),
        weaponName: this.weaponSystem.getCurrentWeaponName(),
        weaponTier: this.weaponSystem.getCurrentTier(),
      };

      this.hud = new HUD(this, initialData);
    }

    // Remove old individual HUD text elements
    // this.scoreText, this.heroCountText, etc. - now handled by HUD
  }

  update(time: number, delta: number): void {
    if (!this.gameActive) return;

    // ... existing update logic ...

    // Update HUD periodically
    if (time - this.lastHudUpdate >= this.hudUpdateInterval) {
      this.updateHUD();
      this.lastHudUpdate = time;
    }
  }

  private updateHUD(): void {
    if (!this.hud || !this.waveManager || !this.heroManager || !this.weaponSystem) return;

    const timeRemaining = this.waveManager.getRemainingTime();

    this.hud.updateData({
      score: this.score,
      timeRemaining,
      heroCount: this.heroManager.getHeroCount(),
      weaponName: this.weaponSystem.getCurrentWeaponName(),
      weaponTier: this.weaponSystem.getCurrentTier(),
    });

    // Show low time warning
    if (timeRemaining < 10) {
      this.hud.showLowTimeWarning();
    }
  }

  private onZomboidDestroyed(scoreValue: number): void {
    this.score += scoreValue;

    // Update HUD immediately on score change
    if (this.hud) {
      this.hud.updateData({ score: this.score });
    }
  }

  private onHeroCountChanged(): void {
    if (this.hud && this.heroManager) {
      this.hud.updateData({ heroCount: this.heroManager.getHeroCount() });
      this.hud.flashHeroCount();
    }
  }

  private onWeaponUpgraded(): void {
    if (this.hud && this.weaponSystem) {
      this.hud.updateData({
        weaponName: this.weaponSystem.getCurrentWeaponName(),
        weaponTier: this.weaponSystem.getCurrentTier(),
      });
      this.hud.flashWeaponUpgrade();
    }
  }

  private transitionToNextWave(): void {
    // ... existing code ...

    if (this.hud && this.waveManager) {
      this.hud.updateData({
        waveNumber: this.waveManager.getCurrentWaveNumber(),
      });
    }
  }
}
```

### Mobile Responsiveness Adjustments
```typescript
// In HUD.ts constructor, add responsive sizing
private adjustForScreenSize(): void {
  const { width, height } = this.scene.scale;

  // Adjust font sizes for smaller screens
  if (width < 768) {
    // Mobile
    this.scoreText.setFontSize('18px');
    this.waveInfoText.setFontSize('16px');
    this.timeText.setFontSize('18px');
    this.heroCountText.setFontSize('22px');
    this.weaponText.setFontSize('14px');

    // Adjust panel sizes
    this.scorePanel.clear();
    this.scorePanel.fillStyle(0x1e1e1e, 0.85);
    this.scorePanel.fillRoundedRect(5, 5, 150, 40, 6);

    // ... adjust other panels similarly ...
  }
}
```

## Testing Checklist
- [ ] HUD displays correctly on game start
- [ ] Score updates when zomboids destroyed
- [ ] Wave info displays correct chapter and wave
- [ ] Time remaining counts down each second
- [ ] Time turns red when < 10 seconds
- [ ] Hero count updates when heroes added/removed
- [ ] Hero count flash animation on change
- [ ] Weapon display updates on upgrade
- [ ] Weapon flash animation on upgrade
- [ ] Wave number updates on wave transition
- [ ] HUD visible on desktop (1920x1080)
- [ ] HUD visible on mobile (720x1280)
- [ ] No overlap with gameplay elements
- [ ] Readable against dark background
- [ ] No performance impact

## Edge Cases to Handle
- [ ] Score exceeds 999,999 (number formatting)
- [ ] Wave duration > 60 minutes (unlikely but test time formatting)
- [ ] Hero count reaches max (5 heroes)
- [ ] Weapon name too long (truncate if needed)
- [ ] Very small screen sizes (< 320px width)

## Visual Design Specifications

### Colors (Dark Mode Theme)
- **Background Panels:** `#1E1E1E` @ 85% opacity
- **Primary Text:** `#E0E0E0` (light gray)
- **Accent Text:** `#03DAC6` (teal/cyan)
- **Warning Text:** `#FF5252` (red, for low time)
- **Highlight Text:** `#FFEA00` (yellow, for weapon upgrade)

### Typography
- **Score:** 24px bold
- **Wave Info:** 20px bold
- **Time:** 24px bold
- **Hero Count:** 28px bold
- **Weapon:** 18px regular

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Score: X,XXX]    [Chapter X - Wave X/X]    [Time: X:XX]│
│                                                           │
│                    [GAMEPLAY AREA]                        │
│                                                           │
│ [Weapon Info]                      [⚡ Heroes: X]        │
└─────────────────────────────────────────────────────────┘
```

## Performance Considerations
- HUD updates throttled to 10 FPS (100ms intervals) - sufficient for readability
- Score updates immediately on change (important for feedback)
- Graphics objects cached, not recreated each frame
- Text updates use setText() (optimized in Phaser)
- Depth set to 1000 to avoid z-index sorting each frame

## Success Metrics
- ✅ All required information displayed
- ✅ Real-time updates work correctly
- ✅ Visual feedback animations smooth
- ✅ No performance impact (< 1ms per update)
- ✅ Readable on all target devices

## Next Steps
After completion:
- Story 4.2.2: Implement Pause Menu System
- Story 4.2.3: Add Visual Feedback Effects

## Notes
- Consider adding FPS counter in debug mode
- May want to add "combo multiplier" display in future
- Could add mini-map or spawn indicators in future
- Animation timings can be adjusted based on feel
