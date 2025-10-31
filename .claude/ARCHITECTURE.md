# Zomboid Assault - Technical Architecture

**Purpose**: Comprehensive technical reference for understanding codebase structure and system interactions.

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         PHASER 3 GAME                            │
├─────────────────────────────────────────────────────────────────┤
│  Scenes (State Management)                                       │
│  ├─ BootScene (Load Assets)                                     │
│  ├─ MenuScene (Chapter Selection)                               │
│  ├─ GameScene (Main Gameplay) ◄─── MOST COMPLEX                │
│  ├─ ChapterCompleteScene                                        │
│  └─ GameOverScene                                               │
├─────────────────────────────────────────────────────────────────┤
│  Core Systems (Managers)                                         │
│  ├─ ConfigLoader (Singleton) - Loads all JSON configs          │
│  ├─ WaveManager - Spawns enemies based on chapter data         │
│  ├─ HeroManager - Player position & rendering                  │
│  ├─ WeaponSystem - Projectile firing                           │
│  ├─ CollisionManager - Collision detection                     │
│  ├─ AudioManager (Singleton) - Sound effects & music           │
│  ├─ InputManager - Touch/mouse input handling                  │
│  └─ ProgressManager (Singleton) - Save/load chapter progress   │
├─────────────────────────────────────────────────────────────────┤
│  UI Components                                                   │
│  ├─ HUD - Score, wave number, time                            │
│  ├─ PauseMenu                                                   │
│  └─ WaveCompleteOverlay                                        │
├─────────────────────────────────────────────────────────────────┤
│  Game Entities                                                   │
│  ├─ Zomboid (extends Phaser.GameObjects.Container)            │
│  ├─ Projectile (extends Phaser.GameObjects.Graphics)          │
│  └─ Timer (spawned by WaveManager)                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Configuration (JSON - Data Driven)                             │
│  ├─ game-settings.json - Screen size, audio, debug flags       │
│  ├─ chapters/*.json (8 files) - Wave definitions               │
│  └─ entities/*.json - zomboids, weapons, timers, heroes        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Game Loop Flow

### Initialization Sequence
```
1. main.ts
   └─> Create Phaser.Game instance
       └─> Boot BootScene

2. BootScene.create()
   ├─> ConfigLoader.getInstance().loadAllConfigs()
   │   ├─> Load game-settings.json
   │   ├─> Load zomboids.json
   │   ├─> Load weapons.json
   │   ├─> Load timers.json
   │   ├─> Load heroes.json
   │   └─> Load all chapters (chapter-01 through chapter-08)
   └─> AudioManager.getInstance().initialize()
       └─> scene.start('MenuScene')

3. MenuScene.create()
   ├─> Display chapter selection UI
   └─> On chapter click → scene.start('GameScene', { chapter })

4. GameScene.init(data)
   └─> Store currentChapter from data.chapter

5. GameScene.create()
   ├─> Initialize AudioManager
   ├─> Create HeroManager (player)
   ├─> Create InputManager (touch/mouse)
   ├─> Create WeaponSystem
   ├─> Create WaveManager (load chapter waves)
   ├─> Create CollisionManager
   ├─> Create HUD
   ├─> Setup event listeners
   └─> WaveManager.startFirstWave()
```

### Main Update Loop (GameScene.update())
```
Every frame (60 FPS):

1. If paused → skip update
2. If transitioning waves → skip update

3. InputManager.update()
   └─> Check touch/mouse input
       └─> Calculate target position
           └─> HeroManager.setTargetPosition()

4. HeroManager.update(delta)
   ├─> Interpolate to target position
   ├─> Update hero sprite positions
   └─> Return current position

5. WeaponSystem.update(delta, heroPosition)
   ├─> Get zombie positions from CollisionManager
   ├─> Find nearest zombie to hero
   ├─> Fire projectiles toward target
   └─> Update all projectile positions

6. WaveManager.update(delta)
   ├─> Decrement wave timer
   ├─> Spawn zomboids per spawn patterns
   ├─> Spawn timers per timer patterns
   ├─> Update all zomboids (move downward)
   └─> If wave timer reaches 0 → emit 'wave_complete'

7. CollisionManager.update()
   ├─> Check projectile/zomboid overlaps
   ├─> Emit 'collision' event on hit
   └─> Check if zomboids reached bottom
       └─> If yes → trigger game over

8. Check timer collisions with hero
   └─> If timer caught → emit timer events

9. Update HUD (throttled to 100ms)
   └─> Update score, time, wave number
```

---

## 📡 Event System

GameScene uses Phaser's event emitter for decoupled communication:

```typescript
// Events emitted by systems
this.events.emit('collision', { projectile, zomboid, destroyed, score });
this.events.emit('timer_exited', { timerType });
this.events.emit('timer_completed', { timerType, rewardType });
this.events.emit('weapon_upgraded', { oldTier, newTier, weaponName });
this.events.emit('wave_complete', { waveNumber, stats, hasNextWave });

// Event listeners in GameScene
this.events.on('collision', this.handleCollision, this);
this.events.on('timer_exited', this.handleTimerExit, this);
this.events.on('timer_completed', this.handleTimerCompleted, this);
this.events.on('weapon_upgraded', this.handleWeaponUpgrade, this);
this.events.on('wave_complete', this.handleWaveComplete, this);
```

---

## 🎯 Critical Game State Variables (GameScene)

```typescript
// Scene references
private currentChapter: ChapterData | null = null;
private heroManager: HeroManager | null = null;
private weaponSystem: WeaponSystem | null = null;
private waveManager: WaveManager | null = null;
private collisionManager: CollisionManager | null = null;
private hud: HUD | null = null;
private waveCompleteOverlay: WaveCompleteOverlay | null = null;

// Game state flags
private gameActive: boolean = true;           // False when game over
private isPaused: boolean = false;            // Pause menu state
private isTransitioningWaves: boolean = false; // True during wave complete overlay

// Gameplay data
private score: number = 0;
private totalZomboidsKilled: number = 0;
private chapterStartTime: number = 0;
```

**Important**: `gameActive` must be false to stop update loops. Both `isPaused` and `isTransitioningWaves` also halt gameplay.

---

## 🔧 Key System Details

### ConfigLoader (Singleton)
**Purpose**: Centralized configuration loader, caches all JSON data.

```typescript
// Usage pattern
const loader = ConfigLoader.getInstance();
const settings = loader.getGameSettings();
const zomboidType = loader.getZomboidType('basic_circle_small');
const chapter = await loader.loadChapter('chapter-01');
```

**Implementation Note**: Uses Maps for O(1) lookups:
```typescript
private zomboidTypes: Map<string, ZomboidType> = new Map();
private weaponTypes: Map<string, WeaponType> = new Map();
private chapters: Map<string, ChapterData> = new Map();
```

### WaveManager
**Purpose**: Orchestrates wave progression and enemy spawning.

**Key Responsibilities**:
1. Load wave data from chapter JSON
2. Spawn zomboids based on `spawnPattern.zomboids`
3. Spawn timers based on `spawnPattern.timers`
4. Track wave time and emit completion events
5. Manage wave transitions

**Spawn Pattern Logic**:
```typescript
// Each zomboid pattern has:
{
  type: "basic_circle_small",  // Zomboid type ID
  count: 20,                    // Total to spawn this wave
  spawnRate: 1.5,              // Zomboids per second
  columns: ["left", "right"],  // Which side(s) to spawn
  spawnDelay: 5                // Wait N seconds before spawning
}

// Spawning algorithm:
spawnTimer += delta
if (spawnTimer >= (1000 / spawnRate) && spawnedCount < count) {
  spawnZomboid(type, randomColumn(columns))
  spawnedCount++
  spawnTimer = 0
}
```

### HeroManager
**Purpose**: Manages player position using 12-position snap system.

**Position System**:
```typescript
// 12 positions in an arc at bottom of screen
const positions = 12
const arcRadius = 300
const arcStartAngle = Math.PI * 0.75  // Start left
const arcEndAngle = Math.PI * 0.25    // End right

// Movement with interpolation
targetPosition = newPosition
currentPosition += (targetPosition - currentPosition) * lerpFactor * delta
```

**Hero Count**:
- Each hero is a visual sprite that trails behind the main sprite
- More heroes = more visual feedback, no gameplay effect on damage
- Heroes reset to 1 when weapon upgraded

### WeaponSystem
**Purpose**: Auto-fires projectiles at nearest enemy.

**Firing Logic**:
```typescript
// Each weapon tier has:
{
  fireRate: 0.5,        // Time between shots (seconds)
  projectileCount: 2,   // How many projectiles per shot
  damage: 1,            // Damage per projectile
  spread: 20            // Angle spread for multiple projectiles
}

// Auto-targeting
nearestZomboid = findClosestZomboid(heroPosition, allZomboids)
if (nearestZomboid) {
  fireProjectile(heroPosition, nearestZomboid.position)
}
```

### CollisionManager
**Purpose**: Efficient collision detection between projectiles and zomboids.

**Algorithm**:
```typescript
// For each active projectile:
for (projectile of projectiles) {
  for (zomboid of zomboids) {
    if (Phaser.Geom.Intersects.CircleToRectangle(
      projectile.getBounds(),
      zomboid.getBounds()
    )) {
      // Hit!
      zomboid.takeDamage(projectile.damage)

      if (zomboid.health <= 0) {
        emit('collision', { destroyed: true, score: zomboid.scoreValue })
        zomboid.destroy()
      }

      // Check penetration
      if (projectile.penetrationDamage <= 0) {
        projectile.destroy()
        break
      } else {
        projectile.penetrationDamage -= zomboid.maxHealth
      }
    }
  }
}
```

**Penetration Mechanic** (Sniper Rifle):
- Projectile continues through enemies if `penetrationDamage > 0`
- Each enemy hit reduces penetration by enemy's max HP
- Allows single shot to hit multiple enemies

---

## 📊 Data Flow Examples

### Wave Complete Flow
```
1. WaveManager detects timer reached 0
   └─> emit('wave_complete', { waveNumber, stats, hasNextWave })

2. GameScene.handleWaveComplete()
   ├─> Set gameActive = false (stops updates)
   ├─> Set isTransitioningWaves = true
   ├─> Play wave_complete sound
   ├─> Create WaveCompleteOverlay (shows stats)
   └─> Schedule 3-second delay
       └─> WaveCompleteOverlay.fadeOut()
           └─> GameScene.transitionToNextWave()
               ├─> If hasNextWave:
               │   ├─> WaveManager.startNextWave()
               │   ├─> Set gameActive = true
               │   └─> Set isTransitioningWaves = false
               └─> Else:
                   └─> scene.start('ChapterCompleteScene')
```

### Weapon Upgrade Flow
```
1. WaveManager spawns weapon_upgrade_timer
   └─> Timer entity created with negative startValue

2. Timer.update()
   └─> Increment value toward 0 (8 points/sec)

3. InputManager detects hero touching timer
   └─> If timer value >= 0:
       └─> emit('timer_completed', { timerType, weaponTier })

4. GameScene.handleTimerCompleted()
   ├─> WeaponSystem.upgradeWeapon(newTier)
   │   └─> emit('weapon_upgraded', { oldTier, newTier })
   ├─> HeroManager.resetHeroCount(1)
   └─> Display weapon upgrade feedback
```

### Game Over Flow
```
1. CollisionManager.update()
   └─> Zomboid.y >= safeZoneHeight (reached bottom)

2. GameScene.checkGameOver()
   └─> Found zomboid at bottom
       └─> GameScene.triggerGameOver()

3. triggerGameOver()
   ├─> Set gameActive = false
   ├─> Play game_over sound (loop: false)
   └─> scene.start('GameOverScene', { score, wave, chapter })

4. GameOverScene displays:
   ├─> Final score
   ├─> Wave reached
   └─> Options: Retry / Back to Menu
```

---

## 🐛 Common Bug Patterns & Fixes

### Memory Leaks
**Symptom**: Performance degrades over time, overlays persist.
**Cause**: Phaser objects not destroyed properly.
**Fix**: Always call `.destroy()` and set reference to `null`:
```typescript
if (this.waveCompleteOverlay) {
  this.waveCompleteOverlay.destroy();
  this.waveCompleteOverlay = null;
}
```

### Event Listener Leaks
**Symptom**: Events fire multiple times.
**Cause**: Event listeners not removed when scene changes.
**Fix**: Use `shutdown()` method:
```typescript
shutdown(): void {
  this.events.off('collision', this.handleCollision, this);
  this.events.off('wave_complete', this.handleWaveComplete, this);
  // ... remove all listeners
}
```

### Audio Looping
**Symptom**: Sound plays repeatedly.
**Cause**: `loop` parameter defaults to true or is cached.
**Fix**: Explicitly set `loop: false`:
```typescript
this.audioManager?.playSFX('game_over', { volume: 0.7, loop: false });
```

### Overlays Not Clearing
**Symptom**: UI persists between waves/scenes.
**Cause**: Overlay not destroyed before creating new one.
**Fix**: Check and destroy existing overlay:
```typescript
if (this.waveCompleteOverlay) {
  this.waveCompleteOverlay.destroy();
  this.waveCompleteOverlay = null;
}
this.waveCompleteOverlay = new WaveCompleteOverlay(...);
```

---

## 🔍 Debugging Tips

### Enable Debug Logging
```json
// public/config/game-settings.json
{
  "debug": {
    "enableLogging": true,
    "unlockAllChapters": true  // Skip chapter unlock requirements
  }
}
```

### Check Wave Spawning
```typescript
// src/systems/WaveManager.ts
console.log('Spawning zomboid:', type, 'at column:', column);
console.log('Wave time remaining:', this.waveTimeRemaining);
```

### Monitor Collision Detection
```typescript
// src/systems/CollisionManager.ts
console.log('Collision detected:', projectile, zomboid, destroyed);
```

### Track Performance
```typescript
// src/scenes/GameScene.ts - update()
const startTime = performance.now();
// ... update logic ...
const elapsed = performance.now() - startTime;
if (elapsed > 16.67) {  // Longer than 1 frame at 60fps
  console.warn('Slow frame:', elapsed, 'ms');
}
```

---

## 📦 Build & Deployment Architecture

### Development
```bash
npm run dev
# Runs: vite
# Opens: http://localhost:5173
# Hot reload enabled
```

### Production Build
```bash
npm run build
# Runs: tsc && vite build
# Output: dist/ directory
# - Compiles TypeScript to JavaScript
# - Bundles all assets
# - Minifies code
# - Copies public/ files to dist/
```

### Deployment (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [master]  # Only deploys from master

jobs:
  build:
    - npm ci              # Clean install
    - npm run build       # Build to dist/
    - upload dist/        # Upload artifact

  deploy:
    - Deploy to GitHub Pages
```

**Important**: The `dist/` folder is gitignored. GitHub Actions rebuilds it on every deploy.

---

## 🎨 Asset Loading

### Audio Files
```
public/assets/audio/
├── music/
│   └── menu_music.mp3
└── sfx/
    ├── projectile_fire.mp3
    ├── zomboid_hit.mp3
    ├── zomboid_destroyed.mp3
    ├── timer_increment.mp3
    ├── hero_add.mp3
    ├── weapon_upgrade.mp3
    ├── wave_complete.mp3
    └── game_over.mp3
```

### Loading Pattern
```typescript
// BootScene.preload()
this.load.audio('game_over', 'assets/audio/sfx/game_over.mp3');

// Usage
AudioManager.getInstance().playSFX('game_over', { volume: 0.7, loop: false });
```

---

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Can select and start each chapter 1-8
- [ ] Weapon upgrades work correctly
- [ ] Hero count increases with hero timers
- [ ] Wave transitions show overlay correctly
- [ ] Game over triggers when zomboid reaches bottom
- [ ] Sounds play once (no looping)
- [ ] Overlays clear properly between waves
- [ ] Score increments on zomboid kills
- [ ] Boss enemies take appropriate time to kill

### Balance Testing
```bash
# Run analyzer after ANY chapter.json changes
python analyze_balance.py

# Look for:
# - Overkill ratio < 1.0 (too hard)
# - [SPAWN PRESSURE] warnings
# - Grades below B
```

---

## 💡 Design Patterns Used

1. **Singleton Pattern**: ConfigLoader, AudioManager, ProgressManager
2. **Event-Driven Architecture**: Phaser EventEmitter for system communication
3. **Data-Driven Design**: All game content in JSON files
4. **Component System**: Phaser GameObjects with custom logic
5. **State Machine**: Scene-based game states (Menu → Game → GameOver)
6. **Object Pool** (potential): Projectiles could be pooled for performance

---

*This architecture document covers the technical implementation. Refer to RECENT_WORK.md for recent changes and context.*
