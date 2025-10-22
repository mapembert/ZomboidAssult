# Story 5.2.1: Profile and Optimize Rendering

**Epic:** 5.2 Performance Optimization
**Phase:** 5 - Audio and Polish (Days 10-11)
**Estimated Time:** 4 hours
**Status:** 📋 READY TO START

## Description
Use Chrome DevTools Performance Profiler and Phaser's debug tools to identify rendering bottlenecks, optimize shape drawing, reduce draw calls, and ensure the game maintains 60 FPS on desktop and 30+ FPS on mid-range mobile devices during intense gameplay.

## User Story
**As a player**, I expect the game to run smoothly at 60 FPS so that my experience is fluid and responsive without lag or stuttering.

## Tasks
- [ ] Set up performance profiling tools
- [ ] Profile current performance (baseline metrics)
- [ ] Identify rendering bottlenecks
- [ ] Optimize Graphics object creation and caching
- [ ] Reduce draw calls where possible
- [ ] Implement render texture caching for static shapes
- [ ] Optimize sprite batching
- [ ] Test performance during heavy waves
- [ ] Verify 60 FPS on desktop
- [ ] Verify 30+ FPS on mid-range mobile
- [ ] Document optimization results

## Acceptance Criteria
- [ ] 60 FPS maintained on desktop Chrome (1920x1080)
- [ ] 30+ FPS on mid-range mobile (iPhone 8, Galaxy S9 equivalent)
- [ ] No frame drops during heavy waves (20+ zomboids, 50+ projectiles)
- [ ] Frame time < 16ms (60 FPS) on desktop
- [ ] Frame time < 33ms (30 FPS) on mobile
- [ ] Draw calls minimized (< 100 per frame)
- [ ] Profiler shows no obvious bottlenecks
- [ ] Game remains playable on lower-end devices

## Files to Create/Modify
- `src/utils/PerformanceMonitor.ts` - NEW: Performance monitoring utility
- `src/entities/Zomboid.ts` - Optimize rendering
- `src/entities/Projectile.ts` - Optimize rendering
- `src/entities/Hero.ts` - Optimize rendering
- `src/entities/Timer.ts` - Optimize rendering
- `src/scenes/GameScene.ts` - Add performance monitoring
- `src/utils/ShapeRenderer.ts` - Optimize shape drawing

## Dependencies
- All Phase 2-4 entities and systems (completed)
- Chrome DevTools (browser tool)

## Implementation Details

### Performance Profiling Setup

#### Chrome DevTools Performance Profiler
1. Open Chrome DevTools (F12)
2. Go to "Performance" tab
3. Click "Record" button
4. Play game for 30-60 seconds (including heavy waves)
5. Stop recording
6. Analyze:
   - **Main thread activity** (should be < 16ms per frame for 60 FPS)
   - **Rendering** (yellow bars - optimize if high)
   - **Scripting** (blue bars - your game code)
   - **GPU** (green bars - WebGL rendering)

**Key Metrics to Watch:**
- Frame rate (FPS)
- Frame time (ms per frame)
- JavaScript execution time
- Rendering time
- Draw calls

---

#### Phaser Debug Plugin
```typescript
// In main.ts or GameScene
const config: Phaser.Types.Core.GameConfig = {
  // ... existing config ...
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false,
    transparent: false,
  },
};
```

---

### PerformanceMonitor.ts (NEW)

