# Wings of Fire — Complete Codebase, Systems & Deployment Architecture

> **Document Version:** v0.9.0 (Modular Source Architecture, 20 Weapons, 5 Biomes, Strict Battlefield & Upgrade Color Hierarchy)  
> **Repository Root:** `c:\Users\DELL\Desktop\code\Addon\Wings of Fire`  
> **Source Modules:** 13 segregated modules under `src/` (`core/`, `entities/`, `world/`, `render/`, `ui/`, `input/`, `css/`)  
> **Bundler & Build Pipeline:** `node build.js [--deploy]`  
> **Production Distributions:** `app/src/main/assets/index.html` (Android APK) & `dist/index.html` (Surge CDN)  
> **Live Production URL:** `https://wingsoffire.surge.sh`  
> **Native Wrapper:** Android WebView Studio Project (`app/`)  
> **Backend Service:** Python HTTP Server + Cloudflare Tunnel (`server.py` on Xperia Phone port 8000)  

---

## 1. Executive Summary & Tech Stack

**Wings of Fire** is a high-octane 2D top-down sci-fi rogue-lite bullet-heaven survival game built with **zero external libraries or frameworks**. It renders at a smooth 60 FPS using HTML5 Canvas 2D with procedural Web Audio sound synthesis, dual control mechanics (Desktop keyboard + mouse aiming, Mobile dual-touch virtual joysticks), dynamic multi-viewport camera tracking, 20 distinct weapon classes with 3-tier branch evolution trees, 28 enemy archetypes across 5 cosmic biomes, 5 mega bosses, an in-depth dual-currency economy (run-only Gold + persistent Coins), multi-tier cloud synchronization (Cloudflare Tunnel API + IndexedDB + LocalStorage), and guest/account authentication.

### Modular Architecture (v0.9.0):
The codebase is segregated into 13 aesthetic, focused modules under `src/`:
- `src/css/style.css`: Modern glassmorphic cyberpunk HUD, responsive canvas, and modal styles.
- `src/core/constants.js`: Game constants, `MODE`, `DIFF`, `ENVIRONMENTS`, `THEME`, `SPR`, `UPGRADES`, `WEAPONS`, `WEAPON_IDS`, `TREES`, `PERMS`.
- `src/core/audio.js`: Procedural Web Audio API synthesizer (`initAudio`, `beep`, `chord`, `haptic`).
- `src/core/storage.js`: Multi-tier cloud synchronization, IndexedDB (`WingsOfFireDB`), LocalStorage, SHA-256 auth modal.
- `src/entities/player.js`: Player state machine, movement physics, directional aim, dash, health, leveling.
- `src/entities/weapons.js`: All 20 weapons attack logic, evolution trees, `weaponBullet`, and card generation.
- `src/entities/enemies.js`: 8 base + 20 biome enemies + 5 bosses, enemy AI, red projectile patterns, red hazards, red beams.
- `src/world/world.js`: Dynamic infinite world bounds, smooth camera, cosmic starfield/embers parallax, gem collection.
- `src/render/vfx.js`: Vector shape primitives, glow sprite renderers, laser/lightning/drone visuals.
- `src/render/renderer.js`: 16-layer compositing engine (`drawWorld`).
- `src/ui/hud.js`: In-game HUD, radar minimap, dual virtual joysticks, buff chips.
- `src/ui/screens.js`: Loadout, Core Shop, Level-Up Card Overlay (with blue/yellow/white color rules), Pause, Dead, Victory.
- `src/input/input.js`: Touch events, virtual joystick physics, mouse aiming, keyboard controls.
- `src/main.js`: Game loop (`frame`), update coordinator, lifecycle bootstrap.
- `build.js`: Modular compiler and syntax validator that bundles all modules and deploys live via `node build.js --deploy`.

---

## 2. Version Evolution & Changelog

### v0.1.0 — Initial Prototype
- Single-screen fixed arena ($1200 \times 800$ bounds).
- Basic player drag-to-move touch controls.
- 3 starter weapons: Machine Gun, Missile Launcher, Plasma Ring.
- Basic chaser enemy spawner with linear HP scaling.
- Simple level-up screen presenting 3 random card upgrades.

### v0.2.0 — Bullet Heaven Foundation
- Added XP gem dropping, magnetic collection radius, and level progress bar.
- Added 2 new weapons: Orbit Drone and Chain Lightning.
- Implemented primitive boss spawn at 60-second intervals with high HP pool and minion summoning.
- Introduced local `localStorage` persistent high-score and kill tracking.

### v0.3.0 — Audio & Visual FX Polish
- Added Web Audio API procedural sound engine: laser zaps, bass explosions, hit clicks, and level-up chimes.
- Added dynamic screen shake with falloff damping.
- Added floating damage numbers with color-coded critical strikes (`#ffd700`) and standard hits (`#ffffff`).
- Added chromatic background starfield parallax and floating cosmic dust grid.

