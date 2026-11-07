# Wings of Fire — Final Implementation Plan v0.8.0

## 20 Weapons · 5 Biomes · 20 Unique Enemies · 5 Mega-Bosses · 100-Level 20-Min Campaign

> **Source Files:**  
> - `app/src/main/assets/index.html` — Primary single-file game engine (4,384 lines)  
> - `dist/index.html` — Web deployment mirror  
> - `phone-ocr/server.py` — Cloudflare Tunnel cloud persistence  

---

## 1. Directives

1. **20 Total Weapons** — Keep all 10 existing + add 10 new. No replacements.
2. **Single-View Scroll Loadout** — No pagination, one continuous scrollable weapon grid.
3. **Bigger Text & Clearer HUD** — +15–25% font scaling, redesigned XP progress bar with milestone pips.
4. **Auto-Pickup XP** — Remove physical gem entities entirely, instant XP credit on kill with floating `+XP` text. Remove Magnet upgrade, replace with Shield Capacitor.
5. **5 Biomes** — Each with unique backgrounds, hazards, 4 exclusive enemies, and 1 mega-boss.
6. **100-Level Cap / ~20 minutes** — Tuned XP curve, victory screen on clearing the biome titan.

---

## 2. Complete 20-Weapon Arsenal

### Existing 10 (Unchanged):

| # | Key | Name | Role | Mechanic |
|---|-----|------|------|----------|
| 1 | `mg` | Machine Gun | RAPID | Directional kinetic slugs with spread |
| 2 | `drone` | Orbit Drone | AUTO | Orbiting escorts auto-fire at nearest |
| 3 | `hole` | Black Hole | CONTROL | Gravity vortex pulling foes inward |
| 4 | `shield` | Shield | DEFENSE | Barrier absorbing hits, pulsing shockwave |
| 5 | `zap` | Chain Lightning | CHAIN | Instant electric arc jumping between foes |
| 6 | `nuke` | Rocket | BURST | Heavy rocket with massive blast radius |
| 7 | `disk` | Bouncing Disk | RICOCHET | Spinning disk bouncing off world walls |
| 8 | `laser` | Laser Beam | BEAM | Continuous directional piercing beam |
| 9 | `spiral` | Spiral Shot | PATTERN | Rotating spiral ring around ship |
| 10 | `wormhole` | Bullet Eater | WILD | Portal eating and returning enemy bullets |

### 10 New Additions:

#### Weapon 11: Cryo Minefield (`mine`)
- **Role:** TRAP / AREA DENIAL
- **Visual:** Deep Ice Blue (`#00f0ff` / `#70d6ff`) glowing hexagonal nanite mines with pulsing core LEDs.
- **Audio:** Crystalline frost shatter on detonation (`sndMine`: filtered white noise + 2400Hz sine sweep down).
- **Mechanics:**
  - Every `1.2s / weaponLevel` your ship deploys a mine at its current position (or launches one toward aim direction at `280*S` px/s).
  - Mines arm after `0.3s` (LED blinks green→blue) and persist for `8s`.
  - When an enemy enters `55*S` px trigger radius, the mine detonates: deals `15 + 8*level` AOE damage in a `75*S` radius and applies a **60% speed slow for 2.5s** to all enemies hit.
  - Maximum `6 + level/3` active mines. Oldest mine despawns if cap exceeded.
- **Tier 3 Evolutions:**
  - **Sub-Zero Cluster:** Each detonation spawns 3 smaller daughter mines (50% damage, 40px radius).
  - **Absolute Zero:** Enemies below 25% max HP caught in the blast are instantly killed (shatter VFX).
  - **Tesla Wire:** Active mines within `120*S` px of each other link via an electric fence arc dealing `5*level` DPS to anything crossing the wire.