```typescript
import Phaser from 'phaser';

export class PerformanceMonitor {
  private scene: Phaser.Scene;
  private fpsText: Phaser.GameObjects.Text | null = null;
  private frameTimeText: Phaser.GameObjects.Text | null = null;
  private drawCallsText: Phaser.GameObjects.Text | null = null;
  private entityCountText: Phaser.GameObjects.Text | null = null;

  private enabled: boolean = false;

  constructor(scene: Phaser.Scene, enabled: boolean = false) {
    this.scene = scene;
    this.enabled = enabled;

    if (this.enabled) {
      this.createDebugDisplay();
    }
  }

  private createDebugDisplay(): void {
    const { width } = this.scene.scale;

    // FPS display
    this.fpsText = this.scene.add.text(width - 120, 10, 'FPS: 60', {
      fontSize: '16px',
      color: '#00FF00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 },
    }).setDepth(9999);

    // Frame time display
    this.frameTimeText = this.scene.add.text(width - 120, 35, 'Frame: 16ms', {
      fontSize: '16px',
      color: '#00FF00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 },
    }).setDepth(9999);

    // Draw calls (estimated)
    this.drawCallsText = this.scene.add.text(width - 120, 60, 'Draws: 0', {
      fontSize: '16px',
      color: '#00FF00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 },
    }).setDepth(9999);

    // Entity count
    this.entityCountText = this.scene.add.text(width - 120, 85, 'Entities: 0', {
      fontSize: '16px',
      color: '#00FF00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 },
    }).setDepth(9999);
  }

  update(entityCount: number): void {
    if (!this.enabled) return;

    const fps = this.scene.game.loop.actualFps;
    const frameTime = this.scene.game.loop.delta;

    // Update FPS (color code: green > 55, yellow > 30, red < 30)
    const fpsColor = fps > 55 ? '#00FF00' : fps > 30 ? '#FFFF00' : '#FF0000';
    this.fpsText?.setText(`FPS: ${Math.round(fps)}`);
    this.fpsText?.setColor(fpsColor);

    // Update frame time
    const frameColor = frameTime < 20 ? '#00FF00' : frameTime < 35 ? '#FFFF00' : '#FF0000';
    this.frameTimeText?.setText(`Frame: ${Math.round(frameTime)}ms`);
    this.frameTimeText?.setColor(frameColor);

    // Update entity count
    this.entityCountText?.setText(`Entities: ${entityCount}`);

    // Draw calls estimation (Phaser doesn't expose this easily)
    const estimatedDraws = this.estimateDrawCalls();
    this.drawCallsText?.setText(`Draws: ~${estimatedDraws}`);
  }

  private estimateDrawCalls(): number {
    // Rough estimation based on display list
    const displayList = this.scene.children.list;
    let drawCalls = 0;

    displayList.forEach((obj) => {
      if (obj.visible) {
        // Graphics objects typically = 1 draw call each
        // Sprites in same texture atlas can be batched
        drawCalls++;
      }
    });

    return drawCalls;
  }

  toggle(): void {
    this.enabled = !this.enabled;

    if (this.enabled && !this.fpsText) {
      this.createDebugDisplay();
    } else if (!this.enabled) {
      this.fpsText?.destroy();
      this.frameTimeText?.destroy();
      this.drawCallsText?.destroy();
      this.entityCountText?.destroy();
      this.fpsText = null;
      this.frameTimeText = null;
      this.drawCallsText = null;
      this.entityCountText = null;
    }
  }
}
```

---

### Graphics Object Caching Optimization

**Problem:** Creating Graphics objects every frame is expensive.

**Solution:** Cache Graphics objects, redraw only when needed.

#### Zomboid.ts Optimization
```typescript
export class Zomboid extends Phaser.GameObjects.Container {
  private shapeGraphics: Phaser.GameObjects.Graphics;
  private shapeDirty: boolean = true; // Flag to redraw

  constructor(scene: Phaser.Scene, x: number, y: number, config: ZomboidType) {
    super(scene, x, y);

    // Create graphics object once
    this.shapeGraphics = scene.add.graphics();
    this.add(this.shapeGraphics);

    this.renderShape();
  }

  private renderShape(): void {
    if (!this.shapeDirty) return; // Skip if not dirty

    this.shapeGraphics.clear();

    // Draw shape using ShapeRenderer
    const fillColor = Phaser.Display.Color.HexStringToColor(this.config.color).color;
    const strokeColor = Phaser.Display.Color.HexStringToColor(this.config.outlineColor).color;

    switch (this.config.shape) {
      case 'circle':
        this.shapeGraphics.fillStyle(fillColor, 1);
        this.shapeGraphics.lineStyle(2, strokeColor, 1);
        this.shapeGraphics.fillCircle(0, 0, this.config.radius || 20);
        this.shapeGraphics.strokeCircle(0, 0, this.config.radius || 20);
        break;
      // ... other shapes ...
    }

    this.shapeDirty = false; // Mark as clean
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    // No need to redraw shape on damage (unless visual change needed)

    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  resetForPool(): void {
    this.shapeDirty = true; // Mark for redraw when reused
    this.renderShape();
    // ... existing reset code ...
  }
}
```

---

### Render Texture Optimization (Advanced)

For static/repeating shapes, use RenderTextures:

```typescript
export class ShapeCache {
  private static cache: Map<string, Phaser.GameObjects.RenderTexture> = new Map();

  static getOrCreateShape(
    scene: Phaser.Scene,
    key: string,
    width: number,
    height: number,
    drawFn: (graphics: Phaser.GameObjects.Graphics) => void
  ): Phaser.GameObjects.RenderTexture {
    if (!this.cache.has(key)) {
      const rt = scene.add.renderTexture(0, 0, width, height);
      const graphics = scene.add.graphics();
      drawFn(graphics);
      rt.draw(graphics);
      graphics.destroy();
      this.cache.set(key, rt);
    }

    return this.cache.get(key)!;
  }
}

// Usage in Zomboid:
const shapeTexture = ShapeCache.getOrCreateShape(
  scene,
  `zomboid_${config.id}`,
  config.radius * 2,
  config.radius * 2,
  (graphics) => {
    graphics.fillStyle(fillColor, 1);
    graphics.fillCircle(config.radius, config.radius, config.radius);
  }
);

// Use sprite instead of graphics
this.sprite = scene.add.sprite(0, 0, shapeTexture.texture.key);
```