### v0.4.0 — Progression & Mastery System
- Added permanent Meta-Progression ("Core Upgrades") shop: Maximum HP, Base Speed, Magnet Radius, Damage Multiplier, and Armor.
- Added Weapon Mastery tracking (Levels 1–30) yielding cumulative stat bonuses (+1% damage, +0.5% fire rate per mastery level).
- Added Touch-Pathing / virtual waypoint movement for mobile.
- Refactored save file format to versioned JSON schema.

### v0.5.0 — The "Screen-Space & 10 Weapons" Overhaul
- **Screen-Space Combat Enforcement:** Clamped enemy spawns inside visible bounds with 0.4s warning beacons (`warnT`), 130px minimum distance check from player, and despawn/clamp rules.
- **Arsenal Expansion (10 Weapons):** Added 5 new weapons:
  1. *Tactical Nuke:* Slow-moving mega-payload with screen-wide shockwave.
  2. *Humming Disk:* Ricocheting buzzsaw disk bouncing between targets and screen walls.
  3. *Laser Array:* Continuous piercing beam with high tick rate.
  4. *Spiral Ellipse:* Double-helical orbiters expanding outward in an elliptical path.
  5. *Random Wormhole:* Spatially warping vortex that pulls and crushes enemies.
- **Weapon Evolution Trees:** Designed 3-tier branching upgrade specializations for all 10 weapons (e.g., *Hyper Velocity* vs *Twin Barrel* vs *AP Rounds*).
- **Expanded Enemy Bestiary (8 Types):** Added Charger (windup dash), Spinner (revolving shields), Artillery (lobbed mortar hazards), and Beamer (charging continuous laser).
- **3 Distinct Boss Kits:**
  - *Boss 0 (Drake):* 8-way bullet rings + dual laser sweeps + summon adds.
  - *Boss 1 (Titan):* Mortar cluster barrage + charge dash shockwave + heavy armor.
  - *Boss 2 (Sentinel):* Rotating 4-beam cross laser + orbital shield drones + micro-missile swarms.
- **Dual Economy:**
  - *Coins (`🪙`):* Persistent currency (formerly Embers) for meta-upgrades and mastery.
  - *Gold (`🪙`):* Run-only currency for the newly introduced **Paid Bonus Card** level-up phase (`25 + 5 * level` gold cost).
- **Difficulty Selection:** Added Easy, Normal, and Hard chips with distinct enemy HP, damage, speed, and reward scaling.
- **Android Release:** Packaged and signed Android Debug APK (`WingsOfFire-v0.5.0-debug.apk`).

### v0.6.0 — Large Dynamic World & Camera Tracking
- **Expanded Infinite-Feel World Grid:**
  - Desktop: $9 \times$ screen width by $6 \times$ screen height ($9W \times 6H$).
  - Mobile: $5 \times$ screen width by $3 \times$ screen height ($5W \times 3H$).
- **Dynamic Smooth Camera:** Centered on player with exponential lerp damping and boundary clamping:
  ```javascript
  cam.x = clamp(p.x - W / 2, 0, WORLD_W - W);
  cam.y = clamp(p.y - H / 2, 0, WORLD_H - H);
  ```
- **World Boundary Physics:** Neon danger grid lines at $x=0, y=0, x=\text{WORLD\_W}, y=\text{WORLD\_H}$; entities strictly clamped within world dimensions.
- **Minimap Radar:** Circular mini-map overlay showing player position, boss beacon, elite targets, and arena borders.

### v0.7.0 (Current Deployed Release) — Hybrid Controls, Cloud Accounts & Unified Theme
- **Dual Control Architecture:**
  - *Desktop:* WASD / Arrow keys for 8-directional movement, Mouse cursor for 360° directional aiming, Spacebar / Shift for Dash, Num-keys 1/2/3 for instant card selection.
  - *Mobile:* Left Virtual Touch Joystick for movement (`touchMove`), Right Virtual Touch Joystick for directional firing (`touchAim`), on-screen Dash button, responsive touch cards.
- **Directional Weapon Aiming:** Machine Gun, Nuke, Disk, Laser, and Wormhole align to player aim vector (`getAimAngle(p)`); Orbit Drone, Black Hole, and Chain Lightning maintain autonomous proximity targeting.
- **Unified `THEME` Configuration System:**
  - Extracted all hardcoded hex codes, stroke widths, glow radii, particle palettes, and enemy styles into a centralized, modular `THEME` JavaScript object (lines 40–180 of `index.html`).
- **Complete Cloud Authentication & Persistence Suite:**
  - Secure in-game Auth Modal (`#authModal`) supporting User Registration, Login, and Guest play.
  - Client-side SHA-256 password hashing.
  - Three-tier fallback sync architecture:
    1. Remote Python/Cloudflare REST API (`/api/user/auth`, `/api/user/save`).
    2. IndexedDB (`WingsOfFireDB`, object store `users`).
    3. `localStorage` fallback (`wof_cloud_users_v1`, `wof_currentUser`).
  - Pre-seeded developer account: `rush` (password `2694`) credited with 50,000,000 Coins.
