# Zomboid Assult - Game Architecture Document

## Document Information
- **Game:** Zomboid Assult
- **Version:** 1.0
- **Date:** 2025-10-21
- **Author:** BMad Orchestrator

---

## 1. Technology Stack

### Core Technologies
- **Game Engine:** Phaser 3 (v3.60+)
- **Language:** TypeScript (v5.0+, strict mode)
- **Build Tool:** Vite (or Webpack)
- **Physics:** Phaser Arcade Physics (AABB collision)
- **Renderer:** WebGL with Canvas fallback

### Development Tools
- **Package Manager:** npm or yarn
- **Linting:** ESLint with TypeScript parser
- **Formatting:** Prettier
- **Testing:** Jest + @testing-library (optional for prototype)
- **Version Control:** Git

---

## 2. Project Structure

```
zomboid-assult/
├── config/                      # JSON configuration files
│   ├── game-settings.json       # Global game settings
│   ├── entities/                # Entity definitions
│   │   ├── zomboids.json        # Zomboid types
│   │   ├── weapons.json         # Weapon configurations
│   │   ├── timers.json          # Timer configurations
│   │   └── heroes.json          # Hero properties
│   └── chapters/                # Chapter and wave definitions
│       ├── chapter-01.json
│       ├── chapter-02.json
│       └── chapter-03.json
│
├── src/                         # TypeScript source code
│   ├── main.ts                  # Entry point, Phaser config
│   ├── scenes/                  # Phaser scenes
│   │   ├── BootScene.ts         # Asset preloading
│   │   ├── MenuScene.ts         # Main menu, chapter selection
│   │   ├── GameScene.ts         # Core gameplay scene
│   │   └── GameOverScene.ts     # Game over, restart
│   ├── entities/                # Game entity classes
│   │   ├── Hero.ts              # Player hero sprite + logic
│   │   ├── Zomboid.ts           # Zomboid enemy sprite + logic
│   │   ├── Projectile.ts        # Projectile sprite + logic
│   │   └── Timer.ts             # Countdown timer entity
│   ├── systems/                 # Game systems
│   │   ├── ConfigLoader.ts      # JSON config parsing
│   │   ├── WeaponSystem.ts      # Weapon firing, upgrades
│   │   ├── HeroManager.ts       # Hero count, positioning
│   │   ├── WaveManager.ts       # Wave spawning, progression
│   │   ├── CollisionManager.ts  # Collision handling
│   │   ├── InputManager.ts      # Input abstraction (keyboard/touch)
│   │   └── AudioManager.ts      # Sound effects, music
│   ├── ui/                      # UI components
│   │   ├── HUD.ts               # Score, wave, hero count
│   │   └── PauseMenu.ts         # Pause overlay
│   ├── utils/                   # Utility functions
│   │   ├── ObjectPool.ts        # Object pooling for performance
│   │   ├── ShapeRenderer.ts     # Draw circles, squares, hexagons
│   │   └── Constants.ts         # Game constants
│   └── types/                   # TypeScript type definitions
│       ├── GameTypes.ts         # Zomboid, Weapon, Timer types
│       └── ConfigTypes.ts       # JSON config types
│
├── assets/                      # Game assets
│   ├── audio/                   # Sound effects, music
│   │   ├── sfx/                 # Sound effects
│   │   └── music/               # Background music
│   └── sprites/                 # Sprite assets (if any)
│
├── public/                      # Static files
│   └── index.html               # HTML entry point
│
├── docs/                        # Documentation
│   ├── zomboid-assult-prototype-design.md
│   └── game-architecture.md (this file)
│
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config (or webpack.config.js)
└── README.md                    # Project readme
```

---

## 3. Core Systems Architecture

### 3.1 Scene Management

**Flow:**
```
BootScene → MenuScene → GameScene → GameOverScene
                ↑                         ↓
                └─────────────────────────┘
```

#### BootScene
- **Purpose:** Preload all assets (JSON configs, audio, sprites if any)
- **Responsibilities:**
  - Load JSON configuration files
  - Load audio assets
  - Display loading progress bar
  - Transition to MenuScene when complete

#### MenuScene
- **Purpose:** Chapter selection, settings, start game
- **Responsibilities:**
  - Display chapter list (locked/unlocked status)
  - Settings menu (audio volume, debug mode)
  - Start game → transition to GameScene with selected chapter

#### GameScene
- **Purpose:** Core gameplay loop
- **Responsibilities:**
  - Initialize game systems (WeaponSystem, HeroManager, WaveManager, etc.)
  - Spawn zomboids and timers based on wave config
  - Handle input (hero movement)
  - Manage collisions
  - Track wave progress and duration
  - Display HUD
  - Handle pause
  - Transition to GameOverScene on loss
  - Transition to next wave or chapter complete

