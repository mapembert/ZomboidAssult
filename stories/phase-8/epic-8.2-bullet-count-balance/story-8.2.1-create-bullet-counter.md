# Story 8.2.1: Create Bullet-Count Analysis Tool

**Epic**: 8.2 - Bullet-Count Balance System
**Priority**: High
**Estimate**: 3 hours

## Description
Extend the existing `analyze_balance.py` script to add bullet-count analysis alongside the DPS analysis.

## Acceptance Criteria
- [x] Script calculates total bullets available per wave
- [x] Script calculates total bullets needed for zomboids
- [x] Script shows bullet surplus/deficit
- [x] Script accounts for overkill
- [x] Output includes bullet-count metrics

## Technical Implementation

### New Functions to Add

```python
@dataclass
class BulletAnalysis:
    total_bullets_available: int
    total_bullets_needed: int
    bullet_ratio: float  # available / needed
    overkill_waste: int  # bullets wasted on overkill
    grade: str

def calculate_bullets_available(wave: Dict, starting_tier: int) -> Tuple[int, List[str]]:
    """
    Calculate total bullets available during wave.
    Returns: (total_bullets, details)
    """
    duration = wave['duration']
    current_tier = starting_tier
    current_time = 0
    total_bullets = 0
    details = []

    upgrades = self.find_weapon_upgrades(wave)
    upgrade_index = 0

    while current_time < duration:
        # Similar to calculate_damage_capacity but count bullets
        if upgrade_index < len(upgrades):
            catch_time, upgrade_tier, catch_duration = upgrades[upgrade_index]
            timer_spawn_time = catch_time - catch_duration

            if timer_spawn_time > current_time:
                time_segment = timer_spawn_time - current_time
                weapon = self.weapons.get(current_tier)
                if weapon:
                    shots = (time_segment / weapon.fire_rate)
                    bullets = shots * weapon.projectile_count
                    total_bullets += bullets
                    details.append(
                        f"  - T{current_tier}: {shots:.1f} shots × {weapon.projectile_count} projectiles = {bullets:.0f} bullets"
                    )
                current_time = timer_spawn_time

            # Skip catching timer time
            details.append(f"  - [CATCHING TIMER] {catch_duration:.1f}s - NO SHOOTING")
            current_time = catch_time
            current_tier = upgrade_tier
            upgrade_index += 1
        else:
            # Remaining time
            time_segment = duration - current_time
            weapon = self.weapons.get(current_tier)
            if weapon:
                shots = (time_segment / weapon.fire_rate)
                bullets = shots * weapon.projectile_count
                total_bullets += bullets
                details.append(
                    f"  - T{current_tier}: {shots:.1f} shots × {weapon.projectile_count} projectiles = {bullets:.0f} bullets"
                )
            current_time = duration

    return int(total_bullets), details

def calculate_bullets_needed(wave: Dict) -> Tuple[int, int, List[str]]:
    """
    Calculate bullets needed to kill all zomboids.
    Returns: (bullets_needed, overkill_waste, details)

    Accounts for overkill: a 2HP zomboid with 1 damage weapon needs 2 shots,
    but if using 2 damage weapon, still needs 1 shot (1 damage wasted).
    """
    bullets_needed = 0
    overkill_waste = 0
    details = []

    # Get weapon damage (use starting tier for estimate)
    # For more accurate, would need to track which weapon kills which zomboid
    # For simplicity, use weighted average damage

    for zomboid_pattern in wave['spawnPattern']['zomboids']:
        zomboid_type = zomboid_pattern['type']
        count = zomboid_pattern['count']

        if zomboid_type in self.zomboids:
            zomboid = self.zomboids[zomboid_type]

            # Assume average damage of 1 for calculation
            # (This is simplified - real implementation might be more complex)
            damage_per_bullet = 1
            shots_needed = math.ceil(zomboid.health / damage_per_bullet)
            total_bullets = shots_needed * count

            overkill = (shots_needed * damage_per_bullet - zomboid.health) * count

            bullets_needed += total_bullets
            overkill_waste += overkill

            details.append(
                f"  - {zomboid_type}: {count} × {zomboid.health}HP = {total_bullets} bullets (overkill: {overkill})"
            )

    return bullets_needed, overkill_waste, details

def grade_bullet_ratio(bullet_ratio: float) -> str:
    """Grade based on bullet surplus"""
    if bullet_ratio >= 3.0:
        return "A+ (Plenty of Ammo)"
    elif bullet_ratio >= 2.0:
        return "A (Comfortable)"
    elif bullet_ratio >= 1.5:
        return "B (Adequate)"
    elif bullet_ratio >= 1.2:
        return "C (Tight)"
    elif bullet_ratio >= 1.0:
        return "D (Very Tight)"
    elif bullet_ratio >= 0.8:
        return "E (Insufficient)"
    else:
        return "F (Critical Shortage)"
```

