import type { ChapterData } from '@/types/ConfigTypes';
import { ConfigLoader } from '@/systems/ConfigLoader';

export interface ChapterProgress {
  chapterId: string;
  completed: boolean;
  unlocked: boolean;
  bestScore: number;
  completionTime: number; // in seconds
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

/**
 * ProgressManager System
 * Manages player progress, chapter unlocking, and localStorage persistence
 */
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
    // Check debug setting - unlock all chapters if enabled
    const configLoader = ConfigLoader.getInstance();
    if (configLoader.isUnlockAllChaptersEnabled()) {
      return true;
    }

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
      const progress = this.getChapterProgress(chapter.chapterId);
      if (progress.unlocked && !progress.completed) {
        return chapter;
      }
    }
    // All completed or none unlocked, return first chapter
    return allChapters[0] || null;
  }
}
