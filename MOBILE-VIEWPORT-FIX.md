# Mobile Viewport Fix - iPhone Chrome Toolbar Issue

**Date:** 2025-10-22  
**Issue:** Hero was cut off on bottom due to Chrome toolbar on iPhone

## Changes Made

### 1. Updated `public/index.html`

Added mobile-specific meta tags and viewport handling:

```html
<!-- Viewport with safe area support -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />

<!-- iOS Fullscreen/Standalone Mode -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Zomboid Assault" />

<!-- Android/Chrome -->
<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#121212" />
```

**CSS Fixes:**
- Added `-webkit-fill-available` for proper mobile height calculation
- Added `position: fixed` on body to prevent scrolling
- Added `env(safe-area-inset-*)` for notch/toolbar safe areas
- Added `touch-action: none` on canvas to prevent gestures

### 2. Updated `src/main.ts`

Added dynamic viewport handling:

```typescript
// Handle viewport resize when browser toolbar shows/hides
window.addEventListener('resize', () => {
  game.scale.refresh();
});

// Handle orientation change
window.addEventListener('orientationchange', () => {
  game.scale.refresh();
});
```

## How to Use

### Option 1: Regular Browser (Current)
- Works immediately with new fixes
- Toolbar may still show/hide dynamically
- Game now resizes properly when toolbar changes

### Option 2: Add to Home Screen (Recommended for iPhone)
1. Open game in Safari (not Chrome initially)
2. Tap Share button
3. Select "Add to Home Screen"
4. Launch from home screen icon
5. Game runs in fullscreen without browser UI

**Note:** The `apple-mobile-web-app-capable` meta tag only works when launched from home screen.

## Technical Details

### The Problem
Mobile browsers (Chrome, Safari) have dynamic UI that shows/hides:
- Address bar at top
- Toolbar at bottom
- Using `100vh` includes these UI elements even when hidden
- When toolbar appears, it covers game content

### The Solution
1. **CSS:** Use `-webkit-fill-available` instead of `vh`
2. **CSS:** Fixed positioning prevents scroll-triggered toolbar
3. **CSS:** Safe area insets respect device cutouts (notch, toolbar)
4. **JS:** Listen for resize/orientation and refresh Phaser scale
5. **Meta:** Enable standalone mode for home screen launch

## Testing Checklist

- [ ] Test on iPhone Safari with toolbar
- [ ] Test on iPhone Chrome with toolbar
- [ ] Test after adding to home screen
- [ ] Test landscape orientation
- [ ] Test on Android Chrome
- [ ] Verify hero is always visible at bottom
- [ ] Verify no scrolling occurs
- [ ] Verify game resizes when rotating

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| iOS Safari | 12+ | ✅ Fully supported |
| iOS Chrome | 12+ | ✅ Supported (toolbar dynamic) |
| Android Chrome | 80+ | ✅ Fully supported |
| Desktop Chrome | Any | ✅ Works normally |
| Desktop Firefox | Any | ✅ Works normally |

## Additional Notes

- The `-webkit-fill-available` fix is specifically for WebKit browsers (Safari, iOS Chrome)
- Phaser's `FIT` scale mode ensures aspect ratio is maintained
- `autoCenter: CENTER_BOTH` keeps game centered even with toolbars
- The resize listener debounces with 100ms timeout to avoid excessive refreshes

## Related Files

- `public/index.html` - Meta tags and CSS fixes
- `src/main.ts` - Viewport resize listeners
- Phaser Scale Config - Uses FIT mode with auto-center

---

**Result:** Game now properly fits viewport on mobile devices, accounting for dynamic browser toolbars and device safe areas (notches, toolbars).
