# Story 3.2.1: Implement Weapon Upgrade Logic

**Epic:** 3.2 Weapon Upgrade System
**Phase:** 3 - Timer and Upgrade Systems (Days 6-7)
**Estimated Time:** 2.5 hours
**Status:** ⏳ PENDING

## Description
Extend `src/systems/WeaponSystem.ts` to implement weapon progression through tiers, add upgradeWeapon() method to load next tier configuration, apply new weapon properties (projectile count, spread, fire rate, damage), and display upgrade notification to the player.

## Tasks
- [ ] Add currentWeaponTier property to WeaponSystem
- [ ] Create weapon tier progression array (single_gun → double_gun → triple_gun → pulse_laser → mega_machine_gun)
- [ ] Implement upgradeWeapon() method
- [ ] Load next tier weapon config from ConfigLoader
- [ ] Apply new weapon properties to active weapon
- [ ] Update projectile pool size if needed
- [ ] Emit 'weapon_upgraded' event with new weapon info
- [ ] Add getCurrentWeaponTier() getter method
- [ ] Handle max tier (cannot upgrade beyond mega_machine_gun)

## Acceptance Criteria
- [ ] Weapon tier increases on upgrade() call
- [ ] New projectile properties applied immediately
- [ ] Fire rate updates to new weapon config
- [ ] Projectile count matches new weapon tier
- [ ] Spread angle changes correctly
- [ ] Upgrade persists through waves
- [ ] Cannot upgrade beyond max tier
- [ ] Event emitted with upgrade details
- [ ] TypeScript compiles without errors

## Files Created/Modified
- `src/systems/WeaponSystem.ts` (modified)
- `src/scenes/GameScene.ts` (modified to display upgrade notification)

## Dependencies
- Story 2.2.3: Implement WeaponSystem (base weapon implementation)
- Story 1.2.2: Implement ConfigLoader System (to load weapon configs)
- `config/entities/weapons.json` (all weapon tier configurations)

## Implementation Details

### Weapon Tier Progression
```typescript
const WEAPON_TIERS = [
  'single_gun',        // Tier 0 (starting weapon)
  'double_gun',        // Tier 1
  'triple_gun',        // Tier 2
  'pulse_laser',       // Tier 3
  'mega_machine_gun'   // Tier 4 (max tier)
];
```

### WeaponSystem Extension
```typescript
class WeaponSystem {
  private currentWeaponTier: number = 0; // Start at tier 0
  private readonly maxWeaponTier: number = 4;
  private weaponConfigs: Map<string, WeaponType>;
  private currentWeaponConfig: WeaponType;

  constructor(scene: Phaser.Scene, configLoader: ConfigLoader) {
    // Load all weapon configs
    this.weaponConfigs = new Map();
    WEAPON_TIERS.forEach(tierName => {
      const config = configLoader.getWeaponConfig(tierName);
      this.weaponConfigs.set(tierName, config);
    });

    // Start with single_gun
    this.currentWeaponConfig = this.weaponConfigs.get('single_gun');
  }

  upgradeWeapon(): boolean {
    if (this.currentWeaponTier >= this.maxWeaponTier) {
      // Already at max tier
      return false;
    }

    // Upgrade to next tier
    this.currentWeaponTier++;
    const newTierName = WEAPON_TIERS[this.currentWeaponTier];
    this.currentWeaponConfig = this.weaponConfigs.get(newTierName);

    // Apply new weapon properties
    this.applyWeaponConfig(this.currentWeaponConfig);

    // Emit upgrade event
    this.scene.events.emit('weapon_upgraded', {
      tier: this.currentWeaponTier,
      weaponName: newTierName,
      config: this.currentWeaponConfig
    });

    return true;
  }

  private applyWeaponConfig(config: WeaponType): void {
    // Update fire rate, projectile count, spread, etc.
    this.fireRate = config.fireRate;
    this.projectileCount = config.projectileCount;
    this.spreadAngle = config.spreadAngle;
    this.projectileSpeed = config.projectileSpeed;
    this.projectileDamage = config.damage;
    this.projectileColor = config.projectile.color;
  }

  getCurrentWeaponTier(): number {
    return this.currentWeaponTier;
  }

  getCurrentWeaponName(): string {
    return WEAPON_TIERS[this.currentWeaponTier];
  }

  isMaxTier(): boolean {
    return this.currentWeaponTier >= this.maxWeaponTier;
  }
}
```

### Weapon Tier Specifications
From `config/entities/weapons.json`:

**Tier 0 - single_gun:**
- projectileCount: 1
- fireRate: 0.3 (fires every 300ms)
- spreadAngle: 0
- damage: 10

**Tier 1 - double_gun:**
- projectileCount: 2
- fireRate: 0.3
- spreadAngle: 15 degrees
- damage: 10

**Tier 2 - triple_gun:**
- projectileCount: 3
- fireRate: 0.3
- spreadAngle: 20 degrees
- damage: 15

**Tier 3 - pulse_laser:**
- projectileCount: 5
- fireRate: 0.2 (faster)
- spreadAngle: 30 degrees
- damage: 20

**Tier 4 - mega_machine_gun:**
- projectileCount: 7
- fireRate: 0.1 (very fast)
- spreadAngle: 25 degrees
- damage: 25

### Upgrade Event Structure
```typescript
interface WeaponUpgradedEvent {
  tier: number;
  weaponName: string;
  config: WeaponType;
}
```

### Visual Notification (in GameScene)
```typescript
// In GameScene.create()
this.events.on('weapon_upgraded', this.handleWeaponUpgrade, this);

private handleWeaponUpgrade(data: WeaponUpgradedEvent): void {
  // Show upgrade notification
  const notification = this.add.text(
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 2,
    `Weapon Upgraded!\n${this.formatWeaponName(data.weaponName)}`,
    {
      fontSize: '36px',
      color: '#18FFFF',
      align: 'center',
      fontStyle: 'bold'
    }
  ).setOrigin(0.5);

  // Animate notification
  this.tweens.add({
    targets: notification,
    scale: { from: 0, to: 1 },
    alpha: { from: 1, to: 0 },
    duration: 2000,
    ease: 'Back.easeOut',
    onComplete: () => notification.destroy()
  });

  // Update HUD
  this.hud?.updateWeaponDisplay(data.weaponName);
}

private formatWeaponName(name: string): string {
  return name.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

### Projectile Visual Changes
Different weapon tiers should have visually distinct projectiles:
```typescript
// Update projectile appearance based on weapon tier
private updateProjectileAppearance(): void {
  const colors = {
    single_gun: 0x18FFFF,      // Cyan
    double_gun: 0x03DAC6,      // Teal
    triple_gun: 0x00E676,      // Green
    pulse_laser: 0xFFEA00,     // Yellow
    mega_machine_gun: 0xFF5252 // Red
  };

  this.projectileColor = colors[this.getCurrentWeaponName()];
}
```

## Testing Checklist
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Weapon starts at tier 0 (single_gun)
- [ ] upgradeWeapon() advances to next tier
- [ ] All 5 weapon tiers load correctly
- [ ] Projectile count changes with tier
- [ ] Fire rate updates correctly
- [ ] Spread angle applied accurately
- [ ] Cannot upgrade beyond tier 4
- [ ] Event emitted on each upgrade
- [ ] Visual notification displays
- [ ] HUD shows current weapon name

## Integration Notes
- This story provides the core upgrade logic
- Story 3.2.2 connects this to weapon_upgrade_timer exits
- Story 3.2.3 validates all tiers work correctly
- Phase 4 HUD will display current weapon tier

## Next Story
Story 3.2.2: Create Weapon Upgrade Timer Type
