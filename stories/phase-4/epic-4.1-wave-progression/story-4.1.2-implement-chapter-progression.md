# Story 4.1.2: Implement Chapter Progression System

**Epic:** 4.1 Wave Completion and Progression
**Phase:** 4 - Wave Progression and Content (Days 8-9)
**Estimated Time:** 4 hours
**Status:** 📋 READY TO START

## Description
Implement a comprehensive chapter progression system that tracks player progress, saves completion state to localStorage, unlocks chapters sequentially, and displays a detailed chapter complete screen with statistics and rewards.

## User Story
**As a player**, I want my chapter progress to be saved and tracked so that I can unlock new chapters, replay completed ones, and see my accomplishments.

## Tasks
- [ ] Create ProgressManager system for tracking chapter completion
- [ ] Implement localStorage save/load functionality
- [ ] Add chapter unlock logic based on completion
- [ ] Create ChapterCompleteScene with statistics display
- [ ] Implement chapter selection UI updates (locked/unlocked states)
- [ ] Add chapter replay functionality
- [ ] Track and display chapter statistics
  - [ ] Best score
  - [ ] Completion time
  - [ ] Total zomboids killed
  - [ ] Highest weapon tier reached
- [ ] Add visual feedback for unlocking new chapters
- [ ] Handle edge cases (first playthrough, cleared save data)

## Acceptance Criteria
- [ ] Chapters unlock sequentially after completion
- [ ] Progress saved to localStorage automatically
- [ ] Progress persists across browser sessions
- [ ] ChapterCompleteScene displays accurate statistics
- [ ] Can replay completed chapters
- [ ] Locked chapters show lock icon in menu
- [ ] Unlocked chapters show completion status
- [ ] Chapter statistics tracked and displayed
- [ ] "Continue" button in menu goes to next uncompleted chapter
- [ ] Clear/reset progress option in settings

## Files to Create/Modify
- `src/systems/ProgressManager.ts` - NEW: Chapter progress tracking
- `src/scenes/ChapterCompleteScene.ts` - NEW: Chapter completion screen
- `src/scenes/MenuScene.ts` - Update to show locked/unlocked chapters
- `src/scenes/GameScene.ts` - Call ProgressManager on chapter complete
- `src/types/GameTypes.ts` - Add ChapterProgress interface

## Dependencies
- Story 4.1.1: Implement Wave Completion Logic (must complete first)
- Story 1.3.2: Implement MenuScene (completed)
- All chapter configurations in config/chapters/

## Implementation Details

