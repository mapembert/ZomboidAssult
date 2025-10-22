# Story 3.2.2: Create Weapon Upgrade Timer Type

**Epic:** 3.2 Weapon Upgrade System
**Phase:** 3 - Timer and Upgrade Systems (Days 6-7)
**Estimated Time:** 2 hours
**Status:** ⏳ PENDING

## Description
Integrate weapon upgrade functionality with the existing timer system by using the weapon_upgrade_timer configuration, modifying the Timer class to support upgrade outcomes, triggering weapon upgrades when weapon_upgrade_timer exits with positive value, and displaying "Weapon Upgraded!" notification.

## Tasks
- [ ] Verify weapon_upgrade_timer config exists in timers.json
- [ ] Add getTimerType() method to Timer class
- [ ] Update GameScene timer exit handler to process weapon_upgrade_timer
- [ ] Call WeaponSystem.upgradeWeapon() on positive timer exit
- [ ] Display upgrade feedback message
- [ ] Handle edge case: already at max weapon tier
- [ ] Test weapon upgrade via timer in actual gameplay
- [ ] Verify upgrade persists across waves

## Acceptance Criteria
- [ ] weapon_upgrade_timer works identically to hero_count_timer mechanically
- [ ] Positive exit value triggers weapon upgrade
- [ ] Negative exit value has no effect (weapons cannot downgrade)
- [ ] Upgrade notification displays clearly
- [ ] At max tier, positive timer gives "Already Max!" message
- [ ] All weapon tiers accessible via upgrade timers
- [ ] Visual feedback clear and informative
- [ ] TypeScript compiles without errors

## Files Created/Modified
- `src/entities/Timer.ts` (modified - add getTimerType method if not present)
- `src/scenes/GameScene.ts` (modified - extend timer exit handler)
- `config/entities/timers.json` (verify weapon_upgrade_timer exists)

## Dependencies
- Story 3.1.1: Create Timer Entity Class
- Story 3.1.2: Implement Timer Spawning in WaveManager
- Story 3.1.4: Implement Timer Exit and Hero Modification (timer exit infrastructure)
- Story 3.2.1: Implement Weapon Upgrade Logic
- `config/entities/timers.json` (weapon_upgrade_timer configuration)

## Implementation Details

### Timer Configuration
Verify `config/entities/timers.json` contains:
```json
{
  "weapon_upgrade_timer": {
    "id": "weapon_upgrade_timer",
    "name": "Weapon Upgrade",
    "sprite": {
      "width": 40,
      "height": 1280,
      "negativeColor": "#CF6679",
      "positiveColor": "#FFEA00",
      "outlineColor": "#18FFFF",
      "outlineWidth": 2
    },
    "initialValue": 3,
    "incrementValue": 1,
    "speed": 100
  }
}
```

### Timer Class Extension
```typescript
class Timer extends Phaser.GameObjects.Container {
  private timerType: string; // 'hero_count_timer' or 'weapon_upgrade_timer'

  constructor(scene, x, y, timerConfig, columnIndex) {
    super(scene, x, y);
    this.timerType = timerConfig.id;
    // ... rest of constructor
  }

  getTimerType(): string {
    return this.timerType;
  }
}
```

### GameScene Timer Exit Handler Extension
```typescript
private handleTimerExit(data: TimerExitEvent): void {
  const { timerType, finalValue } = data;

  if (timerType === 'hero_count_timer') {
    // Existing hero count logic from Story 3.1.4
    if (finalValue > 0) {
      this.heroManager.addHeroes(finalValue);
      this.showFeedback(`+${finalValue} Heroes!`, 0x03DAC6);
    } else if (finalValue < 0) {
      this.heroManager.removeHeroes(Math.abs(finalValue));
      this.showFeedback(`${finalValue} Heroes`, 0xCF6679);
    }
  }
  else if (timerType === 'weapon_upgrade_timer') {
    // New weapon upgrade logic
    if (finalValue > 0) {
      const upgraded = this.weaponSystem.upgradeWeapon();

      if (upgraded) {
        this.showFeedback('Weapon Upgraded!', 0xFFEA00);

        // Optional: show weapon tier
        const tierInfo = this.weaponSystem.getCurrentWeaponName();
        this.showWeaponTierNotification(tierInfo);
      } else {
        // Already at max tier
        this.showFeedback('Max Weapon Tier!', 0xFF5252);
      }
    } else {
      // Negative values do nothing for weapon timers
      this.showFeedback('Weapon Not Upgraded', 0xCF6679);
    }
  }
}

private showWeaponTierNotification(weaponName: string): void {
  const formatted = this.formatWeaponName(weaponName);

  const notification = this.add.text(
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT * 0.4,
    formatted,
    {
      fontSize: '28px',
      color: '#FFEA00',
      align: 'center',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }
  ).setOrigin(0.5);

  this.tweens.add({
    targets: notification,
    y: notification.y - 50,
    alpha: { from: 1, to: 0 },
    duration: 2000,
    ease: 'Cubic.easeOut',
    onComplete: () => notification.destroy()
  });
}
```

### Weapon Upgrade Timer Color Scheme
Use distinctive yellow/gold colors for weapon upgrade timers:
- Positive value: #FFEA00 (bright yellow)
- Negative value: #CF6679 (red)
- Outline: #18FFFF (cyan)

This visually distinguishes weapon timers from hero timers.

### Wave Configuration Example
Example wave config with both timer types:
```json
{
  "wave": 2,
  "duration": 90,
  "zomboidSpawns": [...],
  "timerSpawns": [
    {
      "time": 20,
      "timerType": "hero_count_timer",
      "column": 0,
      "initialValue": -2
    },
    {
      "time": 45,
      "timerType": "weapon_upgrade_timer",
      "column": 1,
      "initialValue": 3
    },
    {
      "time": 70,
      "timerType": "weapon_upgrade_timer",
      "column": 0,
      "initialValue": 4
    }
  ]
}
```

### Player Strategy
Players must decide:
1. **Shoot hero timer** → Increase hero count for more firepower
2. **Shoot weapon timer** → Upgrade weapon for better projectiles
3. **Ignore timer** → Let it fall with initial value

This creates strategic depth: spread fire vs. focused fire.

### Visual Distinction
To help players distinguish timer types at a glance:
- Hero timers: Blue/cyan theme
- Weapon timers: Yellow/gold theme
- Both display counter prominently

## Testing Checklist
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] weapon_upgrade_timer spawns correctly
- [ ] Timer uses yellow color scheme
- [ ] Positive exit triggers weapon upgrade
- [ ] Upgrade notification displays
- [ ] Current weapon name shown after upgrade
- [ ] Max tier prevents further upgrades
- [ ] Negative timer exit shows appropriate message
- [ ] Works in combination with hero timers
- [ ] Weapon upgrade persists through waves

## Gameplay Testing Scenarios
1. **Single upgrade**: Start wave → upgrade timer spawns → shoot to positive → verify upgrade
2. **Multiple upgrades**: Spawn 3 weapon timers in one wave → upgrade from tier 0 to tier 3
3. **Max tier handling**: Upgrade to tier 4 → spawn another weapon timer → verify "Max Tier" message
4. **Negative exit**: Ignore weapon timer (let fall with positive value) → verify weapon stays same
5. **Mixed timers**: Spawn both hero and weapon timers → verify both work correctly

## Next Story
Story 3.2.3: Test All Weapon Tiers
