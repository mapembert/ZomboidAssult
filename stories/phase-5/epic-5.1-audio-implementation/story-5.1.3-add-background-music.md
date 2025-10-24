# Story 5.1.3: Add Background Music

**Epic:** 5.1 Audio Implementation
**Phase:** 5 - Audio and Polish (Days 10-11)
**Estimated Time:** 3 hours
**Status:** ✅ COMPLETED

## Description
Source or create background music tracks for all game scenes and implement seamless looping and scene transitions. Music should match the dark mode aesthetic with minimal techno/electronic/ambient styles that enhance the atmosphere without distracting from gameplay.

## User Story
**As a player**, I want atmospheric background music that enhances the game experience and sets the mood for different game states.

## Tasks
- [x] Source or create menu music track
- [x] Source or create game music track
- [x] Source or create game over music track
- [x] Ensure all tracks loop seamlessly
- [x] Implement music playback in MenuScene
- [x] Implement music playback in GameScene
- [x] Implement music playback in GameOverScene/ChapterCompleteScene
- [x] Add smooth fade transitions between scenes
- [x] Test music looping (no gaps or clicks)
- [x] Balance music volume with SFX
- [x] Test on desktop and mobile

## Acceptance Criteria
- [x] 3 music tracks created and loaded
- [x] Menu music plays on MenuScene start
- [x] Game music plays on GameScene start
- [x] GameOver music plays on GameOverScene start
- [x] Music loops seamlessly without gaps
- [x] Fade transitions between scenes (1-2 seconds)
- [x] Music doesn't overlap (proper stopping/starting)
- [x] Volume balanced with SFX (music slightly quieter)
- [x] Mute button works for music
- [x] Music respects volume slider
- [x] Works on desktop browsers
- [x] Works on mobile browsers

## Files to Create/Modify
- `assets/audio/music/menu_music.mp3` - Menu background music
- `assets/audio/music/game_music.mp3` - Gameplay background music
- `assets/audio/music/gameover_music.mp3` - Game over background music
- `src/scenes/MenuScene.ts` - Play menu music
- `src/scenes/GameScene.ts` - Play game music
- `src/scenes/GameOverScene.ts` - Play game over music
- `src/scenes/ChapterCompleteScene.ts` - Play victory music (optional)

## Dependencies
- Story 5.1.1: Implement AudioManager System (completed)
- Story 5.1.2: Add Sound Effects (completed - for volume balancing)

## Implementation Details

### Music Track Specifications

#### 1. Menu Music (`menu_music.mp3`)
**Style:** Ambient electronic, calm, inviting
**Mood:** Atmospheric, slightly mysterious
**Tempo:** 80-100 BPM
**Duration:** 60-120 seconds (loopable)
**Key characteristics:**
- Minimal, not too busy
- Dark but not oppressive
- Sets the tone for the game
- Smooth loop point

**Recommended Elements:**
- Synth pads
- Subtle bassline
- Minimal percussion
- Ambient textures

---

#### 2. Game Music (`game_music.mp3`)
**Style:** Minimal techno/dark ambient
**Mood:** Focused, tense, driving
**Tempo:** 120-130 BPM
**Duration:** 90-150 seconds (loopable)
**Key characteristics:**
- Driving but not distracting
- Builds tension
- Complements fast gameplay
- Seamless loop

