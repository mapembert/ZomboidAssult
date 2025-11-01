#!/usr/bin/env python3
"""
Zomboid Assault - Chapter Balance Analyzer

This script analyzes the difficulty balance of each chapter and wave by:
1. Calculating total enemy HP
2. Estimating player damage output based on weapons and timing
3. Comparing damage capacity vs enemy health
4. Calculating bullet counts (bullets available vs bullets needed)
5. Grading each wave on difficulty
"""

import json
import math
import os
from pathlib import Path
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class WeaponStats:
    id: str
    name: str
    tier: int
    fire_rate: float  # Time between shots in seconds
    damage: int
    projectile_count: int

    def dps(self) -> float:
        """Damage per second"""
        if self.fire_rate == 0:
            return 0
        shots_per_second = 1.0 / self.fire_rate
        return shots_per_second * self.damage * self.projectile_count

@dataclass
class ZomboidStats:
    id: str
    health: int
    speed: int

@dataclass
class WaveAnalysis:
    wave_id: int
    wave_name: str
    duration: int
    total_zomboid_hp: int
    weapon_tier_start: int
    weapon_tier_end: int
    damage_capacity: float
    overkill_ratio: float  # damage_capacity / total_hp (>1 is good, <1 is hard)
    grade: str
    details: List[str]
    bullets_available: int = 0
    bullets_needed: int = 0
    bullet_ratio: float = 0.0
    bullet_grade: str = ""
    overkill_waste: int = 0

