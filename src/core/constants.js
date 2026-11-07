// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — CORE CONSTANTS, SPRITES & THEME PALETTE
// ═══════════════════════════════════════════════════════════════

const DEV_MODE = false;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d', { alpha: false });
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const TAU = Math.PI * 2;

let W = 0, H = 0, DPR = 1, S = 1, bgGrad = null;
let worldW = 0, worldH = 0;
let cam = { x: 0, y: 0 };
let stars = [];
let embers = [];
let nebulae = [
  { x: 0.28, y: 0.35, r: 0.45, vx: 0.006, vy: 0.003, col: '140,40,230' },
  { x: 0.72, y: 0.62, r: 0.52, vx: -0.005, vy: 0.005, col: '255,50,90' }
];

let touchMove = { id: null, startX: 0, startY: 0, curX: 0, curY: 0, active: false };
let touchAim = { id: null, startX: 0, startY: 0, curX: 0, curY: 0, active: false };

let currentUser = null; // null = guest mode
let authDB = null;

const MODE = { MENU: 'menu', PLAY: 'play', LEVEL: 'level', PAUSE: 'pause', DEAD: 'dead', SHOP: 'shop', LOADOUT: 'loadout', VICTORY: 'victory' };
let mode = MODE.MENU;
let modeAt = 0;

let G = null;
let keys = {};
let shopRects = { rows: [], back: null };
let shopNote = null;
let loadoutRects = { rows: [], back: null, start: null };
let loadoutNote = null;
let loadoutScrollY = 0;
let loadoutMaxScroll = 0;
let loadoutTouchStartY = 0;
let loadoutTouchStartScroll = 0;
let loadoutIsDragging = false;
let victoryRects = { restart: null, shop: null, menu: null };
let pauseRects = { resume: null, quit: null };
let deadRects = { restart: null, shop: null, menu: null };
let menuRects = { diffs: [], biomes: [], loadout: null, shop: null, account: null };

const rand = (a, b) => a + Math.random() * (b - a);
const randi = n => Math.floor(Math.random() * n);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const fmt = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');

function glowSprite(color, size) {
  const c = document.createElement('canvas');
  c.width = c.height = size * 2;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size, size, 0, size, size, size);
  gr.addColorStop(0, color);
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, size * 2, size * 2);
  return c;
}
const SPR = {
  player: glowSprite('rgba(255,160,60,0.85)', 64),
  bullet: glowSprite('rgba(255,255,255,0.95)', 24),
  gem: glowSprite('rgba(90,220,255,0.9)', 24),
  gemGold: glowSprite('rgba(255,215,0,0.95)', 28),
  cyan: glowSprite('rgba(255,255,255,0.9)', 32),
  enemy: glowSprite('rgba(255,120,30,0.65)', 40),
  boss: glowSprite('rgba(255,90,0,0.75)', 80),
  shot: glowSprite('rgba(255,25,50,0.95)', 24),
  white: glowSprite('rgba(255,255,255,0.95)', 32),
  gold: glowSprite('rgba(255,215,0,0.85)', 32),
  purple: glowSprite('rgba(192,132,252,0.85)', 32),
  green: glowSprite('rgba(123,255,178,0.85)', 32)
};

