# Zomboid Assult - Prototype Design Document

## Executive Summary

### Core Concept
Zomboid Assult is a 2D/2.5D column-based defense game where players must make strategic split-second decisions: shoot advancing zombie hordes or sacrifice firepower to shoot countdown timers that unlock powerful upgrades. The game features a minimalist dark-mode aesthetic with configurable JSON-driven waves and progressive difficulty.

### Target Audience
- **Primary:** Mobile gamers (16-35), casual/mid-core players who enjoy fast-paced arcade action
- **Secondary:** Fans of tower defense, survival, and bullet-hell genres

### Platform & Technical Requirements
- **Primary Platform:** Mobile (iOS/Android), Desktop web browser
- **Engine:** Phaser 3 + TypeScript
- **Performance Target:** 60 FPS on mid-range mobile devices (2019+)
- **Screen Support:** Portrait orientation, 720x1280 to 1080x1920

### Unique Selling Points
1. **Strategic Timer Mechanic** - Players must choose between offense (shooting zomboids) and power-ups (shooting timers)
2. **JSON-Driven Configuration** - All game entities, upgrades, and chapters defined in external config files
3. **Dark Mode Aesthetic** - Minimalist Chrome dark-theme inspired visuals with outline highlights
4. **Progressive Weapon Upgrades** - From single gun to triple guns, pulse lasers, and mega machine guns
5. **Hero Management** - Timer countdown affects hero count (positive = add heroes, negative = remove heroes)

---

## Core Gameplay

### Game Pillars
1. **Strategic Decision Making** - Every second, players choose resource allocation (zomboids vs timers)
2. **Progressive Difficulty** - JSON-configured waves increase horde size, speed, and variety
3. **Risk/Reward Balance** - Shooting timers means less defense but better long-term capability
4. **Clear Visual Feedback** - Minimalist design ensures instant readability of threats and opportunities
5. **Configuration-Driven Design** - Easy to balance and extend through JSON files

### Core Gameplay Loop (30-60 seconds)
1. **Wave Start** (2s) - Zomboids and timers spawn from top of columns and descend
2. **Strategic Shooting** (20-50s) - Player moves heroes left/right, auto-fires upward, decides targets
3. **Timer Decision** (5-10s) - Critical choice: continue defense or shoot countdown timer
4. **Reward/Consequence** (3-5s) - Timer reaches 0 → upgrade applied or hero added/removed
5. **Wave Clear** (2-3s) - Survive duration → next wave or chapter complete

### Win/Loss Conditions

**Victory Conditions:**
- Survive the configured duration for each wave
- Complete all waves in a chapter
- Prevent zomboids from reaching the bottom player zone

**Failure States:**
- Any zomboid reaches the bottom (hero position) → immediate game over
- All heroes removed by negative timer countdown
- Player quits mid-wave

---

## Game Mechanics

### Primary Mechanics

#### 1. Column-Based Movement System
**Description:** Game field divided into 2 vertical lanes/columns. All entities (zomboids, timers) descend at uniform speed. Heroes move horizontally at the bottom.

**Player Input:**
- Desktop: Arrow keys or A/D to move heroes left/right between columns
- Mobile: Touch left/right side of screen or drag hero sprite

**System Response:**
- Heroes move to selected column position
- Auto-fire continuously upward in current column
- Collision detection with descending entities

**Implementation Notes:**
- Column width: 50% of screen width each
- Hero movement speed: instant snap or smooth lerp (configurable)
- Auto-fire rate: depends on current weapon upgrade
- Phaser Arcade Physics for collision detection

**Dependencies:** Weapon system, collision system

---

#### 2. Zomboid Spawning & Behavior
**Description:** Various zomboid types spawn at the top of columns and descend at configured speeds. JSON config defines spawn patterns, types, and wave composition.

**Player Input:** None (system-driven)

**System Response:**
- Spawn zomboids based on wave configuration
- Move downward at constant velocity
- Register collision with projectiles (take damage/die)
- Trigger game over if reaching bottom

**Implementation Notes:**
- Object pooling for performance (reuse zomboid sprites)
- Zomboid properties: `type`, `size`, `health`, `speed`, `color`, `shape`, `scoreValue`
- Shape types: `circle`, `square`, `hexagon`
- Size variants: `small`, `medium`, `large`
- JSON structure: `entities/zomboids.json`

**Dependencies:** Collision system, JSON config loader

---

#### 3. Countdown Timer Mechanic
**Description:** Thin, full-column vertical boxes spawn periodically with countdown numbers (starting at negative values like -25). Players shoot the timer to increment the counter. At 0, it changes to positive (red → light blue). Final value determines hero add/remove.

