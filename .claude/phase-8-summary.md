# Phase 8: Progressive Chapter System - Summary

**Date**: 2025-10-31
**Status**: Planning Complete, Ready for Implementation

## What Was Created

### 📁 Complete Story Documentation (9 files)

```
stories/phase-8/
├── README.md                                    # Phase overview
├── IMPLEMENTATION_GUIDE.md                      # Quick start guide
├── epic-8.1-persistent-progression/
│   ├── README.md                               # Persistent progression overview
│   └── story-8.1.1-design-progression-architecture.md
├── epic-8.2-bullet-count-balance/
│   ├── README.md                               # Bullet-count methodology
│   └── story-8.2.1-create-bullet-counter.md
└── epic-8.3-chapter-rebalancing/
    ├── README.md                               # Rebalancing overview
    ├── story-8.3.1-rebalance-chapters-1-3.md  # Detailed chapter plans
    └── story-8.3.2-rebalance-chapters-4-6.md  # Detailed chapter plans
```

## Key Concepts

### 🎮 Progressive Campaign System
- **Before**: Each chapter is independent, starts with T1 weapon
- **After**: Weapon tier carries forward, must play chapters in order
- **Impact**: Creates roguelike-inspired progression, upgrades feel meaningful

### 📊 Bullet-Count Balance Methodology
- **Before**: Balance uses DPS (damage per second)
- **After**: Balance counts actual bullets fired vs needed
- **Why**: More accurate, accounts for overkill, matches player thinking

### ⬆️ Rare Upgrades
- **Before**: ~15-20 upgrades across 8 chapters
- **After**: ~8-10 upgrades across 8 chapters
- **Distribution**:
  ```
  Ch1: T1→T2  |  Ch5: T4→T5
  Ch2: T2→T3  |  Ch6: T5 (none)
  Ch3: T3 (none) | Ch7: T5→T6
  Ch4: T3→T4  |  Ch8: T6 (none)
  ```

## What's Already Done

### ✅ Today's Fixes
1. **Wave Complete Overlay Bug Fixed**
   - File: `src/scenes/GameScene.ts:820-824`
   - Issue: Overlay persisted when transitioning to ChapterCompleteScene
   - Fixed: Added cleanup in `onChapterComplete()`

2. **Chapters 4-6 Rebalanced**
   - Files: `public/config/chapters/chapter-04.json`, `05`, `06`
   - Changes: Start with weaker enemies, gradual difficulty, early upgrades
   - Result: All waves now beatable (A+ grades)

3. **Balance Analysis Script**
   - File: `analyze_balance.py`
   - Current: DPS-based analysis working well
   - Ready for: Bullet-count enhancement

## What Needs to Be Done

### 📋 Implementation Roadmap

#### Phase 1: Balance System (3-4 hours)
1. **Add Bullet Counting to `analyze_balance.py`**
   - Follow: `story-8.2.1-create-bullet-counter.md`
   - Add: `calculate_bullets_available()` function
   - Add: `calculate_bullets_needed()` function
   - Test: Run on all chapters, review output

#### Phase 2: Chapter Rebalancing (8-12 hours)
2. **Rebalance Chapters 1-3**
   - Follow: `story-8.3.1-rebalance-chapters-1-3.md`
   - Ch1: Minor tweaks (already good)
   - Ch2: Reduce to 4 waves, 1 upgrade (T2→T3)
   - Ch3: 4 waves, NO upgrades (stay T3)

3. **Rebalance Chapters 4-6**
   - Follow: `story-8.3.2-rebalance-chapters-4-6.md`
   - Ch4: Adjust for T3 start, 1 upgrade (T3→T4)
   - Ch5: Adjust for T4 start, 1 upgrade (T4→T5)
   - Ch6: Extend to 5 waves, NO upgrades (stay T5)

4. **Create Chapters 7-8** (if needed)
   - Similar story patterns
   - Ch7: T5→T6 upgrade
   - Ch8: Endgame challenge

#### Phase 3: Progression System (10-14 hours)
5. **Design Architecture**
   - Follow: `story-8.1.1-design-progression-architecture.md`
   - Document data structures
   - Define interfaces
   - Plan system flow

6. **Implement Persistence**
   - Modify: `src/systems/ProgressManager.ts`
   - Add: `currentCampaignTier` tracking
   - Add: `startingWeaponTier` per chapter
   - Add: `resetCampaign()` function

7. **Update Game Scenes**
   - Modify: `src/scenes/GameScene.ts`
   - Modify: `src/scenes/ChapterCompleteScene.ts`
   - Modify: `src/scenes/MenuScene.ts`
   - Add: Starting tier parameter
   - Add: Tier persistence on completion

8. **Update UI**
   - Add: Current weapon tier display
   - Add: Locked chapter indicators
   - Add: "Reset Campaign" button
   - Add: Progression breadcrumb trail

