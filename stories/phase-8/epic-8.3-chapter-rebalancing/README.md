# Epic 8.3: Chapter Rebalancing for Progressive Play

## Overview
Rebalance all chapters for the new progressive campaign system where players carry weapon tier forward. Make upgrades more rare and meaningful.

## Current State
- Chapters designed for independent play
- Each chapter has multiple weapon upgrades
- Difficulty not tuned for progressive play
- Some chapters still unbalanced

## Target State
- Chapters balanced for progressive campaign
- Weapon upgrades reduced by ~50%
- Clear difficulty curve: Easy → Medium → Hard
- Each chapter builds on previous
- Upgrades feel rare and meaningful

## Rebalancing Strategy

### Upgrade Distribution (8 Chapters)
```
OLD: ~15-20 total upgrades across campaign
NEW: ~8-10 total upgrades across campaign

Suggested Distribution:
Chapter 1: 1 upgrade (T1 → T2)
Chapter 2: 1 upgrade (T2 → T3)
Chapter 3: 0 upgrades (stay T3)
Chapter 4: 1 upgrade (T3 → T4)
Chapter 5: 1 upgrade (T4 → T5)
Chapter 6: 0 upgrades (stay T5)
Chapter 7: 1 upgrade (T5 → T6)
Chapter 8: 0-1 upgrade (T6 → T7, optional)
```

### Difficulty Curve
```
Chapter 1: Easy    (Tier 1→2, bullet ratio 2.0+)
Chapter 2: Easy    (Tier 2→3, bullet ratio 1.8+)
Chapter 3: Medium  (Tier 3, bullet ratio 1.5+)
Chapter 4: Medium  (Tier 3→4, bullet ratio 1.5+)
Chapter 5: Medium  (Tier 4→5, bullet ratio 1.3+)
Chapter 6: Hard    (Tier 5, bullet ratio 1.2+)
Chapter 7: Hard    (Tier 5→6, bullet ratio 1.1+)
Chapter 8: Very Hard (Tier 6-7, bullet ratio 1.0+)
```

### Wave Count
```
Chapters 1-2: 3 waves (tutorial/intro)
Chapters 3-4: 4 waves (building complexity)
Chapters 5-6: 4-5 waves (challenging)
Chapters 7-8: 5+ waves (endgame)
```

## Stories
- [Story 8.3.1: Rebalance Chapters 1-3](./story-8.3.1-rebalance-chapters-1-3.md)
- [Story 8.3.2: Rebalance Chapters 4-6](./story-8.3.2-rebalance-chapters-4-6.md)
- [Story 8.3.3: Rebalance Chapters 7-8](./story-8.3.3-rebalance-chapters-7-8.md)
- [Story 8.3.4: Validate progressive balance](./story-8.3.4-validate-progressive-balance.md)

## Technical Considerations
- Use bullet-count analysis for validation
- Ensure smooth progression of difficulty
- Test full campaign playthrough
- Verify each chapter is winnable with starting tier

## Success Criteria
- [ ] All chapters balanced for progressive play
- [ ] Total upgrades reduced to ~8-10
- [ ] Bullet ratio > 1.0 for all waves (with starting tier)
- [ ] Clear difficulty curve
- [ ] Each upgrade feels meaningful
- [ ] Campaign is fun and fair

## Validation Checklist
For each chapter:
- [ ] Run bullet-count analysis
- [ ] Verify all waves have bullet ratio > 1.0
- [ ] Check upgrade timing and rarity
- [ ] Test playthrough from appropriate starting tier
- [ ] Confirm difficulty feels appropriate

## Dependencies
- Epic 8.2 (bullet-count tool)
- Updated analyze_balance.py

## Notes
- Consider "hard mode" where upgrades are even more rare
- May need to tweak weapon stats after rebalancing
- Some chapters may need complete redesign
- Focus on making upgrades feel like major power spikes
