import Phaser from 'phaser';
import { Projectile } from '@/entities/Projectile';
import { ObjectPool } from '@/utils/ObjectPool';
import { AudioManager } from '@/systems/AudioManager';
import type { WeaponType } from '@/types/ConfigTypes';

export class WeaponSystem {
  private scene: Phaser.Scene;
  private currentWeapon: WeaponType;
  private weaponTiers: WeaponType[];
  private projectilePool: ObjectPool<Projectile>;
  private activeProjectiles: Projectile[];
  private lastFireTime: number;
  private audioManager: AudioManager;
  private lastFireSoundTime: number = 0;
  private fireSoundThrottle: number = 50; // ms, prevent overlap

  constructor(scene: Phaser.Scene, weaponTiers: WeaponType[], startingWeaponTier?: number) {
    this.scene = scene;
    this.weaponTiers = weaponTiers.sort((a, b) => a.tier - b.tier);

    // Start with the specified tier or tier 1
    const tierToStart = startingWeaponTier ?? 1;
    const startingWeapon = this.weaponTiers.find(w => w.tier === tierToStart);
    this.currentWeapon = startingWeapon || this.weaponTiers[0];
    console.log(`WeaponSystem: Starting with Tier ${this.currentWeapon.tier} - ${this.currentWeapon.name}`);

    this.activeProjectiles = [];
    this.lastFireTime = 0;

    // Initialize AudioManager
    this.audioManager = AudioManager.getInstance();
    this.audioManager.initialize(scene);

    // Create projectile pool (100 projectiles initially)
    this.projectilePool = new ObjectPool<Projectile>(
      () => new Projectile(this.scene),
      (projectile: Projectile) => {
        projectile.setActive(false);
        projectile.setVisible(false);
      },
      100
    );
  }

  /**
   * Set weapon by ID
   */
  setWeapon(weaponId: string): void {
    const weapon = this.weaponTiers.find((w) => w.id === weaponId);
    if (weapon) {
      this.currentWeapon = weapon;
      console.log(`Weapon set to: ${weapon.name} (Tier ${weapon.tier})`);
    }
  }

  /**
   * Check if weapon can fire based on fire rate
   */
  canFire(): boolean {
    const currentTime = this.scene.time.now;
    const timeSinceLastFire = (currentTime - this.lastFireTime) / 1000;
    return timeSinceLastFire >= this.currentWeapon.fireRate;
  }

  /**
   * Fire projectiles from multiple positions (hero positions)
   */
  fire(positions: { x: number; y: number }[]): void {
    if (!this.canFire()) return;

    // Fire from each position
    positions.forEach((pos) => {
      this.fireFromPosition(pos.x, pos.y);
    });

    // Play projectile fire sound (throttled to prevent overlap)
    const now = this.scene.time.now;
    if (now - this.lastFireSoundTime >= this.fireSoundThrottle) {
      this.audioManager.playSFX('projectile_fire', {
        volume: 0.2,
        detune: Phaser.Math.Between(-100, 100), // Pitch variation
      });
      this.lastFireSoundTime = now;
    }

    // Update last fire time
    this.lastFireTime = this.scene.time.now;
  }

  /**
   * Fire projectiles from a single position
   */
  private fireFromPosition(x: number, y: number): void {
    const count = this.currentWeapon.projectileCount;
    const spacing = 15; // Horizontal spacing between projectiles (pixels)

    for (let i = 0; i < count; i++) {
      // Calculate horizontal offset for side-by-side positioning
      let offsetX = 0;

      if (count === 1) {
        // Single projectile - center
        offsetX = 0;
      } else {
        // Multiple projectiles - distribute horizontally
        const totalWidth = (count - 1) * spacing;
        offsetX = -totalWidth / 2 + i * spacing;
      }

      // All projectiles fire straight up (angle = 0)
      const angle = 0;

      // Acquire projectile from pool
      const projectile = this.projectilePool.acquire();
      projectile.fire(x + offsetX, y, angle, this.currentWeapon);
      this.activeProjectiles.push(projectile);
    }
  }

  /**
   * Update all active projectiles
   */
  update(_time: number, delta: number): void {
    // Update all active projectiles (iterate backwards for safe removal)
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const projectile = this.activeProjectiles[i];
      projectile.update(delta);

      // Check if projectile should be removed
      if (!projectile.active || projectile.isOffScreen()) {
        // Return to pool
        this.projectilePool.release(projectile);
        this.activeProjectiles.splice(i, 1);
      }
    }
  }

  /**
   * Upgrade weapon to next tier
   */
  upgradeWeapon(): boolean {
    const currentTier = this.currentWeapon.tier;
    const nextWeapon = this.weaponTiers.find((w) => w.tier === currentTier + 1);

    if (nextWeapon) {
      this.currentWeapon = nextWeapon;
      console.log(`Weapon upgraded to ${nextWeapon.name} (Tier ${nextWeapon.tier})`);

      // Emit weapon upgraded event
      this.scene.events.emit('weapon_upgraded', {
        tier: nextWeapon.tier,
        weaponName: nextWeapon.name,
        weaponId: nextWeapon.id,
        config: nextWeapon
      });

      return true;
    }

    console.log('Already at max weapon tier');
    return false; // Already at max tier
  }

  /**
   * Upgrade weapon to a specific tier
   */
  upgradeToTier(targetTier: number): boolean {
    const targetWeapon = this.weaponTiers.find((w) => w.tier === targetTier + 1); // tier is 1-based, targetTier is 0-based

    if (targetWeapon && targetWeapon.tier > this.currentWeapon.tier) {
      this.currentWeapon = targetWeapon;
      console.log(`Weapon upgraded to ${targetWeapon.name} (Tier ${targetWeapon.tier})`);

      // Emit weapon upgraded event
      this.scene.events.emit('weapon_upgraded', {
        tier: targetWeapon.tier,
        weaponName: targetWeapon.name,
        weaponId: targetWeapon.id,
        config: targetWeapon
      });

      return true;
    }

    if (targetWeapon && targetWeapon.tier <= this.currentWeapon.tier) {
      console.log(`Cannot downgrade weapon from tier ${this.currentWeapon.tier} to tier ${targetWeapon.tier}`);
    } else {
      console.log(`Target weapon tier ${targetTier + 1} not found`);
    }

    return false;
  }

  /**
   * Downgrade weapon to previous tier
   */
  downgradeWeapon(): boolean {
    const currentTier = this.currentWeapon.tier;
    const prevWeapon = this.weaponTiers.find((w) => w.tier === currentTier - 1);

    if (prevWeapon) {
      this.currentWeapon = prevWeapon;
      console.log(`Weapon downgraded to ${prevWeapon.name} (Tier ${prevWeapon.tier})`);
      return true;
    }

    console.log('Already at min weapon tier');
    return false;
  }

  /**
   * Get current weapon
   */
  getCurrentWeapon(): WeaponType {
    return this.currentWeapon;
  }

  /**
   * Get all active projectiles
   */
  getActiveProjectiles(): Projectile[] {
    return this.activeProjectiles;
  }

  /**
   * Get pool statistics
   */
  getPoolStats(): { active: number; available: number; total: number } {
    return this.projectilePool.getStats();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    // Clear all active projectiles
    this.activeProjectiles.forEach((projectile) => {
      projectile.destroy();
    });
    this.activeProjectiles = [];

    // Clear pool
    this.projectilePool.clear();
  }
}
