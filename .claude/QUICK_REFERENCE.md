# Zomboid Assault - Quick Reference

**Quick lookup for common tasks and file locations.**

---

## 🔥 Common Tasks

### Adjust Chapter Difficulty
```bash
# 1. Edit chapter file
code public/config/chapters/chapter-03.json

# 2. Run balance analyzer
python analyze_balance.py

# 3. Look for these issues:
#    - Overkill ratio < 1.0 (not enough damage)
#    - [SPAWN PRESSURE] warnings (spawning too fast)
#    - Grade D, E, or F (too hard)

# 4. If too hard, reduce:
#    - Enemy counts
#    - Spawn rates
#    - Timer difficulty (startValue closer to 0)
```

### Fix Weapon Balance
```bash
# Edit weapon stats
code public/config/entities/weapons.json

# Key properties:
{
  "fireRate": 0.5,        # Lower = faster (seconds between shots)
  "projectileCount": 2,   # How many bullets per shot
  "damage": 1,            # Damage per projectile
  "spread": 20            # Angle spread (degrees)
}

# Calculate DPS:
# DPS = (1 / fireRate) * damage * projectileCount
# Example: (1 / 0.15) * 2 * 1 = 13.3 DPS
```

### Add New Enemy Type
```bash
# 1. Edit zomboids.json
code public/config/entities/zomboids.json

# 2. Add new entry
{
  "id": "new_zomboid_name",
  "shape": "circle",      # circle, square, hexagon
  "size": "medium",       # small, medium, large, boss
  "health": 5,
  "speed": 65,
  "scoreValue": 50
}

# 3. Use in chapter wave
{
  "type": "new_zomboid_name",
  "count": 20,
  "spawnRate": 1.5,
  "columns": ["left", "right"]
}
```

### Create New Chapter
```bash
# 1. Copy existing chapter
cp public/config/chapters/chapter-03.json public/config/chapters/chapter-09.json

# 2. Edit properties
code public/config/chapters/chapter-09.json
# Change: chapterId, chapterName, description, unlockRequirement

# 3. Register in ConfigLoader.ts
code src/systems/ConfigLoader.ts
# Add 'chapter-09' to getAllChapters() array

# 4. Register in MenuScene.ts
code src/scenes/MenuScene.ts
# Add 'chapter-09' to getAvailableChapters() array

# 5. Test balance
python analyze_balance.py
```

---

## 📂 Quick File Locations

### Need to...

**Adjust wave difficulty?**
→ `public/config/chapters/chapter-XX.json`

**Change weapon damage/fire rate?**
→ `public/config/entities/weapons.json`

**Add/modify enemy types?**
→ `public/config/entities/zomboids.json`

**Fix game logic bugs?**
→ `src/scenes/GameScene.ts` (main gameplay)

**Change chapter loading?**
→ `src/systems/ConfigLoader.ts`
→ `src/scenes/MenuScene.ts`

**Adjust player movement?**
→ `src/systems/HeroManager.ts`

**Fix weapon firing?**
→ `src/systems/WeaponSystem.ts`

**Fix enemy spawning?**
→ `src/systems/WaveManager.ts`

**Fix collision detection?**
→ `src/systems/CollisionManager.ts`

**Fix audio issues?**
→ `src/systems/AudioManager.ts`

**Test balance?**
→ `python analyze_balance.py`

---

## 🎮 Wave Definition Quick Reference

```json
{
  "waveId": 1,
  "waveName": "Wave Name",
  "duration": 30,           // Seconds
  "spawnPattern": {
    "zomboids": [
      {
        "type": "basic_circle_small",
        "count": 20,          // Total to spawn
        "spawnRate": 1.5,     // Per second
        "columns": ["left", "right"],  // Or ["left"] or ["right"]
        "spawnDelay": 5       // Wait N seconds before spawning
      }
    ],
    "timers": [
      {
        "type": "weapon_upgrade_timer",
        "spawnTime": 10,      // Spawn at N seconds into wave
        "column": "right",
        "startValue": -50,    // More negative = harder to catch
        "resetHeroCount": true,
        "weaponTier": 3       // Upgrade to this tier
      },
      {
        "type": "hero_add_timer",
        "spawnTime": 20,
        "column": "left",
        "startValue": -30
      },
      {
        "type": "rapid_hero_timer",  // Faster incrementing
        "spawnTime": 15,
        "column": "right",
        "startValue": -25
      }
    ]
  }
}
```

---

## 🐛 Quick Bug Fixes

### Sound Looping
```typescript
// WRONG
this.audioManager?.playSFX('game_over');

// CORRECT
this.audioManager?.playSFX('game_over', { loop: false });
```

### Overlay Not Clearing
```typescript
// WRONG - Creates new without destroying old
this.overlay = new WaveCompleteOverlay(...);

// CORRECT - Destroy old first
if (this.overlay) {
  this.overlay.destroy();
  this.overlay = null;
}
this.overlay = new WaveCompleteOverlay(...);
```

### Memory Leak - Objects Not Destroyed
```typescript
// WRONG - Reference still exists
if (this.manager) {
  this.manager.destroy();
}

// CORRECT - Clear reference
if (this.manager) {
  this.manager.destroy();
  this.manager = null;
}
```