#### GameOverScene
- **Purpose:** Display results, retry, return to menu
- **Responsibilities:**
  - Show final score, wave reached, chapter status
  - Restart button → restart current chapter
  - Menu button → return to MenuScene

---

### 3.2 Configuration System

**ConfigLoader.ts**
- **Purpose:** Load and parse all JSON configuration files
- **Methods:**
  - `loadGameSettings(): GameSettings` - Load game-settings.json
  - `loadZomboidTypes(): ZomboidType[]` - Load zomboids.json
  - `loadWeaponTypes(): WeaponType[]` - Load weapons.json
  - `loadTimerTypes(): TimerType[]` - Load timers.json
  - `loadHeroConfig(): HeroConfig` - Load heroes.json
  - `loadChapter(chapterId: string): ChapterData` - Load specific chapter config
  - `getAllChapters(): ChapterData[]` - Load all chapters

**Type Definitions (ConfigTypes.ts):**
```typescript
interface GameSettings {
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

interface ZomboidType {
  id: string;
  shape: 'circle' | 'square' | 'hexagon';
  size: 'small' | 'medium' | 'large';
  radius?: number;  // for circles and hexagons
  width?: number;   // for squares
  height?: number;  // for squares
  color: string;
  outlineColor: string;
  health: number;
  speed: number;
  scoreValue: number;
}

interface WeaponType {
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

interface TimerType {
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

interface HeroConfig {
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

interface WaveData {
  waveId: number;
  waveName: string;
  duration: number;
  spawnPattern: {
    zomboids: {
      type: string;
      count: number;
      spawnRate: number;
      columns: ('left' | 'right')[];
      spawnDelay: number;
    }[];
    timers: {
      type: string;
      spawnTime: number;
      column: 'left' | 'right';
    }[];
  };
}

interface ChapterData {
  chapterId: string;
  chapterName: string;
  description: string;
  unlockRequirement: string | null;
  waves: WaveData[];
}
```

---

### 3.3 Entity Classes

#### Hero.ts
```typescript
class Hero extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics;
  private columnIndex: number;

  constructor(scene: Phaser.Scene, x: number, y: number, config: HeroConfig);

  moveToColumn(columnIndex: number): void;
  update(delta: number): void;
  renderShape(): void;  // Draw triangle shape
}
```

#### Zomboid.ts
```typescript
class Zomboid extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics;
  private config: ZomboidType;
  private health: number;
  private currentSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZomboidType);

  takeDamage(amount: number): boolean;  // Returns true if destroyed
  update(delta: number): void;
  renderShape(): void;  // Draw circle/square/hexagon
  resetForPool(): void;  // Reset state for object pooling
}
```

#### Projectile.ts
```typescript
class Projectile extends Phaser.GameObjects.Graphics {
  private damage: number;
  private velocity: Phaser.Math.Vector2;

  constructor(scene: Phaser.Scene, x: number, y: number, weaponConfig: WeaponType, angle: number);

  update(delta: number): void;
  resetForPool(x: number, y: number, angle: number): void;
}
```

#### Timer.ts
```typescript
class Timer extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private counterText: Phaser.GameObjects.Text;
  private config: TimerType;
  private currentValue: number;
  private columnIndex: number;

  constructor(scene: Phaser.Scene, x: number, y: number, config: TimerType, columnIndex: number);

  incrementCounter(amount: number): void;
  getCurrentValue(): number;
  update(delta: number): void;
  renderBackground(): void;  // Update color based on value
  onExitScreen(): number;  // Returns final value for hero modification
}
```

---

### 3.4 Game Systems

#### WeaponSystem.ts
```typescript
class WeaponSystem {
  private scene: Phaser.Scene;
  private currentWeapon: WeaponType;
  private projectilePool: ObjectPool<Projectile>;
  private lastFireTime: number;

  constructor(scene: Phaser.Scene);

  setWeapon(weaponId: string): void;
  fire(x: number, y: number): void;  // Fire projectiles from position
  update(delta: number): void;
  upgradeWeapon(): void;  // Move to next tier
}
```

#### HeroManager.ts
```typescript
class HeroManager {
  private scene: Phaser.Scene;
  private heroes: Hero[];
  private config: HeroConfig;
  private currentColumn: number;
  private columnPositions: number[];  // X positions for each column

  constructor(scene: Phaser.Scene, config: HeroConfig);

  moveLeft(): void;
  moveRight(): void;
  addHero(count: number): void;
  removeHero(count: number): void;
  getHeroCount(): number;
  getHeroPositions(): { x: number, y: number }[];
  update(delta: number): void;
  repositionHeroes(): void;  // Space heroes evenly in column
}
```

