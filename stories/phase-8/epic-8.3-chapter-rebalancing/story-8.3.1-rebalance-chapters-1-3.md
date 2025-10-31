# Story 8.3.1: Rebalance Chapters 1-3 for Progressive Play

**Epic**: 8.3 - Chapter Rebalancing
**Priority**: High
**Estimate**: 4 hours

## Description
Rebalance the first three chapters to serve as the "Easy" tier of the progressive campaign. Reduce weapon upgrades and ensure smooth difficulty progression.

## Acceptance Criteria
- [ ] Chapter 1: 1 upgrade (T1→T2), 3 waves
- [ ] Chapter 2: 1 upgrade (T2→T3), 4 waves
- [ ] Chapter 3: 0 upgrades (stay T3), 4 waves
- [ ] All waves have bullet ratio ≥ 1.5
- [ ] No spawn pressure issues
- [ ] Difficulty increases gradually

## Current State Analysis

### Chapter 1 - First Contact
**Current**: 3 waves, 1 upgrade (T1→T2) ✓
**Status**: Already well-balanced
**Issues**: None
**Action**: Minor tweaks only

### Chapter 2 - One-Side Pressure
**Current**: 5 waves, multiple upgrades
**Status**: Wave 1 too hard (0.72x ratio)
**Issues**: Too many waves, too many upgrades
**Action**: Reduce to 4 waves, 1 upgrade (T2→T3)

### Chapter 3 - Speed Demons
**Current**: 4 waves, 1-2 upgrades
**Status**: Wave 4 borderline (0.86x ratio)
**Issues**: Assumes T1 start, needs rebalance for T3 start
**Action**: Remove upgrades, rebalance for T3 weapon

## Rebalancing Plan

### Chapter 1: First Contact (Tutorial)
**Starting Tier**: T1
**Ending Tier**: T2
**Wave Count**: 3

```
Wave 1 - "Getting Started"
- Duration: 20s
- Zomboids: 20x basic_circle_small (20 HP)
- Timers: None
- Expected bullets: 40 available, 20 needed (2.0x ratio)

Wave 2 - "Adding Firepower"
- Duration: 25s
- Zomboids: 25x basic_circle_small (25 HP)
- Timers: hero_add_timer at 8s (startValue: -20)
- Expected bullets: 50 available, 25 needed (2.0x ratio)

Wave 3 - "First Upgrade"
- Duration: 30s
- Zomboids:
  - 25x basic_circle_small (25 HP)
  - 8x basic_circle_medium (16 HP)
  - Total: 41 HP
- Timers: weapon_upgrade_timer at 8s (T1→T2, startValue: -25)
- Expected bullets: ~150 available, 41 needed (3.7x ratio)
```

### Chapter 2: One-Side Pressure
**Starting Tier**: T2
**Ending Tier**: T3
**Wave Count**: 4

```
Wave 1 - "Left Side Focus"
- Duration: 28s
- Zomboids (all left):
  - 25x basic_circle_small (25 HP)
  - 10x square_small (20 HP)
  - Total: 45 HP
- Timers: hero_add_timer at 10s
- Expected bullets (T2): ~280 available, 45 needed (6.2x ratio)

Wave 2 - "Right Side Pressure"
- Duration: 30s
- Zomboids (all right):
  - 20x basic_circle_medium (40 HP)
  - 12x square_small (24 HP)
  - Total: 64 HP
- Timers: rapid_hero_timer at 8s
- Expected bullets (T2): ~300 available, 64 needed (4.7x ratio)

Wave 3 - "Power Up"
- Duration: 32s
- Zomboids (both):
  - 18x basic_circle_large (54 HP)
  - 14x square_medium (42 HP)
  - 10x hex_small (30 HP)
  - Total: 126 HP
- Timers: weapon_upgrade_timer at 12s (T2→T3, startValue: -40)
- Expected bullets: ~250 T2 + 200 T3 = 450 available, 126 needed (3.6x ratio)

Wave 4 - "Both Sides"
- Duration: 35s
- Zomboids (both):
  - 20x basic_circle_large (60 HP)
  - 16x square_medium (48 HP)
  - 12x hex_small (36 HP)
  - Total: 144 HP
- Timers: hero_add_timer at 10s, rapid_hero_timer at 22s
- Expected bullets (T3): ~525 available, 144 needed (3.6x ratio)
```

### Chapter 3: Speed Demons
**Starting Tier**: T3
**Ending Tier**: T3 (no upgrade!)
**Wave Count**: 4

```
Wave 1 - "Fast Intro"
- Duration: 26s
- Zomboids:
  - 18x basic_circle_small (18 HP)
  - 10x square_small (20 HP)
  - 8x basic_circle_medium (16 HP)
  - Total: 54 HP
- Timers: hero_add_timer at 10s
- Expected bullets (T3): ~390 available, 54 needed (7.2x ratio)

Wave 2 - "Right Rush"
- Duration: 28s
- Zomboids (right):
  - 22x square_small (44 HP)
  - 14x basic_circle_medium (28 HP)
  - 10x square_medium (30 HP)
  - Total: 102 HP
- Timers: rapid_hero_timer at 8s
- Expected bullets (T3): ~420 available, 102 needed (4.1x ratio)

Wave 3 - "Hexagon Storm"
- Duration: 32s
- Zomboids:
  - 18x hex_small (54 HP)
  - 14x square_medium (42 HP)
  - 10x hex_medium (40 HP)
  - Total: 136 HP
- Timers: hero_add_timer at 10s, rapid_hero_timer at 22s
- Expected bullets (T3): ~480 available, 136 needed (3.5x ratio)

Wave 4 - "Speed Challenge"
- Duration: 35s
- Zomboids:
  - 35x square_small (70 HP)
  - 20x square_medium (60 HP)
  - 18x hex_medium (72 HP)
  - 15x hex_small (45 HP)
  - Total: 247 HP
- Timers: rapid_hero_timer at 8s, hero_add_timer at 20s
- Expected bullets (T3): ~525 available, 247 needed (2.1x ratio)
```

## Bullet Count Calculations

### Weapon Stats Reference
```
T1 (Single Gun): 2 shots/sec × 1 projectile = 2 bullets/sec
T2 (Double Gun): 5 shots/sec × 2 projectiles = 10 bullets/sec
T3 (Triple Gun): 5 shots/sec × 3 projectiles = 15 bullets/sec
```

### Timer Catch Times
```
hero_add_timer (startValue: -20): ~2.5s catch time
hero_add_timer (startValue: -25): ~3.1s catch time
weapon_upgrade_timer (startValue: -25): ~3.1s catch time
weapon_upgrade_timer (startValue: -40): ~5.0s catch time
rapid_hero_timer: ~3.5s catch time average
```

## Implementation Tasks
- [ ] Update chapter-01.json (minor tweaks)
- [ ] Completely rewrite chapter-02.json
- [ ] Completely rewrite chapter-03.json
- [ ] Run bullet-count analysis
- [ ] Verify all bullet ratios ≥ 1.5
- [ ] Playtest all three chapters
- [ ] Adjust based on playtest feedback

## Testing Strategy
- Run analyze_balance.py with bullet counts
- Play through all three chapters in sequence
- Verify difficulty curve feels right
- Check that upgrades feel meaningful
- Ensure no frustrating difficulty spikes

## Dependencies
- Story 8.2.1 (bullet-count tool)
- analyze_balance.py script

## Notes
- Chapter 3 gets NO upgrade - this is intentional
- Players should feel powerful with T3 in Chapter 3
- This sets up appreciation for T4 upgrade in Chapter 4
- Focus on enemy variety rather than raw difficulty
