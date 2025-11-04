# Story 8.1.1: Design Persistent Progression Architecture

**Epic**: 8.1 - Persistent Weapon Progression System
**Priority**: High
**Estimate**: 2 hours

## Description
Design the architecture for persistent weapon progression across chapters, defining data structures, flow, and system interactions.

## Acceptance Criteria
- [ ] Architecture document created
- [ ] Data structures defined
- [ ] Flow diagrams created
- [ ] Interface contracts defined
- [ ] Edge cases identified

## Technical Design

### Data Structure

```typescript
// Progress data structure (extend existing)
interface ChapterProgress {
  chapterId: string;
  completed: boolean;
  startingWeaponTier: number;  // NEW: Tier when starting this chapter
  endingWeaponTier: number;    // NEW: Tier when completing this chapter
  highScore: number;
  completionTime: number;
  starsEarned: number;
  lastPlayed: Date;
}

interface GameProgress {
  chapters: Map<string, ChapterProgress>;
  currentCampaignTier: number;  // NEW: Current weapon tier in campaign
  unlockedChapters: string[];
}
```

### Flow

```
Chapter Start:
1. Load progress for chapter
2. If first time: use currentCampaignTier
3. If replay: use startingWeaponTier from progress
4. Start game with appropriate weapon tier

Chapter Complete:
1. Save endingWeaponTier
2. Update currentCampaignTier = endingWeaponTier
3. Unlock next chapter
4. Save progress

Campaign Reset:
1. Clear all progress
2. Set currentCampaignTier = 1
3. Unlock only Chapter 1
```

### System Changes

**ProgressManager**:
- Add `currentCampaignTier: number`
- Add `getStartingWeaponTier(chapterId: string): number`
- Add `setChapterCompletion(chapterId: string, endingTier: number): void`
- Add `resetCampaign(): void`

**GameScene**:
- Accept `startingWeaponTier` in scene data
- Pass to WeaponSystem constructor
- Don't reset weapon on restart within same chapter

**ChapterCompleteScene**:
- Track final weapon tier
- Call `ProgressManager.setChapterCompletion()`

**MenuScene**:
- Show current campaign tier
- Show locked chapters
- Add "Reset Campaign" button

### Edge Cases

1. **Replay Chapter**: Use saved startingWeaponTier, not currentCampaignTier
2. **Skip Chapter**: Not allowed - must play in order
3. **Weapon Tier Decrease**: Not possible - tier only increases
4. **Save Corruption**: Default to Tier 1, Chapter 1
5. **Mid-Chapter Quit**: Don't update progress
6. **Chapter Restart**: Keep same starting tier

## Tasks
- [ ] Create architecture diagram
- [ ] Document data flow
- [ ] Define interface contracts
- [ ] Review with team (if applicable)
- [ ] Update technical documentation

## Testing Strategy
- Diagram validation
- Interface contract review
- Edge case coverage verification

## Dependencies
- None (design phase)

## Notes
- Consider "hardcore mode" where weapon tier resets on failure
- May want to track best ending tier per chapter
- Could add achievements for completing with low tiers
