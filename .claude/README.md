# .claude Documentation Directory

This directory contains comprehensive documentation to help quickly restore context when working on the Zomboid Assault project.

---

## 📚 Document Guide

### [RECENT_WORK.md](./RECENT_WORK.md)
**Start here if you're resuming work after a break.**

Contains:
- Summary of recent session work (last 7 days)
- What was accomplished (8 chapters, balance fixes, bug fixes)
- Key files modified and why
- Recent commits
- Known issues and next steps
- Player feedback patterns

**Use this to**: Understand what was done recently and why.

---

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Reference this for technical implementation details.**

Contains:
- System architecture overview
- Game loop flow diagrams
- Event system documentation
- Critical state variables
- Key system implementation details
- Data flow examples for common scenarios
- Common bug patterns and fixes
- Debugging tips

**Use this to**: Understand how the codebase works at a deep level.

---

### [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**Quick lookup when you need to do something specific.**

Contains:
- Common task walkthroughs
- File location quick lookup table
- Wave definition JSON template
- Quick bug fix patterns
- Balance analyzer cheat sheet
- Weapon/enemy stats reference tables
- Emergency fixes

**Use this to**: Quickly find files or remember how to do common tasks.

---

## 🎯 How to Use These Docs

### Starting a New Session
1. Read **RECENT_WORK.md** first (5-10 min read)
2. Skim **ARCHITECTURE.md** if you need technical details
3. Keep **QUICK_REFERENCE.md** open for lookups

### Fixing a Bug
1. Check **QUICK_REFERENCE.md** → "Quick Bug Fixes" section
2. If not there, check **ARCHITECTURE.md** → "Common Bug Patterns"
3. Search relevant section in **ARCHITECTURE.md** for system details

### Adjusting Balance
1. **QUICK_REFERENCE.md** → "Adjust Chapter Difficulty" section
2. Run `python analyze_balance.py` (explained in RECENT_WORK.md)
3. Refer to balance thresholds in QUICK_REFERENCE.md

### Understanding a System
1. **ARCHITECTURE.md** → Find system section (WaveManager, etc.)
2. Follow data flow examples
3. Check event system if systems interact

### Adding New Content
1. **QUICK_REFERENCE.md** → "Common Tasks" section
2. Find relevant template (new chapter, enemy, etc.)
3. Follow step-by-step instructions

---

## 📁 Project Structure Quick Lookup

```
ZomboidAssult/
├── .claude/                    # ← YOU ARE HERE
│   ├── README.md              # This file
│   ├── RECENT_WORK.md         # Recent session context
│   ├── ARCHITECTURE.md        # Technical deep dive
│   └── QUICK_REFERENCE.md     # Common tasks & lookups
├── public/
│   └── config/                # ← Game data (JSON)
│       ├── chapters/          # Wave definitions
│       └── entities/          # Zomboids, weapons, timers
├── src/
│   ├── scenes/               # ← Main game logic
│   │   └── GameScene.ts      # Most important file
│   └── systems/              # Game systems (managers)
├── analyze_balance.py        # ← Balance testing tool
├── package.json
└── .github/workflows/        # Auto-deployment
```

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev              # Start dev server (auto-reload)
python analyze_balance.py  # Check balance after config changes

# Build
npm run build            # Build for production

# Git
git add .
git commit -m "message"
git push                 # Push to development branch
# Create PR to master → auto-deploys via GitHub Actions
```

---

## 🔥 Most Commonly Needed Info

### Where to adjust difficulty?
→ `public/config/chapters/chapter-XX.json`

### Where are weapon stats?
→ `public/config/entities/weapons.json`

### Main game logic?
→ `src/scenes/GameScene.ts`

### How to test balance?
→ `python analyze_balance.py`

### How to deploy?
→ Create PR from `development` → `master` on GitHub

---

## 💡 Pro Tips

1. **Always run balance analyzer** after changing chapter JSON files
2. **Read RECENT_WORK.md first** when resuming - saves time
3. **Use QUICK_REFERENCE.md** as a cheat sheet while coding
4. **Refer to ARCHITECTURE.md** when debugging complex issues
5. **Update RECENT_WORK.md** if you make significant changes

---

## 📞 Need More Help?

- Full recent context: [RECENT_WORK.md](./RECENT_WORK.md)
- Technical details: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Quick lookups: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- Balance tool: `python analyze_balance.py`

---

*These documents are maintained to help quickly restore context for any developer or AI assistant working on this project.*