function drawGlow(spr, x, y, w) {
  const h = w * spr.height / spr.width;
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(spr, x - w / 2, y - h / 2, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

// ═══════════════════════════════════════════════════════════════════
// ENVIRONMENTS / BIOMES — 5 Distinct Worlds with Unique Hazards & Enemies
// ═══════════════════════════════════════════════════════════════════
const ENVIRONMENTS = {
  nebula: {
    id: 'nebula', name: 'NEON NEBULA', desc: 'Cosmic deep space shrouded in radiant ultraviolet gas',
    bg: ['#19112a', '#0b0816', '#05040a'], gridCol: 'rgba(6,182,212,0.12)',
    hazard: 'STARDUST BURST',
    enemies: ['neb_drifter', 'neb_weaver', 'neb_nova', 'neb_prism'],
    bossKit: 0
  },
  magma: {
    id: 'magma', name: 'MAGMA FORGE', desc: 'Molten volcanic crucibles with blazing heat and eruptions',
    bg: ['#2b0a0a', '#140505', '#080101'], gridCol: 'rgba(249,115,22,0.14)',
    hazard: 'LAVA ERUPTION',
    enemies: ['mag_crawler', 'mag_spitter', 'mag_golem', 'mag_phoenix'],
    bossKit: 1
  },
  cyber: {
    id: 'cyber', name: 'CYBER MATRIX', desc: 'Digital grid mainframe corrupted with hostile firewall entities',
    bg: ['#051515', '#020b0b', '#000505'], gridCol: 'rgba(16,185,129,0.15)',
    hazard: 'LASER TRIPWIRE',
    enemies: ['cyb_drone', 'cyb_turret', 'cyb_glitch', 'cyb_firewall'],
    bossKit: 2
  },
  abyss: {
    id: 'abyss', name: 'ABYSSAL RIFT', desc: 'Infinite void chasm inhabited by cosmic bio-luminescent terrors',
    bg: ['#0b0c26', '#040514', '#01020a'], gridCol: 'rgba(99,102,241,0.14)',
    hazard: 'GRAVITY VORTEX',
    enemies: ['aby_eel', 'aby_jelly', 'aby_leech', 'aby_leviathan'],
    bossKit: 3
  },
  chrono: {
    id: 'chrono', name: 'CHRONO WASTELAND', desc: 'Temporal fracture where past and future collide in golden ruins',
    bg: ['#241a08', '#120d04', '#060401'], gridCol: 'rgba(245,158,11,0.15)',
    hazard: 'TIME SHIFT',
    enemies: ['chr_phantom', 'chr_warp', 'chr_rewind', 'chr_decay'],
    bossKit: 4
  }
};
const ENV_IDS = ['nebula', 'magma', 'cyber', 'abyss', 'chrono'];

// ═══════════════════════════════════════════════════════════════════
// THEME — Edit ONLY this object to re-skin the entire game.
//         All visuals (colors, shapes, SFX) read from here.
//         Zero logic changes needed to change any appearance.
// ═══════════════════════════════════════════════════════════════════
const THEME = {
  player: {
    bodyCol:'#fff6e8', bodyStroke:'#ffb347', bodyStrokeW:2.2,
    coreCol:'#ff7a2f', coreR:0.45,
    wings:[
      {c:'rgba(255,110,40,0.95)', s:0.7, l:0.5},
      {c:'rgba(255,160,70,0.85)', s:1.0, l:0.8},
      {c:'rgba(255,210,130,0.7)', s:1.3, l:1.1}
    ],
    flapSpd:0.012,
    thrustCol:'rgba(255,120,40,0.9)', thrustPulse:0.03, thrustLen:1.1,
    invCol:'#8ecbff', invW:2
  },
  wp: {
    mg:       {bCol:'#ffffff',  bSize:2.0,  sfx:[1050,0.02,'square',0.003,-180]},
    drone:    {bCol:'#f8fafc',  bSize:2.4,  body:'#1e293b', stroke:'#f8fafc', core:'#ffffff', sfx:[1400,0.025,'sine',0.004,-300]},
    hole:     {inner:'rgba(5,4,10,0.97)', mid:'rgba(255,255,255,0.18)', outer:'rgba(255,255,255,0)', ring:'rgba(255,255,255,0.85)', ringW:2.4, spin:0.0024, sfx:[70,0.5,'sine',0.05,-20]},
    shield:   {col:'rgba(255,255,255,0.75)', flash:'#ffffff', segs:6, gap:0.12, w:3, r:25, spin:0.0016},
    zap:      {outer:'rgba(255,255,255,0.55)', outerW:6, inner:'#ffffff', innerW:2, sfx:[1900,0.06,'sawtooth',0.02,-1000]},
    nuke:     {body:'#ffffff', nose:'#f1f5f9', boom:'#ffffff', cluster:'#f8fafc', sfx:[220,0.18,'sawtooth',0.04,300], sfxBoom:[80,0.35,'sawtooth',0.07,-40]},
    disk:     {col:'#ffffff', spokes:6, inR:0.5, spin:0.015, sfx:[880,0.09,'triangle',0.03,-300], sfxBounce:[1100,0.03,'triangle',0.02,100]},
    laser:    {outerCol:'rgba(255,255,255,0.4)', outerWM:1.8, coreCol:'#ffffff', coreW:15, centerCol:'#ffffff', centerWM:0.4, trail:'#f8fafc'},
    spiral:   {bCol:'#ffffff', bSize:3.0},
    wormhole: {col:'#ffffff', arcW:2.4, spin:0.003, convCol:'#ffffff', sfx:[500,0.2,'sine',0.03,300]},
    mine:     {col:'#f8fafc', hexR:8, armCol:'#ffffff', blastCol:'#ffffff', sfx:[2400,0.06,'sine',0.02,-1800]},
    railgun:  {col:'#ffffff', trailCol:'rgba(255,255,255,0.85)', chargeCol:'#ffffff', sfx:[55,0.15,'sawtooth',0.07,-20]},
    swarm:    {col:'#ffffff', bodyCol:'#f8fafc', trailCol:'#ffffff', sfx:[220,0.04,'triangle',0.02,6]},
    flame:    {col:'#ffffff', coneCol:'#f8fafc', burnCol:'#ffffff', sfx:[300,0.08,'sawtooth',0.03,-100]},
    scythe:   {col:'#ffffff', bladeCol:'#ffffff', pullCol:'rgba(255,255,255,0.35)', sfx:[440,0.1,'triangle',0.03,80]},
    flak:     {col:'#ffffff', shellCol:'#ffffff', pelletCol:'#f8fafc', sfx:[80,0.08,'sawtooth',0.05,0]},
    orbital:  {col:'#ffffff', beamCol:'#ffffff', reticleCol:'rgba(255,255,255,0.85)', sfx:[880,0.5,'sine',0.03,880]},
    echo:     {col:'#ffffff', ghostCol:'rgba(255,255,255,0.45)', sfx:[660,0.08,'sine',0.02,8]},
    tether:   {col:'#ffffff', wireCol:'#ffffff', sparkCol:'#ffffff', sfx:[165,0.12,'sawtooth',0.03,0]},
    parasite: {col:'#ffffff', sporeCol:'#ffffff', auraCol:'rgba(255,255,255,0.4)', sfx:[90,0.06,'sine',0.04,5]}
  },
  en: {
    chaser:   {shape:'hex',    sides:6, col:'#ff6b35', stroke:'rgba(255,255,255,0.7)', sw:1.2},
    fast:     {shape:'tri',    col:'#ff8533', stroke:'rgba(255,255,255,0.7)', sw:1.2, hr:1.3},
    tank:     {shape:'oct',    sides:8, col:'#c2410c', stroke:'rgba(255,255,255,0.8)', sw:2},
    shooter:  {shape:'diamond',col:'#f97316', stroke:'rgba(255,255,255,0.7)', sw:1.2, hr:1.2},
    charger:  {shape:'chevron',col:'#ea580c', stroke:'rgba(255,255,255,0.8)', sw:1.4},
    spinner:  {shape:'star',   pts:6, inR:0.55, col:'#ff781f', stroke:'rgba(255,255,255,0.75)', sw:1.2},
    artillery:{shape:'circle', col:'#d95700', stroke:'rgba(255,255,255,0.7)', sw:1.2},
    beamer:   {shape:'rect',   col:'#ffa726', stroke:'rgba(255,255,255,0.7)', sw:1.2, beamCol:'#ef4444', telegCol:'rgba(255,60,60,0.7)'},
    // Nebula Biome Enemies
    neb_drifter: {shape:'hex',    sides:6, col:'#ff7a29', stroke:'rgba(255,255,255,0.75)', sw:1.2},
    neb_weaver:  {shape:'diamond',col:'#f97316', stroke:'rgba(255,255,255,0.75)', sw:1.2, hr:1.3},
    neb_nova:    {shape:'circle', col:'#ea580c', stroke:'rgba(255,255,255,0.85)', sw:1.4},
    neb_prism:   {shape:'tri',    col:'#ff9248', stroke:'rgba(255,255,255,0.75)', sw:1.2, hr:1.2},
    // Magma Biome Enemies
    mag_crawler: {shape:'oct',    sides:8, col:'#f97316', stroke:'rgba(255,255,255,0.75)', sw:1.3},
    mag_spitter: {shape:'circle', col:'#ea580c', stroke:'rgba(255,255,255,0.8)', sw:1.4},
    mag_golem:   {shape:'rect',   col:'#b45309', stroke:'rgba(255,255,255,0.85)', sw:2.0},
    mag_phoenix: {shape:'chevron',col:'#ff5419', stroke:'rgba(255,255,255,0.85)', sw:1.5},
    // Cyber Biome Enemies
    cyb_drone:   {shape:'tri',    col:'#ff8c00', stroke:'rgba(255,255,255,0.8)', sw:1.2, hr:1.4},
    cyb_turret:  {shape:'rect',   col:'#ff7700', stroke:'rgba(255,255,255,0.85)', sw:1.3},
    cyb_glitch:  {shape:'star',   pts:5, inR:0.5, col:'#ffa040', stroke:'rgba(255,255,255,0.8)', sw:1.2},
    cyb_firewall:{shape:'hex',    sides:6, col:'#c2410c', stroke:'rgba(255,255,255,0.85)', sw:2.2},
    // Abyss Biome Enemies
    aby_eel:     {shape:'chevron',col:'#ff6b35', stroke:'rgba(255,255,255,0.75)', sw:1.3},
    aby_jelly:   {shape:'circle', col:'#f97316', stroke:'rgba(255,255,255,0.8)', sw:1.2},
    aby_leech:   {shape:'diamond',col:'#ea580c', stroke:'rgba(255,255,255,0.8)', sw:1.2, hr:1.4},
    aby_leviathan:{shape:'oct',   sides:8, col:'#9a3412', stroke:'rgba(255,255,255,0.9)', sw:2.4},
    // Chrono Biome Enemies
    chr_phantom: {shape:'tri',    col:'#fbbf24', stroke:'rgba(255,255,255,0.75)', sw:1.2, hr:1.2},
    chr_warp:    {shape:'star',   pts:6, inR:0.5, col:'#f59e0b', stroke:'rgba(255,255,255,0.8)', sw:1.3},
    chr_rewind:  {shape:'circle', col:'#d97706', stroke:'rgba(255,255,255,0.8)', sw:1.3},
    chr_decay:   {shape:'diamond',col:'#b45309', stroke:'rgba(255,255,255,0.85)', sw:1.4, hr:1.2}
  },
  boss:[
    {name:'INFERNO DRAKE',  eName:'\\u26A1 ENRAGED INFERNO DRAKE',  col:'#ff6600', eCol:'#ea580c', bar:'#ff7a29', eBar:'#ea580c'},
    {name:'VORTEX TITAN',   eName:'\\u26A1 ENRAGED VORTEX TITAN',   col:'#ff7e22', eCol:'#c2410c', bar:'#ff8533', eBar:'#c2410c'},
    {name:'STORM SENTINEL', eName:'\\u26A1 ENRAGED STORM SENTINEL', col:'#ff9436', eCol:'#d95700', bar:'#ffa04d', eBar:'#d95700'},
    {name:'NEXUS CORE',     eName:'\\u26A1 OVERCLOCKED NEXUS CORE', col:'#ff5a1f', eCol:'#9a3412', bar:'#ff6c3b', eBar:'#9a3412'},
    {name:'CHRONOS PRIME',  eName:'\\u26A1 TIME BENT CHRONOS PRIME',col:'#fb923c', eCol:'#b45309', bar:'#f97316', eBar:'#9a3412'}
  ],
  vfx: {
    eliteRing:'rgba(255,180,50,0.95)', eliteW:2.2, eliteDash:[4,4],
    burnRing:'rgba(255,60,40,0.85)', burnW:2,
    warnDash:[4,4], warnPulse:0.025, warnExpand:1.5
  },
  hud: {
    hpCol:'#ff4d6d', hpLow:'#ff2a4b', hpAt:0.3, xpCol:'#6ee7ff',
    coinFlash:'#ffffff', coinCol:'#ffd166',
    diffCol:{easy:'#7bffb2', normal:'#ffd166', hard:'#ff4d6d'}
  }
};

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.max(1, Math.floor(W * DPR));
  cv.height = Math.max(1, Math.floor(H * DPR));

  // Desktop vs Mobile scaling:
  // Desktop is zoomed out further (0.85x) so everything is extra compact, razor-sharp, and field of view is wide!
  const isDesktop = Math.min(W, H) >= 540 || (!('ontouchstart' in window) && W >= 720);
  if (isDesktop) {
    S = clamp((Math.min(W, H) / 960) * 0.85, 0.48, 0.80);
    worldW = W * 9;
    worldH = H * 6;
  } else {
    S = clamp(Math.min(W, H) / 430, 0.72, 1.15);
    worldW = W * 5;
    worldH = H * 3;
  }

  bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.2, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.85);
  bgGrad.addColorStop(0, '#19112a');
  bgGrad.addColorStop(0.55, '#0b0816');
  bgGrad.addColorStop(1, '#05040a');

  stars = [];
  const n = Math.floor((W * H) / 13000);
  for (let i = 0; i < n; i++) {
    const tier = Math.random() < 0.6 ? 1 : Math.random() < 0.88 ? 2 : 3;
    stars.push({
      x: rand(0, W), y: rand(0, H),
      r: (tier === 1 ? rand(0.5, 1.0) : tier === 2 ? rand(1.1, 1.8) : rand(1.9, 2.5)) * S,
      tier,
      ph: rand(0, TAU),
      sp: (tier === 1 ? rand(0.15, 0.35) : tier === 2 ? rand(0.4, 0.7) : rand(0.8, 1.2))
    });
  }
  embers = [];
  const m = Math.floor((W * H) / 36000);
  for (let i = 0; i < m; i++) {
    embers.push({ x: rand(0, W), y: rand(0, H), sp: rand(10, 36) * S, dr: rand(-12, 12) * S, ph: rand(0, TAU), a: rand(0.15, 0.55), r: rand(0.8, 2.4) * S });
  }
  if (G && G.player) {
    G.player.x = clamp(G.player.x, G.player.r, worldW - G.player.r);
    G.player.y = clamp(G.player.y, G.player.r, worldH - G.player.r);
  }
}
window.addEventListener('resize', resize);