- **Universal Currency Migration:** Standardized all UI, tooltips, upgrade nodes, and logs to "Coins" (`🪙`) with automatic legacy data migration.
- **Cloudflare Edge Deployment:** Embedded Cloudflare Tunnel webhook on Xperia phone backend (`https://customs-wins-wallace-ultimately.trycloudflare.com`).

### v0.8.0 — 20 Weapons, 5 Biomes & Auto-Pickup XP
- **20 Weapons Total:** Expanded arsenal to 20 unique weapons with full 3-tier evolution trees (Gauss Railgun, Swarm Drones, Plasma Torch, Graviton Scythe, Flak Cannon, Orbital Lance, Phantom Echo, Gravity Tether, Void Parasite, Cryo Minefield).
- **5 Cosmic Biomes & 28 Enemies:** Nebula, Magma, Cyber, Abyss, Chrono biomes with 20 biome-specific enemies and 5 mega bosses.
- **Auto-Pickup XP:** Replaced manual magnet collection with seamless auto-pickup XP, streamlining the battlefield.

### v0.9.0 (Current Release) — Modular Architecture & Strict Color Hierarchy
- **Segregated Modular Architecture:** Split monolithic 6,250+ line script into 13 aesthetic ES modules under `src/` (`core/`, `entities/`, `world/`, `render/`, `ui/`, `input/`, `css/`).
- **Unified Build & Deploy Pipeline (`build.js`):** High-speed bundler and syntax validator with 1-click deployment to Android APK assets, Surge CDN (`wingsoffire.surge.sh`), and Xperia Phone Termux over ADB WiFi.
- **Battlefield Visual Color Hierarchy:**
  - **Enemies:** Distinct shades of **Orange** (`#ff6b35`, `#ff8533`, `#c2410c`, `#f97316`, `#ea580c`, `#ff781f`, `#d95700`, `#ffa726`, etc. + `#ffd000` for elites).
  - **Enemy Bullets / Hazards / Beams:** Striking shades of **Red** (`#ef4444`, `#ff2a4b`, `#dc2626`, `#ff0033`, `#e11d48`, `#b91c1c`).
  - **Player Ship Attacks:** Luminous shades of **White** (`#ffffff`, `#f8fafc`, `#f1f5f9` across all 20 weapons).
- **Level-Up Card Color Coding:**
  - **Blue (`#38bdf8`):** Weapon upgrades.
  - **Yellow (`#facc15`):** Skill upgrades.
  - **White (`#f8fafc`):** Other upgrades (survivability, mobility, defense).

---

## 3. Game Systems & Technical Architecture

### 3.1. World & Camera Mechanics
```
+-------------------------------------------------------------+
| WORLD BOUNDS (Desktop: 9W x 6H  |  Mobile: 5W x 3H)         |
|                                                             |
|         +-----------------------+                           |
|         | VIEWPORT (Screen WxH) |                           |
|         |                       |                           |
|         |       [Player]        | ---> Camera tracks player |
|         |       (Center)        |      Clamped at edges     |
|         |                       |                           |
|         +-----------------------+                           |
|                                                             |
+-------------------------------------------------------------+
```
- **Grid Rendering:** Rendered in world coordinates with parallax coordinate translation (`ctx.translate(-cam.x, -cam.y)`).
- **Spawn Geometry:** Spawns occur inside the active camera view or within a close outer buffer ($40\text{px}$ margin), with 0.4s warning markers preventing surprise damage.

### 3.2. Player Ship Mechanics
- **Physics:** Velocity with inertia, friction coefficient ($0.88$), dynamic speed calculated as:
  $$\text{Effective Speed} = \text{Base Speed} \times (1 + \text{Speed Upgrade} \times 0.08) \times \text{Difficulty Mod}$$
- **Dash Ability:** 
  - Cooldown: $2.5\text{s}$ (reduced by Core Upgrades).
  - Invulnerability duration: $0.35\text{s}$.
  - Velocity impulse: $18\text{px/frame}$ along aim vector.
  - Generates chromatic after-image ghost sprites.

---

## 4. Weapon Arsenal & 3-Tier Branch Trees

Every weapon features 8 base upgrade levels followed by 3 branching specializations at Tier 3:

