# Story 8.3.2: Rebalance Chapters 4-6 for Progressive Play

**Epic**: 8.3 - Chapter Rebalancing
**Priority**: High
**Estimate**: 4 hours

## Description
Rebalance chapters 4-6 to serve as the "Medium" difficulty tier of the progressive campaign. These chapters introduce larger enemies and first boss encounters.

## Acceptance Criteria
- [ ] Chapter 4: 1 upgrade (T3→T4), 4 waves
- [ ] Chapter 5: 1 upgrade (T4→T5), 4 waves
- [ ] Chapter 6: 0 upgrades (stay T5), 5 waves
- [ ] All waves have bullet ratio ≥ 1.3
- [ ] Gradual introduction of bosses
- [ ] Difficulty feels challenging but fair

## Current State Analysis

### Chapter 4 - Heavy Defense
**Current**: Just rebalanced, 4 waves
**Status**: Good structure, needs adjustment for T3 start
**Action**: Adjust for T3 start, 1 upgrade to T4

### Chapter 5 - Mixed Assault
**Current**: 4 waves, recently rebalanced
**Status**: Needs adjustment for T4 start
**Action**: Start at T4, upgrade to T5

### Chapter 6 - First Boss
**Current**: 4 waves, recently rebalanced
**Status**: Needs adjustment for T5 start, extend to 5 waves
**Action**: Start at T5, no upgrade, 5 waves with gradual boss introduction

## Rebalancing Plan

### Chapter 4: Heavy Defense
**Starting Tier**: T3
**Ending Tier**: T4
**Wave Count**: 4

```
Wave 1 - "Size Matters"
- Duration: 30s
- Starting weapon: T3
- Zomboids:
  - 22x basic_circle_small (22 HP)
  - 18x basic_circle_medium (36 HP)
  - 12x basic_circle_large (36 HP)
  - Total: 94 HP
- Timers: hero_add_timer at 12s
- Expected bullets (T3): ~450 available, 94 needed (4.8x ratio)

Wave 2 - "Large Threat"
- Duration: 32s
- Starting weapon: T3
- Zomboids:
  - 20x basic_circle_large (60 HP)
  - 16x square_medium (48 HP)
  - 12x hex_medium (48 HP)
  - Total: 156 HP
- Timers: rapid_hero_timer at 8s, hero_add_timer at 20s
- Expected bullets (T3): ~480 available, 156 needed (3.1x ratio)

Wave 3 - "Upgrade Time"
- Duration: 35s
- Starting weapon: T3, upgrade to T4
- Zomboids:
  - 18x basic_circle_large (54 HP)
  - 16x square_medium (48 HP)
  - 14x hex_medium (56 HP)
  - 10x hex_large (60 HP)
  - Total: 218 HP
- Timers: weapon_upgrade_timer at 10s (T3→T4, startValue: -45)
- Expected bullets: ~150 T3 + ~1000 T4 = 1150 available, 218 needed (5.3x ratio)

Wave 4 - "Tank Test"
- Duration: 38s
- Starting weapon: T4
- Zomboids:
  - 20x basic_circle_large (60 HP)
  - 18x square_medium (54 HP)
  - 16x hex_medium (64 HP)
  - 14x hex_large (84 HP)
  - Total: 262 HP
- Timers: rapid_hero_timer at 8s, hero_add_timer at 22s
- Expected bullets (T4): ~1900 available, 262 needed (7.3x ratio)
```

### Chapter 5: Mixed Assault
**Starting Tier**: T4
**Ending Tier**: T5
**Wave Count**: 4

```
Wave 1 - "Variety Pack"
- Duration: 32s
- Starting weapon: T4
- Zomboids:
  - 24x basic_circle_small (24 HP)
  - 20x square_small (40 HP)
  - 16x basic_circle_medium (32 HP)
  - 12x hex_medium (48 HP)
  - Total: 144 HP
- Timers: hero_add_timer at 12s
- Expected bullets (T4): ~1600 available, 144 needed (11.1x ratio)

Wave 2 - "All Types"
- Duration: 35s
- Starting weapon: T4
- Zomboids:
  - 18x basic_circle_large (54 HP)
  - 16x square_medium (48 HP)
  - 14x hex_medium (56 HP)
  - 12x hex_large (72 HP)
  - Total: 230 HP
- Timers: rapid_hero_timer at 10s, hero_add_timer at 24s
- Expected bullets (T4): ~1750 available, 230 needed (7.6x ratio)

Wave 3 - "Power Surge"
- Duration: 38s
- Starting weapon: T4, upgrade to T5
- Zomboids:
  - 25x square_small (50 HP)
  - 20x basic_circle_large (60 HP)
  - 18x hex_medium (72 HP)
  - 14x hex_large (84 HP)
  - Total: 266 HP
- Timers: weapon_upgrade_timer at 12s (T4→T5, startValue: -50)
- Expected bullets: ~600 T4 + ~520 T5 = 1120 available, 266 needed (4.2x ratio)

Wave 4 - "Maximum Mix"
- Duration: 40s
- Starting weapon: T5
- Zomboids:
  - 28x basic_circle_small (28 HP)
  - 24x square_small (48 HP)
  - 20x hex_medium (80 HP)
  - 18x basic_circle_large (54 HP)
  - 14x hex_large (84 HP)
  - Total: 294 HP
- Timers: rapid_hero_timer at 10s, hero_add_timer at 24s
- Expected bullets (T5): ~800 available, 294 needed (2.7x ratio)
```

