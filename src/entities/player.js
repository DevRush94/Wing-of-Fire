// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — PLAYER SHIP STATE, PHYSICS, AIM & LEVELING
// ═══════════════════════════════════════════════════════════════

function newGame() {
  const chosenDiff = meta.diff || 'easy';
  const startX = worldW ? worldW / 2 : W * 2.5;
  const startY = worldH ? worldH / 2 : H * 1.5;
  G = {
    diff: chosenDiff,
    env: meta.env || 'nebula',
    hazardT: 15,
    t: 0, level: 1, xp: 0, xpNext: xpFor(1), kills: 0, bossKills: 0, banked: false, earned: 0, uid: 0,
    coins: 0, coinsEarned: 0, coinsSpent: 0, coinFlash: 0,
    combo: 0, comboT: 0, maxCombo: 0,
    hitsTaken: 0, isStreak: false,
    milestones: new Set(),
    enemies: [], bullets: [], gems: [], parts: [], holes: [], zaps: [], nukes: [], disks: [], rifts: [], hazards: [], ebeams: [], rings: [], path: [],
    mines: [], scythes: [], tethers: [], parasites: [], echoes: [], flakShells: [], orbitalStrikes: [], flamePools: [], railTrails: [],
    echoBuffer: [], echoIdx: 0,
    pows: [], ebullets: [], slowT: 0, slowStacks: 0, toast: null,
    hitFlash: 0, powerFlash: 0, powerPity: 0,
    spawnT: 0.4, nextBoss: 85, shake: 0,
    cards: [], cardRects: [], up: {}, treeChoice: null,
    bonusPick: false, bonusPickCost: 0, bonusPickDone: false, afterTree: 'resume',
    player: {
      x: startX, y: startY, r: 22 * S,
      hp: 100, maxHp: 100, speed: 225 * S,
      dmg: 7, rate: 2.2, bspeed: 560 * S,
      multi: 1, pierce: 0, crit: 0, burn: 0, explode: 0, lifesteal: 0,
      magnet: 82 * S, regen: 0.8, buffRapid: 0, buffMagnet: 0, rapidStacks: 0, magnetStacks: 0, aegisT: 0, aegisStacks: 0,
      mg: 0, mgT: 0,
      drone: 0, droneT: 0,
      hole: 0, holeT: 2.5,
      shield: 0, shieldCd: 0, shieldFlash: 0, shieldPulse: 0,
      zap: 0, zapT: 1.5,
      nuke: 0, nukeT: 2.0,
      disk: 0, diskT: 1.5,
      laser: 0, laserT: 0, laserActive: 0,
      spiral: 0, spiralAng: 0, spiralT: 0.1,
      wormhole: 0, wormholeT: 3.0,
      mine: 0, mineT: 1.2,
      railgun: 0, railgunT: 2.8, railgunCharge: 0,
      swarm: 0, swarmDrones: [],
      flame: 0, flameActive: 0,
      scythe: 0, scytheT: 2.2,
      flak: 0, flakT: 1.6,
      orbital: 0, orbitalT: 4.5,
      echo: 0, echoT: 6.0,
      tether: 0, tetherT: 3.0,
      parasite: 0, parasiteT: 5.0,
      shieldCap: 0,
      coreProj: 1, resist: 0, revives: 0,
      trees: { mg: {}, drone: {}, hole: {}, shield: {}, zap: {}, nuke: {}, disk: {}, laser: {}, spiral: {}, wormhole: {},
               mine: {}, railgun: {}, swarm: {}, flame: {}, scythe: {}, flak: {}, orbital: {}, echo: {}, tether: {}, parasite: {} },
      fireT: 0.2, inv: 0, dashT: 0, dashCd: 0, dashMax: 3, dashDir: { x: 0, y: -1 }, lastDir: { x: 0, y: -1 },
      aimAng: -Math.PI / 2, hasAim: false
    }
  };

  cam.x = clamp(G.player.x - W / 2, 0, Math.max(0, worldW - W));
  cam.y = clamp(G.player.y - H / 2, 0, Math.max(0, worldH - H));

  for (const wid of getLoadout()) {
    const m = masteryFor(wid);
    G.player[wid] = m.lv;
    G.player.trees[wid] = { ...m.trees };
  }
  applyMeta(G.player);
}

function startGame() {
  newGame();
  mode = MODE.PLAY;
  modeAt = performance.now();
  initAudio();
  haptic(40);
}

function getAimAngle(p) {
  if (p.hasAim) return p.aimAng;
  const target = nearestEnemy(p.x, p.y);
  if (target) return Math.atan2(target.y - p.y, target.x - p.x);
  return Math.atan2(p.lastDir.y, p.lastDir.x);
}