---

### Reducing Draw Calls

**Batch Similar Objects:**
- Use sprite sheets for projectiles (all projectiles in one texture)
- Group Graphics objects into single RenderTexture where possible

**Minimize Transparency:**
- Avoid alpha < 1.0 on many objects (forces separate draw calls)

**Reduce Container Depth:**
- Flatten Container hierarchies where possible

---

### GameScene.ts Integration

```typescript
import { PerformanceMonitor } from '@/utils/PerformanceMonitor';

export class GameScene extends Phaser.Scene {
  private perfMonitor: PerformanceMonitor | null = null;

  create(): void {
    // ... existing code ...

    // Enable performance monitor in debug mode
    const gameSettings = this.registry.get('gameSettings');
    const debugMode = gameSettings?.gameSettings?.debugMode || false;

    this.perfMonitor = new PerformanceMonitor(this, debugMode);

    // Toggle with F3 key
    this.input.keyboard?.on('keydown-F3', () => {
      this.perfMonitor?.toggle();
    });
  }

  update(time: number, delta: number): void {
    // ... existing game logic ...

    // Update performance monitor
    if (this.perfMonitor && this.waveManager) {
      const entityCount =
        this.waveManager.getActiveZomboidCount() +
        this.weaponSystem.getActiveProjectileCount() +
        this.heroManager.getHeroCount();

      this.perfMonitor.update(entityCount);
    }
  }
}
```

---

## Optimization Checklist

### Rendering Optimizations
- [ ] Cache Graphics objects (don't recreate every frame)
- [ ] Use RenderTextures for static shapes
- [ ] Batch similar sprites (use sprite sheets)
- [ ] Minimize transparency usage
- [ ] Reduce container nesting depth
- [ ] Disable unused Phaser features

### Code Optimizations
- [ ] Avoid creating objects in update loop
- [ ] Use object pooling (already implemented)
- [ ] Cache frequently accessed values
- [ ] Minimize array iterations in update()
- [ ] Use `const` and `let` appropriately

### Visual Optimizations
- [ ] Reduce particle count on mobile
- [ ] Simplify effects on lower-end devices
- [ ] Limit simultaneous tweens (< 50)
- [ ] Cull off-screen objects (already handled by Phaser)

---

## Performance Testing

### Desktop Test (Chrome, 1920x1080)
**Test Scenario:**
- Chapter 2, Wave 1
- 20 zomboids on screen
- 50+ projectiles active
- 3 heroes
- All effects enabled

**Target Metrics:**
- FPS: 60
- Frame time: < 16ms
- No frame drops

---

### Mobile Test (iPhone 8 / Galaxy S9 equivalent)
**Test Scenario:**
- Same as desktop
- Reduce particle effects

**Target Metrics:**
- FPS: 30+
- Frame time: < 33ms
- Playable without lag

---

### Stress Test
**Test Scenario:**
- Chapter 3 (if exists)
- Max weapon tier (mega_machine_gun)
- 30+ zomboids
- 100+ projectiles
- All effects active

**Target Metrics:**
- Desktop: 45+ FPS
- Mobile: 25+ FPS

---

## Profiling Results Documentation

Create a performance report:

```markdown
# Performance Optimization Report

## Baseline (Before Optimization)
- Desktop FPS: XX
- Mobile FPS: XX
- Frame time (desktop): XXms
- Frame time (mobile): XXms
- Draw calls: ~XXX

## Bottlenecks Identified
1. [Bottleneck description]
2. [Bottleneck description]

## Optimizations Applied
1. [Optimization description]
   - Before: XX FPS
   - After: XX FPS
   - Improvement: XX%

## Final Results (After Optimization)
- Desktop FPS: XX (+XX%)
- Mobile FPS: XX (+XX%)
- Frame time (desktop): XXms (-XX%)
- Frame time (mobile): XXms (-XX%)
- Draw calls: ~XXX (-XX%)

## Recommendations
- [Future optimization opportunities]
```

---

## Success Metrics
- ✅ 60 FPS on desktop during normal gameplay
- ✅ 30+ FPS on mid-range mobile
- ✅ < 16ms frame time on desktop
- ✅ No frame drops during heavy waves
- ✅ Draw calls minimized
- ✅ Performance monitor implemented

## Next Steps
After completion:
- Story 5.2.2: Optimize Object Pooling
- Story 5.2.3: Mobile Testing and Optimization

## Notes
- Profiling is iterative - may need multiple passes
- Focus on biggest bottlenecks first (80/20 rule)
- Don't over-optimize at expense of code clarity
- Test on actual mobile devices, not just emulators
- Performance can vary by browser/device - test widely
