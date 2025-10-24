# Game Configuration Guide

This directory contains JSON configuration files that control all aspects of the Zomboid Assault game. You can modify these files to customize gameplay without touching any code.

## Directory Structure

```
config/
├── chapters/           # Chapter and wave definitions
│   ├── chapter-01.json
│   ├── chapter-02.json
│   └── chapter-03.json
├── game-settings.json  # Core game settings
├── hero-config.json    # Hero behavior and appearance
├── timer-types.json    # Timer definitions (barriers)
├── weapon-types.json   # Weapon progression
└── zomboid-types.json  # Enemy types and stats
```

---

## Chapter Configuration

**Location:** `chapters/chapter-XX.json`

Defines the story progression, waves, enemy spawns, and timer spawns for each chapter.

### Chapter Structure

```json
{
  "chapterId": "chapter-01",
  "chapterName": "First Contact",
  "description": "Learn the basics - shoot zomboids, survive the wave",
  "unlockRequirement": null,  // null for first chapter, or "chapter-01" to unlock after completing previous
  "waves": [ /* array of wave objects */ ]
}
```

### Wave Configuration

Each wave contains:

```json
{
  "waveId": 1,
  "waveName": "Tutorial Wave",
  "duration": 20,  // seconds
  "spawnPattern": {
    "zomboids": [ /* zomboid spawn patterns */ ],
    "timers": [ /* timer spawn patterns */ ]
  }
}
```

### Zomboid Spawn Pattern

Controls when and how zomboids appear:

```json
{
  "type": "basic_circle_small",      // ID from zomboid-types.json
  "count": 25,                       // Total zomboids to spawn
  "spawnRate": 1.2,                  // Spawns per second
  "columns": ["left", "right"],      // Which columns to spawn in (random choice)
  "spawnDelay": 0.5                  // Seconds before first spawn
}
```

**Tips:**
- Higher `spawnRate` = more pressure on player
- Use `spawnDelay` to stagger different enemy types
- Mix `columns` for unpredictable spawns, or specify one for focused attacks

### Timer Spawn Pattern

Timers are barriers that move down the screen. Players shoot them to change their counter value.

```json
{
  "type": "hero_add_timer",          // ID from timer-types.json
  "spawnTime": 10,                   // Seconds after wave starts
  "column": "left",                  // "left" or "right"
  "startValue": -20,                 // Starting counter value
  "resetHeroCount": true,            // (Optional) Reset hero count to 1 when timer exits
  "weaponTier": 2                    // (Optional) Specific weapon tier to upgrade to (0-5)
}
```

#### Timer Types

- **`hero_add_timer`**: Changes hero count
  - Positive value: Adds heroes
  - Negative value: Removes heroes
  - Zero: Neutralized (no effect)

- **`weapon_upgrade_timer`**: Upgrades weapon
  - Positive/Zero value: Upgrades weapon
  - Negative value: No upgrade

- **`rapid_hero_timer`**: Fast-moving hero modifier (same logic as hero_add_timer but faster)

#### Advanced Timer Options

**`resetHeroCount` (Optional):**
- When `true`, resets player's hero count to 1 when timer exits bottom of screen
- Use for weapon upgrades to prevent overpowered combinations
- Example: Getting a machine gun but losing your 5-hero squad

**`weaponTier` (Optional):**
- Specifies exact weapon tier to upgrade to (0-5 maps to tiers 1-6)
- If omitted, upgrades to next tier (+1)
- Weapon tiers:
  - `0` = Basic Gun (Tier 1)
  - `1` = Double Gun (Tier 2)
  - `2` = Triple Gun (Tier 3)
  - `3` = Pulse Laser (Tier 4)
  - `4` = Plasma Cannon (Tier 5)
  - `5` = Ultimate Weapon (Tier 6)

#### Timer Examples