| # | Weapon Key | Name | Targeting Mode | Mechanics & Bullet Behavior | Tier 3 Evolution Branches |
|---|---|---|---|---|---|
| 1 | `mg` | **Machine Gun** | Directional Aim | High-speed kinetic slugs with slight cone spread. | • **Hyper-Velocity:** +60% bullet speed, piercing.<br>• **Twin-Barreled:** Doubles bullet output per burst.<br>• **Depleted Uranium:** Applies stacking DOT bleed. |
| 2 | `missile` | **Missile Launcher** | Proximity Lock | Seeking micro-rockets with acceleration curve and AOE detonation. | • **Cluster Swarm:** Splits into 4 mini-cluster bomblets on impact.<br>• **Hellfire Warhead:** +100% blast radius, burning ground fire.<br>• **Javelin Penetrator:** High-velocity armor-piercing kinetic missile. |
| 3 | `plasma` | **Plasma Ring** | Omnidirectional | Expanding radial shockwave pulsing outward from ship hull. | • **Superconductor:** Shockwave triggers chain lightning.<br>• **Event Horizon:** Pulls enemies inward before exploding.<br>• **Double Pulse:** Fires an immediate second echo pulse. |
| 4 | `orbit` | **Orbit Drone** | Autonomous Orbit | High-tech orbital spheres circling ship, destroying incoming bullets and shredding enemies. | • **Satellite Bastion:** Doubles active drone count, increases orbit speed.<br>• **Shield Link:** Projects damage-absorbing kinetic barrier between drones.<br>• **Overclocked Lasers:** Drones fire micro-lasers inward and outward. |
| 5 | `lightning`| **Chain Lightning**| Smart Auto-Target | Instant electric arc jumping to up to 6 adjacent enemies with zero travel time. | • **Forked Arc:** Arcs jump to 3 additional targets simultaneously.<br>• **High Voltage:** 25% chance to stun enemies for 1.2 seconds.<br>• **Ball Lightning:** Leaves an electrifying orb at terminal arc location. |
| 6 | `nuke` | **Tactical Nuke** | Directional Aim | Heavy rocket with slow acceleration, colossal AOE blast, and screen-wide flash. | • **Thermonuclear Core:** Increases blast radius to 40% of viewport.<br>• **Neutron Fallout:** Leaves a radioactive zone damaging all who enter.<br>• **MIRV Multi-Split:** Splinters into 3 tactical nukes mid-flight. |
| 7 | `disk` | **Humming Disk** | Directional Aim | Piercing rotary buzzsaw blade bouncing off screen boundaries and enemies. | • **Serrated Edge:** Increases bounce count by +6, applies bleed.<br>• **Splitter Disk:** Splits into 2 half-size disks on first enemy impact.<br>• **Gravitational Hub:** Emits a vortex pulling enemies into its path. |
| 8 | `laser` | **Laser Array** | Directional Aim | Continuous collimated energy beam sweeping with player aim, ticking damage every 60ms. | • **Prismatic Split:** Splits beam into 3 focused fan beams.<br>• **Pulse Overcharge:** Periodic high-energy surges through the beam.<br>• **Meltdown:** Melting armor increases all incoming damage by 30%. |
| 9 | `spiral` | **Spiral Ellipse** | Radial Geometry | Dual projectile orbs revolving in an expanding elliptical orbit. | • **Graviton Orbit:** Extreme elliptical stretch with crushing mass.<br>• **Tri-Helix:** Adds a 3rd rotating ellipse orb.<br>• **Cosmic Resonance:** Orbs explode upon completing an orbit cycle. |
| 10| `wormhole` | **Random Wormhole**| Point/Target Aim | Generates an unstable singularity tearing open space-time and crushing enemies. | • **Supermassive Core:** Vastly increases pull strength and singularity size.<br>• **Cosmic Rift:** Spawns a secondary linked wormhole emitting shockwaves.<br>• **Singularity Collapse:** Violently detonates upon collapse, launching enemies. |

---

## 5. Enemy Bestiary & Boss Kits

### 5.1. Standard & Elite Archetypes
1. **Chaser (`chaser`):** Standard swarming drone, moves directly towards player position.
2. **Fast (`fast`):** High-speed dart ship, low HP, dangerous in large packs.
3. **Tank (`tank`):** Heavy armor plating, slow movement, absorbs massive projectile fire.
4. **Shooter (`shooter`):** Keeps medium distance, fires red plasma bolts at player.
5. **Charger (`charger`):** Pauses, telegraphs an orange lock-on line for $0.8\text{s}$, then lunges forward at $3.5\times$ speed.
6. **Spinner (`spinner`):** Revolves around player, deflecting front-facing kinetic projectiles.
7. **Artillery (`artillery`):** Stays at viewport boundary, lobbing glowing mortar zones with circular ground telegraphs.
8. **Beamer (`beamer`):** Charges a continuous cyan laser beam with a $1.0\text{s}$ warning track before firing.

### 5.2. Boss Encounters
Bosses appear every **60 seconds**, scaling with survival time:
- **Kit 0: Drake Prime (Wyrm Cruiser)**
  - Health: $4,500 \times \text{Difficulty Multiplier}$.
  - Attacks: 16-way radial fire ring, dual forward laser sweeps, and minion spawn beacons.
- **Kit 1: Titan Dreadnought**
  - Health: $7,200 \times \text{Difficulty Multiplier}$.
  - Attacks: Mortar salvo barrage (6 markers), high-speed ramming thruster dash, and kinetic bullet sponges.