#### Weapon 12: Gauss Railgun (`railgun`)
- **Role:** PRECISION / BURST
- **Visual:** Electric Violet (`#d946ef` / `#f43f5e`) beam with blinding white tracer line.
- **Audio:** Heavy recoil bass punch (`sndRailgun`: 55Hz sawtooth 0.15s + 1800Hz sine spike 0.03s), camera screen-shake on fire.
- **Mechanics:**
  - Fires every `2.8s / (1 + level*0.12)`.
  - On fire: 0.4s charge-up (visible capacitor glow ring expands around ship) then releases an **instant hit-scan rail** spanning the entire screen in aim direction.
  - The rail pierces **all enemies** in its path, dealing `45 + 22*level` base damage.
  - Leaves an electrified ion trail (`1.0s` duration) that deals `8*level` DPS to enemies passing through it.
  - Screen recoil: camera punches backward `8*S` px opposite to aim direction for `0.12s`.
- **Tier 3 Evolutions:**
  - **Superconductor:** Each enemy the rail pierces through increases the damage of that single shot by +20% for subsequent targets (1st target: 100%, 2nd: 120%, 3rd: 144%, etc.).
  - **Overcharge Capacitors:** Critical hits spawn a `45°` cone of 6 shrapnel darts behind the pierced target, each dealing 30% of rail damage.
  - **Dual Rail:** Fires twin parallel rails separated by `18*S` px, doubling clearance width.

#### Weapon 13: Swarm Drones (`swarm`)
- **Role:** INTERCEPTOR / AUTONOMOUS
- **Visual:** Amber Gold (`#fbbf24` / `#f59e0b`) agile teardrop micro-drones buzzing around ship.
- **Audio:** Hive frequency buzz modulated by drone count (`sndSwarm`: dual detuned 220Hz+226Hz triangle oscillators).
- **Mechanics:**
  - Maintains `4 + level/2` micro-drones orbiting ship hull in a loose swarm formation (jittering orbit radius `40–65*S` px).
  - When an enemy enters `180*S` px sensor range, the nearest idle drone breaks formation at `480*S` px/s, dive-bombs the target dealing `12 + 6*level` damage, then curves back to dock at the ship over `0.8s`.
  - Each drone has a `1.2s` cooldown between attacks.
  - Drones visually display a tiny amber thrust trail while attacking.
- **Tier 3 Evolutions:**
  - **Kamikaze Protocol:** Drones explode on contact dealing `200%` damage in a `35*S` AOE, rebuilding at the ship after `1.5s`.
  - **Shield Interceptor:** Drones prioritize destroying incoming enemy bullets within `100*S` px before targeting enemies. Each intercepted bullet heals 1 HP.
  - **Leech Nanites:** 5% of total drone damage converts into ship HP regeneration. +15% XP magnet range per active drone.

#### Weapon 14: Plasma Torch (`flame`)
- **Role:** CLOSE-RANGE / CROWD CONTROL
- **Visual:** High-heat Solar Orange & Magenta (`#ff4500` / `#ff007f`) turbulent particle cone.
- **Audio:** Continuous pressurized flame roar (`sndFlame`: filtered noise buffer with bandpass at 300Hz, gain modulated by aim distance).
- **Mechanics:**
  - Fires continuously while weapon is active: emits a sweeping `50°` cone of plasma particles extending `120 + 15*level` px from the ship prow in aim direction.
  - Tick rate: damage applied every `0.08s` to all enemies within the cone.
  - Base damage per tick: `4 + 2.5*level`.
  - Applies a stacking **Burn DOT**: `3 + level` DPS for `3s`, stacks up to 5x. When a burning enemy dies, the burn spreads to all enemies within `50*S` px.
- **Tier 3 Evolutions:**
  - **Napalm Residue:** Leaves flaming ground patches (circle `40*S` radius, `4s` duration) that deal `6*level` DPS to enemies walking over them.
  - **Thermobaric Jet:** Every `3s`, the torch fires a pressurized burst wave knocking all enemies within `100*S` px backward by `60*S` px.
  - **Blue Star Fire:** Beam becomes blue-white (`#00bfff`). Ignores 100% of enemy armor/resist. Deals +40% damage to bosses and tanks.

