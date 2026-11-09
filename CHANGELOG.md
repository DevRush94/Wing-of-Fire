# 📜 Changelog — Wings of Fire: Survivor Chronicles

All notable changes, architectural evolutions, and system updates for **Wings of Fire: Survivor Chronicles** are documented in this file.

The project adheres to semantic versioning patterns (`v<major>.<minor>.<patch>`).

---

## [v0.9.2] — 2026-11-09

### 🧹 Codebase Cleanup & Repository Standardization
- **License Integrity**: Restored full MIT License legal text in `LICENSE` (2026 DevRush94 / Rushabh Sheth).
- **Repository Hygiene**: Verified zero stray debug code, eliminated dead variables, removed development logs, and confirmed 100% clean syntax across all 13 segregated modules.
- **Documentation**: Added dedicated `CHANGELOG.md` tracking the complete historical evolution from v0.1.0 prototype to the current modular engine.
- **Build Verification**: Verified automated bundling pipeline via `node build.js` generating zero-dependency distribution bundles for Web, Surge CDN, and Android WebView.

---

## [v0.9.1] — 2026-11-07

### ⏱️ Pacing & Run Duration Rebalance (~20 Minutes)
- **Max Level Cap Tuned**: Rebalanced campaign level cap from 100 to **Level 50** (`MAX_RUN_LEVEL = 50`), perfectly aligning with fully maxing out all 3 active weapons (8 tiers each) and all 6 passive skills without excessive pause-menu interruption.
- **Calibrated XP Curve**: Tuned XP progression formula `xpFor(level) = Math.floor(12 + level * 8 + level * level * 0.4)` requiring ~26,500 total XP to reach Level 50 (~1 level-up every 20–25s), naturally pacing completion at **~18–20 minutes**.
- **Boss Cadence Overhaul**: Spaced the 5 Flagship Bosses across the 20-minute run (Titan 1 at ~2:30, Titan 2 at ~6:15, Titan 3 at ~9:50, Titan 4 at ~13:15, and Apex Titan at ~16:30–18:30) instead of rapid 50s spam.
- **Triple Victory Condition**: Defeating the 5th Apex Titan, reaching Level 50, or surviving the full 20:00 (1200s) timer triggers the **Campaign Conquered! 🏆** victory sequence.
- **Health Scaling Refinement**: Reduced late-game HP inflation multiplier so high-tier enemies remain challenging without becoming static bullet sponges.
- **Survival Milestones**: Added milestone achievements for 5 minutes, 10 minutes, 20 minutes survival, and slaying all 5 Titans.

---

## [v0.9.0] — 2026-11-06

### 🧩 Modular Architecture & Visual Threat Hierarchy
- **13 Segregated ES Modules**: Segregated monolithic 6,250+ line script into focused modules under `src/`:
  - `src/core/`: `constants.js`, `audio.js`, `storage.js`
  - `src/entities/`: `player.js`, `weapons.js`, `enemies.js`
  - `src/world/`: `world.js`
  - `src/render/`: `renderer.js`, `vfx.js`
  - `src/ui/`: `hud.js`, `screens.js`
  - `src/input/`: `input.js`
  - `src/main.js` & `src/css/style.css`
- **Automated Bundler Pipeline (`build.js`)**: Single command `node build.js [--deploy]` compiling all modules into production bundles for `dist/` (Surge CDN) and `app/src/main/assets/` (Android WebView), with automatic ADB WiFi push.
- **Supersonic Fighter Jet Model**:
  - Replaced circular sprite with dynamic swept-delta fighter jet with faceted cockpit canopy, navigation strobes, and dual plasma afterburners.
  - Added 360° fluid banking physics and responsive kinetic shield bubble.