const DIFF = {
  easy:   { id: 'easy',   name: 'EASY',   cap: 120, spawn: 1.0,  hp: 1.0,  dmg: 1.0, spd: 1.0, reward: 1.0,  bossBonus: 100, desc: 'Casual survival with relaxed pressure' },
  normal: { id: 'normal', name: 'NORMAL', cap: 140, spawn: 0.80, hp: 1.35, dmg: 1.2, spd: 1.1, reward: 1.4,  bossBonus: 150, desc: 'Balanced challenge with +40% Coins' },
  hard:   { id: 'hard',   name: 'HARD',   cap: 155, spawn: 0.65, hp: 1.75, dmg: 1.5, spd: 1.2, reward: 1.85, bossBonus: 200, desc: 'Relentless onslaught with +85% Coins' }
};

const UPGRADES = [
  { id: 'dmg', name: 'Damage Up', desc: '+25% bullet damage', max: 99, color: '#facc15', apply: p => { p.dmg *= 1.25; } },
  { id: 'rate', name: 'Fire Rate Up', desc: '+18% fire rate', max: 12, color: '#facc15', apply: p => { p.rate *= 1.18; } },
  { id: 'multi', name: 'Extra Shots', desc: '+1 projectile for all weapons', max: 8, color: '#facc15', apply: p => { p.multi++; } },
  { id: 'pierce', name: 'Piercing Shots', desc: 'Bullets pierce +1 foe', max: 4, color: '#facc15', apply: p => { p.pierce++; } },
  { id: 'speed', name: 'Speed Up', desc: '+25% move speed', max: 8, color: '#f8fafc', apply: p => { p.speed *= 1.25; } },
  { id: 'hp', name: 'Max HP Up', desc: '+30 max HP and heal 30', max: 99, color: '#f8fafc', apply: p => { p.maxHp += 30; p.hp = Math.min(p.maxHp, p.hp + 30); } },
  { id: 'regen', name: 'HP Regen', desc: 'Regenerate +0.7 HP/s', max: 8, color: '#f8fafc', apply: p => { p.regen += 0.7; } },
  { id: 'magnet', name: 'Shield Capacitor', desc: '+12 kinetic shield barrier', max: 6, color: '#f8fafc', apply: p => { p.shieldCap = (p.shieldCap || 0) + 12; } },
  { id: 'burn', name: 'Burn Rounds', desc: 'Bullets burn foes (+4 DPS)', max: 6, color: '#facc15', apply: p => { p.burn += 4; } },
  { id: 'explode', name: 'Blast Radius', desc: 'Hits blast nearby foes', max: 4, color: '#facc15', apply: p => { p.explode++; } },
  { id: 'crit', name: 'Crit Chance', desc: '+10% critical chance (x2 dmg)', max: 6, color: '#facc15', apply: p => { p.crit += 0.1; } },
  { id: 'steal', name: 'Lifesteal', desc: 'Heal slightly per bullet hit', max: 5, color: '#facc15', apply: p => { p.lifesteal += 1; } }
];

