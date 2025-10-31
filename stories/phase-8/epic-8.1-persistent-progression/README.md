# Epic 8.1: Persistent Weapon Progression System

## Overview
Implement a system where weapon tier persists across chapters, creating a progressive campaign where players carry forward their upgrades.

## Current State
- Each chapter starts with Tier 1 weapon
- Chapters are independent
- Progress only tracks completion, not weapon tier

## Target State
- Weapon tier persists across chapters
- Chapters must be played in order
- Progress saves weapon tier for each chapter
- Chapter selection shows current weapon tier

## Stories
- [Story 8.1.1: Design persistent progression architecture](./story-8.1.1-design-progression-architecture.md)
- [Story 8.1.2: Implement weapon persistence](./story-8.1.2-implement-weapon-persistence.md)
- [Story 8.1.3: Update progress save/load system](./story-8.1.3-update-progress-system.md)
- [Story 8.1.4: Update chapter selection UI](./story-8.1.4-update-chapter-ui.md)

## Technical Considerations
- Need to modify ProgressManager to track weapon tier
- GameScene needs to use starting weapon tier from progress
- ChapterCompleteScene needs to save final weapon tier
- MenuScene needs to show progression status

## Success Criteria
- [ ] Weapon tier persists between chapters
- [ ] Can only play unlocked chapters in order
- [ ] Progress saves weapon tier
- [ ] UI clearly shows progression state
- [ ] Can reset progression to start fresh

## Dependencies
- Current ProgressManager system
- Save/load functionality