**Player Input:** Shoot timer object instead of zomboids

**System Response:**
- Each hit increments counter by +1 or configured increment
- Visual transition: negative (red) → 0 (neutral) → positive (light blue)
- When timer exits screen or reaches target: apply hero count modification
- Positive final value = add heroes, negative = remove heroes

**Implementation Notes:**
- Timer properties: `startValue` (e.g., -25), `increment`, `width`, `column`, `speed`
- Visual: thin vertical rectangle spanning column height
- Counter display: centered number, font size scales with importance
- JSON structure: `entities/timers.json`
- Hero count never goes below 1

**Dependencies:** Hero management system, projectile collision

---

#### 4. Auto-Fire Weapon System
**Description:** Heroes continuously fire upward automatically. Weapon type determines projectile count, spread, damage, and fire rate.

**Player Input:** Movement only (firing is automatic)

**System Response:**
- Fire projectiles upward from hero positions
- Projectiles collide with zomboids and timers
- Weapon upgrades modify projectile behavior

**Implementation Notes:**
- Base weapon: single straight shot
- Upgrades: double, triple, pulse laser (wide beam), mega machine gun (rapid fire)
- Projectile properties: `speed`, `damage`, `sprite`, `particleEffect`
- JSON structure: `entities/weapons.json`
- Object pooling for projectile performance

**Dependencies:** Upgrade system, collision detection

---

#### 5. Hero Management
**Description:** Player controls 1-N heroes at the bottom. Heroes can be added or removed based on timer countdown outcomes. All heroes share the same equipped weapon.

**Player Input:** Move heroes collectively left/right

**System Response:**
- All heroes move together as a group
- Each hero fires the current weapon
- Hero count increases/decreases based on timer results
- Game over if hero count reaches 0

**Implementation Notes:**
- Hero properties: `speed`, `sprite`, `spacing`
- Visual: simple geometric shape or sprite
- Spacing: evenly distributed within column
- JSON structure: `entities/heroes.json`
- Default starting hero count: 1

**Dependencies:** Timer system, weapon system

---

#### 6. Upgrade System
**Description:** Weapon upgrades unlocked through gameplay progression or special timer events. Upgrades persist within session and can be configured per chapter.

**Player Input:** Earned through gameplay (timer events or wave completion)

**System Response:**
- Apply weapon upgrade to all heroes
- Visual feedback: weapon sprite/effect changes
- Projectile behavior updates

**Implementation Notes:**
- Upgrade tiers: `single → double → triple → pulse_laser → mega_machine_gun`
- Each upgrade defined in JSON with properties
- Upgrade properties: `fireRate`, `projectileCount`, `damage`, `spread`, `visualEffect`
- JSON structure: `entities/upgrades.json`

**Dependencies:** Weapon system, reward system

---

### Controls

| Action | Desktop | Mobile | Gamepad |
| ------ | ------- | ------ | ------- |
| Move Left | A or Left Arrow | Touch left third of screen | D-Pad Left |
| Move Right | D or Right Arrow | Touch right third of screen | D-Pad Right |
| Pause | ESC or P | Pause button (top-right) | Start button |
| Fire | Auto (continuous) | Auto (continuous) | Auto (continuous) |

---

## Progression & Balance

### Player Progression
**Progression Type:** Chapter-based linear progression with increasing difficulty

**Key Milestones:**
1. **Chapter 1 Complete** - Unlock weapon upgrade tier 2 (double gun)
2. **Chapter 2 Complete** - Unlock weapon upgrade tier 3 (triple gun)
3. **Chapter 3 Complete** - Unlock pulse laser
4. **Chapter 5 Complete** - Unlock mega machine gun

### Difficulty Curve
- **Tutorial/Chapter 1:** 3-5 waves, simple circular zomboids, slow speed, no timers
- **Early Game (Chapters 2-3):** Introduce timers, medium zomboids, mixed shapes
- **Mid Game (Chapters 4-6):** Large zomboids, faster speeds, more complex timer patterns
- **Late Game (Chapters 7+):** High density, all zomboid types, rapid timers, extreme challenge

### Economy & Resources
No traditional economy. Resources are:
- **Survival Time:** Core metric
- **Upgrade Unlocks:** Progression-based
- **Hero Count:** Dynamic based on timer outcomes

---

## Level Design Framework

### Wave Configuration Structure
Each chapter consists of multiple waves defined in JSON:

```json
{
  "chapterId": "chapter-01",
  "chapterName": "First Contact",
  "waves": [
    {
      "waveId": 1,
      "duration": 30,
      "spawnPattern": {
        "zomboids": [
          {
            "type": "basic_circle_small",
            "count": 10,
            "spawnRate": 0.5,
            "columns": ["left", "right"]
          }
        ],
        "timers": []
      }
    }
  ]
}
```

### Chapter Types
1. **Tutorial Chapters** - Simple mechanics, minimal threat, teaching gameplay
2. **Standard Chapters** - Balanced challenge, progressive difficulty
3. **Challenge Chapters** - High difficulty, requires mastery of timer mechanic
4. **Endless Mode** - Infinite waves with scaling difficulty

---

## Technical Specifications

### Performance Requirements
- **Frame Rate:** 60 FPS (minimum 30 FPS on low-end mobile)
- **Memory Usage:** <150MB
- **Load Times:** <3s initial, <1s between waves
- **Battery Usage:** Optimized for mobile devices (minimal particle effects)

### Platform Specific

**Desktop:**
- Resolution: 720x1280 (portrait) or 1080x1920
- Input: Keyboard (primary), Mouse (menu only)
- Browser: Chrome 90+, Firefox 85+, Safari 14+

**Mobile:**
- Resolution: 720x1280 - 1080x1920 (portrait only)
- Input: Touch (primary), tilt (disabled for this prototype)
- OS: iOS 13+, Android 8+

### Asset Requirements

**Visual Assets:**
- Art Style: Minimalist dark mode, geometric shapes, neon outlines
- Color Palette:
  - Background: `#121212` (dark gray)
  - Zomboids: Various (`#FF5252` red, `#FFC107` amber, `#4CAF50` green based on type)
  - Timers: Negative = `#FF1744` (red), Positive = `#00B0FF` (light blue)
  - Heroes: `#03DAC6` (teal/cyan)
  - Projectiles: `#FFFFFF` (white) or upgrade-specific colors
- Animation: Simple tweens for movement, scale pulse for feedback
- UI Resolution: Vector-based, scales to screen

**Audio Assets:**
- Music Style: Minimal techno/electronic, dark ambient
- Sound Effects:
  - Projectile fire: short electronic "pew"
  - Zomboid hit: muted impact
  - Zomboid death: small pop
  - Timer increment: digital beep
  - Upgrade acquired: ascending chime
  - Game over: descending tone
- Voice Acting: None

---

## Technical Architecture Requirements

### Engine Configuration

**Phaser 3 Setup:**
- TypeScript: Strict mode enabled
- Physics: Arcade Physics (simple AABB collision)
- Renderer: WebGL with Canvas fallback
- Scale Mode: FIT (maintain aspect ratio, portrait)

### Code Architecture

**Required Systems:**
- Scene Management (MenuScene, GameScene, GameOverScene)
- State Management (GameState: current wave, score, heroes, weapon)
- Asset Loading (JSON configs, sprites, audio)
- Save/Load System (localStorage for progress)
- Input Management (keyboard, touch abstraction)
- Audio System (sound effects, background music)
- Performance Monitoring (FPS counter, debug mode)
- Config Loader (JSON parsing for entities and chapters)

### Data Management

**JSON Configuration Files:**

1. **`config/entities/zomboids.json`**
```json
{
  "zomboidTypes": [
    {
      "id": "basic_circle_small",
      "shape": "circle",
      "size": "small",
      "radius": 15,
      "color": "#FF5252",
      "outlineColor": "#FF8A80",
      "health": 1,
      "speed": 50,
      "scoreValue": 10
    },
    {
      "id": "basic_circle_medium",
      "shape": "circle",
      "size": "medium",
      "radius": 25,
      "color": "#FF5252",
      "outlineColor": "#FF8A80",
      "health": 2,
      "speed": 50,
      "scoreValue": 20
    },
    {
      "id": "basic_circle_large",
      "shape": "circle",
      "size": "large",
      "radius": 35,
      "color": "#FF5252",
      "outlineColor": "#FF8A80",
      "health": 3,
      "speed": 50,
      "scoreValue": 30
    },
    {
      "id": "square_small",
      "shape": "square",
      "size": "small",
      "width": 30,
      "height": 30,
      "color": "#FFC107",
      "outlineColor": "#FFD54F",
      "health": 2,
      "speed": 60,
      "scoreValue": 25
    },
    {
      "id": "hex_medium",
      "shape": "hexagon",
      "size": "medium",
      "radius": 25,
      "color": "#4CAF50",
      "outlineColor": "#81C784",
      "health": 4,
      "speed": 40,
      "scoreValue": 50
    }
  ]
}
```