### ProgressManager.ts (NEW)
```typescript
import type { ChapterData } from '@/types/ConfigTypes';

export interface ChapterProgress {
  chapterId: string;
  completed: boolean;
  unlocked: boolean;
  bestScore: number;
  completionTime: number;  // in seconds
  zomboidsKilled: number;
  highestWeaponTier: number;
  playCount: number;
  firstCompletedDate: string | null;
  lastPlayedDate: string | null;
}

export interface GameProgress {
  chapters: Record<string, ChapterProgress>;
  totalScore: number;
  totalPlayTime: number;
  lastUpdated: string;
}

export class ProgressManager {
  private static instance: ProgressManager | null = null;
  private progress: GameProgress;
  private readonly STORAGE_KEY = 'zomboid_assult_progress';

  private constructor() {
    this.progress = this.loadProgress();
  }

  static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager();
    }
    return ProgressManager.instance;
  }

  /**
   * Load progress from localStorage
   */
  private loadProgress(): GameProgress {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Progress loaded from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }

    // Return default progress (only first chapter unlocked)
    return {
      chapters: {},
      totalScore: 0,
      totalPlayTime: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Save progress to localStorage
   */
  private saveProgress(): void {
    try {
      this.progress.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.progress));
      console.log('Progress saved to localStorage');
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * Initialize chapter progress if not exists
   */
  private initChapterProgress(chapterId: string, unlocked: boolean = false): ChapterProgress {
    if (!this.progress.chapters[chapterId]) {
      this.progress.chapters[chapterId] = {
        chapterId,
        completed: false,
        unlocked,
        bestScore: 0,
        completionTime: 0,
        zomboidsKilled: 0,
        highestWeaponTier: 0,
        playCount: 0,
        firstCompletedDate: null,
        lastPlayedDate: null,
      };
    }
    return this.progress.chapters[chapterId];
  }

  /**
   * Check if a chapter is unlocked
   */
  isChapterUnlocked(chapterId: string): boolean {
    // First chapter is always unlocked
    if (chapterId === 'chapter-01') {
      return true;
    }

    const chapterProgress = this.progress.chapters[chapterId];
    return chapterProgress ? chapterProgress.unlocked : false;
  }

  /**
   * Get chapter progress data
   */
  getChapterProgress(chapterId: string): ChapterProgress {
    return this.initChapterProgress(chapterId, chapterId === 'chapter-01');
  }

  /**
   * Mark chapter start (increment play count)
   */
  onChapterStart(chapterId: string): void {
    const progress = this.initChapterProgress(chapterId, true);
    progress.playCount++;
    progress.lastPlayedDate = new Date().toISOString();
    this.saveProgress();
  }

  /**
   * Mark chapter complete and update statistics
   */
  onChapterComplete(
    chapterId: string,
    score: number,
    completionTime: number,
    zomboidsKilled: number,
    weaponTier: number
  ): void {
    const progress = this.initChapterProgress(chapterId, true);

    // Update best score if current is higher
    if (score > progress.bestScore) {
      progress.bestScore = score;
    }

    // Update completion time if first completion or faster
    if (!progress.completed || completionTime < progress.completionTime) {
      progress.completionTime = completionTime;
    }

    // Update zomboids killed (cumulative)
    progress.zomboidsKilled += zomboidsKilled;

    // Update highest weapon tier reached
    if (weaponTier > progress.highestWeaponTier) {
      progress.highestWeaponTier = weaponTier;
    }

    // Mark as completed
    if (!progress.completed) {
      progress.completed = true;
      progress.firstCompletedDate = new Date().toISOString();
    }

    // Update total stats
    this.progress.totalScore += score;
    this.progress.totalPlayTime += completionTime;

    // Unlock next chapter
    this.unlockNextChapter(chapterId);

    this.saveProgress();

    console.log(`Chapter ${chapterId} completed! Progress saved.`);
  }

  /**
   * Unlock the next chapter in sequence
   */
  private unlockNextChapter(completedChapterId: string): void {
    const chapterNumber = parseInt(completedChapterId.split('-')[1]);
    const nextChapterId = `chapter-${String(chapterNumber + 1).padStart(2, '0')}`;

    const nextProgress = this.initChapterProgress(nextChapterId, false);
    nextProgress.unlocked = true;

    console.log(`Unlocked chapter: ${nextChapterId}`);
  }

  /**
   * Get all chapter progress data
   */
  getAllProgress(): GameProgress {
    return { ...this.progress };
  }

  /**
   * Reset all progress (for testing or settings)
   */
  resetProgress(): void {
    this.progress = {
      chapters: {},
      totalScore: 0,
      totalPlayTime: 0,
      lastUpdated: new Date().toISOString(),
    };
    this.saveProgress();
    console.log('Progress reset!');
  }

  /**
   * Get next uncompleted chapter for "Continue" button
   */
  getNextUncompletedChapter(allChapters: ChapterData[]): ChapterData | null {
    for (const chapter of allChapters) {
      const progress = this.getChapterProgress(chapter.id);
      if (progress.unlocked && !progress.completed) {
        return chapter;
      }
    }
    // All completed or none unlocked, return first chapter
    return allChapters[0] || null;
  }
}
```