```json
// Easy hero boost - add 2 heroes
{
  "type": "hero_add_timer",
  "spawnTime": 5,
  "column": "left",
  "startValue": -20  // Shoot 20 times to neutralize, 21+ to add heroes
}

// Weapon upgrade with hero reset (strategic choice)
{
  "type": "weapon_upgrade_timer",
  "spawnTime": 15,
  "column": "right",
  "startValue": -50,
  "resetHeroCount": true,    // Player loses hero squad
  "weaponTier": 4            // But gets Plasma Cannon (tier 5)
}

// Standard weapon upgrade (no penalty)
{
  "type": "weapon_upgrade_timer",
  "spawnTime": 20,
  "column": "left",
  "startValue": -30  // No resetHeroCount, keeps heroes
}
```

---

## Weapon Types Configuration

**Location:** `weapon-types.json`

Defines the weapon progression system.

```json
{
  "id": "basic_gun",
  "name": "Basic Gun",
  "tier": 1,                    // 1-6, higher is better
  "fireRate": 0.3,              // Seconds between shots (lower = faster)
  "projectileCount": 1,         // Number of projectiles per shot
  "damage": 10,                 // Damage per projectile
  "spread": 0,                  // Not currently used
  "projectileSpeed": 400,       // Pixels per second
  "projectileColor": "#00FFFF", // Hex color
  "projectileSize": 8           // Radius in pixels
}
```

**Balancing Tips:**
- `fireRate`: 0.1 = very fast, 0.5 = slow
- `projectileCount`: 3+ creates "shotgun" effect
- `damage`: Scale with tier (10, 15, 20, 30, 50, 100)

---

## Zomboid Types Configuration

**Location:** `zomboid-types.json`

Defines enemy types, appearance, and stats.

```json
{
  "id": "basic_circle_small",
  "shape": "circle",           // "circle", "square", or "hexagon"
  "size": "small",             // "small", "medium", "large", "boss"
  "radius": 20,                // For circles (pixels)
  "width": 40,                 // For squares (pixels)
  "height": 40,
  "color": "#FF1744",          // Fill color (hex)
  "outlineColor": "#FFFFFF",   // Border color (hex)
  "health": 10,                // Hit points
  "speed": 80,                 // Pixels per second
  "scoreValue": 10             // Points when destroyed
}
```

**Design Patterns:**
- Small enemies: 10-30 HP, 80-100 speed, 10-20 score
- Medium enemies: 30-60 HP, 60-80 speed, 30-50 score
- Large enemies: 60-120 HP, 40-60 speed, 50-100 score
- Boss enemies: 200+ HP, 20-40 speed, 200+ score

---

## Timer Types Configuration

**Location:** `timer-types.json`

Defines timer behavior and appearance.

```json
{
  "id": "hero_add_timer",
  "name": "Hero Timer",
  "startValue": -20,              // Default starting value (can be overridden in chapters)
  "increment": 1,                 // How much each projectile hit increases counter
  "width": 200,                   // Pixels
  "height": 60,                   // Pixels
  "speed": 50,                    // Pixels per second downward
  "negativeColor": "#FF1744",     // Color when counter < 0
  "positiveColor": "#00E676",     // Color when counter > 0
  "neutralColor": "#757575",      // Color when counter = 0
  "fontSize": 24,
  "fontColor": "#FFFFFF",
  "maxValue": 0,                  // (Optional) Instant completion when reached
  "instantReward": "hero",        // (Optional) Reward type: "hero" or "weapon_upgrade"
  "instantRewardCount": 1,        // (Optional) Amount of reward
  "rewardDisplayText": "+1 Hero"  // (Optional) Text shown on timer
}
```

**Instant Completion:**
- When `maxValue` is set, timer completes instantly when counter reaches that value
- Example: `maxValue: 0` means timer completes as soon as counter reaches 0 or above
- Use `instantReward` to specify what happens on instant completion

---

## Hero Configuration

**Location:** `hero-config.json`

Controls player hero squad behavior.

