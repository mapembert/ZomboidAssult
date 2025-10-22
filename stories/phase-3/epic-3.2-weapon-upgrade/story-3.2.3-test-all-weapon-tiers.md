# Story 3.2.3: Test All Weapon Tiers

**Epic:** 3.2 Weapon Upgrade System
**Phase:** 3 - Timer and Upgrade Systems (Days 6-7)
**Estimated Time:** 3 hours
**Status:** ⏳ PENDING

## Description
Comprehensive testing of all five weapon tiers to verify correct projectile count, spread angles, fire rates, damage values, and visual distinctions. Ensure smooth transitions between tiers and validate weapon balance.

## Tasks
- [ ] Create test scene/config with rapid weapon upgrades
- [ ] Test Tier 0: single_gun (1 projectile, 0° spread)
- [ ] Test Tier 1: double_gun (2 projectiles, 15° spread)
- [ ] Test Tier 2: triple_gun (3 projectiles, 20° spread)
- [ ] Test Tier 3: pulse_laser (5 projectiles, 30° spread)
- [ ] Test Tier 4: mega_machine_gun (7 projectiles, 25° spread)
- [ ] Verify fire rates for each tier
- [ ] Validate damage values against zomboid health
- [ ] Test visual distinction between tiers
- [ ] Measure performance impact at max tier
- [ ] Document weapon balance observations

## Acceptance Criteria
- [ ] All weapon configs load without errors
- [ ] Projectile counts match configuration
- [ ] Spread angles visually correct
- [ ] Fire rates accurate (measured)
- [ ] Damage values applied correctly
- [ ] Visual distinction clear between tiers
- [ ] No performance drops (60 FPS maintained)
- [ ] Smooth transitions between tiers
- [ ] All tiers feel balanced and useful

## Files Created/Modified
- `config/chapters/test-weapons.json` (create test chapter with weapon timers)
- Test results documented in this story

## Dependencies
- Story 3.2.1: Implement Weapon Upgrade Logic
- Story 3.2.2: Create Weapon Upgrade Timer Type
- All weapon configurations in `config/entities/weapons.json`
- All existing weapon/projectile systems

## Implementation Details

### Test Chapter Configuration
Create `config/chapters/test-weapons.json`:
```json
{
  "id": "test-weapons",
  "name": "Weapon Testing",
  "description": "Test all weapon tiers",
  "unlocked": true,
  "waves": [
    {
      "wave": 1,
      "duration": 120,
      "zomboidSpawns": [
        {
          "time": 0,
          "spawnRate": 2,
          "spawnDuration": 120,
          "zomboidType": "circle_zomboid",
          "column": 0
        }
      ],
      "timerSpawns": [
        {
          "time": 5,
          "timerType": "weapon_upgrade_timer",
          "column": 1,
          "initialValue": 5
        },
        {
          "time": 20,
          "timerType": "weapon_upgrade_timer",
          "column": 0,
          "initialValue": 5
        },
        {
          "time": 35,
          "timerType": "weapon_upgrade_timer",
          "column": 1,
          "initialValue": 5
        },
        {
          "time": 50,
          "timerType": "weapon_upgrade_timer",
          "column": 0,
          "initialValue": 5
        }
      ]
    }
  ]
}
```

### Weapon Tier Testing Checklist

#### Tier 0: single_gun (Starting Weapon)
**Expected Configuration:**
- projectileCount: 1
- fireRate: 0.3s (300ms between shots)
- spreadAngle: 0°
- damage: 10
- color: #18FFFF (cyan)

**Test Steps:**
1. Start game with single_gun
2. Fire continuously for 10 seconds
3. Count projectiles fired (should be ~33 projectiles)
4. Verify single straight projectile
5. Shoot circle_zomboid (health: 10) → should destroy in 1 hit

**Pass Criteria:**
- [ ] Fires exactly 1 projectile per shot
- [ ] Projectile travels straight up
- [ ] Fire rate approximately 3.3 shots/second
- [ ] Destroys circle_zomboid in 1 hit

---

#### Tier 1: double_gun
**Expected Configuration:**
- projectileCount: 2
- fireRate: 0.3s
- spreadAngle: 15°
- damage: 10
- color: #03DAC6 (teal)

**Test Steps:**
1. Upgrade to double_gun via timer
2. Fire continuously
3. Measure spread angle visually
4. Verify 2 projectiles per shot
5. Test damage against square_zomboid (health: 20) → should destroy in 2 hits

**Pass Criteria:**
- [ ] Fires exactly 2 projectiles per shot
- [ ] Spread angle approximately 15° total
- [ ] Projectiles diverge symmetrically
- [ ] Color changes to teal

---

#### Tier 2: triple_gun
**Expected Configuration:**
- projectileCount: 3
- fireRate: 0.3s
- spreadAngle: 20°
- damage: 15
- color: #00E676 (green)

**Test Steps:**
1. Upgrade to triple_gun
2. Fire continuously
3. Verify 3 projectiles: left, center, right
4. Measure spread angle
5. Test damage (square_zomboid should take 2 hits)