2. **`config/entities/weapons.json`**
```json
{
  "weaponTypes": [
    {
      "id": "single_gun",
      "name": "Single Gun",
      "tier": 1,
      "fireRate": 0.2,
      "projectileCount": 1,
      "damage": 1,
      "spread": 0,
      "projectileSpeed": 400,
      "projectileColor": "#FFFFFF",
      "projectileSize": 8
    },
    {
      "id": "double_gun",
      "name": "Double Gun",
      "tier": 2,
      "fireRate": 0.2,
      "projectileCount": 2,
      "damage": 1,
      "spread": 20,
      "projectileSpeed": 400,
      "projectileColor": "#FFFFFF",
      "projectileSize": 8
    },
    {
      "id": "triple_gun",
      "name": "Triple Gun",
      "tier": 3,
      "fireRate": 0.2,
      "projectileCount": 3,
      "damage": 1,
      "spread": 30,
      "projectileSpeed": 400,
      "projectileColor": "#FFFFFF",
      "projectileSize": 8
    },
    {
      "id": "pulse_laser",
      "name": "Pulse Laser",
      "tier": 4,
      "fireRate": 0.1,
      "projectileCount": 5,
      "damage": 2,
      "spread": 50,
      "projectileSpeed": 500,
      "projectileColor": "#00E5FF",
      "projectileSize": 12
    },
    {
      "id": "mega_machine_gun",
      "name": "Mega Machine Gun",
      "tier": 5,
      "fireRate": 0.05,
      "projectileCount": 1,
      "damage": 1,
      "spread": 5,
      "projectileSpeed": 600,
      "projectileColor": "#FFEA00",
      "projectileSize": 6
    }
  ]
}
```

3. **`config/entities/timers.json`**
```json
{
  "timerTypes": [
    {
      "id": "hero_add_timer",
      "startValue": -25,
      "increment": 1,
      "width": 100,
      "speed": 30,
      "negativeColor": "#FF1744",
      "positiveColor": "#00B0FF",
      "fontSize": 24
    },
    {
      "id": "weapon_upgrade_timer",
      "startValue": -50,
      "increment": 2,
      "width": 100,
      "speed": 25,
      "negativeColor": "#FF1744",
      "positiveColor": "#76FF03",
      "fontSize": 24
    }
  ]
}
```

4. **`config/entities/heroes.json`**
```json
{
  "heroConfig": {
    "defaultHeroCount": 1,
    "maxHeroCount": 5,
    "movementSpeed": 300,
    "sprite": {
      "shape": "triangle",
      "baseWidth": 30,
      "height": 30,
      "color": "#03DAC6",
      "outlineColor": "#18FFFF"
    },
    "spacing": 15
  }
}
```

5. **`config/chapters/chapter-01.json`**
```json
{
  "chapterId": "chapter-01",
  "chapterName": "First Contact",
  "description": "Learn the basics - shoot zomboids, survive the wave",
  "unlockRequirement": null,
  "waves": [
    {
      "waveId": 1,
      "waveName": "Tutorial Wave",
      "duration": 30,
      "spawnPattern": {
        "zomboids": [
          {
            "type": "basic_circle_small",
            "count": 15,
            "spawnRate": 0.5,
            "columns": ["left", "right"],
            "spawnDelay": 1
          }
        ],
        "timers": []
      }
    },
    {
      "waveId": 2,
      "waveName": "Introduction to Variety",
      "duration": 45,
      "spawnPattern": {
        "zomboids": [
          {
            "type": "basic_circle_small",
            "count": 10,
            "spawnRate": 0.4,
            "columns": ["left", "right"],
            "spawnDelay": 0
          },
          {
            "type": "basic_circle_medium",
            "count": 5,
            "spawnRate": 0.3,
            "columns": ["left", "right"],
            "spawnDelay": 5
          }
        ],
        "timers": [
          {
            "type": "hero_add_timer",
            "spawnTime": 20,
            "column": "left"
          }
        ]
      }
    }
  ]
}
```

6. **`config/chapters/chapter-02.json`**
```json
{
  "chapterId": "chapter-02",
  "chapterName": "Rising Threat",
  "description": "More zomboids, faster pace, strategic timer decisions",
  "unlockRequirement": "chapter-01",
  "waves": [
    {
      "waveId": 1,
      "waveName": "Speed Increase",
      "duration": 40,
      "spawnPattern": {
        "zomboids": [
          {
            "type": "basic_circle_small",
            "count": 20,
            "spawnRate": 0.3,
            "columns": ["left", "right"],
            "spawnDelay": 0
          },
          {
            "type": "square_small",
            "count": 8,
            "spawnRate": 0.4,
            "columns": ["left", "right"],
            "spawnDelay": 5
          }
        ],
        "timers": [
          {
            "type": "hero_add_timer",
            "spawnTime": 15,
            "column": "right"
          },
          {
            "type": "weapon_upgrade_timer",
            "spawnTime": 25,
            "column": "left"
          }
        ]
      }
    }
  ]
}
```