const WEAPONS = {
  mg:       { name: 'Machine Gun',     role: 'RAPID',    desc: 'Rapid bullets fired in your aim direction', color: '#ffe066' },
  drone:    { name: 'Orbit Drone',     role: 'AUTO',     desc: 'Orbiting escorts auto-firing at nearest foes', color: '#6ee7ff' },
  hole:     { name: 'Black Hole',      role: 'CONTROL',  desc: 'Gravity vortex pulling foes in, then collapsing', color: '#c084fc' },
  shield:   { name: 'Shield',          role: 'DEFENSE',  desc: 'Barrier absorbing hits and pulsing shockwaves', color: '#9ef0ff' },
  zap:      { name: 'Chain Lightning', role: 'CHAIN',    desc: 'Electric bolts leaping through enemy swarms', color: '#a78bfa' },
  nuke:     { name: 'Rocket',          role: 'BURST',    desc: 'Heavy rocket with huge blast radius in aim direction', color: '#ff6b35' },
  disk:     { name: 'Bouncing Disk',   role: 'RICOCHET', desc: 'Spinning disk bouncing off world boundary walls', color: '#38ef7d' },
  laser:    { name: 'Laser Beam',      role: 'BEAM',     desc: 'Continuous directional laser melting lines of foes', color: '#ff416c' },
  spiral:   { name: 'Spiral Shot',     role: 'PATTERN',  desc: 'Rotating spiral energy ring around your ship', color: '#e056fd' },
  wormhole: { name: 'Bullet Eater',    role: 'WILD',     desc: 'Portal eating enemy bullets and firing them back', color: '#00d2d3' },
  mine:     { name: 'Cryo Minefield',  role: 'TRAP',     desc: 'Proximity freeze mines slowing enemies by 60%', color: '#70d6ff' },
  railgun:  { name: 'Gauss Railgun',   role: 'PRECISION',desc: 'Charged supersonic slug piercing all enemies', color: '#d946ef' },
  swarm:    { name: 'Swarm Drones',    role: 'INTERCEPT',desc: 'Agile micro-drones dive-bombing nearby foes', color: '#fbbf24' },
  flame:    { name: 'Plasma Torch',    role: 'CLOSE',    desc: 'Sweeping flame cone with stacking burn DOT', color: '#ff4500' },
  scythe:   { name: 'Graviton Scythe', role: 'BOOMERANG',desc: 'Curving blade dragging enemies in its wake', color: '#8b5cf6' },
  flak:     { name: 'Flak Cannon',     role: 'SHOTGUN',  desc: 'Heavy shell bursting into 12-pellet shrapnel', color: '#facc15' },
  orbital:  { name: 'Orbital Lance',   role: 'SMITE',    desc: 'Targeted solar beam smiting from above', color: '#f59e0b' },
  echo:     { name: 'Phantom Echo',    role: 'TEMPORAL', desc: 'Ghost ship replaying your weapons 2s delayed', color: '#2dd4bf' },
  tether:   { name: 'Gravity Tether',  role: 'GRAPPLE',  desc: 'Razor wire clothesline between you and foe', color: '#ef4444' },
  parasite: { name: 'Void Parasite',   role: 'CONTROL',  desc: 'Parasitic spore hijacking enemy to fight for you', color: '#84cc16' }
};

