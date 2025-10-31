# Phase 8: Implementation Guide

## Quick Start

This phase introduces a **progressive campaign system** where:
1. Players start at Chapter 1 with Tier 1 weapon
2. Weapon tier persists across chapters
3. Upgrades are more rare (~8-10 total vs current ~15-20)
4. All balance validated using bullet-count methodology

## Implementation Order

### Step 1: Create Bullet-Count Analysis Tool (2-3 hours)
**File**: `analyze_balance.py`

Add bullet counting functions to the existing script:

```python
# Quick implementation example:
def calculate_bullets_available(self, wave, starting_tier):
    """Count total bullets that can be fired during wave"""
    total_bullets = 0
    # Similar to DPS calc but count actual shots
    # shots = time_segment / fire_rate
    # bullets = shots * projectile_count
    return total_bullets

def calculate_bullets_needed(self, wave):
    """Count bullets needed to kill all zomboids"""
    bullets_needed = 0
    for pattern in wave['spawnPattern']['zomboids']:
        zomboid = self.zomboids[pattern['type']]
        # bullets = ceil(health / damage) * count
        bullets_needed += zomboid.health * pattern['count']
    return bullets_needed
```

**Test**: Run `python analyze_balance.py` and verify output includes bullet counts.

### Step 2: Validate Current Chapters (1 hour)
Run bullet analysis on all chapters:
```bash
python analyze_balance.py > bullet_analysis.txt
```

Review output and identify problem areas.

### Step 3: Rebalance Chapters 1-6 (6-8 hours)
Follow the detailed plans in:
- `story-8.3.1-rebalance-chapters-1-3.md`
- `story-8.3.2-rebalance-chapters-4-6.md`

**Target bullet ratios**:
- Chapters 1-2: ≥ 2.0x (comfortable)
- Chapters 3-4: ≥ 1.5x (adequate)
- Chapters 5-6: ≥ 1.3x (tight but fair)

### Step 4: Implement Persistent Progression (8-10 hours)
**Files to modify**:
1. `src/systems/ProgressManager.ts` - Add weapon tier tracking
2. `src/scenes/GameScene.ts` - Accept starting weapon tier
3. `src/scenes/ChapterCompleteScene.ts` - Save ending weapon tier
4. `src/scenes/MenuScene.ts` - Show progression, lock chapters

**Key changes**:
```typescript
// ProgressManager.ts
interface ChapterProgress {
  // ... existing fields
  startingWeaponTier: number;  // NEW
  endingWeaponTier: number;    // NEW
}

// GameScene.ts - init
init(data: { chapter: ChapterData, startingTier?: number }) {
  const startTier = data.startingTier || 1;
  this.weaponSystem = new WeaponSystem(scene, startTier);
}

// ChapterCompleteScene.ts
const endingTier = this.weaponSystem.getCurrentWeapon().tier;
ProgressManager.setChapterCompletion(chapterId, endingTier);
```

### Step 5: Update UI (2-3 hours)
Add visual indicators:
- Current weapon tier badge in menu
- "Locked" overlay on future chapters
- "Reset Campaign" button
- Progression breadcrumb trail

## Testing Checklist

### Bullet-Count Validation
- [ ] All Chapter 1-3 waves have bullet ratio ≥ 1.5
- [ ] All Chapter 4-6 waves have bullet ratio ≥ 1.3
- [ ] No spawn pressure issues in early game
- [ ] Boss fights feel challenging but fair

### Progression System
- [ ] Starting Chapter 1 gives Tier 1 weapon
- [ ] Completing chapter saves weapon tier
- [ ] Next chapter starts with saved tier
- [ ] Can't skip chapters
- [ ] "Reset Campaign" clears all progress

### Balance & Feel
- [ ] Upgrades feel rare and impactful
- [ ] Difficulty curve is smooth
- [ ] Each chapter feels distinct
- [ ] Campaign takes 45-60 minutes to complete
- [ ] Players feel sense of progression

## Upgrade Distribution