- **Kit 2: Sentinel Apex**
  - Health: $9,500 \times \text{Difficulty Multiplier}$.
  - Attacks: Revolving 4-way cross laser, 4 orbit shield satellites (must be destroyed to break main barrier), and homing micro-missile waves.

---

## 6. Economy, Core Progression & Mastery

### 6.1. Currency Split
- **Coins (`🪙`):** Persistent meta-currency.
  - Earned via: Enemy drop rolls, Boss bounties (+100/150/200 Coins), Run completion bonuses.
  - Spent on: Permanent Core Upgrades and Weapon Mastery node unlocks.
- **Gold (`🪙`):** In-run volatile currency.
  - Drops: Regular kill (+1), Elite kill (+5), Boss kill (+50).
  - Spent on: Level-up **Paid Bonus Pick** card screen ($25 + 5 \times \text{Player Level}$). Resets to 0 upon death or restart.

### 6.2. Permanent Core Upgrades (11 Trees)
1. **Hull Reinforcement:** +15 Max HP per level (Cap: Level 10).
2. **Thruster Output:** +4% Move Speed per level (Cap: Level 10).
3. **Magnetic Collector:** +25px Gem Grab Radius per level (Cap: Level 10).
4. **Weapons Calibrator:** +5% All Damage per level (Cap: Level 10).
5. **Coolant Loops:** +4% Cooldown Reduction / Fire Rate per level (Cap: Level 10).
6. **Kinetic Plating:** Flat -1 Damage taken per level (Cap: Level 5).
7. **Nanite Repair:** +0.5 HP/second regeneration (Cap: Level 5).
8. **Critical Sensor:** +3% Crit Chance, +15% Crit Damage (Cap: Level 10).
9. **Dash Capacitor:** -10% Dash Cooldown, +0.05s invulnerability (Cap: Level 5).
10. **Bounty Hunter:** +10% Gold drop chance per level (Cap: Level 5).
11. **Coin Extraction:** +15% Coins earned across all runs (Cap: Level 10).

### 6.3. Weapon Mastery (Levels 1–30)
- Every weapon earns Weapon XP based on run usage and kill tally.
- Leveling up mastery permanently grants +1% Damage and +0.5% Attack Speed to that weapon across all future runs.
- Level 10, 20, and 30 unlock cosmetic projectile skins and alternate fire SFX profiles.

---

## 7. Controls & Input Mapping Matrix

| Action | Desktop Keyboard & Mouse | Mobile Touch Interface |
|---|---|---|
| **Movement** | `W`, `A`, `S`, `D` or Arrow Keys | Left Virtual Joystick (`touchMove`) |
| **Aiming / Firing** | Mouse Cursor (360° Raycast) | Right Virtual Joystick (`touchAim`) |
| **Dash / Evasion** | `Spacebar` or `Left Shift` | On-Screen Floating Dash Button |
| **Card 1 Select** | Key `1` | Touch Card 1 Element |
| **Card 2 Select** | Key `2` | Touch Card 2 Element |
| **Card 3 Select** | Key `3` | Touch Card 3 Element |
| **Pause / Menu** | `Escape` or `P` | Touch Top-Right Pause Button |
| **Skip Paid Pick**| `Spacebar` / `Enter` | Touch `[SKIP]` Button |

---

## 8. Authentication & Multi-Tier Cloud Sync Pipeline

The client uses an asynchronous 3-tier persistence strategy to ensure zero data loss across mobile web, Android APK WebView, and desktop browsers:

```
                  +-----------------------------------+
                  |           User Action             |
                  | (Shop Purchase, Level Up, Game Over)|
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |       Synchronous RAM State       |
                  |          G.saveData               |
                  +-----------------------------------+
                                    |
                 +------------------+------------------+
                 |                                     |
                 v                                     v
   +---------------------------+         +---------------------------+
   |   Local Tier 1: Storage   |         |   Local Tier 2: IndexedDB |
   |  localStorage.setItem()   |         | WingsOfFireDB (users/runs)|
   +---------------------------+         +---------------------------+
                 |                                     |
                 +------------------+------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |   Remote Tier 3: Cloudflare API   |
                  | POST /api/user/save (JSON Hash)   |
                  +-----------------------------------+
```

### Endpoints Implemented in `phone-ocr/server.py`:
- `POST /api/user/auth`: Validates username + SHA-256 password hash; seeds default progress if new account.
- `POST /api/user/save`: Receives full serialized JSON payload (`coins`, `coreUpgrades`, `weaponMastery`, `runHistory`).
- `GET /api/user`: Returns remote user data for cross-device sync.
- Pre-seeded Test Account:
  - **Username:** `rush`
  - **Password:** `2694`
  - **Starting Balance:** 50,000,000 Coins.

---

## 9. Audio Synthesis & Theme Design System

