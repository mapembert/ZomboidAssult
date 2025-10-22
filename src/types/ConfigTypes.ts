// Game Settings Types
export interface GameSettings {
  gameSettings: {
    screenWidth: number;
    screenHeight: number;
    columnCount: number;
    backgroundColor: string;
    fps: number;
    debugMode: boolean;
  };
  gameplay: {
    playerStartColumn: number;
    safeZoneHeight: number;
    spawnZoneHeight: number;
    gameOverOnZomboidReachBottom: boolean;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
}

// Zomboid Type
export interface ZomboidType {
  id: string;
  shape: 'circle' | 'square' | 'hexagon';
  size: 'small' | 'medium' | 'large';
  radius?: number;
  width?: number;
  height?: number;
  color: string;
  outlineColor: string;
  health: number;
  speed: number;
  scoreValue: number;
}

// Weapon Type
export interface WeaponType {
  id: string;
  name: string;
  tier: number;
  fireRate: number;
  projectileCount: number;
  damage: number;
  spread: number;
  projectileSpeed: number;
  projectileColor: string;
  projectileSize: number;
}

// Timer Type
export interface TimerType {
  id: string;
  name: string;
  startValue: number;
  increment: number;
  width: number;
  speed: number;
  negativeColor: string;
  positiveColor: string;
  neutralColor: string;
  fontSize: number;
  fontColor: string;
}

// Hero Config
export interface HeroConfig {
  heroConfig: {
    defaultHeroCount: number;
    minHeroCount: number;
    maxHeroCount: number;
    movementSpeed: number;
    sprite: {
      shape: string;
      baseWidth: number;
      height: number;
      color: string;
      outlineColor: string;
      outlineWidth: number;
    };
    spacing: number;
    positionFromBottom: number;
  };
}

// Wave Spawn Pattern
export interface ZomboidSpawnPattern {
  type: string;
  count: number;
  spawnRate: number;
  columns: ('left' | 'right')[];
  spawnDelay: number;
}

export interface TimerSpawnPattern {
  type: string;
  spawnTime: number;
  column: 'left' | 'right';
}

// Wave Data
export interface WaveData {
  waveId: number;
  waveName: string;
  duration: number;
  spawnPattern: {
    zomboids: ZomboidSpawnPattern[];
    timers: TimerSpawnPattern[];
  };
}

// Chapter Data
export interface ChapterData {
  chapterId: string;
  chapterName: string;
  description: string;
  unlockRequirement: string | null;
  waves: WaveData[];
}

// Helper type for config collections
export interface ZomboidTypesConfig {
  zomboidTypes: ZomboidType[];
}

export interface WeaponTypesConfig {
  weaponTypes: WeaponType[];
}

export interface TimerTypesConfig {
  timerTypes: TimerType[];
}