### ChapterCompleteScene.ts (NEW)
```typescript
import Phaser from 'phaser';
import type { ChapterData } from '@/types/ConfigTypes';
import { ProgressManager } from '@/systems/ProgressManager';

export class ChapterCompleteScene extends Phaser.Scene {
  private chapter: ChapterData | null = null;
  private score: number = 0;
  private completionTime: number = 0;
  private zomboidsKilled: number = 0;
  private weaponTier: number = 0;

  constructor() {
    super({ key: 'ChapterCompleteScene' });
  }

  init(data: {
    chapter: ChapterData;
    score: number;
    completionTime: number;
    zomboidsKilled: number;
    weaponTier: number;
  }): void {
    this.chapter = data.chapter;
    this.score = data.score || 0;
    this.completionTime = data.completionTime || 0;
    this.zomboidsKilled = data.zomboidsKilled || 0;
    this.weaponTier = data.weaponTier || 0;

    // Save progress
    if (this.chapter) {
      const progressManager = ProgressManager.getInstance();
      progressManager.onChapterComplete(
        this.chapter.id,
        this.score,
        this.completionTime,
        this.zomboidsKilled,
        this.weaponTier
      );
    }
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Background
    this.cameras.main.setBackgroundColor('#121212');

    // Title
    this.add.text(centerX, 100, 'Chapter Complete!', {
      fontSize: '48px',
      color: '#03DAC6',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Chapter name
    if (this.chapter) {
      this.add.text(centerX, 160, this.chapter.chapterName, {
        fontSize: '28px',
        color: '#E0E0E0',
      }).setOrigin(0.5);
    }

    // Statistics panel
    const statsY = 240;
    const stats = [
      `Final Score: ${this.score}`,
      `Time: ${this.formatTime(this.completionTime)}`,
      `Zomboids Destroyed: ${this.zomboidsKilled}`,
      `Weapon Tier Reached: ${this.weaponTier + 1}`,
    ];

    this.add.text(centerX, statsY, stats.join('\n'), {
      fontSize: '24px',
      color: '#E0E0E0',
      align: 'center',
      lineSpacing: 12,
    }).setOrigin(0.5);

    // Check if new chapter unlocked
    const progressManager = ProgressManager.getInstance();
    const chapterNumber = this.chapter ? parseInt(this.chapter.id.split('-')[1]) : 0;
    const nextChapterId = `chapter-${String(chapterNumber + 1).padStart(2, '0')}`;
    const nextChapterProgress = progressManager.getChapterProgress(nextChapterId);

    if (nextChapterProgress.unlocked && nextChapterProgress.playCount === 0) {
      // New chapter just unlocked!
      this.add.text(centerX, statsY + 140, '🎉 New Chapter Unlocked! 🎉', {
        fontSize: '28px',
        color: '#FFEA00',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    // Buttons
    const buttonY = height - 200;

    this.createButton(centerX - 150, buttonY, 'Replay', () => {
      this.scene.start('GameScene', { chapter: this.chapter });
    });

    this.createButton(centerX + 150, buttonY, 'Menu', () => {
      this.scene.start('MenuScene');
    });

    // Next chapter button (if available)
    if (nextChapterProgress.unlocked) {
      this.createButton(centerX, buttonY + 80, 'Next Chapter', () => {
        // Load next chapter and start
        const ConfigLoader = require('@/systems/ConfigLoader').ConfigLoader;
        const loader = ConfigLoader.getInstance();
        const allChapters = loader.getChapters();
        const nextChapter = allChapters.find((c: ChapterData) => c.id === nextChapterId);

        if (nextChapter) {
          this.scene.start('GameScene', { chapter: nextChapter });
        }
      });
    }

    // Fade in animation
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x03DAC6, 1);
    bg.fillRoundedRect(-80, -25, 160, 50, 8);

    const label = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: '#121212',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(160, 50);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerdown', callback);

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x18FFFF, 1);
      bg.fillRoundedRect(-80, -25, 160, 50, 8);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x03DAC6, 1);
      bg.fillRoundedRect(-80, -25, 160, 50, 8);
    });
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
```