### Recommended Setup
```
Chapter 1: T1 → T2  (Wave 3)
Chapter 2: T2 → T3  (Wave 3)
Chapter 3: T3 (no upgrade)
Chapter 4: T3 → T4  (Wave 3)
Chapter 5: T4 → T5  (Wave 3)
Chapter 6: T5 (no upgrade)
Chapter 7: T5 → T6  (Wave 3-4)
Chapter 8: T6 (no upgrade, or optional T7)

Total: 6-7 upgrades across 8 chapters
```

## Bullet-Count Formula Reference

### Available Bullets
```
shots_per_second = 1 / fire_rate
bullets_per_second = shots_per_second × projectile_count
total_bullets = bullets_per_second × (time - catch_time)
```

### Needed Bullets
```
For each zomboid type:
  bullets_to_kill = ceil(health / bullet_damage)
  total_needed = bullets_to_kill × count
```

### Safety Margins
```
Ratio ≥ 2.0: Very comfortable (Tutorial)
Ratio ≥ 1.5: Comfortable (Easy)
Ratio ≥ 1.3: Adequate (Medium)
Ratio ≥ 1.1: Tight (Hard)
Ratio ≥ 1.0: Very tight (Very Hard)
Ratio < 1.0: Impossible
```

## Weapon Stats (for reference)

```
T1: 2.0 bullets/sec  (2 shots/s × 1 projectile)
T2: 10.0 bullets/sec (5 shots/s × 2 projectiles)
T3: 15.0 bullets/sec (5 shots/s × 3 projectiles)
T4: 50.0 bullets/sec (10 shots/s × 5 projectiles)
T5: 20.0 bullets/sec (20 shots/s × 1 projectile)
T6: 13.3 bullets/sec (6.67 shots/s × 2 projectiles, with penetration)
T7: 20.0 bullets/sec (0.4 shots/s × 1 huge projectile)
```

## Common Issues & Solutions

### Issue: Wave too hard (ratio < 1.0)
**Solutions**:
- Reduce zomboid count
- Reduce zomboid health (use smaller types)
- Move weapon upgrade earlier
- Increase wave duration
- Remove timer that requires catching

### Issue: Wave too easy (ratio > 3.0)
**Solutions**:
- Increase zomboid count
- Use higher HP zomboid types
- Reduce wave duration
- Delay weapon upgrade
- Add more timers to catch

### Issue: Spawn pressure (enemies spawn faster than you can kill)
**Solutions**:
- Increase spawn delays
- Reduce spawn rates
- Stagger enemy types
- Provide weapon upgrade earlier

## Example: Rebalancing a Wave

**Before**:
```json
{
  "waveId": 1,
  "duration": 25,
  "zomboids": [
    { "type": "basic_circle_large", "count": 30, "spawnRate": 2.0 }
  ]
}
```
**Analysis**: 90 HP, T1 weapon = 50 bullets → Ratio: 0.56x ❌

**After**:
```json
{
  "waveId": 1,
  "duration": 25,
  "zomboids": [
    { "type": "basic_circle_small", "count": 25, "spawnRate": 1.2 }
  ]
}
```
**Analysis**: 25 HP, T1 weapon = 50 bullets → Ratio: 2.0x ✅

## Next Steps

1. ✅ Read all story documents in `phase-8/`
2. ⬜ Implement bullet-count tool (Story 8.2.1)
3. ⬜ Rebalance Chapters 1-3 (Story 8.3.1)
4. ⬜ Rebalance Chapters 4-6 (Story 8.3.2)
5. ⬜ Design progression architecture (Story 8.1.1)
6. ⬜ Implement progression system (Epic 8.1)
7. ⬜ Full campaign playtest
8. ⬜ Polish and release!

## Questions?

See individual story files for detailed specifications:
- `epic-8.1-persistent-progression/` - Progression system details
- `epic-8.2-bullet-count-balance/` - Balance methodology
- `epic-8.3-chapter-rebalancing/` - Chapter rebalance plans