const WEAPON_IDS = ['mg', 'drone', 'hole', 'shield', 'zap', 'nuke', 'disk', 'laser', 'spiral', 'wormhole', 'mine', 'railgun', 'swarm', 'flame', 'scythe', 'flak', 'orbital', 'echo', 'tether', 'parasite'];

const TREES = {
  mg: [
    [
      { id: 'rate', name: 'Faster Firing', desc: '+30% fire rate', color: '#ffd166' },
      { id: 'dmg', name: 'Bigger Bullets', desc: '+35% damage', color: '#ff7a45' }
    ],
    [
      { id: 'pierce', name: 'Piercing', desc: 'Goes through +2 enemies', color: '#ffb3c1' },
      { id: 'burn', name: 'Burn Rounds', desc: '+6 fire burn damage/sec', color: '#ff6b35' }
    ],
    [
      { id: 'split', name: 'Extra Barrel', desc: '+1 bullet stream', color: '#ff9f1c' },
      { id: 'execute', name: 'Executioner', desc: '+50% damage to all foes', color: '#ff4d6d' }
    ]
  ],
  drone: [
    [
      { id: 'extra', name: 'Second Drone', desc: '+1 orbiting drone escort', color: '#6ee7ff' },
      { id: 'rate', name: 'Faster Guns', desc: '+30% drone fire rate', color: '#ffd166' }
    ],
    [
      { id: 'pierce', name: 'Piercing Bolts', desc: 'Drone bolts pierce +2 foes', color: '#ffb3c1' },
      { id: 'power', name: 'Power Boost', desc: '+45% drone bolt damage', color: '#ff7a45' }
    ],
    [
      { id: 'swarm', name: 'Drone Swarm', desc: '+1 additional drone escort', color: '#6ee7ff' },
      { id: 'rapid', name: 'Afterburner', desc: '+40% drone fire rate & speed', color: '#ffd166' }
    ]
  ],
  hole: [
    [
      { id: 'wide', name: 'Wider Pull', desc: '+35% black hole pull radius', color: '#c084fc' },
      { id: 'long', name: 'Longer Duration', desc: '+35% black hole duration', color: '#a78bfa' }
    ],
    [
      { id: 'twin', name: 'Twin Holes', desc: '+1 black hole deployed per cast', color: '#c084fc' },
      { id: 'deep', name: 'Stronger Crush', desc: '+55% vortex damage per second', color: '#ff7a45' }
    ],
    [
      { id: 'collapse', name: 'Big Bang', desc: '+70% collapse blast damage', color: '#ff9f1c' },
      { id: 'singularity', name: 'Triple Holes', desc: '+1 additional black hole', color: '#c084fc' }
    ]
  ],
  shield: [
    [
      { id: 'block', name: 'Fast Recharge', desc: '-20% shield cooldown', color: '#9ef0ff' },
      { id: 'pulse', name: 'Strong Pulse', desc: '+40% kinetic pulse damage', color: '#ffd166' }
    ],
    [
      { id: 'reflect', name: 'Mirror Guard', desc: '+60% reflected bullet damage', color: '#9ef0ff' },
      { id: 'wide', name: 'Wide Shockwave', desc: '+50% pulse impact radius', color: '#6ee7ff' }
    ],
    [
      { id: 'guard', name: 'Safe Zone', desc: '+1.2s invulnerability on hit', color: '#7bffb2' },
      { id: 'bulwark', name: 'Quick Reset', desc: '-30% shield recharge cooldown', color: '#9ef0ff' }
    ]
  ],
  zap: [
    [
      { id: 'chain', name: 'More Jumps', desc: '+3 lightning chain jumps', color: '#a78bfa' },
      { id: 'power', name: 'Stronger Bolt', desc: '+35% lightning strike damage', color: '#ff7a45' }
    ],
    [
      { id: 'fork', name: 'Fork', desc: 'Splits to 2 target branches', color: '#a78bfa' },
      { id: 'strike', name: 'Double Strike', desc: '+2 lightning chain links', color: '#ffd166' }
    ],
    [
      { id: 'storm', name: 'Storm Cloud', desc: '+3 lightning chain links', color: '#a78bfa' },
      { id: 'overload', name: 'Lightning Ball', desc: '+60% lightning strike damage', color: '#ff4d6d' }
    ]
  ],
  nuke: [
    [
      { id: 'yield', name: 'Bigger Blast', desc: '+45% rocket explosion radius', color: '#ff6b35' },
      { id: 'fast', name: 'Faster Rocket', desc: '+40% rocket flight speed', color: '#ffd166' }
    ],
    [
      { id: 'twin', name: 'Twin Rockets', desc: '+1 rocket launched per volley', color: '#ff9f1c' },
      { id: 'cluster', name: 'Cluster Bomb', desc: 'Detonation releases 6 explosive shards', color: '#ffbe0b' }
    ],
    [
      { id: 'mirv', name: 'Heavy Warheads', desc: '+2 additional heavy rockets', color: '#ff4d6d' },
      { id: 'fallout', name: 'Burn Zone', desc: 'Lingering fire on ground for 3s', color: '#7bffb2' }
    ]
  ],
  disk: [
    [
      { id: 'bounce', name: 'Extra Bounces', desc: '+3 wall bounces before fading', color: '#8ee9ff' },
      { id: 'spin', name: 'Speed Boost', desc: '+35% disk flight speed & DPS', color: '#6ee7ff' }
    ],
    [
      { id: 'twin', name: 'Second Disk', desc: '+1 bouncing disk launched', color: '#9ef0ff' },
      { id: 'shatter', name: 'Shatter AoE', desc: 'Final bounce triggers concussive blast', color: '#c084fc' }
    ],
    [
      { id: 'orbit', name: 'Twin Orbit', desc: '+2 permanent orbiting defense blades', color: '#a78bfa' },
      { id: 'plasma', name: 'Plasma Edge', desc: 'Disks slice with burn (+7 DPS) & pierce', color: '#ff7a45' }
    ]
  ],
  laser: [
    [
      { id: 'wide', name: 'Wider Beam', desc: '+50% beam thickness and range', color: '#ff7a45' },
      { id: 'heat', name: 'Fast Warmup', desc: '+35% continuous laser DPS', color: '#ffd166' }
    ],
    [
      { id: 'split', name: 'Split Beam', desc: 'Fires angled twin laser beams', color: '#ff9f1c' },
      { id: 'trail', name: 'Fire Trail', desc: 'Beam path creates burning ground patches', color: '#ff6b35' }
    ],
    [
      { id: 'overcharge', name: 'Overcharge', desc: '+65% beam damage and heat', color: '#ff4d6d' },
      { id: 'refract', name: 'Bounce Beam', desc: 'Reflects into secondary nearby targets', color: '#c084fc' }
    ]
  ],
  spiral: [
    [
      { id: 'wide', name: 'Wider Ring', desc: '+40% spiral orbit radius', color: '#c084fc' },
      { id: 'gyro', name: 'Faster Spin', desc: '+35% spiral rotation velocity', color: '#a78bfa' }
    ],
    [
      { id: 'double', name: 'Double Spiral', desc: '+1 opposing spiral energy arm', color: '#ffd166' },
      { id: 'phase', name: 'Phase Bullets', desc: 'Spiral shots pierce through +2 enemies', color: '#8ee9ff' }
    ],
    [
      { id: 'graviton', name: 'Gravity Pull', desc: 'Pulls nearby enemies toward spiral ring', color: '#9ef0ff' },
      { id: 'collapse', name: 'Nova Pulse', desc: 'Spiral pulses a radial blast every 2s', color: '#ff4d6d' }
    ]
  ],
  wormhole: [
    [
      { id: 'range', name: 'Bigger Mouth', desc: '+45% bullet suction radius', color: '#a78bfa' },
      { id: 'reflect', name: 'Damaging Return', desc: 'Converted bullets deal +70% damage', color: '#8ee9ff' }
    ],
    [
      { id: 'twin', name: 'Twin Portals', desc: '+1 active spatial portal', color: '#c084fc' },
      { id: 'pulse', name: 'Zap Pulse', desc: 'Portal zaps nearby enemies with lightning', color: '#ffd166' }
    ],
    [
      { id: 'void', name: 'Full Cleanse', desc: 'Immediately cleanses all screen enemy bullets', color: '#ff4d6d' },
      { id: 'echo', name: 'Double Fire', desc: 'Doubles all player bullet counts inside portal', color: '#7bffb2' }
    ]
  ],
  mine: [
    [
      { id: 'fast', name: 'Quick Arm', desc: 'Mines arm 50% faster and last +4s', color: '#70d6ff' },
      { id: 'count', name: 'Extra Mines', desc: '+3 max active mines deployed', color: '#00f0ff' }
    ],
    [
      { id: 'cluster', name: 'Sub-Zero Cluster', desc: 'Detonation spawns 3 smaller daughter mines', color: '#70d6ff' },
      { id: 'range', name: 'Wide Blast', desc: '+50% detonation radius and slow duration', color: '#00f0ff' }
    ],
    [
      { id: 'execute', name: 'Absolute Zero', desc: 'Enemies below 25% HP shatter instantly', color: '#ff4d6d' },
      { id: 'tesla', name: 'Tesla Wire', desc: 'Nearby mines link via electric arcs', color: '#a78bfa' }
    ]
  ],
  railgun: [
    [
      { id: 'charge', name: 'Quick Charge', desc: '-30% charge time between shots', color: '#d946ef' },
      { id: 'trail', name: 'Ion Trail', desc: 'Leaves damaging trail for 1.5s', color: '#f43f5e' }
    ],
    [
      { id: 'conduct', name: 'Superconductor', desc: '+20% damage per enemy pierced', color: '#d946ef' },
      { id: 'shrapnel', name: 'Overcharge', desc: 'Crits spawn cone of shrapnel darts', color: '#ff9f1c' }
    ],
    [
      { id: 'dual', name: 'Dual Rail', desc: 'Fires twin parallel hyper-velocity rails', color: '#d946ef' },
      { id: 'mega', name: 'Mega Charge', desc: '+80% damage and knockback force', color: '#ff4d6d' }
    ]
  ],
  swarm: [
    [
      { id: 'count', name: 'Bigger Swarm', desc: '+4 additional micro-drones', color: '#fbbf24' },
      { id: 'speed', name: 'Afterburner', desc: '+40% drone dive speed', color: '#f59e0b' }
    ],
    [
      { id: 'kamikaze', name: 'Kamikaze Protocol', desc: 'Drones explode on contact for 200% damage', color: '#ff9f1c' },
      { id: 'shield', name: 'Shield Interceptor', desc: 'Drones destroy incoming enemy bullets', color: '#6ee7ff' }
    ],
    [
      { id: 'leech', name: 'Leech Nanites', desc: '5% of drone damage heals your ship', color: '#7bffb2' },
      { id: 'barrage', name: 'Missile Barrage', desc: 'Drones fire micro-missiles at targets', color: '#ff6b35' }
    ]
  ],
  flame: [
    [
      { id: 'range', name: 'Long Reach', desc: '+40% flame cone range', color: '#ff4500' },
      { id: 'tick', name: 'Rapid Burn', desc: '+35% burn tick damage', color: '#ff007f' }
    ],
    [
      { id: 'napalm', name: 'Napalm Residue', desc: 'Leaves burning ground patches for 4s', color: '#ff6b35' },
      { id: 'blast', name: 'Thermobaric Jet', desc: 'Periodic knockback blast every 3s', color: '#ff9f1c' }
    ],
    [
      { id: 'blue', name: 'Blue Star Fire', desc: 'Ignores all enemy armor, +40% boss damage', color: '#00bfff' },
      { id: 'spread', name: 'Wildfire', desc: 'Burn spreads to 3 nearby enemies on kill', color: '#ff4d6d' }
    ]
  ],
  scythe: [
    [
      { id: 'pull', name: 'Stronger Pull', desc: '+40% enemy suction force', color: '#8b5cf6' },
      { id: 'range', name: 'Extended Range', desc: '+50% max flight range', color: '#a78bfa' }
    ],
    [
      { id: 'grow', name: 'Event Horizon', desc: 'Grows +12% per enemy hit in flight', color: '#8b5cf6' },
      { id: 'orbit', name: 'Orbital Barrier', desc: 'Orbits ship twice on return as shield', color: '#6ee7ff' }
    ],
    [
      { id: 'vuln', name: 'Eclipse Reave', desc: 'Enemies take +35% damage from all sources', color: '#ff4d6d' },
      { id: 'twin', name: 'Twin Scythes', desc: 'Launches 2 scythes in a V pattern', color: '#c084fc' }
    ]
  ],
  flak: [
    [
      { id: 'pellets', name: 'More Pellets', desc: '+6 pellets per shell burst', color: '#facc15' },
      { id: 'speed', name: 'Quick Reload', desc: '+30% fire rate', color: '#ffd166' }
    ],
    [
      { id: 'flechette', name: 'Flechette Rounds', desc: 'Pellets pierce 2 enemies + bleed DOT', color: '#facc15' },
      { id: 'incendiary', name: 'Incendiary Flak', desc: 'Pellets burst into mini-fireballs', color: '#ff6b35' }
    ],
    [
      { id: 'breach', name: 'Breaching Slug', desc: 'Direct hits deal 3x crit to bosses', color: '#ff4d6d' },
      { id: 'spread', name: 'Wide Spread', desc: '+40% spread angle, covering more area', color: '#facc15' }
    ]
  ],
  orbital: [
    [
      { id: 'lock', name: 'Fast Lock', desc: '-30% lock-on time', color: '#f59e0b' },
      { id: 'radius', name: 'Wide Beam', desc: '+50% beam column radius', color: '#fef08a' }
    ],
    [
      { id: 'sweep', name: 'Sweeping Beam', desc: 'Beam drags across ground for 2s', color: '#f59e0b' },
      { id: 'tri', name: 'Tri-Strike', desc: 'Paints 3 target zones simultaneously', color: '#fbbf24' }
    ],
    [
      { id: 'conduit', name: 'Conduit', desc: 'Walking in beam grants +40% speed/fire-rate', color: '#7bffb2' },
      { id: 'vaporize', name: 'Vaporize', desc: 'Kills enemies below 30% HP in the beam', color: '#ff4d6d' }
    ]
  ],
  echo: [
    [
      { id: 'duration', name: 'Longer Echo', desc: '+1.5s phantom duration', color: '#2dd4bf' },
      { id: 'power', name: 'Stronger Ghost', desc: 'Phantom deals 80% weapon damage', color: '#99f6e4' }
    ],
    [
      { id: 'delay', name: 'Tight Echo', desc: 'Replay delay reduced to 1s', color: '#2dd4bf' },
      { id: 'contact', name: 'Ghostfire', desc: 'Phantom contact damage +10 per level', color: '#ff9f1c' }
    ],
    [
      { id: 'triple', name: 'Triple Echo', desc: '3 phantoms at 1s, 2s, 3s delays', color: '#c084fc' },
      { id: 'overlock', name: 'Overclocked', desc: 'Single phantom deals 150% damage', color: '#ff4d6d' }
    ]
  ],
  tether: [
    [
      { id: 'length', name: 'Long Wire', desc: '+40% max tether length', color: '#ef4444' },
      { id: 'dmg', name: 'Razor Wire', desc: '+50% wire crossing damage', color: '#fca5a5' }
    ],
    [
      { id: 'dual', name: 'Dual Tether', desc: 'Fire 2 wires creating a death triangle', color: '#ef4444' },
      { id: 'electric', name: 'Electrified Wire', desc: 'Wire zaps 3 nearby enemies for chain damage', color: '#a78bfa' }
    ],
    [
      { id: 'anchor', name: 'Singularity Anchor', desc: 'Tethered enemy pulls others toward it', color: '#c084fc' },
      { id: 'snap', name: 'Whiplash', desc: 'Wire snap deals massive burst damage', color: '#ff4d6d' }
    ]
  ],
  parasite: [
    [
      { id: 'duration', name: 'Deep Roots', desc: '+2s infection duration', color: '#84cc16' },
      { id: 'boost', name: 'Stimulant', desc: 'Infected enemies gain +80% damage', color: '#bef264' }
    ],
    [
      { id: 'hive', name: 'Hive Mind', desc: 'Can infect 3+ enemies simultaneously', color: '#84cc16' },
      { id: 'volatile', name: 'Volatile Strain', desc: 'Infected explode on death for 200% HP AOE', color: '#ff9f1c' }
    ],
    [
      { id: 'neural', name: 'Neural Override', desc: '+100% infected attack speed, +2s duration', color: '#7bffb2' },
      { id: 'plague', name: 'Plague Spreader', desc: 'Infection auto-jumps to 2 enemies on expire', color: '#ff4d6d' }
    ]
  ]
};