#### WaveManager.ts
```typescript
class WaveManager {
  private scene: Phaser.Scene;
  private currentChapter: ChapterData;
  private currentWaveIndex: number;
  private waveStartTime: number;
  private zomboidPool: ObjectPool<Zomboid>;
  private activeZomboids: Zomboid[];
  private activeTimers: Timer[];
  private spawnSchedule: { time: number, entity: 'zomboid' | 'timer', config: any }[];

  constructor(scene: Phaser.Scene, chapter: ChapterData);

  startWave(waveIndex: number): void;
  update(delta: number, currentTime: number): void;
  spawnZomboid(config: ZomboidType, column: number): void;
  spawnTimer(config: TimerType, column: number, spawnTime: number): void;
  isWaveComplete(): boolean;
  getNextWave(): WaveData | null;
  getRemainingTime(): number;
}
```

#### CollisionManager.ts
```typescript
class CollisionManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene);

  checkProjectileZomboidCollisions(projectiles: Projectile[], zomboids: Zomboid[]): void;
  checkProjectileTimerCollisions(projectiles: Projectile[], timers: Timer[]): void;
  checkZomboidReachBottom(zomboids: Zomboid[], bottomY: number): boolean;
}
```

#### InputManager.ts
```typescript
class InputManager {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private leftKey: Phaser.Input.Keyboard.Key;
  private rightKey: Phaser.Input.Keyboard.Key;
  private touchZones: { left: Phaser.GameObjects.Zone, right: Phaser.GameObjects.Zone };

  constructor(scene: Phaser.Scene);

  isMovingLeft(): boolean;
  isMovingRight(): boolean;
  update(): void;
}
```

#### AudioManager.ts
```typescript
class AudioManager {
  private scene: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound>;
  private music: Phaser.Sound.BaseSound | null;

  constructor(scene: Phaser.Scene);

  playSFX(soundId: string): void;
  playMusic(musicId: string, loop: boolean): void;
  stopMusic(): void;
  setVolume(type: 'master' | 'music' | 'sfx', volume: number): void;
}
```

---

### 3.5 Utility Systems

#### ObjectPool.ts
```typescript
class ObjectPool<T> {
  private pool: T[];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number);

  acquire(): T;
  release(obj: T): void;
  getActiveCount(): number;
}
```

#### ShapeRenderer.ts
```typescript
class ShapeRenderer {
  static drawCircle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, fillColor: number, strokeColor: number, strokeWidth: number): void;

  static drawSquare(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, fillColor: number, strokeColor: number, strokeWidth: number): void;

  static drawHexagon(graphics: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, fillColor: number, strokeColor: number, strokeWidth: number): void;

  static drawTriangle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, baseWidth: number, height: number, fillColor: number, strokeColor: number, strokeWidth: number): void;
}
```

#### Constants.ts
```typescript
export const SCREEN_WIDTH = 720;
export const SCREEN_HEIGHT = 1280;
export const COLUMN_COUNT = 2;
export const COLUMN_WIDTH = SCREEN_WIDTH / COLUMN_COUNT;

export const COLORS = {
  BACKGROUND: 0x121212,
  HERO: 0x03DAC6,
  HERO_OUTLINE: 0x18FFFF,
  PROJECTILE: 0xFFFFFF,
  // ... etc
};

export const GAME_EVENTS = {
  ZOMBOID_DESTROYED: 'zomboid_destroyed',
  TIMER_HIT: 'timer_hit',
  HERO_COUNT_CHANGED: 'hero_count_changed',
  WEAPON_UPGRADED: 'weapon_upgraded',
  WAVE_COMPLETE: 'wave_complete',
  GAME_OVER: 'game_over'
};
```

---

## 4. Data Flow

### Initialization Flow
```
1. main.ts creates Phaser.Game instance
   ↓
2. BootScene loads all JSON configs via ConfigLoader
   ↓
3. MenuScene displays available chapters
   ↓
4. User selects chapter → GameScene initialized with ChapterData
```