### 9.1. Web Audio Procedural Sound Engine
Zero audio files are downloaded. Sounds are synthesized via procedural envelopes:
- **Laser Zap:** Rapid exponential frequency sweep ($880\text{Hz} \to 110\text{Hz}$ in $0.08\text{s}$) with triangle waveform.
- **Explosion:** White noise buffer passed through a low-pass biquad filter with exponential decay.
- **Hit Click:** Ultra-short sine wave ($1200\text{Hz}$, $0.02\text{s}$) providing tactile hit registration.
- **Level-Up Fanfare:** Harmonic major chord arpeggio ($C_5, E_5, G_5, C_6$) synthesized with dual detuned oscillators.

### 9.2. Centralized `THEME` Configuration Object
Located at lines 40–180 of `index.html`:
- **Palette Definitions:**
  - Background: `#080b12` with neon grid `#141f36`.
  - Player Hull: `#00f0ff` (Cyan) with engine burn `#ffaa00`.
  - Enemy Default: `#ff3366` (Crimson Neon).
  - Boss Armor: `#ff0033` with gold trims `#ffcc00`.
  - Gold Currency: `#ffd700`.
  - Coins: `#00e5ff`.
- **Glow & Shadow Effects:** Standardized `shadowBlur` values for lasers ($12\text{px}$), nukes ($24\text{px}$), and bullets ($8\text{px}$).

---

## 10. Active Deployments & File Locations

| Deployment Target | Platform / Mode | Location / Endpoint | Status |
|---|---|---|---|
| **Android App** | Native APK (WebView) | `c:\Users\DELL\Desktop\code\Addon\Wings of Fire\WingsOfFire-v0.5.0-debug.apk` | Built & Ready for Sideloading |
| **Android Source**| Android Studio Java Project| `c:\Users\DELL\Desktop\code\Addon\Wings of Fire\app\` | Compiled |
| **Web Asset** | Surge.sh Static CDN | `https://wingsoffire.surge.sh` (`dist/`) | Configured |
| **Cloud Relay** | Cloudflare Edge Tunnel | `https://adaptive-households-insulin-greeting.trycloudflare.com/game` | Live (Served from Xperia Phone) |
| **Local Game File**| Browser / Direct Open | `c:\Users\DELL\Desktop\code\Addon\Wings of Fire\app\src\main\assets\index.html` | v0.7.0 Active Source |

Ran search level and wave logic in index.html

In **Wings of Fire**, "levels" work across three distinct layers (as a rogue-lite survivor game like *Vampire Survivors*):

---

### 1. In-Run Player Level: **Infinite (Uncapped Survival)**
- The game does **not** have discrete "World 1, World 2, Level 1, Level 2" linear stage maps. Instead, it is an **endless wave-survival arena**.
- During each run, your ship starts at **Level 1** and levels up by collecting XP gems:
  - Required XP formula: $\text{xpFor}(L) = \lfloor 8 + 5.2 \times L + 0.58 \times L^2 \rfloor$.
  - There is **no hard ceiling** on your in-run player level.
  - Every level-up grants **1 Free Card Choice** (out of 3) plus an optional **Paid Bonus Card Pick** costing $(25 + 5 \times \text{Level})$ Gold.
  - As your level rises, the spawn director dynamically raises enemy pack density: $\text{Target Enemies} = \min(\text{Cap}, 12 + 2.2 \times \text{Level} + 0.06 \times t)$.

---

### 2. Boss Waves & Cycles: **Continuous Escalation Every ~50–85s**
While it is one continuous arena, the game acts like waves through repeating boss encounters:
- Bosses spawn every **$\sim 60\text{–}85\text{s}$** (frequency quickens per kill: $\max(50, 85 - 5 \times \text{BossKills})$).
- There are **3 unique Boss Kits** that cycle in rotation (`bossKills % 3`):
  1. **Drake Prime (Wyrm Cruiser):** 16-way radial fire rings + dual sweeping lasers.
  2. **Titan Dreadnought:** Mortar cluster barrages + ramming thruster charge.
  3. **Sentinel Apex:** Revolving 4-way cross laser + orbiting shield satellites + micro-missiles.
- Each successive boss cycle scales up HP and damage infinitely.

---

### 3. Meta-Progression & Weapon Caps:
- **Core Meta-Upgrades Shop:** **100 Max Combined Core Levels** across 11 stat categories (Max HP, Speed, Magnet, Armor, Crit, etc.).
- **Weapon Mastery:** **30 Levels per weapon** across all 10 weapons (Levels 1–30 give permanent damage & attack speed bonuses).
- **In-Run Weapon Upgrades:** **8 Tiers** + **3 branching evolution paths** per weapon.

Add the below weapon in the game 1. Cryo Minefield / Proximity Mines

Best replacement for: Spiral Ellipse (which can feel floaty or hard to aim)