#### Weapon 15: Graviton Scythe (`scythe`)
- **Role:** BOOMERANG / PULL
- **Visual:** Dark Matter Purple (`#8b5cf6` / `#4c1d95`) spinning crescent blade with gravitational lens distortion rings.
- **Audio:** Phase-frequency whir with doppler shift (`sndScythe`: 440Hz triangle with LFO modulated pitch ±80Hz).
- **Mechanics:**
  - Fires every `2.2s / (1 + level*0.08)`.
  - Throws a spinning crescent blade along aim vector at `320*S` px/s.
  - As the scythe travels, it **drags enemies** within `65*S` px toward its flight path (pull force `120*S` px/s).
  - The scythe deals `18 + 10*level` damage on contact (pierces all enemies).
  - At maximum range (`220 + 20*level` px), it pauses for `0.3s` (grinding enemies in place with rapid `3*level` DPS ticks), then curves back to the player's current position at `400*S` px/s.
  - Return trip also deals full damage.
- **Tier 3 Evolutions:**
  - **Event Horizon:** The scythe grows +12% in size and +8% pull strength for every enemy it hits on its flight (resets on return).
  - **Orbital Barrier:** Upon returning, the scythe orbits your ship twice (0.8s orbit) as a kinetic barrier dealing `6*level` DPS before despawning.
  - **Eclipse Reave:** Enemies hit by the scythe receive a **Vulnerable** debuff: +35% damage taken from all sources for `4s`.

#### Weapon 16: Flak Cannon (`flak`)
- **Role:** SHOTGUN / KNOCKBACK
- **Visual:** Industrial Neon Yellow / White (`#facc15` / `#ffffff`) heavy shell casing with explosive spark bursts.
- **Audio:** Metallic explosive thud (`sndFlak`: 80Hz sawtooth 0.08s + 3200Hz noise burst 0.04s).
- **Mechanics:**
  - Fires every `1.6s / (1 + level*0.1)`.
  - Launches a heavy shell at `380*S` px/s in aim direction.
  - The shell detonates on first solid enemy impact OR at `160*S` px range, bursting into a `60°` spread of `10 + level/2` pellets.
  - Each pellet deals `8 + 3*level` damage and travels `90*S` px.
  - Point-blank knockback: all enemies within `50*S` px of the detonation are pushed `45*S` px away from the blast center.
- **Tier 3 Evolutions:**
  - **Flechette Rounds:** Pellets pierce through 2 enemies each and apply a bleed DOT (`4*level` DPS for 2s).
  - **Incendiary Flak:** Pellets explode into secondary micro-fireballs on terminal impact (8px AOE, `5*level` damage each).
  - **Breaching Slug:** Direct shell hit (before pellet burst) deals `3×` critical damage to Bosses and Elites. Shell penetrates through standard enemies.

#### Weapon 17: Orbital Beam Lance (`orbital`)
- **Role:** TARGETED SMITE / ELITE KILLER
- **Visual:** Blinding Golden Solar Ray (`#fef08a` / `#f59e0b`) targeting crosshair reticle + vertical pillar of light.
- **Audio:** High-pitch satellite lock-on ascending tone, then deep solar impact drone (`sndOrbital`: 880Hz→1760Hz sine 0.5s, then 110Hz triangle 0.3s).
- **Mechanics:**
  - Fires every `4.5s / (1 + level*0.08)`.
  - Phase 1 (Lock-on, 0.5s): Paints a `90*S` px diameter pulsing golden crosshair on the ground under the highest-HP enemy within `300*S` px of the player (or at aim cursor if no enemy qualifies).
  - Phase 2 (Smite): A massive vertical beam pillar ($16*S$ px wide, screen-height tall) strikes down for `0.4s`, dealing `60 + 30*level` damage to all enemies within the `90*S` px column. Standard enemies are vaporized instantly if their HP is below `40 + 15*level`.
  - Screen flash: brief `0.06s` golden screen overlay.