### Chapter 6: First Boss
**Starting Tier**: T5
**Ending Tier**: T5 (no upgrade!)
**Wave Count**: 5

```
Wave 1 - "Warm Up"
- Duration: 30s
- Starting weapon: T5
- Zomboids:
  - 25x basic_circle_small (25 HP)
  - 20x basic_circle_medium (40 HP)
  - 16x basic_circle_large (48 HP)
  - 12x square_medium (36 HP)
  - Total: 149 HP
- Timers: hero_add_timer at 12s
- Expected bullets (T5): ~600 available, 149 needed (4.0x ratio)

Wave 2 - "Large Forces"
- Duration: 35s
- Starting weapon: T5
- Zomboids:
  - 22x basic_circle_large (66 HP)
  - 18x square_medium (54 HP)
  - 16x hex_medium (64 HP)
  - 12x hex_large (72 HP)
  - Total: 256 HP
- Timers: rapid_hero_timer at 10s, hero_add_timer at 24s
- Expected bullets (T5): ~700 available, 256 needed (2.7x ratio)

Wave 3 - "Boss Introduction"
- Duration: 38s
- Starting weapon: T5
- Zomboids:
  - 1x boss_circle_tank (150 HP) [spawns at 15s]
  - 28x basic_circle_medium (56 HP)
  - 18x square_small (36 HP)
  - 14x hex_medium (56 HP)
  - Total: 298 HP
- Timers: rapid_hero_timer at 8s, hero_add_timer at 26s
- Expected bullets (T5): ~760 available, 298 needed (2.6x ratio)

Wave 4 - "Double Boss"
- Duration: 42s
- Starting weapon: T5
- Zomboids:
  - 2x boss_circle_tank (300 HP) [spawns at 12s, 20s]
  - 30x square_small (60 HP)
  - 20x hex_medium (80 HP)
  - 16x basic_circle_large (48 HP)
  - Total: 488 HP
- Timers: rapid_hero_timer at 8s, hero_add_timer at 22s, rapid_hero_timer at 34s
- Expected bullets (T5): ~840 available, 488 needed (1.7x ratio)

Wave 5 - "Boss Rush"
- Duration: 45s
- Starting weapon: T5
- Zomboids:
  - 3x boss_circle_tank (450 HP) [spawns at 10s, 18s, 26s]
  - 32x basic_circle_small (32 HP)
  - 24x square_medium (72 HP)
  - 18x hex_large (108 HP)
  - Total: 662 HP
- Timers: rapid_hero_timer at 6s, hero_add_timer at 18s, rapid_hero_timer at 32s
- Expected bullets (T5): ~900 available, 662 needed (1.4x ratio)
```

## Bullet Count Calculations

### Weapon Stats Reference
```
T3 (Triple Gun): 5 shots/sec × 3 projectiles = 15 bullets/sec
T4 (Pulse Laser): 10 shots/sec × 5 projectiles = 50 bullets/sec
T5 (Mega Machine Gun): 20 shots/sec × 1 projectile = 20 bullets/sec
```

### Timer Catch Times
```
hero_add_timer (startValue: -45 to -50): ~5.6-6.3s
weapon_upgrade_timer (startValue: -45 to -50): ~5.6-6.3s
rapid_hero_timer: ~3.5-4.5s catch time average
```

### Boss Stats
```
boss_circle_tank: 150 HP, speed 35
- With T5 (1 damage): needs 150 bullets
- With T4 (1 damage): needs 150 bullets
```

## Implementation Tasks
- [ ] Update chapter-04.json for T3 start
- [ ] Update chapter-05.json for T4 start, T5 upgrade
- [ ] Rewrite chapter-06.json with 5 waves, T5 throughout
- [ ] Run bullet-count analysis on all three chapters
- [ ] Verify all bullet ratios ≥ 1.3
- [ ] Playtest chapters 4-6 in sequence from Chapter 3
- [ ] Adjust based on feedback

## Testing Strategy
- Start from end of Chapter 3 (with T3 weapon)
- Play through all three chapters in order
- Verify boss encounters feel epic but fair
- Check that upgrade timings feel natural
- Ensure Chapter 6 with no upgrade still feels satisfying

## Dependencies
- Story 8.2.1 (bullet-count tool)
- Story 8.3.1 (Chapters 1-3 complete)
- analyze_balance.py with bullet counting

## Notes
- Chapter 6 has NO upgrade - intentional difficulty spike
- Players need to master T5 weapon before getting T6
- Boss introduction should feel gradual: 1 → 2 → 3
- Consider adding boss health bars in future
- T5 Mega Machine Gun is actually lower DPS than T4, but more focused