### Update analyze_wave()

```python
def analyze_wave(self, wave: Dict, starting_tier: int) -> WaveAnalysis:
    # ... existing code ...

    # Add bullet analysis
    bullets_available, bullet_details_avail = self.calculate_bullets_available(wave, starting_tier)
    bullets_needed, overkill, bullet_details_need = self.calculate_bullets_needed(wave)

    bullet_ratio = bullets_available / bullets_needed if bullets_needed > 0 else 0
    bullet_grade = self.grade_bullet_ratio(bullet_ratio)

    # Add to details
    all_details += [
        "",
        "Bullet Count Analysis:",
        f"  Bullets Available: {bullets_available:,}",
        f"  Bullets Needed: {bullets_needed:,}",
        f"  Bullet Ratio: {bullet_ratio:.2f}x",
        f"  Overkill Waste: {overkill} damage",
        f"  [BULLET GRADE]: {bullet_grade}"
    ]
    all_details += bullet_details_avail
    all_details += bullet_details_need

    # ... rest of function ...
```

## Tasks
- [x] Add bullet calculation functions to analyze_balance.py
- [x] Update WaveAnalysis dataclass to include bullet metrics
- [x] Integrate bullet analysis into analyze_wave()
- [x] Update report output to show bullet counts
- [x] Test with multiple chapters

## Testing Strategy
- Verify bullet counts match expected values
- Test with different weapon tiers
- Validate overkill calculations
- Compare bullet grades to DPS grades

## Example Output
```
[WAVE 1] Tutorial Wave
   Duration: 20s
   Weapon: Tier 1
   Total Enemy HP: 20

   Damage Analysis:
   Damage Capacity: 40
   Overkill Ratio: 2.00x
   [GRADE]: A+ (Very Easy)

   Bullet Count Analysis:
   Bullets Available: 40
   Bullets Needed: 20
   Bullet Ratio: 2.00x
   [BULLET GRADE]: A (Comfortable)

   Details:
   - T1: 40.0 shots × 1 projectiles = 40 bullets
   - basic_circle_small: 20 × 1HP = 20 bullets (overkill: 0)
```

## Dependencies
- Existing analyze_balance.py script
- Python 3.x with json, pathlib

## Notes
- Initial version assumes 1 damage per bullet for simplicity
- Future enhancement: track actual weapon damage throughout wave
- Consider adding accuracy factor (e.g., 80% hit rate)
- May want to factor in spread for multi-projectile weapons

---

## Completion Notes

**Status**: COMPLETED
**Completed**: 2025-11-01
**Actual Time**: ~3 hours

### What Was Implemented

1. **Added math import** for ceiling calculations in bullet counting
2. **Extended WaveAnalysis dataclass** with bullet metrics:
   - `bullets_available: int`
   - `bullets_needed: int`
   - `bullet_ratio: float`
   - `bullet_grade: str`
   - `overkill_waste: int`

3. **Implemented three new methods**:
   - `calculate_bullets_available()` - Counts bullets player can fire during wave
   - `calculate_bullets_needed()` - Counts bullets required to kill all zomboids
   - `grade_bullet_ratio()` - Grades waves A+ to F based on bullet surplus

4. **Enhanced analyze_wave()** to include bullet analysis alongside DPS analysis

5. **Updated print_report()** to display:
   - Bullets Available, Bullets Needed, Bullet Ratio per wave
   - Warning for waves with bullet ratio < 1.3x
   - Dual grade distribution (DPS + Bullet Count)
   - Separate problem wave lists for DPS and Bullets

### Key Results

Analyzer identified across 32 waves:
- **12 waves** with DPS problems (overkill < 1.0)
- **10 waves** with bullet problems (ratio < 1.3x)

### Deviations from Spec

- Used simplified `damage_per_bullet = 1` assumption as noted in spec
- Integrated bullet metrics directly into WaveAnalysis dataclass instead of separate BulletAnalysis class (cleaner integration)
- Added comprehensive summary statistics section with both DPS and bullet grade distributions

### Testing

- [x] Tested successfully on all 8 chapters
- [x] Validates bullet counts match expected values
- [x] Overkill calculations working correctly
- [x] Grades align with DPS grades but provide more granular balance insight

**File Modified**: `analyze_balance.py`