- **Tier 3 Evolutions:**
  - **Sweeping Beam:** The beam drags across the ground for `2.0s` following the player's movement direction, cutting a swath of destruction.
  - **Tri-Strike:** Paints 3 crosshairs simultaneously in a triangular cluster (`100*S` px spacing). All 3 beams strike at once.
  - **Supercharged Conduit:** Walking through your own beam's afterglow zone (`1.5s` lingering circle) grants +40% movement speed and +30% fire rate for `3s`.

#### Weapon 18: Phantom Echo (`echo`)
- **Role:** TEMPORAL REPLICATOR / FORCE MULTIPLIER
- **Visual:** Spectral Teal/Ghostly White (`#2dd4bf` / `#99f6e4`) translucent afterimage clone of the player ship, trailing fading phosphorescent echoes.
- **Audio:** Ethereal phasing whoosh (`sndEcho`: dual detuned 660Hz+668Hz sine oscillators with slow tremolo, creating a shimmering "ghost" tone).
- **Mechanics:**
  - **Concept:** This weapon doesn't fire projectiles of its own. Instead, it summons a **phantom ghost ship** that replays your movement and weapon fire from 2 seconds ago.
  - Fires (summons a phantom) every `6.0s / (1 + level*0.06)`. Each phantom persists for `3.0 + level*0.15` seconds.
  - The phantom is a translucent (`alpha 0.45`) mirror of your ship rendered with a teal glow halo. It follows the exact recorded path your ship took 2 seconds prior.
  - **The phantom fires spectral copies of ALL your other equipped weapons** at 60% of their damage, targeting the nearest enemy to the phantom's position.
  - Phantom shots are visually desaturated and semi-transparent to distinguish from real weapon fire.
  - The phantom is invulnerable (enemies pass through it) but enemies touching it take `5*level` contact damage per second.
  - Only 1 active phantom at a time (level 15+: up to 2 phantoms staggered 1s apart).
  - **Player position buffer:** Maintain a rolling circular buffer of `180` position entries (3 seconds at 60fps). Phantom reads from `[currentIndex - 120]` (2 seconds ago).
- **Tier 3 Evolutions:**
  - **Extended Replay:** Phantom duration increased to `5.0 + level*0.2` seconds. Replay delay reduced to 1.5s (tighter echo).
  - **Triple Manifestation:** Summons 3 phantoms at once, reading from 1s, 2s, and 3s ago respectively. Each deals 45% damage (total: 135% of base).
  - **Overclocked Echo:** Single phantom deals 150% weapon damage instead of 60%. Phantom also inherits your current burn, crit, and pierce stats. Phantom visually burns bright white.

#### Weapon 19: Gravity Tether (`tether`)
- **Role:** GRAPPLE / CROWD SWEEPER
- **Visual:** Electric Crimson (`#ef4444` / `#fca5a5`) crackling energy wire connecting ship to grappled enemy, with arcing spark particles along the tether line.
- **Audio:** Taut metallic hum with electric crackle (`sndTether`: 165Hz sawtooth + periodic 2400Hz spark pops every 0.2s).
- **Mechanics:**
  - **Concept:** You lasso an enemy with an energy grapple wire. The wire itself becomes a lethal razor line — any enemy that crosses the tether takes continuous slicing damage. As you fly around, you sweep the wire through crowds like a deadly clothesline.
  - Fires every `3.0s / (1 + level*0.07)`. Shoots a grapple bolt at `500*S` px/s toward the nearest enemy within `250*S` px.
  - On hit, the wire locks onto the target. Tethered enemy is **dragged** toward you at `40*S` px/s (resists with its own speed, creating tension).
  - **Wire collision:** Every frame, the game checks all enemies intersecting the line segment between your ship and the tethered enemy. Each enemy crossing the wire takes `10 + 5*level` damage per tick (60fps) and is pushed `12*S` px perpendicular to the wire.
  - Tether lasts `4.0s` or until the anchored enemy dies. If the anchor dies, the wire **snaps to the next nearest enemy** within `150*S` px (chain lasso). If no target in range, tether retracts.
  - Wire renders as a 2px inner white line with a 6px outer crimson glow, with spark particles drifting along its length.
  - Tethered enemy takes `3*level` DPS from the grapple lock itself.
  - Maximum tether length: `320*S` px. If you fly further, the tether snaps.