### Game Loop (GameScene.update)
```
1. InputManager: Check player input → HeroManager.moveLeft/Right
   ↓
2. WaveManager: Spawn zomboids/timers based on schedule
   ↓
3. HeroManager: Update hero positions
   ↓
4. WeaponSystem: Auto-fire projectiles from hero positions
   ↓
5. Update all entities (zomboids, timers, projectiles)
   ↓
6. CollisionManager: Check all collisions
   ↓
7. Handle collision outcomes:
   - Projectile + Zomboid → damage/destroy zomboid, pool projectile
   - Projectile + Timer → increment counter, pool projectile
   - Zomboid reaches bottom → GAME OVER
   ↓
8. Check wave completion:
   - Duration elapsed + all zomboids cleared → next wave
   - All waves complete → chapter complete
   ↓
9. Update HUD (score, time, hero count, wave info)
```

### Timer Lifecycle
```
1. WaveManager spawns Timer at scheduled time
   ↓
2. Timer descends at configured speed
   ↓
3. Projectile collision → Timer.incrementCounter()
   ↓
4. Counter reaches 0 → visual color change (red → blue)
   ↓
5. Timer exits screen bottom → onExitScreen()
   ↓
6. Return final counter value → HeroManager.addHero() or .removeHero()
```

---

## 5. Performance Optimization

### Object Pooling
- **Zomboids:** Pre-allocate 50 zomboid objects, reuse on destroy
- **Projectiles:** Pre-allocate 100 projectile objects, reuse when off-screen
- **Why:** Avoid garbage collection overhead, maintain 60 FPS

### Rendering Optimization
- **Graphics Objects:** Use Phaser.GameObjects.Graphics for shapes (no sprite sheets needed)
- **Batch Drawing:** Minimize draw calls by grouping similar shapes
- **Culling:** Destroy or disable objects off-screen

### Memory Management
- **Asset Loading:** Load all assets in BootScene, cache in memory
- **Scene Cleanup:** Destroy unused objects when transitioning scenes
- **Event Listeners:** Remove all event listeners in scene shutdown

### Mobile Optimization
- **Touch Input:** Large touch zones (1/2 screen width) for reliable input
- **Reduced Particles:** Minimal visual effects to preserve battery
- **Scale Mode:** FIT mode maintains aspect ratio on all devices

---

## 6. Testing Strategy

### Unit Testing (Optional for Prototype)
- Test ConfigLoader JSON parsing
- Test ObjectPool acquire/release logic
- Test collision detection algorithms

### Integration Testing
- Test wave spawning matches JSON config
- Test hero count modification from timers
- Test weapon upgrade progression

### Playtesting Checklist
- [ ] All zomboid types render correctly
- [ ] Hero movement responds instantly to input
- [ ] Weapon firing is consistent and accurate
- [ ] Timers increment properly when hit
- [ ] Hero count updates correctly
- [ ] Wave progression follows chapter config
- [ ] Game over triggers correctly
- [ ] 60 FPS maintained on target devices
- [ ] Audio plays without lag or clipping
- [ ] No memory leaks during extended play

---

## 7. Build and Deployment

### Development Build
```bash
npm install
npm run dev  # Start Vite dev server
```

### Production Build
```bash
npm run build  # Build optimized bundle
npm run preview  # Preview production build locally
```

### Deployment Options
- **GitHub Pages:** Static hosting for web version
- **Itch.io:** HTML5 game distribution
- **Capacitor/Cordova:** Wrap for iOS/Android native apps

---

## 8. Future Architecture Considerations

### Scalability
- **Multiplayer:** Not planned for prototype, but could use WebSockets + authoritative server
- **Procedural Waves:** Could generate wave configs algorithmically instead of JSON
- **Mod Support:** JSON configs already enable community modifications

### Analytics Integration
- Track player metrics: completion rates, average score, weapon preferences
- Use Google Analytics or custom backend for data collection

### Save System
- LocalStorage for progress tracking
- Cloud save via backend API (future)

---

## 9. Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "phaser": "^3.60.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^4.0.0",
    "@types/node": "^18.0.0",
    "eslint": "^8.0.0",
    "prettier": "^2.8.0"
  }
}
```

---

## 10. Technical Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Performance drops below 60 FPS on mobile | High | Medium | Implement object pooling, limit particle effects, profile early |
| Touch input unreliable on small screens | High | Low | Use large touch zones (1/2 screen width), test on multiple devices |
| JSON config errors break game | Medium | Medium | Validate JSON schema on load, provide error messages, fallback configs |
| Audio lag on mobile browsers | Medium | Medium | Use Web Audio API via Phaser, preload all audio, test on iOS/Android |
| Memory leaks during long sessions | Medium | Low | Proper object pooling, scene cleanup, memory profiling |

---

## Document Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |
| 2025-10-21 | 1.0 | Initial game architecture document | BMad Orchestrator |