```json
{
  "heroConfig": {
    "defaultHeroCount": 1,       // Starting heroes
    "minHeroCount": 1,           // Can't go below this
    "maxHeroCount": 5,           // Can't exceed this
    "movementSpeed": 300,        // Pixels per second
    "sprite": {
      "shape": "triangle",
      "baseWidth": 30,
      "height": 40,
      "color": "#03DAC6",
      "outlineColor": "#FFFFFF",
      "outlineWidth": 2
    },
    "spacing": 50,               // Vertical spacing between heroes
    "positionFromBottom": 100    // Distance from bottom of screen
  }
}
```

---

## Game Settings

**Location:** `game-settings.json`

Core game configuration.

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
    "playerStartColumn": 0,       // 0 = left, 1 = right
    "safeZoneHeight": 150,        // Game over if zomboid enters this zone
    "spawnZoneHeight": 100,
    "gameOverOnZomboidReachBottom": true
  },
  "audio": {
    "masterVolume": 1.0,
    "musicVolume": 0.5,
    "sfxVolume": 0.7
  }
}
```

---

## Tips for Balancing Chapters

### Wave Difficulty Progression

1. **Early Waves (1-2):**
   - Few enemy types
   - Low spawn rates (0.5-1.0)
   - Simple timers with easy values (-10 to -20)
   - Short duration (20-25 seconds)

2. **Mid Waves (3-4):**
   - Mix 2-3 enemy types
   - Medium spawn rates (1.0-1.5)
   - Multiple timers with strategic choices
   - Medium duration (30-40 seconds)

3. **Late Waves (5-6):**
   - All enemy types including bosses
   - High spawn rates (1.5-2.5)
   - Hard timer choices (negative values -30 to -60)
   - Long duration (40-50 seconds)

### Strategic Timer Design

**Easy Timer (Generous):**
```json
{
  "type": "hero_add_timer",
  "startValue": -10,  // Easy to neutralize/convert
  "spawnTime": 5
}
```

**Hard Timer (Risky):**
```json
{
  "type": "hero_add_timer",
  "startValue": -50,  // Requires focus to neutralize
  "spawnTime": 3      // Appears early, less time to shoot
}
```

**Strategic Choice (Risk/Reward):**
```json
{
  "type": "weapon_upgrade_timer",
  "startValue": -40,
  "resetHeroCount": true,  // Get powerful weapon but lose hero squad
  "weaponTier": 4,         // Jump to tier 5 weapon
  "spawnTime": 20
}
```

### Testing Your Changes

1. Save your JSON file
2. Refresh the game in browser (Ctrl+R or F5)
3. Configuration is loaded at game start
4. Check browser console (F12) for any JSON errors

---

## Common Issues

**Timer not appearing:**
- Check `spawnTime` is less than wave `duration`
- Verify timer type ID exists in `timer-types.json`

**Zomboid not spawning:**
- Verify zomboid type ID exists in `zomboid-types.json`
- Check that `count` and `spawnRate` are reasonable

**Weapon upgrade not working:**
- Ensure `weaponTier` value is 0-5
- Timer must reach positive value (>= 0) to trigger upgrade

**Hero count not resetting:**
- Verify `resetHeroCount: true` is in the timer config (not the timer type)
- Timer must complete successfully (reach bottom with value >= 0)

---

## JSON Syntax Tips

- Always use double quotes for strings: `"hero_add_timer"`
- Numbers don't need quotes: `10`, `1.5`, `-20`
- Booleans: `true` or `false` (lowercase, no quotes)
- Arrays use square brackets: `["left", "right"]`
- Objects use curly braces: `{ "key": "value" }`
- Last item in array/object should NOT have trailing comma

**Valid:**
```json
{
  "name": "Test",
  "value": 10
}
```

**Invalid (has trailing comma):**
```json
{
  "name": "Test",
  "value": 10,
}
```

---

## Need Help?

Check the browser console (F12) for detailed error messages when the game loads. The console will show:
- Configuration loading status
- Wave start/end events
- Timer spawn/completion events
- Weapon upgrade events
- Hero count changes

Look for messages prefixed with the file name (e.g., `WaveManager.ts:`, `GameScene.ts:`) for debugging information.