**Pass Criteria:**
- [ ] Fires exactly 3 projectiles per shot
- [ ] Center projectile goes straight
- [ ] Left/right projectiles spread evenly
- [ ] Spread angle approximately 20°
- [ ] Color changes to green

---

#### Tier 3: pulse_laser
**Expected Configuration:**
- projectileCount: 5
- fireRate: 0.2s (faster)
- spreadAngle: 30°
- damage: 20
- color: #FFEA00 (yellow)

**Test Steps:**
1. Upgrade to pulse_laser
2. Fire continuously for 10 seconds
3. Count projectiles fired (should be ~50 projectiles per hero)
4. Verify 5 projectiles with wide spread
5. Test damage (square_zomboid should destroy in 1 hit)

**Pass Criteria:**
- [ ] Fires exactly 5 projectiles per shot
- [ ] Fire rate increased to 5 shots/second
- [ ] Wide spread covers more area
- [ ] Color changes to yellow
- [ ] Noticeably faster fire rate

---

#### Tier 4: mega_machine_gun (Max Tier)
**Expected Configuration:**
- projectileCount: 7
- fireRate: 0.1s (very fast)
- spreadAngle: 25°
- damage: 25
- color: #FF5252 (red)

**Test Steps:**
1. Upgrade to mega_machine_gun
2. Fire continuously for 10 seconds
3. Count projectiles fired (should be ~100 projectiles per hero)
4. Verify 7 projectiles fan out
5. Test damage (hex_zomboid health: 50 should take 2 hits)
6. **Performance test**: 3 heroes + mega_machine_gun + 20 zomboids → verify 60 FPS

**Pass Criteria:**
- [ ] Fires exactly 7 projectiles per shot
- [ ] Fire rate increased to 10 shots/second
- [ ] Spread covers good area without being too wide
- [ ] Color changes to red
- [ ] Screen fills with projectiles but maintains 60 FPS
- [ ] Attempting to upgrade shows "Max Tier" message

---

### Visual Distinction Testing
Play through all tiers and verify:
- [ ] Each tier has unique projectile color
- [ ] Projectile count clearly increases
- [ ] Spread patterns feel different
- [ ] Fire rate differences noticeable
- [ ] Upgrade feels impactful

### Performance Testing
**Test scenario**: 3 heroes with mega_machine_gun
- 7 projectiles × 10 shots/second × 3 heroes = **210 projectiles/second**
- With 20 active zomboids + timers + UI

**Metrics to check:**
- [ ] FPS stays at 60
- [ ] No frame drops during intense firing
- [ ] Collision detection remains accurate
- [ ] Memory usage stable (< 150MB)
- [ ] No lag on projectile creation/destruction

### Balance Testing
Evaluate whether weapon progression feels good:
1. **Early game (Tier 0-1)**: Should feel challenging but fair
2. **Mid game (Tier 2-3)**: Noticeable power increase
3. **Late game (Tier 4)**: Powerful but not trivial

**Questions to answer:**
- [ ] Does each upgrade feel meaningful?
- [ ] Is mega_machine_gun too powerful?
- [ ] Is single_gun too weak for later waves?
- [ ] Do spread angles feel appropriate?
- [ ] Are fire rates balanced?

### Damage Testing Matrix
| Weapon Tier | Damage | circle_zomboid (hp:10) | square_zomboid (hp:20) | hex_zomboid (hp:50) |
|-------------|--------|------------------------|------------------------|---------------------|
| single_gun  | 10     | 1 hit                  | 2 hits                 | 5 hits              |
| double_gun  | 10     | 1 hit                  | 2 hits                 | 5 hits              |
| triple_gun  | 15     | 1 hit                  | 2 hits                 | 4 hits              |
| pulse_laser | 20     | 1 hit                  | 1 hit                  | 3 hits              |
| mega_gun    | 25     | 1 hit                  | 1 hit                  | 2 hits              |

Verify this table matches actual gameplay.

## Testing Results Documentation

### Test Results Template
For each weapon tier, document:

```markdown
## Tier X: [weapon_name]

**Configuration Verified:**
- Projectile Count: ✅ / ❌
- Fire Rate: ✅ / ❌  (measured: X.XX seconds)
- Spread Angle: ✅ / ❌  (visual check)
- Damage: ✅ / ❌
- Color: ✅ / ❌

**Performance:**
- FPS: XX
- Memory: XXX MB
- Projectiles on screen (max): XX

**Balance Notes:**
[Observations about feel, power level, usability]

**Issues Found:**
[List any bugs or unexpected behavior]
```

## Bug Reporting
If issues found, create separate bug tickets:
- Incorrect projectile count
- Fire rate not matching config
- Spread angle too wide/narrow
- Damage calculation errors
- Performance issues
- Visual glitches

## Success Criteria Summary
- [ ] All 5 weapon tiers work as configured
- [ ] No TypeScript or runtime errors
- [ ] 60 FPS maintained at all tiers
- [ ] Visual progression clear
- [ ] Weapon balance feels appropriate
- [ ] Test chapter playable and useful for debugging

## Next Phase
After Phase 3 completion, proceed to:
**Phase 4: Wave Progression and Content**
- Story 4.1.1: Implement Wave Completion Logic