### Event Listener Leak
```typescript
// Always remove listeners in shutdown()
shutdown(): void {
  this.events.off('collision', this.handleCollision, this);
  this.events.off('wave_complete', this.handleWaveComplete, this);
}
```

---

## 🎯 Balance Analyzer Cheat Sheet

### Run Analyzer
```bash
python analyze_balance.py
```

### Understanding Output
```
[GRADE]: A+ (Very Easy)    # Perfect, easy but fun
[GRADE]: A (Easy)          # Good for early chapters
[GRADE]: B (Balanced)      # Ideal difficulty
[GRADE]: C (Challenging)   # Hard but fair
[GRADE]: D (Hard)          # Too difficult, needs adjustment
[GRADE]: E (Very Hard)     # Way too hard, must fix
[GRADE]: F (Nearly Impossible)  # Unplayable, fix immediately

[SPAWN PRESSURE] Phase 1: T1 weapon: 4.4 HP/sec spawning vs 2.0 DPS (SHORT 2.4 HP/sec!)
# ^ Enemies spawn faster than you can kill them = problem

Overkill Ratio: 0.69x
# ^ Less than 1.0 = not enough damage capacity
```

### Quick Balance Fixes

**Problem: Overkill < 1.0**
→ Reduce enemy counts by 20-30%
→ Reduce spawn rates by 0.2-0.3
→ Make timers easier (startValue closer to 0)

**Problem: Spawn Pressure**
→ Reduce spawn rates (most important!)
→ Delay spawns (increase spawnDelay)
→ Reduce early-wave enemy counts

**Problem: Timer too hard to catch**
→ Reduce startValue magnitude (e.g., -50 → -30)
→ Spawn timer earlier in wave
→ Place timer on less busy side

---

## 🔧 Development Workflow

### Daily Development
```bash
# 1. Start dev server
npm run dev

# 2. Make changes to src/ or public/config/

# 3. Browser auto-reloads

# 4. Test in browser

# 5. Commit changes
git add .
git commit -m "Description of changes"
git push
```

### Testing Changes
```bash
# Test balance after config changes
python analyze_balance.py

# Build production version
npm run build

# Test production build locally
npm run preview
```

### Deployment
```bash
# Work in development branch
git checkout development

# Make changes, commit, push
git add .
git commit -m "Changes"
git push

# When ready to deploy:
# 1. Create PR from development → master on GitHub
# 2. Review changes
# 3. Merge PR
# 4. GitHub Actions auto-deploys to GitHub Pages
```

---

## 📊 Weapon Tier Reference

| Tier | Weapon | Fire Rate | Count | Damage | DPS | Notes |
|------|--------|-----------|-------|--------|-----|-------|
| 1 | Single Gun | 0.5s | 1 | 1 | 2.0 | Starting weapon |
| 2 | Double Gun | 0.2s | 2 | 1 | 10.0 | 5x improvement |
| 3 | Triple Gun | 0.2s | 3 | 1 | 15.0 | Wide spread |
| 4 | Pulse Laser | 0.1s | 5 | 1 | 50.0 | Huge DPS spike |
| 5 | Mega Machine Gun | 0.05s | 1 | 1 | 20.0 | Very fast single shots |
| 6 | Sniper Rifle | 0.15s | 1 | 2 | 13.3 | Penetration (15 dmg through) |
| 7 | Ultimate Gun | 2.5s | 1 | 50 | 20.0 | Huge projectile, testing only |

---

## 🧟 Enemy Type Reference

### Basic Enemies
- `basic_circle_small`: 1 HP, speed 80
- `basic_circle_medium`: 2 HP, speed 75
- `basic_circle_large`: 3 HP, speed 70
- `square_small`: 2 HP, speed 90 ⚡ (fastest basic)
- `square_medium`: 3 HP, speed 85
- `hex_small`: 3 HP, speed 70
- `hex_medium`: 4 HP, speed 65
- `hex_large`: 6 HP, speed 55

### Boss Enemies
- `boss_circle_tank`: 150 HP, speed 35
- `boss_square_fortress`: 200 HP, speed 30
- `boss_hex_juggernaut`: 400 HP, speed 25 💀 (hardest)

---

## 💡 Quick Tips

### Making Waves Easier
1. Reduce spawn rates first (biggest impact)
2. Lower enemy counts second
3. Increase wave duration third
4. Make timers easier to catch (startValue closer to 0)

### Making Waves Harder
1. Increase spawn rates
2. Add more enemy types
3. Place timers on opposite side from most enemies
4. Use faster enemy types (square_small, square_medium)

### Good Wave Design
- Start easy, ramp up difficulty
- Introduce new enemy type gradually (low count first)
- Place timers strategically (not always same side as enemies)
- Use spawnDelay to control pacing
- Boss waves need weapon tier 6+ (sniper penetration helps)

---

## 🚨 Emergency Fixes

### Game won't build
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Chapters not showing
1. Check `src/systems/ConfigLoader.ts` - chapter in array?
2. Check `src/scenes/MenuScene.ts` - chapter in array?
3. Check chapter JSON has correct `unlockRequirement`

### Balance way off
```bash
# Re-run analyzer
python analyze_balance.py

# Check for:
# - Overkill < 0.5 (cut enemies in half)
# - Spawn pressure > 5 HP/sec (reduce spawn rates by 50%)
```

---

*For full details, see RECENT_WORK.md and ARCHITECTURE.md*
