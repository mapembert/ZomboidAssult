# Story 1.2.2: Implement ConfigLoader System

**Epic:** 1.2 Configuration System
**Phase:** 1 - Foundation (Days 1-2)
**Estimated Time:** 3 hours
**Status:** 🟡 READY TO START

## Description
Create `src/systems/ConfigLoader.ts` with methods to load and parse all JSON configuration files. Implement error handling for missing or malformed JSON, and ensure all config data is accessible in scenes.

## Tasks
- [ ] Create `src/systems/ConfigLoader.ts`
- [ ] Implement loadGameSettings() method
- [ ] Implement loadZomboidTypes() method
- [ ] Implement loadWeaponTypes() method
- [ ] Implement loadTimerTypes() method
- [ ] Implement loadHeroConfig() method
- [ ] Implement loadChapter(chapterId) method
- [ ] Implement getAllChapters() method
- [ ] Add error handling for missing/malformed JSON
- [ ] Test loading all existing config files

## Acceptance Criteria
- [ ] All JSON files load successfully
- [ ] Typed data structures returned
- [ ] Error messages display for invalid JSON
- [ ] Config data accessible in scenes

## Implementation Guide

### Create `src/systems/ConfigLoader.ts`

```typescript
import type {
  GameSettings,
  ZomboidTypesConfig,
  WeaponTypesConfig,
  TimerTypesConfig,
  HeroConfig,
  ChapterData,
  ZomboidType,
  WeaponType,
  TimerType,
} from '@/types/ConfigTypes';

export class ConfigLoader {
  private static instance: ConfigLoader;

  private gameSettings: GameSettings | null = null;
  private zomboidTypes: Map<string, ZomboidType> = new Map();
  private weaponTypes: Map<string, WeaponType> = new Map();
  private timerTypes: Map<string, TimerType> = new Map();
  private heroConfig: HeroConfig | null = null;
  private chapters: Map<string, ChapterData> = new Map();

  private constructor() {}

  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  public async loadGameSettings(): Promise<GameSettings> {
    if (this.gameSettings) return this.gameSettings;

    try {
      const response = await fetch('/config/game-settings.json');
      if (!response.ok) throw new Error('Failed to load game settings');
      this.gameSettings = await response.json();
      return this.gameSettings;
    } catch (error) {
      console.error('Error loading game settings:', error);
      throw error;
    }
  }

  public async loadZomboidTypes(): Promise<Map<string, ZomboidType>> {
    if (this.zomboidTypes.size > 0) return this.zomboidTypes;

    try {
      const response = await fetch('/config/entities/zomboids.json');
      if (!response.ok) throw new Error('Failed to load zomboid types');
      const data: ZomboidTypesConfig = await response.json();

      data.zomboidTypes.forEach((type) => {
        this.zomboidTypes.set(type.id, type);
      });

      return this.zomboidTypes;
    } catch (error) {
      console.error('Error loading zomboid types:', error);
      throw error;
    }
  }

  public async loadWeaponTypes(): Promise<Map<string, WeaponType>> {
    if (this.weaponTypes.size > 0) return this.weaponTypes;

    try {
      const response = await fetch('/config/entities/weapons.json');
      if (!response.ok) throw new Error('Failed to load weapon types');
      const data: WeaponTypesConfig = await response.json();

      data.weaponTypes.forEach((type) => {
        this.weaponTypes.set(type.id, type);
      });

      return this.weaponTypes;
    } catch (error) {
      console.error('Error loading weapon types:', error);
      throw error;
    }
  }

  public async loadTimerTypes(): Promise<Map<string, TimerType>> {
    if (this.timerTypes.size > 0) return this.timerTypes;

    try {
      const response = await fetch('/config/entities/timers.json');
      if (!response.ok) throw new Error('Failed to load timer types');
      const data: TimerTypesConfig = await response.json();

      data.timerTypes.forEach((type) => {
        this.timerTypes.set(type.id, type);
      });

      return this.timerTypes;
    } catch (error) {
      console.error('Error loading timer types:', error);
      throw error;
    }
  }

  public async loadHeroConfig(): Promise<HeroConfig> {
    if (this.heroConfig) return this.heroConfig;

    try {
      const response = await fetch('/config/entities/heroes.json');
      if (!response.ok) throw new Error('Failed to load hero config');
      this.heroConfig = await response.json();
      return this.heroConfig;
    } catch (error) {
      console.error('Error loading hero config:', error);
      throw error;
    }
  }

  public async loadChapter(chapterId: string): Promise<ChapterData> {
    if (this.chapters.has(chapterId)) {
      return this.chapters.get(chapterId)!;
    }

    try {
      const response = await fetch(`/config/chapters/${chapterId}.json`);
      if (!response.ok) throw new Error(`Failed to load chapter ${chapterId}`);
      const chapter: ChapterData = await response.json();
      this.chapters.set(chapterId, chapter);
      return chapter;
    } catch (error) {
      console.error(`Error loading chapter ${chapterId}:`, error);
      throw error;
    }
  }

  public async getAllChapters(): Promise<ChapterData[]> {
    const chapterIds = ['chapter-01', 'chapter-02', 'chapter-03'];
    const chapters: ChapterData[] = [];

    for (const id of chapterIds) {
      try {
        const chapter = await this.loadChapter(id);
        chapters.push(chapter);
      } catch (error) {
        console.warn(`Could not load chapter ${id}, skipping...`);
      }
    }

    return chapters;
  }

  public async loadAllConfigs(): Promise<void> {
    console.log('Loading all game configurations...');

    await Promise.all([
      this.loadGameSettings(),
      this.loadZomboidTypes(),
      this.loadWeaponTypes(),
      this.loadTimerTypes(),
      this.loadHeroConfig(),
      this.getAllChapters(),
    ]);

    console.log('All configurations loaded successfully!');
  }

  // Getters for cached data
  public getZomboidType(id: string): ZomboidType | undefined {
    return this.zomboidTypes.get(id);
  }

  public getWeaponType(id: string): WeaponType | undefined {
    return this.weaponTypes.get(id);
  }

  public getTimerType(id: string): TimerType | undefined {
    return this.timerTypes.get(id);
  }

  public getGameSettings(): GameSettings | null {
    return this.gameSettings;
  }

  public getHeroConfig(): HeroConfig | null {
    return this.heroConfig;
  }

  public getChapter(id: string): ChapterData | undefined {
    return this.chapters.get(id);
  }
}
```

## Files to Create
- `src/systems/ConfigLoader.ts`

## Dependencies
- Story 1.2.1: Create TypeScript Type Definitions

## Testing

### Create test file `src/test-config-loader.ts` (temporary):
```typescript
import { ConfigLoader } from '@/systems/ConfigLoader';

async function testConfigLoader() {
  const loader = ConfigLoader.getInstance();

  try {
    // Test loading all configs
    await loader.loadAllConfigs();

    // Test getters
    console.log('Game Settings:', loader.getGameSettings());
    console.log('Zomboid Type (basic_circle_small):', loader.getZomboidType('basic_circle_small'));
    console.log('Weapon Type (single_gun):', loader.getWeaponType('single_gun'));
    console.log('Chapter (chapter-01):', loader.getChapter('chapter-01'));

    console.log('✅ All config tests passed!');
  } catch (error) {
    console.error('❌ Config loading failed:', error);
  }
}

testConfigLoader();
```

### Run test:
```bash
npm run dev
# Open browser console
# Should see all configs logged without errors
```

## Next Story
Story 1.3.1: Implement BootScene