function updatePlayer(dt) {
  const p = G.player;
  let mx = 0, my = 0;

  // Keyboard Movement (WASD / Arrows)
  if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) mx += 1;
  if (keys['KeyW'] || keys['ArrowUp']) my -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) my += 1;

  // Virtual Move Joystick (Mobile left touch)
  if (touchMove && touchMove.active) {
    const dx = touchMove.curX - touchMove.startX;
    const dy = touchMove.curY - touchMove.startY;
    const dist = Math.hypot(dx, dy);
    const maxR = 48 * S;
    if (dist > 4) {
      const power = Math.min(1, dist / maxR);
      mx = (dx / dist) * power;
      my = (dy / dist) * power;
    }
  }

  const kl = Math.hypot(mx, my);
  if (kl > 1) { mx /= kl; my /= kl; }
  if (mx || my) {
    G.path.length = 0;
    p.lastDir = { x: mx, y: my };
  }

  // Virtual Aim Joystick (Mobile right touch)
  if (touchAim && touchAim.active) {
    const adx = touchAim.curX - touchAim.startX;
    const ady = touchAim.curY - touchAim.startY;
    if (Math.hypot(adx, ady) > 6) {
      p.aimAng = Math.atan2(ady, adx);
      p.hasAim = true;
    }
  }

  // Dash movement
  if (p.dashT > 0) {
    p.dashT -= dt;
    mx = p.dashDir.x; my = p.dashDir.y;
    p.x += mx * p.speed * 3.6 * dt;
    p.y += my * p.speed * 3.6 * dt;
    if (Math.random() < 0.6) burst(p.x, p.y, 1, '#8ecbff', 70 * S, 0.28);
  } else if (mx || my) {
    p.x += mx * p.speed * dt;
    p.y += my * p.speed * dt;
    if (Math.random() < 0.3) burst(p.x - mx * 10 * S, p.y - my * 10 * S, 1, '#ff8a3d', 40 * S, 0.25);
  } else if (G.path.length) {
    const wp = G.path[0];
    const dx = wp.x - p.x, dy = wp.y - p.y;
    const d = Math.hypot(dx, dy);
    const step = p.speed * dt;
    if (d > 0.5) p.lastDir = { x: dx / d, y: dy / d };
    if (d <= step + 0.5) {
      p.x = wp.x;
      p.y = wp.y;
      if (G.path.length > 1 || !wp.held) G.path.shift();
    } else {
      p.x += dx / d * step;
      p.y += dy / d * step;
      if (Math.random() < 0.3) burst(p.x - (dx / d) * 10 * S, p.y - (dy / d) * 10 * S, 1, '#ff8a3d', 40 * S, 0.25);
    }
  }

  // 5W x 3H World Boundary Clamping
  p.x = clamp(p.x, p.r, worldW - p.r);
  p.y = clamp(p.y, p.r, worldH - p.r);

  // Camera Follows Player (dead-center, only shifting near edges)
  cam.x = clamp(p.x - W / 2, 0, Math.max(0, worldW - W));
  cam.y = clamp(p.y - H / 2, 0, Math.max(0, worldH - H));

  p.inv = Math.max(0, p.inv - dt);
  p.dashCd = Math.max(0, p.dashCd - dt);
  p.shieldCd = Math.max(0, p.shieldCd - dt);
  p.shieldFlash = Math.max(0, p.shieldFlash - dt);
  if (p.regen > 0) p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
  if (p.buffRapid > 0) { p.buffRapid = Math.max(0, p.buffRapid - dt); if (!p.buffRapid) p.rapidStacks = 0; }
  if (p.buffMagnet > 0) { p.buffMagnet = Math.max(0, p.buffMagnet - dt); if (!p.buffMagnet) p.magnetStacks = 0; }
  if (p.aegisT > 0) { p.aegisT = Math.max(0, p.aegisT - dt); if (!p.aegisT) p.aegisStacks = 0; }
  if (G.slowT > 0) { G.slowT = Math.max(0, G.slowT - dt); if (!G.slowT) G.slowStacks = 0; }
  if (G.comboT > 0) { G.comboT = Math.max(0, G.comboT - dt); if (!G.comboT) G.combo = 0; }
  if (G.coinFlash > 0) G.coinFlash = Math.max(0, G.coinFlash - dt);
  if (G.hitFlash > 0) G.hitFlash = Math.max(0, G.hitFlash - dt);
  if (G.powerFlash > 0) G.powerFlash = Math.max(0, G.powerFlash - dt);
  p.flameActive = Math.max(0, (p.flameActive || 0) - dt);
  p.laserActive = Math.max(0, (p.laserActive || 0) - dt);
}

function nearestEnemy(x, y, maxDist) {
  let best = null, bd = (maxDist || Infinity) ** 2;
  for (const e of G.enemies) {
    if (e.warnT > 0) continue;
    const d = (e.x - x) ** 2 + (e.y - y) ** 2;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function weaponBullet(x, y, ang, spd, dmg, col, size, pierce, burn) {
  if (G.bullets.length >= 400) return;
  G.bullets.push({
    x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
    r: (size || 2.2) * S, dmg, pierce: pierce || 0, crit: Math.random() < (G.player.crit || 0),
    burn: burn || 0, explode: 0, lifesteal: 0, col, life: 1.5, hit: []
  });
}

function fire(dt) {
  const p = G.player;
  p.fireT -= dt;
  if (p.fireT > 0) return;

  p.fireT = 1 / (p.rate * (1 + (p.buffRapid > 0 ? p.rapidStacks : 0)));
  const base = getAimAngle(p);
  const n = Math.min(36, p.multi * p.coreProj);
  for (let i = 0; i < n; i++) {
    if (G.bullets.length >= 400) break;
    const a = base + (i - (n - 1) / 2) * 0.12;
    G.bullets.push({
      x: p.x + Math.cos(a) * p.r, y: p.y + Math.sin(a) * p.r,
      vx: Math.cos(a) * p.bspeed, vy: Math.sin(a) * p.bspeed,
      r: 3.2 * S, dmg: p.dmg, pierce: p.pierce, crit: Math.random() < p.crit,
      burn: p.burn, explode: p.explode, lifesteal: p.lifesteal,
      life: 1.6, hit: []
    });
  }
  beep(720 + rand(-40, 40), 0.03, 'square', 0.005, -140);
}