class BalanceAnalyzer:
    def __init__(self, config_dir: str):
        self.config_dir = Path(config_dir)
        self.weapons: Dict[int, WeaponStats] = {}
        self.zomboids: Dict[str, ZomboidStats] = {}
        self.chapters: List[Dict] = []

    def load_configs(self):
        """Load all configuration files"""
        print("Loading configurations...")

        # Load weapons
        weapons_path = self.config_dir / "entities" / "weapons.json"
        with open(weapons_path, 'r') as f:
            weapons_data = json.load(f)
            for weapon in weapons_data['weaponTypes']:
                w = WeaponStats(
                    id=weapon['id'],
                    name=weapon['name'],
                    tier=weapon['tier'],
                    fire_rate=weapon['fireRate'],
                    damage=weapon['damage'],
                    projectile_count=weapon['projectileCount']
                )
                self.weapons[w.tier] = w

        # Load zomboids
        zomboids_path = self.config_dir / "entities" / "zomboids.json"
        with open(zomboids_path, 'r') as f:
            zomboids_data = json.load(f)
            for zomboid in zomboids_data['zomboidTypes']:
                z = ZomboidStats(
                    id=zomboid['id'],
                    health=zomboid['health'],
                    speed=zomboid['speed']
                )
                self.zomboids[z.id] = z

        # Load all chapters
        chapters_dir = self.config_dir / "chapters"
        for chapter_file in sorted(chapters_dir.glob("chapter-*.json")):
            if "test" not in chapter_file.name:
                with open(chapter_file, 'r') as f:
                    chapter_data = json.load(f)
                    self.chapters.append(chapter_data)

        print(f"Loaded {len(self.weapons)} weapons, {len(self.zomboids)} zomboid types, {len(self.chapters)} chapters\n")

    def calculate_zomboid_hp(self, wave: Dict) -> Tuple[int, List[str]]:
        """Calculate total HP for all zomboids in a wave"""
        total_hp = 0
        details = []

        for zomboid_pattern in wave['spawnPattern']['zomboids']:
            zomboid_type = zomboid_pattern['type']
            count = zomboid_pattern['count']

            if zomboid_type in self.zomboids:
                hp_per_unit = self.zomboids[zomboid_type].health
                total = count * hp_per_unit
                total_hp += total
                details.append(f"  - {zomboid_type}: {count} × {hp_per_unit}HP = {total}HP")
            else:
                details.append(f"  - {zomboid_type}: UNKNOWN TYPE")

        return total_hp, details

    def find_weapon_upgrades(self, wave: Dict) -> List[Tuple[float, int, float]]:
        """
        Find when weapon upgrades occur in a wave.
        Returns list of (catch_time, tier, catch_duration)

        catch_duration = time spent NOT shooting enemies while catching timer
        """
        upgrades = []

        for timer in wave['spawnPattern'].get('timers', []):
            if timer['type'] == 'weapon_upgrade_timer':
                spawn_time = timer['spawnTime']
                weapon_tier = timer.get('weaponTier', 2)
                start_value = timer.get('startValue', -50)

                # Time needed to catch the timer
                # Player must stop shooting enemies and focus on timer
                # Estimate: 8 points per second increment (conservative)
                catch_duration = abs(start_value) / 8.0

                # Total time when upgrade is obtained
                catch_time = spawn_time + catch_duration

                upgrades.append((catch_time, weapon_tier, catch_duration))

        return sorted(upgrades, key=lambda x: x[0])

    def calculate_damage_capacity(self, wave: Dict, starting_tier: int) -> Tuple[float, int, int, List[str]]:
        """
        Calculate total damage capacity for a wave.
        Returns: (total_damage, starting_tier, ending_tier, details)

        KEY: Accounts for time spent catching timers where NO damage is dealt to enemies
        """
        duration = wave['duration']
        current_tier = starting_tier
        current_time = 0
        total_damage = 0
        details = []

        # Find weapon upgrades with catch durations
        upgrades = self.find_weapon_upgrades(wave)
        upgrade_index = 0

        # Calculate damage in segments between upgrades
        while current_time < duration:
            # Check if we have an upgrade coming
            if upgrade_index < len(upgrades) and upgrades[upgrade_index][0] <= duration:
                catch_time, upgrade_tier, catch_duration = upgrades[upgrade_index]
                timer_spawn_time = catch_time - catch_duration

                if timer_spawn_time > current_time:
                    # Deal damage with current weapon until timer spawns
                    time_segment = timer_spawn_time - current_time
                    weapon = self.weapons.get(current_tier)
                    if weapon:
                        segment_damage = weapon.dps() * time_segment
                        total_damage += segment_damage
                        details.append(
                            f"  - T{current_tier} ({weapon.name}) for {time_segment:.1f}s @ {weapon.dps():.1f} DPS = {segment_damage:.0f} damage"
                        )
                    current_time = timer_spawn_time

                # Now catching timer - NO DAMAGE TO ENEMIES during this time
                if catch_duration > 0:
                    details.append(
                        f"  - [CATCHING TIMER] for {catch_duration:.1f}s - NO DAMAGE (enemies accumulate!)"
                    )

                current_time = catch_time
                current_tier = upgrade_tier
                upgrade_index += 1
            else:
                # No more upgrades, calculate remaining time
                time_segment = duration - current_time
                weapon = self.weapons.get(current_tier)
                if weapon:
                    segment_damage = weapon.dps() * time_segment
                    total_damage += segment_damage
                    details.append(
                        f"  - T{current_tier} ({weapon.name}) for {time_segment:.1f}s @ {weapon.dps():.1f} DPS = {segment_damage:.0f} damage"
                    )
                current_time = duration

        ending_tier = current_tier
        return total_damage, starting_tier, ending_tier, details


    def calculate_bullets_available(self, wave: Dict, starting_tier: int) -> Tuple[int, List[str]]:
        """Calculate total bullets available during wave"""
        duration = wave['duration']
        current_tier = starting_tier
        current_time = 0
        total_bullets = 0
        details = []
        upgrades = self.find_weapon_upgrades(wave)
        upgrade_index = 0

        while current_time < duration:
            if upgrade_index < len(upgrades):
                catch_time, upgrade_tier, catch_duration = upgrades[upgrade_index]
                timer_spawn_time = catch_time - catch_duration
                if timer_spawn_time > current_time:
                    time_segment = timer_spawn_time - current_time
                    weapon = self.weapons.get(current_tier)
                    if weapon:
                        shots = time_segment / weapon.fire_rate
                        bullets = shots * weapon.projectile_count
                        total_bullets += bullets
                        details.append(f"  - T{current_tier}: {shots:.1f} shots x {weapon.projectile_count} projectiles = {bullets:.0f} bullets")
                    current_time = timer_spawn_time
                details.append(f"  - [CATCHING TIMER] {catch_duration:.1f}s - NO SHOOTING")
                current_time = catch_time
                current_tier = upgrade_tier
                upgrade_index += 1
            else:
                time_segment = duration - current_time
                weapon = self.weapons.get(current_tier)
                if weapon:
                    shots = time_segment / weapon.fire_rate
                    bullets = shots * weapon.projectile_count
                    total_bullets += bullets
                    details.append(f"  - T{current_tier}: {shots:.1f} shots x {weapon.projectile_count} projectiles = {bullets:.0f} bullets")
                current_time = duration
        return int(total_bullets), details

    def calculate_bullets_needed(self, wave: Dict) -> Tuple[int, int, List[str]]:
        """Calculate bullets needed to kill all zomboids"""
        bullets_needed = 0
        overkill_waste = 0
        details = []
        damage_per_bullet = 1

        for zomboid_pattern in wave['spawnPattern']['zomboids']:
            zomboid_type = zomboid_pattern['type']
            count = zomboid_pattern['count']
            if zomboid_type in self.zomboids:
                zomboid = self.zomboids[zomboid_type]
                shots_needed = math.ceil(zomboid.health / damage_per_bullet)
                total_bullets = shots_needed * count
                overkill = (shots_needed * damage_per_bullet - zomboid.health) * count
                bullets_needed += total_bullets
                overkill_waste += overkill
                details.append(f"  - {zomboid_type}: {count} x {zomboid.health}HP = {total_bullets} bullets (overkill: {overkill})")
        return bullets_needed, overkill_waste, details

    def grade_bullet_ratio(self, bullet_ratio: float) -> str:
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

    def grade_wave(self, overkill_ratio: float) -> str:
        """Grade a wave based on overkill ratio"""
        if overkill_ratio >= 2.0:
            return "A+ (Very Easy)"
        elif overkill_ratio >= 1.5:
            return "A (Easy)"
        elif overkill_ratio >= 1.2:
            return "B (Balanced)"
        elif overkill_ratio >= 1.0:
            return "C (Challenging)"
        elif overkill_ratio >= 0.8:
            return "D (Hard)"
        elif overkill_ratio >= 0.6:
            return "E (Very Hard)"
        else:
            return "F (Nearly Impossible)"

    def calculate_spawn_pressure(self, wave: Dict, starting_tier: int) -> Tuple[bool, List[str]]:
        """
        Check if spawn rate exceeds damage capacity at any point.
        Returns: (has_pressure_problem, pressure_details)
        """
        pressure_details = []
        has_problem = False

        # Get weapon upgrades
        upgrades = self.find_weapon_upgrades(wave)
        current_tier = starting_tier
        current_time = 0
        upgrade_index = 0

        # Check each phase
        while current_time < wave['duration']:
            # Determine next checkpoint
            if upgrade_index < len(upgrades):
                catch_time, upgrade_tier, catch_duration = upgrades[upgrade_index]
                timer_spawn_time = catch_time - catch_duration
                phase_end = timer_spawn_time
                phase_name = f"Phase {upgrade_index + 1}: T{current_tier} weapon"
            else:
                phase_end = wave['duration']
                phase_name = f"Final phase: T{current_tier} weapon"

            if phase_end <= current_time:
                if upgrade_index < len(upgrades):
                    current_tier = upgrades[upgrade_index][1]
                    current_time = upgrades[upgrade_index][0]
                    upgrade_index += 1
                continue

            # Calculate spawn rate during this phase
            spawn_hp_per_sec = 0
            for zomboid_pattern in wave['spawnPattern']['zomboids']:
                zomboid_type = zomboid_pattern['type']
                spawn_rate = zomboid_pattern['spawnRate']
                spawn_delay = zomboid_pattern.get('spawnDelay', 0)

                # Only count if spawning during this phase
                if spawn_delay < phase_end and zomboid_type in self.zomboids:
                    hp_per_unit = self.zomboids[zomboid_type].health
                    spawn_hp_per_sec += spawn_rate * hp_per_unit

            # Get damage per second for current weapon
            weapon = self.weapons.get(current_tier)
            dps = weapon.dps() if weapon else 0

            # Check if we can keep up
            if spawn_hp_per_sec > dps:
                has_problem = True
                deficit = spawn_hp_per_sec - dps
                pressure_details.append(
                    f"  [SPAWN PRESSURE] {phase_name}: {spawn_hp_per_sec:.1f} HP/sec spawning vs {dps:.1f} DPS (SHORT {deficit:.1f} HP/sec!)"
                )

            current_time = phase_end
            if upgrade_index < len(upgrades):
                current_tier = upgrades[upgrade_index][1]
                current_time = upgrades[upgrade_index][0]
                upgrade_index += 1

        return has_problem, pressure_details

    def analyze_wave(self, wave: Dict, starting_tier: int) -> WaveAnalysis:
        """Analyze a single wave"""
        total_hp, hp_details = self.calculate_zomboid_hp(wave)
        damage_capacity, tier_start, tier_end, damage_details = self.calculate_damage_capacity(wave, starting_tier)

        # Check spawn pressure
        has_pressure, pressure_details = self.calculate_spawn_pressure(wave, starting_tier)

        # Calculate bullet analysis
        bullets_available, bullet_details_avail = self.calculate_bullets_available(wave, starting_tier)
        bullets_needed, overkill_waste, bullet_details_need = self.calculate_bullets_needed(wave)
        bullet_ratio = bullets_available / bullets_needed if bullets_needed > 0 else 0
        bullet_grade = self.grade_bullet_ratio(bullet_ratio)

        overkill_ratio = damage_capacity / total_hp if total_hp > 0 else 0

        # Adjust grade if spawn pressure exists
        if has_pressure and overkill_ratio > 1.0:
            overkill_ratio = overkill_ratio * 0.5  # Penalize grade for spawn pressure
            grade = self.grade_wave(overkill_ratio) + " [Spawn Pressure!]"
        else:
            grade = self.grade_wave(overkill_ratio)

        all_details = ["Zomboids:"] + hp_details + ["Damage Output:"] + damage_details
        if pressure_details:
            all_details += ["Spawn Pressure Analysis:"] + pressure_details

        # Add bullet analysis details
        all_details += [
            "",
            "Bullet Count Analysis:",
            f"  Bullets Available: {bullets_available:,}",
            f"  Bullets Needed: {bullets_needed:,}",
            f"  Bullet Ratio: {bullet_ratio:.2f}x",
            f"  Overkill Waste: {overkill_waste} damage",
            f"  [BULLET GRADE]: {bullet_grade}"
        ]
        all_details += bullet_details_avail
        all_details += bullet_details_need

        return WaveAnalysis(
            wave_id=wave['waveId'],
            wave_name=wave['waveName'],
            duration=wave['duration'],
            total_zomboid_hp=total_hp,
            weapon_tier_start=tier_start,
            weapon_tier_end=tier_end,
            damage_capacity=damage_capacity,
            overkill_ratio=overkill_ratio,
            grade=grade,
            details=all_details,
            bullets_available=bullets_available,
            bullets_needed=bullets_needed,
            bullet_ratio=bullet_ratio,
            bullet_grade=bullet_grade,
            overkill_waste=overkill_waste
        )

    def analyze_chapter(self, chapter: Dict) -> List[WaveAnalysis]:
        """Analyze all waves in a chapter"""
        current_tier = 1  # Always start with tier 1 weapon
        analyses = []

        for wave in chapter['waves']:
            analysis = self.analyze_wave(wave, current_tier)
            analyses.append(analysis)
            # Next wave starts with the tier we ended with
            current_tier = analysis.weapon_tier_end

        return analyses

    def print_report(self):
        """Generate and print the full balance report"""
        print("=" * 80)
        print("ZOMBOID ASSAULT - BALANCE ANALYSIS REPORT")
        print("=" * 80)
        print()

        for chapter in self.chapters:
            chapter_id = chapter['chapterId']
            chapter_name = chapter['chapterName']

            print(f"\n{'=' * 80}")
            print(f"[CHAPTER] {chapter_name} ({chapter_id})")
            print(f"{'=' * 80}")

            analyses = self.analyze_chapter(chapter)

            for analysis in analyses:
                print(f"\n[WAVE {analysis.wave_id}] {analysis.wave_name}")
                print(f"   Duration: {analysis.duration}s")
                print(f"   Weapon: Tier {analysis.weapon_tier_start}", end="")
                if analysis.weapon_tier_end != analysis.weapon_tier_start:
                    print(f" -> Tier {analysis.weapon_tier_end}")
                else:
                    print()
                print(f"   Total Enemy HP: {analysis.total_zomboid_hp:,}")
                print(f"   Damage Capacity: {analysis.damage_capacity:,.0f}")
                print(f"   Overkill Ratio: {analysis.overkill_ratio:.2f}x")
                print(f"   [GRADE]: {analysis.grade}")

                # Display bullet count metrics
                print(f"   Bullets Available: {analysis.bullets_available:,}")
                print(f"   Bullets Needed: {analysis.bullets_needed:,}")
                print(f"   Bullet Ratio: {analysis.bullet_ratio:.2f}x")
                print(f"   [BULLET GRADE]: {analysis.bullet_grade}")

                # Show details for problem waves
                show_details = analysis.overkill_ratio < 1.0 or "[Spawn Pressure!]" in analysis.grade or analysis.bullet_ratio < 1.3

                if analysis.overkill_ratio < 1.0:
                    deficit = analysis.total_zomboid_hp - analysis.damage_capacity
                    print(f"   [WARNING]: {deficit:.0f} damage SHORT! Wave may be too hard!")

                if analysis.bullet_ratio < 1.3:
                    print(f"   [WARNING]: Bullet ratio below recommended 1.3x threshold!")

                if show_details:
                    print("\n   Details:")
                    for detail in analysis.details:
                        print(f"   {detail}")

        # Summary statistics
        print(f"\n\n{'=' * 80}")
        print("[SUMMARY STATISTICS]")
        print(f"{'=' * 80}")

        all_analyses = []
        for chapter in self.chapters:
            all_analyses.extend(self.analyze_chapter(chapter))

        grades = {}
        bullet_grades = {}
        problem_waves = []
        bullet_problems = []

        for analysis in all_analyses:
            grade_letter = analysis.grade.split()[0]
            grades[grade_letter] = grades.get(grade_letter, 0) + 1

            bullet_grade_letter = analysis.bullet_grade.split()[0]
            bullet_grades[bullet_grade_letter] = bullet_grades.get(bullet_grade_letter, 0) + 1

            if analysis.overkill_ratio < 1.0:
                problem_waves.append(
                    f"  - {analysis.wave_name}: {analysis.overkill_ratio:.2f}x (needs {(1.0 - analysis.overkill_ratio) * 100:.0f}% more damage capacity)"
                )

            if analysis.bullet_ratio < 1.3:
                bullet_problems.append(
                    f"  - {analysis.wave_name}: {analysis.bullet_ratio:.2f}x (recommended: >=1.3x)"
                )

        print(f"\nTotal Waves Analyzed: {len(all_analyses)}")
        print("\nDPS Grade Distribution:")
        for grade in sorted(grades.keys()):
            print(f"  {grade}: {grades[grade]} waves")

        print("\nBullet Count Grade Distribution:")
        for grade in sorted(bullet_grades.keys()):
            print(f"  {grade}: {bullet_grades[grade]} waves")

        if problem_waves:
            print(f"\n[PROBLEM WAVES - DPS] ({len(problem_waves)} waves with overkill < 1.0):")
            for wave in problem_waves:
                print(wave)
        else:
            print("\n[SUCCESS - DPS] No problem waves detected! All waves appear balanced.")

        if bullet_problems:
            print(f"\n[PROBLEM WAVES - BULLETS] ({len(bullet_problems)} waves with bullet ratio < 1.3):")
            for wave in bullet_problems:
                print(wave)
        else:
            print("\n[SUCCESS - BULLETS] All waves meet the 1.3x bullet ratio threshold!")

        print("\n" + "=" * 80)
        print("END OF REPORT")
        print("=" * 80)

def main():
    # Determine config directory
    script_dir = Path(__file__).parent
    config_dir = script_dir / "public" / "config"

    if not config_dir.exists():
        print(f"Error: Config directory not found at {config_dir}")
        return

    analyzer = BalanceAnalyzer(config_dir)
    analyzer.load_configs()
    analyzer.print_report()

if __name__ == "__main__":
    main()