const POWERS = [
  { id: 'rapid', name: 'OVERDRIVE', icon: 'x2', col: '#ffb347' },
  { id: 'magnet', name: 'MAGNET', icon: 'M', col: '#6ee7ff' },
  { id: 'aegis', name: 'AEGIS', icon: 'A', col: '#8ecbff' },
  { id: 'slow', name: 'TIME WARP', icon: 'T', col: '#c084fc' },
  { id: 'heal', name: 'MEND', icon: '+', col: '#7bffb2' },
  { id: 'nova', name: 'NOVA', icon: '!', col: '#fff3c4' }
];

const PERMS = [
  { id: 'dmg', name: 'Damage Up', desc: '+6% bullet damage', max: 12, base: 150, cat: 'OFFENSE', color: '#ff9f1c', apply: p => { p.dmg *= 1.06; } },
  { id: 'rate', name: 'Fire Rate Up', desc: '+5% fire rate', max: 12, base: 160, cat: 'OFFENSE', color: '#ffd166', apply: p => { p.rate *= 1.05; } },
  { id: 'crit', name: 'Crit Chance', desc: '+5% critical chance', max: 10, base: 200, cat: 'OFFENSE', color: '#f15bb5', apply: p => { p.crit += 0.05; } },
  { id: 'proj', name: 'Extra Shots', desc: '+100% projectiles for all weapons', max: 3, base: 420, cat: 'OFFENSE', color: '#ff9f1c', apply: p => { p.coreProj += 1; } },

  { id: 'hp', name: 'Max HP Up', desc: '+12 starting max HP', max: 12, base: 120, cat: 'DEFENSE', color: '#ff6b6b', apply: p => { p.maxHp += 12; } },
  { id: 'regen', name: 'HP Regen', desc: '+0.12 HP/s regeneration', max: 10, base: 130, cat: 'DEFENSE', color: '#ffa8a8', apply: p => { p.regen += 0.12; } },
  { id: 'resist', name: 'Armor', desc: '-3% damage taken', max: 10, base: 220, cat: 'DEFENSE', color: '#9ef0ff', apply: p => { p.resist += 0.03; } },
  { id: 'revive', name: 'Extra Life', desc: 'Revive once at 50% HP', max: 1, base: 800, cat: 'DEFENSE', color: '#7bffb2', apply: p => { p.revives += 1; } },

  { id: 'speed', name: 'Speed Up', desc: '+4% move speed', max: 12, base: 140, cat: 'UTILITY', color: '#8ee9ff', apply: p => { p.speed *= 1.04; } },
  { id: 'magnet', name: 'Shield Capacitor', desc: '+12 kinetic shield barrier', max: 10, base: 100, cat: 'DEFENSE', color: '#c3a6ff', apply: p => { p.shieldCap = (p.shieldCap || 0) + 12; } },
  { id: 'dash', name: 'Dash Cooldown', desc: '-0.15s dash cooldown', max: 8, base: 180, cat: 'UTILITY', color: '#9ef0ff', apply: p => { p.dashMax = Math.max(1.8, p.dashMax - 0.15); } }
];

