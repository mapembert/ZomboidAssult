# Story 2.2.2: Implement ObjectPool Utility

**Epic:** 2.2 Weapon and Projectile System
**Phase:** 2 - Core Gameplay Mechanics (Days 3-5)
**Estimated Time:** 2 hours
**Status:** ✅ COMPLETED

## Description
Create `src/utils/ObjectPool.ts` generic utility class for object pooling. Pre-allocates objects in constructor, provides acquire() to get available objects, release() to return objects to pool, and tracks active vs. pooled objects to prevent memory leaks and reduce garbage collection.

## Tasks
- [x] Create `src/utils/ObjectPool.ts` generic class
- [x] Implement constructor with pre-allocation
- [x] Implement acquire() method to get object from pool
- [x] Implement release() method to return object to pool
- [x] Track active vs. pooled objects
- [x] Add getActiveCount() method
- [x] Add getPoolSize() method
- [x] Ensure no memory leaks (objects properly released)

## Acceptance Criteria
- [x] Pool creates initial objects on construction
- [x] acquire() returns available object from pool
- [x] acquire() creates new object if pool is empty (optional expansion)
- [x] release() returns object to pool correctly
- [x] No memory leaks (all acquired objects can be released)
- [x] getActiveCount() returns correct count
- [x] Works with any object type (generic implementation)
- [x] No runtime errors

## Files Created/Modified
- `src/utils/ObjectPool.ts` ✅ Created

## Dependencies
- None (pure TypeScript utility) ✅

## Implementation Details

### Object Pool Pattern
The ObjectPool manages a pool of reusable objects:
1. **Pre-allocation:** Create N objects at initialization ✅
2. **Acquire:** Return inactive object from pool (or create new if empty) ✅
3. **Release:** Mark object as inactive and return to pool ✅
4. **Tracking:** Count active vs. inactive objects ✅

### Generic Type Support
Uses TypeScript generics to work with any object type:
```typescript
class ObjectPool<T> {
  private available: T[];
  private inUse: Set<T>;
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number);
}
```

### Core Methods

**Constructor:**
```typescript
constructor(
  createFn: () => T,      // Function to create new object
  resetFn: (obj: T) => void,  // Function to reset object state
  initialSize: number     // Number of objects to pre-allocate
) {
  this.createFn = createFn;
  this.resetFn = resetFn;
  this.available = [];
  this.inUse = new Set();

  // Pre-allocate objects
  for (let i = 0; i < initialSize; i++) {
    this.available.push(this.createFn());
  }
}
```

**Acquire:**
```typescript
acquire(): T {
  let obj: T;

  // Get from pool or create new
  if (this.available.length > 0) {
    obj = this.available.pop()!;
  } else {
    obj = this.createFn();
    console.warn('ObjectPool exhausted, creating new object dynamically');
  }

  // Track as in-use
  this.inUse.add(obj);
  return obj;
}
```

**Release:**
```typescript
release(obj: T): void {
  // Ensure object is actually in use
  if (!this.inUse.has(obj)) {
    console.warn('Attempting to release object not from this pool');
    return;
  }

  // Reset object state
  this.resetFn(obj);

  // Move from in-use to available
  this.inUse.delete(obj);
  this.available.push(obj);
}
```

### Class Interface
```typescript
class ObjectPool<T> {
  private available: T[];
  private inUse: Set<T>;
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize: number
  );

  acquire(): T;
  release(obj: T): void;
  getActiveCount(): number;
  getAvailableCount(): number;
  getTotalCount(): number;
  getStats(): { active: number; available: number; total: number };
  clear(): void;
}
```

### Usage Example (Projectile Pool)
```typescript
// In WeaponSystem
const projectilePool = new ObjectPool<Projectile>(
  // Create function
  () => new Projectile(this.scene),

  // Reset function
  (projectile: Projectile) => {
    projectile.setActive(false);
    projectile.setVisible(false);
  },

  // Initial size
  100
);

// Acquire projectile
const projectile = projectilePool.acquire();
projectile.fire(x, y, angle, weaponConfig);

// Later, when projectile is off-screen
projectilePool.release(projectile);
```

### Memory Management
Benefits of object pooling:
- **Reduced GC:** Reuse objects instead of creating/destroying ✅
- **Consistent Performance:** No allocation spikes ✅
- **Memory Efficiency:** Pre-allocated pool size ✅
- **60 FPS Target:** Minimize garbage collection pauses ✅

### Pool Size Guidelines
Recommended pool sizes for Zomboid Assault:
- **Projectiles:** 100-200 (rapid fire weapons) - Set to 100 initially ✅
- **Zomboids:** 50-100 (wave spawning) - Future implementation
- **Timers:** 10-20 (occasional spawns) - Future implementation

### Error Handling
Handles edge cases:
1. Releasing object not from pool → warn and ignore ✅
2. Pool expansion when empty → create new object dynamically ✅
3. Clear pool on scene shutdown → prevent memory leaks ✅

## Testing Results
✅ TypeScript compilation successful
✅ ESLint checks passed
✅ ObjectPool class created with full generic type support
✅ Pre-allocation working (100 projectiles created on initialization)
✅ acquire() method returns objects from pool
✅ release() method returns objects to pool correctly
✅ Tracking methods (getActiveCount, getAvailableCount, getTotalCount) implemented
✅ getStats() method provides debugging information
✅ clear() method for cleanup implemented
✅ Dynamic expansion works when pool exhausted
✅ Warning logs for edge cases (exhaustion, invalid release)

## Next Story
Story 2.2.3: Implement WeaponSystem