- **Tier 3 Evolutions:**
  - **Dual Tether:** Fire 2 grapple wires simultaneously to 2 different enemies. The triangle formed between you and the 2 anchors creates a **death triangle** — enemies inside the triangle take `8*level` DPS.
  - **Electrified Wire:** The tether arc crackles with chain lightning, zapping 3 nearby enemies within `60*S` px of the wire for `12*level` damage per second.
  - **Singularity Anchor:** The tethered enemy becomes a temporary gravity well, pulling other enemies within `80*S` px toward it at `60*S` px/s — clustering them onto the razor wire.

#### Weapon 20: Void Parasite (`parasite`)
- **Role:** MIND CONTROL / CONVERSION
- **Visual:** Sickly Chartreuse / Toxic Green (`#84cc16` / `#bef264`) parasitic spore with writhing tendrils, infected enemies gain a green pulsing aura and inverted color tint.
- **Audio:** Wet organic burrow sound on attach, continuous low hum while active (`sndParasite`: 90Hz sine + 95Hz sine creating 5Hz beat frequency, plus squelchy 400Hz bandpass noise burst 0.06s on infection).
- **Mechanics:**
  - **Concept:** You fire a living parasitic spore that burrows into an enemy, hijacking its AI. The infected enemy turns friendly and attacks its former allies with boosted stats. When the host dies, the parasite leaps to the next victim.
  - Fires a spore projectile every `5.0s / (1 + level*0.06)` at `350*S` px/s toward the nearest enemy.
  - On hit, the spore **infects** the target (0.3s burrow animation — enemy flashes green):
    - Enemy switches to **friendly AI**: moves toward and attacks other enemies using its native attack patterns (chasers charge other enemies, shooters fire at other enemies, artillery lobs at other enemies).
    - Infected enemy gains +50% move speed and +`30 + 10*level`% damage boost.
    - Duration: `4.0 + level*0.2` seconds.
    - Infected enemy has a green pulsing ring and desaturated sprite tint.
  - When the host dies OR the infection timer expires:
    - The parasite **leaps** to the nearest uninfected enemy within `150*S` px (visible green arc projectile, `400*S` px/s).
    - If no valid target within range, the parasite returns to orbit around your ship as a visible green spore, auto-latching onto the next enemy that enters `80*S` px.
  - Maximum active parasites: `1 + floor(level/8)` (up to 4 at max level).
  - Boss immunity: Bosses cannot be fully converted. Instead, they take `15*level` DPS and are **slowed by 25%** for the infection duration.
- **Tier 3 Evolutions:**
  - **Hive Mind:** Can infect up to `3 + level/5` enemies simultaneously. Infected enemies gain +20% additional damage for each other infected enemy on screen (swarm synergy).
  - **Volatile Strain:** When an infected host dies, it **explodes** dealing `200%` of its max HP as AOE damage in a `70*S` px radius (chain reaction potential with clustered enemies).
  - **Neural Override:** Infected enemies gain +100% attack speed and fire rate. Additionally, shooter-type infected enemies fire double projectile volleys. Infection duration extended by +2s.

---

## 3. 5th Biome: Chrono Wasteland (Temporal Fracture Zone)

Existing 4 biomes + 1 completely unique new environment:

### Biome 1: Neon Nebula (Deep Cosmic Void)
- **Palette:** Deep Indigo / Cyan (`#080b12`, `#00f0ff`)
- **Background:** Parallax cosmic starfields, nebula dust clouds, passing comets.
- **Hazard:** Cosmic lightning storms (telegraphed electric zones, 1.5s warning).