### GameScene.ts Modifications
```typescript
import { ProgressManager } from '@/systems/ProgressManager';

export class GameScene extends Phaser.Scene {
  // ... existing code ...

  private chapterStartTime: number = 0;
  private totalZomboidsKilled: number = 0;

  create(): void {
    // ... existing code ...

    // Track chapter start
    this.chapterStartTime = this.time.now;
    if (this.currentChapter) {
      const progressManager = ProgressManager.getInstance();
      progressManager.onChapterStart(this.currentChapter.id);
    }
  }

  private onChapterComplete(): void {
    if (!this.currentChapter || !this.waveManager || !this.weaponSystem) return;

    const completionTime = (this.time.now - this.chapterStartTime) / 1000; // seconds
    const weaponTier = this.weaponSystem.getCurrentTier();

    // Transition to chapter complete scene
    this.scene.start('ChapterCompleteScene', {
      chapter: this.currentChapter,
      score: this.score,
      completionTime,
      zomboidsKilled: this.totalZomboidsKilled,
      weaponTier,
    });
  }

  private onZomboidDestroyed(): void {
    this.totalZomboidsKilled++;
    // ... existing code ...
  }
}
```

### MenuScene.ts Updates
```typescript
import { ProgressManager } from '@/systems/ProgressManager';

export class MenuScene extends Phaser.Scene {
  create(): void {
    // ... existing code ...

    const progressManager = ProgressManager.getInstance();
    const allChapters = this.configLoader.getChapters();

    // "Continue" button - goes to next uncompleted chapter
    const nextChapter = progressManager.getNextUncompletedChapter(allChapters);
    if (nextChapter) {
      this.createButton(centerX, 200, 'Continue', () => {
        this.scene.start('GameScene', { chapter: nextChapter });
      });
    }

    // Chapter selection
    let chapterY = 300;
    allChapters.forEach((chapter: ChapterData) => {
      const progress = progressManager.getChapterProgress(chapter.id);

      if (progress.unlocked) {
        const label = progress.completed
          ? `${chapter.chapterName} ✓`
          : chapter.chapterName;

        this.createChapterButton(centerX, chapterY, label, chapter, progress);
      } else {
        // Locked chapter
        this.createLockedChapter(centerX, chapterY, chapter.chapterName);
      }

      chapterY += 70;
    });
  }

  private createChapterButton(
    x: number,
    y: number,
    label: string,
    chapter: ChapterData,
    progress: ChapterProgress
  ): void {
    // ... button creation with progress stats tooltip ...
  }

  private createLockedChapter(x: number, y: number, name: string): void {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a2a, 1);
    bg.fillRoundedRect(-150, -25, 300, 50, 8);

    const lockIcon = this.add.text(-120, 0, '🔒', {
      fontSize: '24px',
    }).setOrigin(0.5);

    const label = this.add.text(0, 0, name, {
      fontSize: '18px',
      color: '#666666',
    }).setOrigin(0.5);

    container.add([bg, lockIcon, label]);
  }
}
```

## Testing Checklist
- [ ] Complete Chapter 1, verify Chapter 2 unlocks
- [ ] Complete Chapter 2, verify Chapter 3 unlocks
- [ ] Verify progress saves to localStorage
- [ ] Close browser and reopen, verify progress persists
- [ ] Test "Continue" button goes to correct chapter
- [ ] Test chapter replay maintains unlock status
- [ ] Test locked chapters display correctly
- [ ] Test chapter statistics display accurately
- [ ] Test "New Chapter Unlocked" message displays
- [ ] Test reset progress functionality

## Edge Cases to Handle
- [ ] First time player (no saved progress)
- [ ] localStorage disabled or full
- [ ] Corrupted save data
- [ ] Playing chapter while not unlocked (shouldn't happen, but validate)
- [ ] Completing same chapter multiple times (updates best score)

## Performance Considerations
- localStorage operations are synchronous but fast (<10ms)
- Save on chapter complete only (not every frame)
- Progress data is small (<10KB even with many chapters)

## Success Metrics
- ✅ Progress saves and loads reliably
- ✅ Chapter unlocking works correctly
- ✅ Statistics tracked accurately
- ✅ UI clearly shows locked/unlocked state
- ✅ No data loss on browser refresh

## Next Steps
After completion:
- Story 4.1.3: Test All Chapter Configurations

## Notes
- Consider adding cloud save integration in future (backend API)
- May want to add achievement system based on chapter progress
- Export/import save data feature for backup/sharing