- **Strict Visual Threat Hierarchy**:
  - **Enemies**: Restricted to distinct shades of **Orange**, amber, and bronze hulls (`#ff6b35`, `#ff8533`, `#ea580c`, `#ffd000` for elites; zero near-white on enemy craft).
  - **Enemy Projectiles / Hazards / Beams**: Striking shades of **Red** (`#ef4444`, `#dc2626`, `#ff2a4b`).
  - **Player Ordnance**: Luminous shades of **White** (`#ffffff`, `#f8fafc`) across all 20 weapon classes for instant readability.
- **Color-Coded Progression Cards**:
  - **Blue (`#38bdf8`)**: Weapon upgrades and new weapon acquisitions.
  - **Yellow (`#facc15`)**: Passive skill upgrades (Damage, Rate, Speed, Shield, Armor, Lifesteal).
  - **White (`#f8fafc`)**: Universal survivability and mobility upgrades.
- **Redesigned Cockpit HUD**:
  - Docked player HP bar (`100/100 HP`), kinetic shield barrier gauge, and XP progression bar centered at bottom screen.
  - Docked Boss Health Bar with enraged state indicators (`⚡ ENRAGED`) directly above player cockpit console.
  - Relocated DASH trigger button to bottom-right corner for touch ergonomics and zero HUD overlap.
  - Top status bar displaying compact weapon upgrade badges, passive skill chips, timer, and active buffs.
- **Hostile AI & Spawning Improvements**:
  - Viewport-aware off-screen acceleration: enemies outside screen move at 2.6x entry speed before settling into dogfight patterns.
  - Boss pursuit AI with high-speed ram dash charges and targeted death-ray cannons originating directly from the boss core.
- **Load Screen Polish**: Fixed spacing, layout alignment, and eradicated `NaN:NaN` / `undefined kills` records with robust data sanitization.

---

## [v0.8.0] — 2026-10-24

### ⚔️ 20-Weapon Arsenal, 5 Planetary Biomes & Auto-Pickup XP
- **Expanded to 20 Weapon Classes**:
  1. *Machine Gun* (`mg`)
  2. *Orbit Drone* (`drone`)
  3. *Black Hole* (`hole`)
  4. *Kinetic Shield* (`shield`)
  5. *Chain Lightning* (`zap`)
  6. *Rocket Nuke* (`nuke`)
  7. *Bouncing Disk* (`disk`)
  8. *Laser Beam* (`laser`)
  9. *Spiral Shot* (`spiral`)
  10. *Bullet Eater Wormhole* (`wormhole`)
  11. *Cryo Minefield* (`mine`)
  12. *Gauss Railgun* (`railgun`)
  13. *Swarm Drones* (`swarm`)
  14. *Plasma Torch* (`flame`)
  15. *Graviton Scythe* (`scythe`)
  16. *Flak Cannon* (`flak`)
  17. *Orbital Lance* (`orbital`)
  18. *Phantom Echo* (`echo`)
  19. *Gravity Tether* (`tether`)
  20. *Void Parasite* (`parasite`)
- **3-Tier Branching Weapon Evolution Trees**: Unique branch specializations for all 20 weapons.
- **5 Cosmic Biomes**:
  - *Neon Deep Space* (Stardust bursts, nebula particles)
  - *Magma Caverns* (Heat distortion, lava geyser vents)
  - *Cyber Matrix* (Digital grid lines, laser tripwires)
  - *Abyssal Trench* (Bioluminescent currents, gravity vortexes)
  - *Chrono Rift* (Time dilation, paradox ripples)
- **20 Biome-Specific Hostiles & 5 Mega Bosses**:
  - Distinct movement patterns, behaviors, and projectile types per biome.
  - 5 Bosses: *Inferno Drake*, *Vortex Titan*, *Storm Sentinel*, *Nexus Core*, *Chronos Prime*.
- **Auto-Pickup XP Engine**: Eliminated manual gem magnetism; enemies grant instant XP credit on defeat with floating `+XP` numbers, dramatically improving late-game frame rates.
- **Single-View Scroll Loadout**: Replaced paginated inventory with unified vertical drag-to-scroll loadout arsenal.

---

## [v0.7.0] — 2026-10-23