### Biome 2: Magma Forge (Volcanic Core)
- **Palette:** Smoldering Obsidian / Magma Crimson (`#1a0505`, `#ff3300`)
- **Background:** Molten lava fissures, floating ember sparks, thermal waves.
- **Hazard:** Lava geysers erupting from cracked ground with 1.2s warning glow.

### Biome 3: Cyber Matrix (Digital Gridworld)
- **Palette:** Terminal Pitch / Phosphor Green (`#021206`, `#00ff66`)
- **Background:** Flowing digital wireframes, hex grids, falling binary code rain.
- **Hazard:** Moving energy security laser tripwires.

### Biome 4: Abyssal Rift (Singularity Horizon)
- **Palette:** Void Black / Electric Violet (`#0c0214`, `#bf00ff`)
- **Background:** Gravitational warping, void tendrils, dark matter nodes.
- **Hazard:** Gravity vortex anomalies pulling ship and enemies inward.

### Biome 5: Chrono Wasteland (Temporal Fracture Zone) — NEW
- **Palette:** Antique Gold / Teal / Dusty Sepia (`#1a1408`, `#d4a017`, `#2dd4bf`)
- **Background:** Shattered clockwork gears floating in fractured spacetime. Half the backdrop shows ancient crumbling ruins; the other half shows futuristic wreckage — stitched together by glowing temporal rift seams. Falling sand/dust particles with intermittent chromatic aberration glitch effects (RGB channel split for 0.3s every ~12s).
- **Unique Mechanic — Time Shifts:** Every `45s`, a "TEMPORAL SHIFT" event triggers (screen flash + clock sound effect):
  - **Time Dilate (Slow):** All enemies move at 40% speed for 5 seconds, but deal +60% damage — rewarding aggressive play.
  - **Time Accelerate (Fast):** All enemies move at 180% speed for 4 seconds, but have -30% HP — rewarding survival.
  - **Ghost Echo:** Spectral ghosts of the last 8 killed enemies reappear at their death positions for 6 seconds with 50% HP (they drop XP again if killed).
  - Which shift occurs is random, announced on-screen 1.5s before activation.
- **Hazard:** Temporal fracture rifts — glowing teal/gold cracks appear on the ground. Standing in one for >1.5s teleports the player to a random position on screen (disorienting but not damaging). Enemies that cross rifts are briefly frozen for 0.5s.

---

## 4. 20 Biome Enemies & 5 Mega-Bosses

### Biome 1 Enemies (Nebula):
1. **Drift Drone:** Swarming dart, fast group rushes.
2. **Nebula Jelly:** Floating orb, explodes into 6 spark projectiles on death.
3. **Void Stalker:** Stealth cloaker, fades out and lunges from within 120px.
4. **Photon Sniper:** Long-range, aims a red laser line 0.8s before firing.

### Biome 2 Enemies (Magma):
1. **Magma Crawler:** Armored fire crab leaving a burning lava trail.
2. **Lava Spitter:** Stationary mortar lobbing molten magma ground circles.
3. **Inferno Ram:** Heavy plated charge unit, straight-line dash.
4. **Pyro Siren:** Chants heat waves granting +30% move speed to nearby allies.

### Biome 3 Enemies (Cyber):
1. **Bit Drone:** High-speed glitching triangle, 90° vector angles.
2. **Grid Blocker:** Energy shield connecting to another blocker (wire barrier).
3. **Trojan Worm:** Multi-segment centipede, segments split into mini-bugs.
4. **Pulse Turret:** Fires rapid bouncing bullets reflecting off walls.

### Biome 4 Enemies (Abyss):
1. **Void Shade:** Intangible shadow, 50% projectile resist until within 100px.
2. **Rift Siphon:** Channels violet gravity beam slowing and pulling the player.
3. **Singularity Core:** Detonates on death, pulling gems/enemies into mini black hole.
4. **Chaos Herald:** Fires spiraling double-helix dark matter orbs.

