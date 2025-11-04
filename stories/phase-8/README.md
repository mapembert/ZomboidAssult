# Phase 8: Progressive Chapter System

## Overview
Transform the game into a progressive campaign where players must start from Chapter 1 and carry forward their weapon upgrades through subsequent chapters. This creates a more strategic, roguelike-inspired progression system where upgrade choices matter and chapters build upon each other.

## Goals
- Implement persistent weapon progression across chapters
- Rebalance all chapters using bullet-count methodology
- Make weapon upgrades more rare and meaningful
- Create a cohesive campaign experience
- Ensure chapters are balanced for progressive play

## Epics

### Epic 8.1: Persistent Weapon Progression System
**Priority**: High
**Stories**:
- 8.1.1: Design persistent progression architecture
- 8.1.2: Implement weapon persistence between chapters
- 8.1.3: Update progress save/load system
- 8.1.4: Update chapter selection UI for progression

### Epic 8.2: Bullet-Count Balance System
**Priority**: High
**Stories**:
- 8.2.1: Create bullet-count analysis tool
- 8.2.2: Validate existing chapters with bullet counts
- 8.2.3: Document balance methodology

### Epic 8.3: Chapter Rebalancing for Progressive Play
**Priority**: High
**Stories**:
- 8.3.1: Rebalance Chapters 1-3 for progressive start
- 8.3.2: Rebalance Chapters 4-6 for mid-game
- 8.3.3: Rebalance Chapters 7-8 for end-game
- 8.3.4: Make weapon upgrades more rare

## Success Criteria
- Players start at Chapter 1 with Tier 1 weapon
- Weapon tier carries forward to next chapter
- All chapters balanced using bullet-count methodology
- Weapon upgrades reduced by ~50%
- Clear progression curve from easy to hard
- Campaign feels cohesive and strategic

## Dependencies
- Phase 7 completion (if any)
- Current save/load system
- Chapter configuration format

## Estimated Timeline
- Epic 8.1: 2-3 days
- Epic 8.2: 1-2 days
- Epic 8.3: 3-4 days
- **Total**: ~6-9 days

## Notes
- This is a major architectural change affecting game flow
- Will require significant testing
- May need to adjust weapon stats after rebalancing
- Consider adding "New Game" vs "Continue" option