### 🎮 Hybrid Controls, Cloud Synchronization & Unified Theme
- **Dual Cross-Platform Control Architecture**:
  - *Desktop*: WASD / Arrow keys movement + 360° mouse cursor aiming + Spacebar Dash.
  - *Mobile*: Left Virtual Joystick (Movement) + Right Virtual Joystick (Turret Aiming) + On-screen Dash.
- **Multi-Tier Cloud Persistence**:
  - In-game Auth Modal with guest play, username/password registration, and SHA-256 client hashing.
  - Synchronization pipeline: Cloudflare Edge REST API ↔ IndexedDB (`WingsOfFireDB`) ↔ LocalStorage fallback.
- **Centralized `THEME` Palette**: Standardized color tokens, stroke weights, and glow parameters into unified theme structure.
- **Unified Economy**: Standardized all meta-currency references to Coins (`🪙`).

---

## [v0.6.0] — 2026-10-23

### 🌌 Dynamic Infinite-Feel World & Minimap Radar
- **Expanded World Boundaries**: 9W × 6H on Desktop, 5W × 3H on Mobile.
- **Dynamic Smooth Camera**: Centered tracking on player with exponential lerp damping and boundary clamping.
- **Minimap Radar Overlay**: Top-right holographic radar displaying player heading, elite threats, boss markers, and border walls.
- **Boundary Clamping**: Dangerous neon boundary grid preventing out-of-bounds entity drift.

---

## [v0.5.0] — 2026-10-23

### 💥 Screen-Space Balance, 10 Weapons & Android Debug APK
- **Screen-Space Spawning**: Viewport bounds validation with 0.4s warning beacons (`warnT`).
- **10 Weapons & Evolution Trees**: Added Tactical Nuke, Humming Disk, Laser Array, Spiral Ellipse, and Wormhole.
- **Enemy Bestiary Expanded**: Added Charger, Spinner, Artillery, and Beamer hostile archetypes.
- **3 Boss Kits**: Distinct weapon kits and phases across early boss tiers.
- **Difficulty Selection**: Easy, Normal, and Hard modifiers for HP, damage, and rewards.
- **Native Android APK**: Packaged standalone WebView Android Studio project (`WingsOfFire-v0.5.0-debug.apk`).

---

## [v0.4.0] — 2026-10-23

### 🎖️ Meta-Progression & Weapon Mastery
- **Core Upgrades Shop**: Persistent upgrades for Max HP, Engine Speed, Weapon Damage, and Kinetic Shield.
- **Weapon Mastery Tracking**: 30 mastery levels per weapon delivering permanent stat growth.
- **Touch-Pathing Navigation**: Optional touch-pathing waypoint movement mode.

---

## [v0.3.0] — 2026-10-23

### 🔊 Procedural Web Audio Engine & Visual Polish
- **Zero-Asset Procedural Audio**: Native Web Audio API synthesizer for laser pings, explosion rumbles, chord fanfares, and haptic feedback.
- **Dynamic Screen Shake**: Traumatic falloff screen shake on heavy explosions.
- **Floating Combat Text**: Damage counters with critical strike highlights (`#ffd700`).

---

## [v0.2.0] — 2026-10-22

### 🔮 Rogue-Lite Survival Mechanics
- **XP Progression & Upgrades**: Level-up card selection engine offering random tactical cards.
- **Weapon Expansions**: Added Orbit Drone and Chain Lightning.
- **Initial Boss System**: 60-second periodic flagship summons with minion reinforcement waves.
- **Local High Score Tracking**: Persistent run timer, kills, and highest level tracking.

---

## [v0.1.0] — 2026-10-22

### 🚀 Initial Engine Prototype
- HTML5 Canvas 2D render loop (60 FPS).
- Basic 2D top-down spaceship flight mechanics.
- 3 starter weapons: Kinetic Machine Gun, Missile Launcher, Plasma Ring.
- Basic chaser enemy waves and simple level-up modal.
