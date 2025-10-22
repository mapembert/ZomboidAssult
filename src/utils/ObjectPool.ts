/**
 * Generic Object Pool for efficient object reuse
 * Reduces garbage collection overhead by reusing objects
 */
export class ObjectPool<T> {
  private available: T[];
  private inUse: Set<T>;
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  /**
   * Create an object pool
   * @param createFn Function to create new objects
   * @param resetFn Function to reset object state when returned to pool
   * @param initialSize Number of objects to pre-allocate
   */
  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.available = [];
    this.inUse = new Set<T>();

    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.createFn());
    }
  }

  /**
   * Acquire an object from the pool
   * Creates a new object if pool is empty
   */
  acquire(): T {
    let obj: T;

    // Get from pool or create new
    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      // Pool exhausted, create new object dynamically
      obj = this.createFn();
      console.warn('ObjectPool exhausted, creating new object dynamically');
    }

    // Track as in-use
    this.inUse.add(obj);
    return obj;
  }

  /**
   * Release an object back to the pool
   */
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

  /**
   * Get number of active (in-use) objects
   */
  getActiveCount(): number {
    return this.inUse.size;
  }

  /**
   * Get number of available objects in pool
   */
  getAvailableCount(): number {
    return this.available.length;
  }

  /**
   * Get total number of objects (active + available)
   */
  getTotalCount(): number {
    return this.inUse.size + this.available.length;
  }

  /**
   * Clear the pool (warning: does not destroy objects)
   */
  clear(): void {
    this.available = [];
    this.inUse.clear();
  }

  /**
   * Get pool statistics for debugging
   */
  getStats(): { active: number; available: number; total: number } {
    return {
      active: this.getActiveCount(),
      available: this.getAvailableCount(),
      total: this.getTotalCount(),
    };
  }
}