### Biome 5 Enemies (Chrono):
1. **Clockwork Sentinel:** Bronze armored automaton with a wind-up melee slam (1.0s charge, telegraphed golden circle, then AOE smash in `50*S` px).
2. **Phase Skipper:** Blinks forward in time — teleports `100*S` px toward the player every 2.5s (appears as a blur-trail between positions). Low HP but extremely disorienting.
3. **Temporal Archer:** Fires arrows that travel in **slow motion** for 1.5s (visible, dodgeable), then instantly accelerate to `600*S` px/s for the remaining flight (punishes players who ignore "slow" projectiles).
4. **Paradox Twin:** Always spawns as a **linked pair**. Killing one instantly heals the other to full HP. Must be killed within 1.5s of each other or the survivor respawns its twin. Connected by a visible golden tether line.

### 5 Mega-Bosses:
1. **Drake Prime (Wyrm Cruiser)** *(Biome 1)*: 16-way radial fire rings, dual sweeping lasers, summoning add pods.
2. **Ignis Colossus (Molten Core)** *(Biome 2)*: Lava geyser eruptions, 360° flamethrower sweep, magma crust smash.
3. **Null Pointer (Cyber Overlord)** *(Biome 3)*: 4-beam cross laser, laser cage trap, EMP weapon jam (disables all weapons for 1.5s).
4. **Oblivion Titan (The Abyssal Sovereign)** *(Biome 4)*: Dual black holes, screen-cutting dimensional rifts, berserk at 25% HP (+80% speed, +50% damage).
5. **Chronos Arbiter (The Timekeeper)** *(Biome 5)*: Multi-phase temporal boss:
   - **Phase 1 (100–60% HP):** Summons clockwork minions and fires golden time-bolt spirals. Periodically rewinds its position to where it was 3 seconds ago (healing 5% HP).
   - **Phase 2 (60–30% HP):** Creates 2 temporal clones of itself (each at 20% HP). Clones mirror boss attacks with 1s delay. All 3 must be killed within 5s of each other.
   - **Phase 3 (30–0% HP):** Enters "Paradox Rage" — arena gets chromatic aberration, boss fires in all directions with time-dilated bullets (slow then fast), and periodically freezes ALL enemies and bullets on screen for 1.5s (player can still move, must dodge when unfreeze triggers).

---

## 5. 100-Level / 20-Minute Progression

### XP Formula:
$$\text{xpFor}(L) = \lfloor 10 + 6.5 \cdot L + 0.35 \cdot L^2 \rfloor$$

### Timeline:
| Phase | Time | Levels | Events |
|-------|------|--------|--------|
| Early Swarm | 0:00–5:00 | 1–25 | Building 2–3 weapons, learning biome enemies |
| Mid-Game | 5:00–10:00 | 25–50 | Elite waves, Mini-Boss at 10:00, 3–4 weapons |
| Late Push | 10:00–15:00 | 50–75 | Tier-3 evolutions, heavy spawn pressure |
| Final Onslaught | 15:00–20:00 | 75–100 | Full build, Pre-Boss wave, Titan at Lv 100 |

### Victory Condition:
Reach **Level 100** → triggers Biome Titan spawn → defeat it → **STAGE CLEARED** screen → +10,000 Coins → next biome unlocked.

---

## 6. Execution Checklist

- [ ] **Phase 1:** Auto-Pickup XP + HUD cleanup (remove gems, bigger text, progress bar)
- [ ] **Phase 2:** Add 10 new weapons to `WEAPONS`, `WEAPON_IDS`, `TREES`, player init
- [ ] **Phase 3:** Single-view scroll loadout (remove pagination, add `loadoutScrollY`)
- [ ] **Phase 4:** 5 biome engine (`ENVIRONMENTS`, stage select, background renderers)
- [ ] **Phase 5:** 20 biome enemies + 5 mega-bosses (biome-aware spawner)
- [ ] **Phase 6:** 100-level cap, 20-min XP tuning, victory screen
- [ ] **Phase 7:** Sync dist, test APK, verify Cloudflare tunnel
