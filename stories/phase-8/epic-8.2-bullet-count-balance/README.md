# Epic 8.2: Bullet-Count Balance System

## Overview
Create a more accurate balance methodology based on actual bullet counts rather than just DPS calculations. This accounts for the discrete nature of projectiles and provides more realistic difficulty estimates.

## Current State
- Balance analysis uses DPS (damage per second)
- Doesn't account for discrete projectiles
- Doesn't consider overkill per shot
- Ignores shot accuracy/spread effects

## Target State
- Balance analysis counts actual bullets fired
- Accounts for bullets wasted on overkill
- Considers projectile count per shot
- More accurate difficulty predictions

## Bullet Count Methodology

### Calculation
```
For each weapon:
- shots_per_second = 1 / fireRate
- bullets_per_second = shots_per_second * projectileCount
- total_bullets = bullets_per_second * time_segment

For each zomboid:
- bullets_to_kill = ceil(health / damage_per_bullet)
- Consider: Some bullets wasted due to overkill

Total bullets available vs bullets needed = balance ratio
```

### Example
```
Weapon: Single Gun (Tier 1)
- Fire rate: 0.5s (2 shots/sec)
- Projectile count: 1
- Damage: 1
- Time: 20s
- Total bullets: 2 * 1 * 20 = 40 bullets

Zomboids: 20x basic_circle_small
- Health: 1 HP each
- Bullets to kill: 1 each
- Total needed: 20 bullets

Ratio: 40/20 = 2.0x (good safety margin)
```

## Stories
- [Story 8.2.1: Create bullet-count analysis tool](./story-8.2.1-create-bullet-counter.md)
- [Story 8.2.2: Validate chapters with bullet counts](./story-8.2.2-validate-chapters.md)
- [Story 8.2.3: Document balance methodology](./story-8.2.3-document-methodology.md)

## Technical Considerations
- Must account for multi-projectile weapons (spread)
- Consider penetration (Tier 6 Sniper)
- Account for time spent catching timers
- Factor in player accuracy (assume ~80% hit rate?)

## Success Criteria
- [ ] Bullet counter tool created
- [ ] All chapters analyzed with bullet counts
- [ ] Methodology documented
- [ ] Guidelines for future chapters

## Advantages Over DPS Method
1. **More Intuitive**: "Do I have enough bullets?" vs "Is my DPS high enough?"
2. **Accounts for Overkill**: A 2 HP zomboid still takes 2 bullets with 1 damage
3. **Better for Discrete Systems**: Matches how the game actually works
4. **Player-Facing Metric**: Players think in bullets, not DPS

## Dependencies
- Existing balance analysis script
- Chapter configurations
- Weapon configurations