function defaultMastery() {
  const m = {};
  for (const wid of WEAPON_IDS) m[wid] = { lv: 1, trees: {} };
  return m;
}

function sanitizeLoadout(lo) {
  let arr = Array.isArray(lo) ? lo.filter(id => WEAPON_IDS.includes(id)) : [];
  arr = [...new Set(arr)].slice(0, 3);
  return arr.length ? arr : ['mg', 'drone', 'hole'];
}

function sanitizeUpgrades(up) {
  const clean = {};
  if (up && typeof up === 'object') {
    for (const u of PERMS) {
      const v = Math.floor(+up[u.id] || 0);
      if (v > 0) clean[u.id] = Math.min(u.max, v);
    }
  }
  return clean;
}

function sanitizeWeapons(wp) {
  const clean = defaultMastery();
  if (wp && typeof wp === 'object') {
    for (const wid of WEAPON_IDS) {
      const rec = wp[wid];
      if (!rec) continue;
      clean[wid].lv = Math.max(1, Math.min(30, Math.floor(+rec.lv || 1)));
      clean[wid].trees = {};
      if (rec.trees && typeof rec.trees === 'object') {
        for (const tier of [1, 2, 3]) {
          const id = rec.trees[tier];
          const nodes = TREES[wid] && TREES[wid][tier - 1];
          if (id && nodes && nodes.some(n => n.id === id)) clean[wid].trees[tier] = id;
        }
      }
    }
  }
  return clean;
}

function weaponUpgradeCost(lvl) {
  return Math.min(2000000, Math.round(300 * Math.pow(1.24, Math.max(0, lvl - 1)) / 10) * 10);
}

// ═══════════════════════════════════════════════════════════════════
// USER AUTHENTICATION & PROGRESS DATABASE (IndexedDB + LocalStorage)
// ═══════════════════════════════════════════════════════════════════
function initAuthDB() {
  return new Promise(resolve => {
    try {
      const req = indexedDB.open('WingsOfFireDB', 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'username' });
        }
      };
      req.onsuccess = e => {
        authDB = e.target.result;
        resolve(authDB);
      };
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

async function sha256(str) {
  try {
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16);
  }
}

// ═══════════════════════════════════════════════════════════════════