**Recommended Elements:**
- Steady kick drum (not too loud)
- Pulsing synth bass
- High-hat patterns
- Atmospheric pads in background
- Minimal melody (don't distract from gameplay)

---

#### 3. Game Over Music (`gameover_music.mp3`)
**Style:** Somber ambient/downtempo
**Mood:** Reflective, slightly melancholic
**Tempo:** 60-80 BPM
**Duration:** 30-60 seconds (may not need to loop)
**Key characteristics:**
- Descending tonality
- Soft, reflective
- Signals end/failure clearly
- Can fade out naturally

**Recommended Elements:**
- Descending synth chords
- Soft pads
- No percussion (or very minimal)
- Reverb-heavy atmosphere

---

### Scene Integration

#### MenuScene.ts
```typescript
import { AudioManager } from '@/systems/AudioManager';

export class MenuScene extends Phaser.Scene {
  create(): void {
    // ... existing scene setup ...

    // Initialize and play menu music
    const audioManager = AudioManager.getInstance();
    audioManager.initialize(this);
    audioManager.playMusic('menu_music', 1500); // 1.5s fade in

    // Unlock audio on first interaction (mobile)
    this.input.once('pointerdown', () => {
      audioManager.unlockAudio();
    });
  }

  shutdown(): void {
    // Don't stop music here - let target scene handle transition
  }
}
```

#### GameScene.ts
```typescript
import { AudioManager } from '@/systems/AudioManager';

export class GameScene extends Phaser.Scene {
  create(): void {
    // ... existing scene setup ...

    // Transition from menu music to game music
    const audioManager = AudioManager.getInstance();
    audioManager.initialize(this);

    // Stop menu music with fade, then start game music
    audioManager.stopMusic(500); // 0.5s fade out

    // Start game music after menu music fades (handled in AudioManager)
    this.time.delayedCall(600, () => {
      audioManager.playMusic('game_music', 1000); // 1s fade in
    });
  }

  shutdown(): void {
    // Music will be stopped by next scene
  }
}
```

#### GameOverScene.ts
```typescript
import { AudioManager } from '@/systems/AudioManager';

export class GameOverScene extends Phaser.Scene {
  create(): void {
    // ... existing scene setup ...

    // Transition to game over music
    const audioManager = AudioManager.getInstance();
    audioManager.initialize(this);

    // Stop game music, start game over music
    audioManager.stopMusic(800); // 0.8s fade out

    this.time.delayedCall(900, () => {
      audioManager.playMusic('gameover_music', 1200); // 1.2s fade in
    });
  }
}
```

#### ChapterCompleteScene.ts (Optional - Victory Music)
```typescript
import { AudioManager } from '@/systems/AudioManager';

export class ChapterCompleteScene extends Phaser.Scene {
  create(): void {
    // ... existing scene setup ...

    const audioManager = AudioManager.getInstance();
    audioManager.initialize(this);

    // Option 1: Play wave_complete SFX (already implemented)
    audioManager.playSFX('wave_complete', { volume: 0.8 });

    // Option 2: Play menu music (celebratory but calm)
    audioManager.stopMusic(500);
    this.time.delayedCall(600, () => {
      audioManager.playMusic('menu_music', 1000);
    });
  }
}
```

### Seamless Looping

To ensure music loops without gaps:

1. **Audio File Preparation:**
   - Trim silence from start and end
   - Ensure loop point matches musically
   - Export with no trailing silence
   - Test in audio editor first

2. **Phaser Configuration:**
```typescript
// In AudioManager.playMusic()
this.currentMusic = this.scene.sound.add(key, {
  loop: true,  // Enable looping
  volume: 0,
});
```

3. **Loop Point Testing:**
   - Play music for 5+ minutes
   - Listen for clicks or gaps at loop point
   - Adjust audio file if issues detected

### Music Transition Matrix

| From Scene | To Scene | Transition |
|------------|----------|------------|
| MenuScene | GameScene | Fade out 500ms → Fade in 1000ms |
| GameScene | GameOverScene | Fade out 800ms → Fade in 1200ms |
| GameScene | ChapterCompleteScene | Fade out 500ms → Fade in 1000ms |
| GameOverScene | MenuScene | Fade out 500ms → Fade in 1000ms |
| ChapterCompleteScene | MenuScene | Fade out 500ms → Fade in 1000ms |
| ChapterCompleteScene | GameScene (next) | Continue game music or brief pause |

## Music Sourcing

### Free/Royalty-Free Music Sources

1. **Incompetech (incompetech.com)**
   - Large library of royalty-free music
   - Free with attribution
   - Search: "electronic", "ambient", "dark"
   - License: CC-BY 4.0

2. **FreePD.com**
   - Public domain music
   - No attribution required
   - Various electronic/ambient tracks

3. **OpenGameArt.org**
   - Game-focused music
   - Various licenses (check per-track)
   - Search: "techno", "ambient", "electronic"

4. **Purple Planet Music (purple-planet.com)**
   - Royalty-free music
   - Free for non-commercial or with license
   - Good variety of electronic tracks

5. **Bensound (bensound.com)**
   - Free music with attribution
   - Clean, professional quality
   - Electronic/techno section

### Creating Custom Music (Optional)

**Tools:**
- **LMMS** (free) - Full DAW for creating electronic music
- **Garage Band** (Mac, free) - User-friendly music creation
- **Ableton Live** (paid) - Professional DAW
- **FL Studio** (paid) - Popular for electronic music

**Approach:**
1. Start with a simple kick drum pattern (120-130 BPM)
2. Add bassline (synth or sub-bass)
3. Layer synth pads for atmosphere
4. Add hi-hats and percussion
5. Keep it minimal (4-6 tracks maximum)
6. Ensure musical loop point (4, 8, or 16 bars)
7. Export as MP3 (128-192 kbps)

### Audio File Specifications

**Format:** MP3
**Bitrate:** 128-192 kbps
**Sample Rate:** 44.1 kHz
**Channels:** Stereo
**File Size Target:** < 2 MB per track

## Volume Balancing with SFX

Music should be quieter than SFX to avoid masking important audio cues:

```typescript
// Default volumes (in game-settings.json and AudioManager)
{
  "masterVolume": 0.7,
  "musicVolume": 0.5,   // Music quieter than SFX
  "sfxVolume": 0.8
}

// Effective volumes:
// Music: 0.7 * 0.5 = 0.35 (35% of max)
// SFX: 0.7 * 0.8 = 0.56 (56% of max)
```

**Testing:**
- Play game with both music and SFX
- Ensure important SFX (zomboid destroyed, weapon upgrade) clearly audible over music
- Music should provide atmosphere without dominating

## Testing Checklist

### Functional Testing
- [x] Menu music plays on MenuScene start
- [x] Menu music loops seamlessly (listen for 5+ minutes)
- [x] Game music plays on GameScene start
- [x] Game music loops seamlessly
- [x] GameOver music plays on GameOverScene
- [x] Music transitions smooth between scenes
- [x] No music overlap (old stops before new starts)
- [x] Mute button silences music
- [x] Music volume slider works
- [x] Music restarts correctly after unmute

### Quality Testing
- [x] No gaps or clicks at loop points
- [x] No audio artifacts (pops, distortion)
- [x] Music volume balanced with SFX
- [x] All SFX audible over music
- [x] Music fits the game atmosphere
- [x] Tempo feels appropriate for gameplay

### Platform Testing
- [x] Desktop Chrome: Music plays and loops
- [x] Desktop Firefox: Music plays and loops
- [x] Desktop Safari: Music plays and loops
- [x] Mobile iOS Safari: Music works after unlock
- [x] Mobile Android Chrome: Music works
- [x] No lag on mobile devices

### Edge Cases
- [x] Rapid scene transitions (music handles gracefully)
- [x] Pause/unpause during music playback
- [x] Volume change during music playback
- [x] Mute/unmute during fade transition
- [x] Browser tab hidden/shown (music continues)

## Performance Considerations

- Music files should be < 2 MB each (total ~6 MB for 3 tracks)
- Use streaming for music (Phaser handles this automatically)
- Don't preload all music (load in BootScene is fine)
- Monitor memory usage (music shouldn't cause leaks)

## Success Metrics
- ✅ All 3 music tracks implemented
- ✅ Seamless looping with no gaps
- ✅ Smooth scene transitions
- ✅ Volume balanced with SFX
- ✅ Works on desktop and mobile
- ✅ Enhances game atmosphere

## Next Steps
After completion:
- Epic 5.2: Performance Optimization
- Story 5.2.1: Profile and Optimize Rendering

## Notes
- Music selection is subjective - iterate based on feedback
- Can replace music tracks easily later
- Consider offering multiple music options in settings (future)
- Dark mode aesthetic: minimal, electronic, atmospheric
- Music should never feel intrusive or distracting
- Test with different music volume levels (some players prefer lower music)
- Consider adding music credits in game menu