Theme & Visuals: Deep Ice Blue (#00f0ff / #70d6ff) glowing hexagonal nanite mines with blinking core LEDs.
Mechanics:
As you move and dash, your ship drops a trail of armed proximity mines behind you (or launches them toward cursor/aim joystick).
When an enemy gets within trigger radius, the mine detonates in a cryogenic freeze-blast dealing AOE damage and slowing enemies by 60% for 2.5s.
Tier 3 Evolution Branches:
Sub-Zero Cluster: Each detonated mine splits into 3 mini-bomblets.
Absolute Zero: Enemies below 25% HP caught in the blast instantly shatter into shards.
Tesla Mine: Dropped mines link together with an electric fence wire that shreds enemies passing between them.
2. Railgun / Gauss Impaler

Best replacement for: Laser Array (offers explosive single-shot punch instead of a sustained beam)

Theme & Visuals: Hyper-Velocity Electric Violet (#d946ef / #f43f5e) beam with a blinding white tracer line and screen-recoil camera punch.
Mechanics:
Charges for 0.4s and unleashes an instant, infinite-penetration supersonic kinetic slug in your aim direction.
Pierces through all normal enemies in a straight line, dealing colossal damage and leaving an electrified ion trail for 1s.
Tier 3 Evolution Branches:
Superconductor: Every enemy pierced increases the shot’s damage by +20% for the rest of that bolt.
Overcharge Capacitors: Critical hits trigger a cone of secondary shrapnel darts behind the pierced target.
Dual Rail: Fires twin parallel hyper-velocity rails with wider clearance.
3. Swarm Drones / Nanite Cloud

Best replacement for: Orbit Drone (more active and dynamic than passive circling balls)

Theme & Visuals: Amber Gold / Hive Yellow (#fbbf24 / #f59e0b) swarm of 6–12 agile micro-drones buzzing around your ship.
Mechanics:
Drones fly in formation around your hull. When enemies enter sensor range, individual drones break formation like interceptor missiles, dive-bombing enemies and returning to dock.
Tier 3 Evolution Branches:
Kamikaze Protocol: Drones detonate upon contact, rebuilding themselves at your ship after 1.5s.
Shield Interceptor: Drones prioritize intercepting incoming enemy bullets, vaporizing them before they hit your hull.
Leech Nanites: 5% of drone damage is converted into ship HP regeneration or bonus XP magnet range.
4. Flamethrower / Plasma Torch

Best replacement for: Machine Gun (adds high-intensity close-quarters crowd control)

Theme & Visuals: High-heat Solar Orange & Magenta (#ff4500 / #ff007f) turbulent particle cone spraying from your ship's prow.
Mechanics:
Emits a continuous, sweeping cone of plasma fire in your aim direction.
Melts swarms and applies a stacking Burn DOT (Damage Over Time) that spreads to adjacent enemies when an infected enemy dies.
Tier 3 Evolution Branches:
Napalm Residue: Leaves flaming patches on the arena floor that burn enemies walking over them.
Thermobaric Jet: Every 3 seconds, fire a pressurized burst that knocks back all nearby enemies.
Blue Star Fire: Extreme heat conversion; ignores 100% of Tank and Boss armor plating.
5. Black Hole Boomerang / Graviton Scythe

Best replacement for: Humming Disk (cleaner pathing, more satisfying retrieval loop)

Theme & Visuals: Dark Matter Purple (#8b5cf6 / #4c1d95) spinning crescent blade with gravitational distortions.
Mechanics:
Thrown out along your aim line. As it travels, it drags enemies in its wake.
Upon reaching maximum range, it pauses for 0.3s (grinding enemies in place) and curves back directly toward your current ship position.
Tier 3 Evolution Branches:
Event Horizon: The scythe grows in size and pull strength the more enemies it hits on its flight.
Orbital Orbit: Upon returning to you, it circles your ship twice as a kinetic barrier before reloading.
Eclipse Reave: Inflicts vulnerable debuff, making affected enemies take +35% damage from all weapons.
6. Flak Cannon / Shatter Shotgun

Best replacement for: Tactical Nuke (more frequent action without waiting on a slow bomb)

Theme & Visuals: Industrial Neon Yellow / White (#facc15 / #ffffff) heavy shell casing ejection with explosive spark bursts.
Mechanics:
Fires a heavy explosive shell that detonates at mid-range (or on first solid target), bursting into a wide 12-pellet shrapnel spray.
Tremendous point-blank knockback, creating instant breathing room when swarmed.
Tier 3 Evolution Branches:
Flechette Rounds: Pellets pierce through 2 enemies each and cause bleeding.
Incendiary Flak: Pellets explode into secondary mini-fireballs.
Breaching Slug: Point-blank shots deal 
3
×
3× critical damage to Bosses and Elites.
7. Orbital Beam Strike / Satellite Lance

Best replacement for: Random Wormhole (gives tactical player control instead of random placement)

Theme & Visuals: Blinding Golden Solar Ray (#fef08a / #f59e0b) targeting reticle tracking the nearest elite or cursor, dropping a pillar of light from the sky.
Mechanics:
Paints a 90px crosshair under the highest-HP enemy or your aim cursor.
After a 0.5s lock-on tone, a massive pillar of orbital energy smites down from above, vaporizing all standard enemies caught in the column.
Tier 3 Evolution Branches:
Sweeping Beam: The satellite beam drags across the ground for 2 seconds, following your ship's movement.
Tri-Strike: Paints 3 target zones simultaneously in a triangular cluster.
Supercharged Conduit: Walking into your own beam supercharges your ship speed and weapon fire-rates by +40%.
Summary Recommendation Matrix:
Current Weapon	Weakness in Current Gameplay	Recommended Swap	Gameplay Benefit
Spiral Ellipse	Hard to aim, passive damage	Cryo Minefield	Tactical kite/freeze control for swarms
Humming Disk	Random ricochets can miss targets	Graviton Scythe	High-skill boomerang trajectory & suction
Random Wormhole	Unpredictable spawn locations	Orbital Beam Strike	High-satisfaction, pinpoint elite-killer
Orbit Drone	Passive circling feels generic	Swarm Drones	Active interceptor missiles + projectile interception
Laser Array	Low burst feedback	Gauss Railgun	Heavy screen-punch penetration shot

---

## 13. Release v0.8.0 — The Complete 20-Weapon & 5-Biome Campaign Overhaul

### 13.1 Overview of Changes
- **20 Total Weapons (No Replacements):** Kept all 10 legacy weapons and introduced 10 full-featured new weapons, each equipped with comprehensive 3-tier branch evolution trees (6 upgrades per tree, 120 evolution nodes total).
- **5 Distinct Biomes:**
  1. `Neon Nebula` — Cosmic ultraviolet deep space with cyan grid and stardust burst hazards.
  2. `Magma Forge` — Volcanic crucibles with lava orange grid and geyser eruption hazards.
  3. `Cyber Matrix` — Corrupted digital mainframe with emerald matrix grid and laser tripwires.
  4. `Abyssal Rift` — Infinite oceanic void with deep indigo grid and gravitational singularity vortexes.
  5. `Chrono Wasteland` — Temporal ruin with amber clockwork grid and periodic time dilation shifts.
- **20 Biome-Specific Enemies:** 4 specialized enemies per biome with unique visual shapes, movement AI, and attack patterns (`neb_drifter`, `neb_weaver`, `neb_nova`, `neb_prism`, `mag_crawler`, `mag_spitter`, `mag_golem`, `mag_phoenix`, `cyb_drone`, `cyb_turret`, `cyb_glitch`, `cyb_firewall`, `aby_eel`, `aby_jelly`, `aby_leech`, `aby_leviathan`, `chr_phantom`, `chr_warp`, `chr_rewind`, `chr_decay`).
- **5 Mega-Boss Kits:**
  1. `INFERNO DRAKE` (Kit 0) — Fire breath, spiral fireball volleys, meteor hazards.
  2. `VORTEX TITAN` (Kit 1) — Gravity well, circular tidal bullet rings, seismic hazards.
  3. `STORM SENTINEL` (Kit 2) — Lightning storms, dual-phase arc spreads with dodge gaps.
  4. `NEXUS CORE` (Kit 3) — Overclocked firewall matrix, multi-angle laser sweeps, pulse bullets.
  5. `CHRONOS PRIME` (Kit 4) — Temporal distortion, sinusoidal bullet waves, expanding time shockwaves.
- **Single-View Scrollable Loadout Arsenal:** Completely removed pagination (`loadoutPage`), presenting all 20 weapons in a single unified list with vertical drag/wheel scrolling and scrollbar indicator.
- **Auto-Pickup XP:** Replaced physical gem entities with instant on-kill XP accrual and floating `+XP` combat text particles, eliminating battlefield clutter.
- **Shield Capacitor Upgrade:** Replaced obsolete magnet upgrades in both in-run cards and permanent Core Shop with kinetic barrier shielding that absorbs damage before player HP.
- **HUD Scalability & Redesign:** Increased font scaling by +15-25% across all HUD elements. Redesigned the top XP bar into a high-visibility progress bar with milestone tick pips at 25%, 50%, 75% and clear `LV X / 100` progress labels.
- **100-Level Cap & Victory Condition:** Updated XP progression formula to `xpFor(L) = floor(10 + 6.5*L + 0.35*L^2)` tuned for an engaging ~20-minute campaign. Reaching level 100 triggers an celebratory Victory Screen with run statistics.
- **Live Deployment:** Successfully deployed and live at [https://wingsoffire.surge.sh](https://wingsoffire.surge.sh).
- **Xperia Phone Server & Cloud DB (`wof_db.py`):** Synchronized via ADB (`QV71085R27` / `192.168.1.200:5555`), deployed updated `wof.html` (v0.8.0) into Termux, upgraded `wof_db.py` to index all 20 weapons and auto-migrate legacy `magnet` saves to `shieldCap`, executed SQLite migration for user `rush`, and verified `/game` and `/api/user` endpoints on local LAN (`http://192.168.1.200:8000`) and active Cloudflare tunnel (`https://customs-wins-wallace-ultimately.trycloudflare.com`).