#### Phase 4: Testing & Polish (4-6 hours)
9. **Full Campaign Playtest**
   - Play through all chapters
   - Verify difficulty curve
   - Check upgrade timings
   - Test edge cases

10. **Final Adjustments**
    - Balance tweaks based on playtesting
    - UI polish
    - Bug fixes
    - Documentation updates

## Estimated Timeline

```
Balance System:        3-4 hours
Chapter Rebalancing:   8-12 hours
Progression System:    10-14 hours
Testing & Polish:      4-6 hours
────────────────────────────────
Total:                 25-36 hours (3-5 days)
```

## Quick Start

### Option 1: Start with Bullet Counting
```bash
# Read the story
cat stories/phase-8/epic-8.2-bullet-count-balance/story-8.2.1-create-bullet-counter.md

# Implement in analyze_balance.py
# Test it
python analyze_balance.py
```

### Option 2: Start with Chapter Rebalancing
```bash
# Read the detailed plans
cat stories/phase-8/epic-8.3-chapter-rebalancing/story-8.3.1-rebalance-chapters-1-3.md

# Update chapter configs in public/config/chapters/
# Use existing analyze_balance.py to validate
```

### Option 3: Start with Architecture Design
```bash
# Read the design story
cat stories/phase-8/epic-8.1-persistent-progression/story-8.1.1-design-progression-architecture.md

# Create architecture diagrams
# Document data structures
# Plan implementation approach
```

## Key Files Reference

### Configuration
- `public/config/chapters/chapter-01.json` through `chapter-08.json`
- `public/config/entities/weapons.json`
- `public/config/entities/zomboids.json`

### Systems
- `src/systems/ProgressManager.ts` - Progress tracking
- `src/systems/WeaponSystem.ts` - Weapon management
- `src/systems/WaveManager.ts` - Wave spawning

### Scenes
- `src/scenes/GameScene.ts` - Main gameplay
- `src/scenes/ChapterCompleteScene.ts` - Chapter end
- `src/scenes/MenuScene.ts` - Chapter selection

### Tools
- `analyze_balance.py` - Balance analysis script

## Success Criteria

### ✅ Done When:
- [ ] Bullet-count analysis tool working
- [ ] All chapters rebalanced with bullet ratios ≥ 1.3
- [ ] Weapon tier persists across chapters
- [ ] Chapters must be played in order
- [ ] Only 8-10 total upgrades across campaign
- [ ] Full playthrough takes 45-60 minutes
- [ ] Difficulty curve feels smooth and fair
- [ ] Upgrades feel rare and impactful

## Benefits of This Approach

1. **More Strategic**: Players must think about upgrade timing
2. **Better Pacing**: Chapters build on each other
3. **More Accurate Balance**: Bullet counting matches gameplay
4. **Replayability**: Different strategies, speedruns, low-tier challenges
5. **Better Progression**: Clear sense of advancement through campaign

## Questions & Decisions

### Design Questions to Consider:
1. **Replay Behavior**: Should replaying a chapter reset weapon tier or keep it?
   - Recommendation: Keep tier, allow practice
2. **Death Penalty**: Should dying reset campaign progress?
   - Recommendation: No for normal mode, yes for "hardcore mode"
3. **Tier Display**: Where to show current weapon tier?
   - Recommendation: HUD + menu + chapter select
4. **Skip Chapters**: Allow with debug mode?
   - Recommendation: Yes for testing only

### Technical Decisions Made:
- ✅ Use existing ProgressManager (extend, don't replace)
- ✅ Store tier per chapter (allows replay without reset)
- ✅ Bullet-count supplements DPS (don't replace)
- ✅ Preserve existing chapter structure (waves, timers, etc.)

## Next Steps

**Recommended Path**:
1. Read `IMPLEMENTATION_GUIDE.md` thoroughly
2. Implement bullet-count tool first (validates all work)
3. Rebalance chapters 1-6 using bullet counts
4. Design progression architecture
5. Implement progression system
6. Full playtest and polish

**Alternative Path** (if you want visual results faster):
1. Rebalance chapters 1-3 using existing DPS analysis
2. Add bullet-count validation
3. Rebalance chapters 4-6 with bullet counts
4. Implement progression system
5. Test and adjust

## Resources

- All documentation: `stories/phase-8/`
- Quick guide: `stories/phase-8/IMPLEMENTATION_GUIDE.md`
- Current analysis: Run `python analyze_balance.py`
- Recent fixes: See `.claude/RECENT_WORK.md`

---

**Ready to start?** Pick a story from `stories/phase-8/` and begin!

**Need help?** All stories include:
- Detailed acceptance criteria
- Technical implementation details
- Testing strategies
- Dependencies and notes