7. **`config/game-settings.json`**
```json
{
  "gameSettings": {
    "screenWidth": 720,
    "screenHeight": 1280,
    "columnCount": 2,
    "backgroundColor": "#121212",
    "fps": 60,
    "debugMode": false
  },
  "gameplay": {
    "playerStartColumn": 0,
    "safeZoneHeight": 150,
    "spawnZoneHeight": 100,
    "gameOverOnZomboidReachBottom": true
  },
  "audio": {
    "masterVolume": 0.7,
    "musicVolume": 0.5,
    "sfxVolume": 0.8
  }
}
```

---

## Development Phases

### Phase 1: Core Systems (Week 1)
**Epic: Foundation**
- Phaser 3 + TypeScript project setup
- Scene management (Menu, Game, GameOver)
- JSON config loader system
- Basic column-based layout rendering

**Epic: Core Mechanics**
- Hero movement system (keyboard/touch input)
- Auto-fire weapon system
- Zomboid spawning from JSON config
- Simple collision detection

### Phase 2: Gameplay Features (Week 2)
**Epic: Game Systems**
- Countdown timer mechanic implementation
- Hero add/remove system
- Weapon upgrade system
- Wave progression logic

**Epic: Content Creation**
- Create 3 chapters with 2-3 waves each
- Implement all zomboid types (circle, square, hex)
- Visual polish: dark mode theme, outline effects
- UI: score, wave counter, hero count display

### Phase 3: Polish & Optimization (Week 3)
**Epic: Performance**
- Object pooling for zomboids and projectiles
- Mobile performance optimization
- Memory profiling and cleanup
- 60 FPS target validation

**Epic: User Experience**
- Audio implementation (SFX and music)
- Visual feedback: hit effects, timer transitions
- Menu system: chapter selection, settings
- Game over screen with restart option

---

## Success Metrics

### Technical Metrics
- Frame rate: 60 FPS on target devices
- Load time: <3s initial load
- Crash rate: <0.1%
- Memory usage: <150MB

### Gameplay Metrics
- Tutorial completion: >90%
- Average session: 5-10 minutes
- Chapter 1 completion: >70%
- Player retention: D1 60%, D7 30%

---

## Visual Design Specification

### Dark Mode Theme
- **Background:** `#121212` (Chrome dark mode gray)
- **Grid lines (optional debug):** `#1E1E1E`
- **UI text:** `#E0E0E0` (light gray)

### Entity Colors
- **Heroes:** `#03DAC6` (teal) with `#18FFFF` outline
- **Projectiles:** `#FFFFFF` (white) base, upgrade-specific variations
- **Zomboids:**
  - Circle: `#FF5252` (red) with `#FF8A80` outline
  - Square: `#FFC107` (amber) with `#FFD54F` outline
  - Hexagon: `#4CAF50` (green) with `#81C784` outline
- **Timers:**
  - Negative: `#FF1744` (red) with counter in white
  - Positive: `#00B0FF` (light blue) with counter in white

### Outline Effect
All shapes rendered with:
1. Filled center (base color)
2. 2-3px outline (outline color, slightly lighter/brighter)
3. Optional glow effect for emphasis (heroes, active timers)

---

## Next Steps

### Immediate Actions
1. **Set up project structure** - Initialize Phaser 3 + TypeScript project
2. **Create JSON config files** - Define all entities and first 2 chapters
3. **Implement core scene** - Menu → Game → GameOver flow
4. **Build hero movement** - Column-based positioning and input handling

### Prototype Development Timeline
- **Day 1-2:** Project setup, JSON loader, basic rendering
- **Day 3-4:** Hero movement, auto-fire, zomboid spawning
- **Day 5-6:** Timer mechanic, collision system, hero add/remove
- **Day 7-8:** Weapon upgrades, wave progression
- **Day 9-10:** Visual polish, audio, UI
- **Day 11-12:** Testing, optimization, bug fixes

### Success Criteria for Prototype
- Playable Chapter 1 (2-3 waves)
- All core mechanics functional (movement, shooting, timers, upgrades)
- JSON configuration loading correctly
- Dark mode visual theme implemented
- 60 FPS on test devices
- Core gameplay loop is engaging and clear

---

## Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |
| 2025-10-21 | 1.0 | Initial prototype design document | BMad Orchestrator |
