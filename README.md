# Zomboid Assault 🧟‍♂️

A 2D/2.5D mobile defense game built with Phaser 3 and TypeScript. Defend against zombie hordes descending in columns - shoot zomboids or countdown timers to unlock powerful upgrades!

## 🎮 Game Concept

Zomboid Assault features a unique strategic mechanic: players must choose between shooting zombie hordes (defense) or shooting countdown timers (upgrades). Timers start at negative values and increment when shot - reaching positive values grants hero additions or weapon upgrades.

### Key Features
- **Column-Based Gameplay:** Zomboids descend in 2 vertical lanes
- **Strategic Timer Mechanic:** Shoot timers to unlock upgrades vs. shooting zomboids for defense
- **Progressive Weapon Upgrades:** Single gun → Double → Triple → Pulse Laser → Mega Machine Gun
- **JSON-Driven Configuration:** All entities, waves, and chapters defined in external config files
- **Dark Mode Aesthetic:** Minimalist Chrome dark-theme inspired visuals with outline highlights
- **Mobile-First Design:** Portrait orientation, touch controls, 60 FPS target

## 📁 Project Structure

```
zomboid-assult/
├── config/              # JSON configuration files
│   ├── game-settings.json
│   ├── entities/        # Zomboid, weapon, timer, hero configs
│   └── chapters/        # Chapter and wave definitions
├── src/                 # TypeScript source code
│   ├── main.ts          # Entry point
│   ├── scenes/          # Phaser scenes
│   ├── entities/        # Game entity classes
│   ├── systems/         # Game systems
│   ├── ui/              # UI components
│   ├── utils/           # Utilities
│   └── types/           # TypeScript types
├── assets/              # Audio and sprites
├── public/              # Static files
└── docs/                # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern web browser (Chrome 90+, Firefox 85+, Safari 14+)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd zomboid-assult

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open automatically at `http://localhost:3000`

### Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## 🎯 How to Play

### Controls
- **Desktop:**
  - Move Left: A or Left Arrow
  - Move Right: D or Right Arrow
  - Pause: ESC or P
- **Mobile:**
  - Touch left third of screen to move left
  - Touch right third of screen to move right
  - Tap pause button to pause

### Gameplay
1. Heroes automatically fire upward continuously
2. Move left/right between columns to target zomboids or timers
3. Shoot zomboids to prevent them from reaching the bottom (game over if they do)
4. Shoot countdown timers to increment their value:
   - Negative values (red) → 0 → Positive values (light blue)
   - Positive final value = add heroes
   - Negative final value = remove heroes
5. Survive the wave duration to advance
6. Complete all waves in a chapter to unlock the next chapter

## 🔧 Configuration

All game entities and levels are defined in JSON files under `config/`:

- **`game-settings.json`** - Global game settings
- **`entities/zomboids.json`** - Zomboid types (circles, squares, hexagons)
- **`entities/weapons.json`** - Weapon upgrade tiers
- **`entities/timers.json`** - Timer configurations
- **`entities/heroes.json`** - Hero properties
- **`chapters/chapter-XX.json`** - Chapter and wave definitions

### Creating Custom Chapters

1. Copy an existing chapter JSON file
2. Modify wave configurations:
   - Adjust zomboid types, counts, and spawn rates
   - Set timer spawn times and types
   - Configure wave duration
3. Save as `config/chapters/chapter-XX.json`
4. Chapter will automatically load in the menu

## 📚 Documentation

- **[Prototype Design Document](docs/zomboid-assult-prototype-design.md)** - Complete game design
- **[Game Architecture](docs/game-architecture.md)** - Technical architecture and systems
- **[Implementation Roadmap](docs/implementation-roadmap.md)** - Development plan and stories

## 🎨 Visual Style

**Dark Mode Theme:**
- Background: `#121212` (dark gray)
- Heroes: `#03DAC6` (teal) with `#18FFFF` outline
- Zomboids:
  - Circles: `#FF5252` (red)
  - Squares: `#FFC107` (amber)
  - Hexagons: `#4CAF50` (green)
- Timers: `#FF1744` (red negative) → `#00B0FF` (blue positive)
- Projectiles: `#FFFFFF` (white)

All shapes feature 2-3px outlines for the minimalist Chrome dark-theme aesthetic.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Tech Stack

- **Game Engine:** Phaser 3 (v3.60+)
- **Language:** TypeScript (v5.0+, strict mode)
- **Build Tool:** Vite
- **Physics:** Phaser Arcade Physics
- **Renderer:** WebGL with Canvas fallback

## 📱 Platform Support

- **Desktop:** Chrome 90+, Firefox 85+, Safari 14+
- **Mobile:** iOS 13+ (Safari), Android 8+ (Chrome)
- **Orientation:** Portrait (720x1280 to 1080x1920)
- **Performance:** 60 FPS target on mid-range devices (2019+)

## 🎯 Performance Optimization

- **Object Pooling:** Zomboids and projectiles reused to avoid garbage collection
- **Efficient Rendering:** Geometric shapes via Graphics API (no sprite atlases needed)
- **Mobile-Optimized:** Minimal particle effects, large touch zones, battery-conscious

## 🐛 Known Issues

- None currently (prototype phase)

## 📝 Roadmap

### Current Version (v1.0) - Prototype
- ✅ Core gameplay mechanics
- ✅ 3 chapters with multiple waves
- ✅ All zomboid types and weapon upgrades
- ✅ JSON-driven configuration
- ✅ Dark mode visual theme
- ✅ Mobile and desktop support

### Future Enhancements
- Endless mode with procedural waves
- Additional chapters (4-10)
- Boss waves
- Meta-progression system
- Achievement system
- Leaderboards
- Additional power-ups (shield, slow-mo, bomb)

## 🤝 Contributing

Contributions welcome! Please read the implementation roadmap and architecture docs before starting work.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [Phaser 3](https://phaser.io/)
- Inspired by classic column-based defense games
- Dark mode theme inspired by Chrome's Material Design

---

**Developed with the BMad Method** - Structured game development workflow using specialized agents and JSON-driven configuration.
