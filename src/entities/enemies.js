// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — ENEMY BESTIARY, BIOME AI & BOSS BATTLES
// ═══════════════════════════════════════════════════════════════

function spawnEnemy(type, ox, oy) {
  const p = G.player;
  const d = DIFF[G.diff] || DIFF.easy;
  const scale = (1 + G.t * 0.012) * d.hp;
  const spdScale = d.spd;
  const dmgScale = d.dmg;

  if (!type) {
    const env = (G && G.env && ENVIRONMENTS[G.env]) ? ENVIRONMENTS[G.env] : null;
    if (env && env.enemies && env.enemies.length) {
      const r = Math.random();
      if (G.t > 80) type = r < 0.3 ? env.enemies[0] : r < 0.55 ? env.enemies[1] : r < 0.8 ? env.enemies[2] : env.enemies[3];
      else if (G.t > 40) type = r < 0.45 ? env.enemies[0] : r < 0.75 ? env.enemies[1] : env.enemies[2];
      else type = r < 0.6 ? env.enemies[0] : env.enemies[1];
    } else {
      const r = Math.random();
      if (G.t > 100) {
        type = r < 0.22 ? 'chaser' : r < 0.38 ? 'fast' : r < 0.52 ? 'tank' : r < 0.65 ? 'charger' : r < 0.77 ? 'spinner' : r < 0.89 ? 'artillery' : 'beamer';
      } else if (G.t > 80) {
        type = r < 0.26 ? 'chaser' : r < 0.44 ? 'fast' : r < 0.58 ? 'tank' : r < 0.72 ? 'charger' : r < 0.86 ? 'spinner' : 'artillery';
      } else if (G.t > 60) {
        type = r < 0.30 ? 'chaser' : r < 0.50 ? 'fast' : r < 0.68 ? 'tank' : r < 0.84 ? 'charger' : 'spinner';
      } else if (G.t > 45) {
        type = r < 0.36 ? 'chaser' : r < 0.58 ? 'fast' : r < 0.78 ? 'tank' : 'shooter';
      } else if (G.t > 30) {
        type = r < 0.45 ? 'chaser' : r < 0.70 ? 'fast' : r < 0.88 ? 'tank' : 'charger';
      } else {
        type = r < 0.55 ? 'chaser' : r < 0.82 ? 'fast' : 'tank';
      }
    }
  }

  let base;
  if (type === 'chaser') base = { hp: 16 * scale, speed: 58 * S * spdScale, r: 13 * S, dmg: 8 * dmgScale, xp: 1, col: '#ff6b35', shape: 'hex' };
  else if (type === 'fast') base = { hp: 9 * scale, speed: 98 * S * spdScale, r: 9 * S, dmg: 6 * dmgScale, xp: 1, col: '#ff8533', shape: 'tri' };
  else if (type === 'tank') base = { hp: 70 * scale, speed: 36 * S * spdScale, r: 21 * S, dmg: 16 * dmgScale, xp: 4, col: '#c2410c', shape: 'oct' };
  else if (type === 'shooter') base = { hp: 30 * scale, speed: 32 * S * spdScale, r: 14 * S, dmg: 10 * dmgScale, xp: 3, col: '#f97316', shape: 'diamond' };
  else if (type === 'charger') base = { hp: 42 * scale, speed: 45 * S * spdScale, r: 15 * S, dmg: 22 * dmgScale, xp: 3, col: '#ea580c', shape: 'chevron' };
  else if (type === 'spinner') base = { hp: 35 * scale, speed: 52 * S * spdScale, r: 13 * S, dmg: 7 * dmgScale, xp: 2, col: '#ff781f', shape: 'star' };
  else if (type === 'artillery') base = { hp: 55 * scale, speed: 22 * S * spdScale, r: 17 * S, dmg: 18 * dmgScale, xp: 4, col: '#d95700', shape: 'circle' };
  else if (type === 'beamer') base = { hp: 48 * scale, speed: 28 * S * spdScale, r: 15 * S, dmg: 26 * dmgScale, xp: 4, col: '#ffa726', shape: 'rect' };
  // 20 Biome Enemies
  else if (type === 'neb_drifter') base = { hp: 16 * scale, speed: 60 * S * spdScale, r: 13 * S, dmg: 8 * dmgScale, xp: 1, col: '#ff7a29', shape: 'hex' };
  else if (type === 'neb_weaver') base = { hp: 22 * scale, speed: 75 * S * spdScale, r: 12 * S, dmg: 10 * dmgScale, xp: 2, col: '#f97316', shape: 'diamond' };
  else if (type === 'neb_nova') base = { hp: 28 * scale, speed: 85 * S * spdScale, r: 14 * S, dmg: 18 * dmgScale, xp: 3, col: '#ea580c', shape: 'circle' };
  else if (type === 'neb_prism') base = { hp: 38 * scale, speed: 45 * S * spdScale, r: 15 * S, dmg: 12 * dmgScale, xp: 3, col: '#ff9248', shape: 'tri' };
  else if (type === 'mag_crawler') base = { hp: 45 * scale, speed: 38 * S * spdScale, r: 16 * S, dmg: 14 * dmgScale, xp: 2, col: '#f97316', shape: 'oct' };
  else if (type === 'mag_spitter') base = { hp: 32 * scale, speed: 28 * S * spdScale, r: 15 * S, dmg: 16 * dmgScale, xp: 3, col: '#ea580c', shape: 'circle' };
  else if (type === 'mag_golem') base = { hp: 85 * scale, speed: 24 * S * spdScale, r: 24 * S, dmg: 24 * dmgScale, xp: 5, col: '#b45309', shape: 'rect' };
  else if (type === 'mag_phoenix') base = { hp: 30 * scale, speed: 110 * S * spdScale, r: 12 * S, dmg: 22 * dmgScale, xp: 3, col: '#ff5419', shape: 'chevron' };
  else if (type === 'cyb_drone') base = { hp: 14 * scale, speed: 105 * S * spdScale, r: 10 * S, dmg: 7 * dmgScale, xp: 1, col: '#ff8c00', shape: 'tri' };
  else if (type === 'cyb_turret') base = { hp: 48 * scale, speed: 22 * S * spdScale, r: 16 * S, dmg: 28 * dmgScale, xp: 4, col: '#ff7700', shape: 'rect' };
  else if (type === 'cyb_glitch') base = { hp: 26 * scale, speed: 80 * S * spdScale, r: 13 * S, dmg: 14 * dmgScale, xp: 3, col: '#ffa040', shape: 'star' };
  else if (type === 'cyb_firewall') base = { hp: 95 * scale, speed: 26 * S * spdScale, r: 22 * S, dmg: 18 * dmgScale, xp: 5, col: '#c2410c', shape: 'hex' };
  else if (type === 'aby_eel') base = { hp: 34 * scale, speed: 85 * S * spdScale, r: 14 * S, dmg: 15 * dmgScale, xp: 3, col: '#ff6b35', shape: 'chevron' };
  else if (type === 'aby_jelly') base = { hp: 28 * scale, speed: 36 * S * spdScale, r: 15 * S, dmg: 12 * dmgScale, xp: 2, col: '#f97316', shape: 'circle' };
  else if (type === 'aby_leech') base = { hp: 38 * scale, speed: 70 * S * spdScale, r: 13 * S, dmg: 16 * dmgScale, xp: 3, col: '#ea580c', shape: 'diamond' };
  else if (type === 'aby_leviathan') base = { hp: 110 * scale, speed: 20 * S * spdScale, r: 26 * S, dmg: 30 * dmgScale, xp: 6, col: '#9a3412', shape: 'oct' };
  else if (type === 'chr_phantom') base = { hp: 32 * scale, speed: 75 * S * spdScale, r: 13 * S, dmg: 14 * dmgScale, xp: 3, col: '#fbbf24', shape: 'tri' };
  else if (type === 'chr_warp') base = { hp: 40 * scale, speed: 45 * S * spdScale, r: 16 * S, dmg: 18 * dmgScale, xp: 4, col: '#f59e0b', shape: 'star' };
  else if (type === 'chr_rewind') base = { hp: 50 * scale, speed: 50 * S * spdScale, r: 15 * S, dmg: 12 * dmgScale, xp: 4, col: '#d97706', shape: 'circle' };
  else if (type === 'chr_decay') base = { hp: 60 * scale, speed: 32 * S * spdScale, r: 18 * S, dmg: 22 * dmgScale, xp: 5, col: '#b45309', shape: 'diamond' };
  else base = { hp: (1150 + G.t * 22) * scale, speed: 28 * S * spdScale, r: 46 * S, dmg: 28 * dmgScale, xp: 48, col: '#ff6600', shape: 'boss' };

  const boss = type === 'boss';
  const elite = !boss && G.t > 40 && Math.random() < Math.min(0.16, 0.05 + G.t * 0.00025);
  if (elite) {
    base.hp *= 2.4; base.r *= 1.25; base.speed *= 1.12; base.dmg *= 1.25;
    base.xp = Math.ceil(base.xp * 3); base.col = '#ffd000';
  }

  let x, y;
  const margin = base.r + 14 * S;
  if (ox !== undefined && oy !== undefined) {
    x = clamp(ox, margin, worldW - margin);
    y = clamp(oy, margin, worldH - margin);
  } else if (boss) {
    x = clamp(p.x, margin + 40 * S, worldW - margin - 40 * S);
    y = clamp(cam.y - 100 * S, margin, worldH - margin);
  } else {
    const side = randi(4);
    if (side === 0) {
      x = rand(cam.x - 30 * S, cam.x + W + 30 * S);
      y = cam.y - rand(30, 80) * S;
    } else if (side === 1) {
      x = cam.x + W + rand(30, 80) * S;
      y = rand(cam.y - 30 * S, cam.y + H + 30 * S);
    } else if (side === 2) {
      x = rand(cam.x - 30 * S, cam.x + W + 30 * S);
      y = cam.y + H + rand(30, 80) * S;
    } else {
      x = cam.x - rand(30, 80) * S;
      y = rand(cam.y - 30 * S, cam.y + H + 30 * S);
    }
    x = clamp(x, margin, worldW - margin);
    y = clamp(y, margin, worldH - margin);
  }

  const kitIndex = boss ? ((G.env && ENVIRONMENTS[G.env]) ? ENVIRONMENTS[G.env].bossKit : (G.bossKills % 5)) : 0;
  G.enemies.push({
    id: ++G.uid, x, y, hp: base.hp, maxHp: base.hp, r: base.r, speed: base.speed,
    dmg: base.dmg, xp: base.xp, col: base.col, shape: base.shape,
    boss, kit: kitIndex, elite, type,
    warnT: boss ? 1.0 : 0.4,
    rot: rand(0, TAU), wob: rand(0, TAU), flash: 0, burn: null,
    spawnT: 4.5, shotT: rand(1, 2.2),
    stateT: 0, state: 'idle',
    targetX: 0, targetY: 0
  });
}

function burst(x, y, n, col, spd, life) {
  for (let i = 0; i < n; i++) {
    if (G.parts.length > 340) G.parts.shift();
    const a = rand(0, TAU), s = rand(spd * 0.25, spd);
    G.parts.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: rand(life * 0.5, life), max: life, col, size: rand(1.2, 3.2) * S
    });
  }
}

function addRing(x, y, maxR, col, dur) {
  G.rings.push({ x, y, r: 4 * S, maxR, col, life: dur, max: dur });
}

function killEnemy(e, idx) {
  if (G.enemies[idx] !== e) idx = G.enemies.indexOf(e);
  if (idx < 0) return;

  G.kills++;
  G.combo++;
  G.comboT = 1.6;
  G.maxCombo = Math.max(G.maxCombo, G.combo);

  let earnedCoins = e.boss ? 50 : e.elite ? 5 : 1;
  if (G.combo >= 20) earnedCoins += 3;
  else if (G.combo >= 12) earnedCoins += 2;
  else if (G.combo >= 5) earnedCoins += 1;

  G.coins += earnedCoins;
  G.coinsEarned += earnedCoins;
  G.coinFlash = 0.45;
  beep(1200 + rand(-40, 40), 0.03, 'sine', 0.015, 200);

  if (e.boss) {
    G.bossKills++;
    G.shake = Math.min(18 * S, G.shake + 18 * S);
    addRing(e.x, e.y, 180 * S, '#ff3d6e', 0.65);
    burst(e.x, e.y, 60, '#ff4d6d', 360 * S, 1.2);
    boomBass();
    haptic([80, 50, 120]);
  } else if (e.elite) {
    G.shake = Math.min(10 * S, G.shake + 4 * S);
    addRing(e.x, e.y, 70 * S, '#ffd166', 0.4);
    burst(e.x, e.y, 22, '#ffd166', 280 * S, 0.7);
    chord([600, 750], 0.08, 'triangle', 0.03);
    haptic(30);
  } else {
    G.shake = Math.min(6 * S, G.shake + 1.6 * S);
    burst(e.x, e.y, 12, e.col, 190 * S, 0.45);
    chord([520, 650], 0.05, 'square', 0.015);
  }

  const xpGain = e.xp * (G.diff === 'hard' ? 1.30 : G.diff === 'normal' ? 1.15 : 1.0);
  G.xp += xpGain;
  // Floating +XP text
  G.parts.push({
    x: e.x, y: e.y - 10 * S, vx: 0, vy: -45 * S,
    life: 0.45, max: 0.45, col: e.boss ? '#ffd700' : e.elite ? '#ffd166' : '#6ee7ff',
    size: (e.boss ? 5 : e.elite ? 4 : 2.5) * S, text: '+' + Math.round(xpGain) + ' XP'
  });

  G.powerPity += 0.8;
  if (e.boss) {
    spawnPower(e.x, e.y, 'heal');
    spawnPower(e.x + 24 * S, e.y);
    spawnPower(e.x - 24 * S, e.y);
  } else if (e.elite) {
    spawnPower(e.x, e.y);
  } else if (G.powerPity > 42 || Math.random() < (e.type === 'tank' ? 0.14 : 0.035)) {
    spawnPower(e.x, e.y);
    G.powerPity = 0;
  }

  G.enemies.splice(idx, 1);
}

function damageEnemy(e, dmg) {
  if (e.warnT > 0) return;
  if (e.vuln && e.vuln.t > 0) dmg *= (e.vuln.mul || 1.35);
  e.hp -= dmg;
  e.flash = 0.08;
  if (Math.random() < 0.1) burst(e.x, e.y, 2, '#ffb347', 120 * S, 0.2);
}

function explodeAt(x, y, dmg, radius, col) {
  for (let j = G.enemies.length - 1; j >= 0; j--) {
    const o = G.enemies[j];
    if (o.warnT > 0) continue;
    const dx = o.x - x, dy = o.y - y;
    if (dx * dx + dy * dy <= radius * radius) {
      damageEnemy(o, dmg);
      if (o.hp <= 0) killEnemy(o, j);
    }
  }
  addRing(x, y, radius, col || '#ffb347', 0.35);
  burst(x, y, 16, col || '#ffb347', 240 * S, 0.4);
}

function hurt(dmg) {
  const p = G.player;
  if (p.inv > 0 || p.aegisT > 0 || p.dashT > 0 || mode !== MODE.PLAY) return false;

  const st = (p.trees && p.trees.shield) || {};
  if (p.shield > 0 && p.shieldCd <= 0) {
    let cd = Math.max(2.4, 7.2 - p.shield * 0.95);
    if (st[1] === 'block') cd *= 0.8;
    if (st[3] === 'bulwark') cd *= 0.7;
    p.shieldCd = cd;
    p.shieldFlash = 0.45;
    p.inv = Math.max(p.inv, 0.4);
    if (st[3] === 'guard') p.inv = Math.max(p.inv, 1.2);

    const pulseR = (st[2] === 'wide' ? 175 : 120) * S;
    const pulseDmg = (14 + p.shield * 10) * (st[1] === 'pulse' ? 1.4 : 1);
    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < pulseR * pulseR) {
        damageEnemy(e, pulseDmg);
        const dd = Math.hypot(e.x - p.x, e.y - p.y) || 1;
        e.x = clamp(e.x + (e.x - p.x) / dd * 28 * S, e.r, W - e.r);
        e.y = clamp(e.y + (e.y - p.y) / dd * 28 * S, e.r, H - e.r);
        if (e.hp <= 0) killEnemy(e, j);
      }
    }
    addRing(p.x, p.y, pulseR, '#9ef0ff', 0.35);
    burst(p.x, p.y, 22, '#9ef0ff', 260 * S, 0.5);
    G.shake = Math.min(14 * S, G.shake + 6 * S);
    beep(1400, 0.14, 'triangle', 0.04, -900);
    haptic(35);
    return true;
  }

  dmg *= Math.max(0.2, 1 - (p.resist || 0));
  if (p.shieldCap > 0) {
    const absorb = Math.min(p.shieldCap, dmg);
    p.shieldCap -= absorb;
    dmg -= absorb;
    addRing(p.x, p.y, p.r * 2.2, '#06b6d4', 0.22);
    burst(p.x, p.y, 8, '#06b6d4', 140 * S, 0.28);
    beep(550, 0.08, 'triangle', 0.02, -200);
    if (dmg <= 0) {
      p.inv = 0.18;
      return true;
    }
  }
  p.hp = Math.max(0, p.hp - dmg);
  p.inv = 0.22;
  G.hitsTaken++;
  G.hitFlash = 0.24;
  G.shake = Math.min(16 * S, G.shake + 8 * S);
  burst(p.x, p.y, 16, '#ff2a4b', 210 * S, 0.45);
  beep(90, 0.16, 'sawtooth', 0.06, -40);
  haptic(45);

  if (p.hp <= 0) {
    if (p.revives > 0) {
      p.revives--;
      p.hp = p.maxHp * 0.55;
      p.inv = Math.max(p.inv, 2.4);
      G.shake = Math.min(18 * S, G.shake + 12 * S);
      addRing(p.x, p.y, 140 * S, '#7bffb2', 0.6);
      burst(p.x, p.y, 45, '#7bffb2', 340 * S, 0.9);
      G.toast = { text: 'PHOENIX REVIVAL! 🔥', t: 1.8, col: '#7bffb2' };
      fanfare();
      haptic([60, 40, 100]);
    } else {
      p.hp = 0;
      die();
    }
  }
  return false;
}

function die() {
  mode = MODE.DEAD;
  modeAt = performance.now();
  G.path.length = 0;
  if (best && G.t > best.time) G.isStreak = true;
  G.newBest = saveBest();
  bankRun();
  beep(180, 0.6, 'sawtooth', 0.07, -150);
  haptic([100, 60, 200]);
}

function doDash() {
  const p = G.player;
  if (!p || p.dashCd > 0 || mode !== MODE.PLAY) return;

  let dx = 0, dy = 0;
  if (touchMove && touchMove.active) {
    const tdx = touchMove.curX - touchMove.startX;
    const tdy = touchMove.curY - touchMove.startY;
    if (Math.hypot(tdx, tdy) > 4) { dx = tdx; dy = tdy; }
  }
  if (!dx && !dy && G.path.length) {
    dx = G.path[0].x - p.x;
    dy = G.path[0].y - p.y;
  }
  if (!dx && !dy) {
    if (p.lastDir && (p.lastDir.x || p.lastDir.y)) {
      dx = p.lastDir.x;
      dy = p.lastDir.y;
    } else {
      let bd = Infinity;
      for (const e of G.enemies) {
        const d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
        if (d < bd) { bd = d; dx = -(e.x - p.x); dy = -(e.y - p.y); }
      }
    }
  }
  if (!dx && !dy) { dx = 0; dy = -1; }
  const l = Math.hypot(dx, dy) || 1;
  p.dashDir = { x: dx / l, y: dy / l };
  p.lastDir = { x: p.dashDir.x, y: p.dashDir.y };
  p.dashT = 0.16;
  p.inv = Math.max(p.inv, 0.35);
  p.dashCd = p.dashMax;
  burst(p.x, p.y, 10, '#8ecbff', 140 * S, 0.3);
  beep(360, 0.14, 'sine', 0.035, 450);
  haptic(25);
}

function updateEnemies(dt) {
  const p = G.player;
  const slow = G.slowT > 0 ? Math.pow(0.5, G.slowStacks) : 1;

  for (let i = G.enemies.length - 1; i >= 0; i--) {
    const e = G.enemies[i];
    if (!e) continue;

    if (e.warnT > 0) {
      e.warnT = Math.max(0, e.warnT - dt);
      continue;
    }

    e.flash = Math.max(0, e.flash - dt);
    if (e.burn) {
      e.burn.t -= dt;
      e.hp -= e.burn.dps * dt;
      if (e.burn.t <= 0) e.burn = null;
    }
    if (e.vuln) {
      e.vuln.t -= dt;
      if (e.vuln.t <= 0) e.vuln = null;
    }
    let eSlow = 1;
    if (e.slow) {
      e.slow.t -= dt;
      eSlow = e.slow.factor || 0.5;
      if (e.slow.t <= 0) e.slow = null;
    }
    if (e.hp <= 0) { killEnemy(e, i); continue; }

    const dx = p.x - e.x, dy = p.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    e.heading = Math.atan2(dy, dx);

    // Off-screen speedup: enemies outside camera frame rush in at 2.6x speed
    const isOffscreen = (e.x < cam.x - 20 || e.x > cam.x + W + 20 || e.y < cam.y - 20 || e.y > cam.y + H + 20);
    const entryBoost = isOffscreen ? (e.boss ? 1.6 : 2.6) : 1.0;
    const sp = e.speed * slow * eSlow * entryBoost;

    // Fast-entry rush for off-screen non-boss enemies
    if (isOffscreen && !e.boss) {
      e.x += (dx / d) * sp * dt;
      e.y += (dy / d) * sp * dt;
      continue;
    }

    // ═══════════════════════════════════════════════════════════════
    // ENEMY ABILITY & ATTACK AI (Standard + 20 Biome Enemies)
    // ═══════════════════════════════════════════════════════════════
    if (e.type === 'shooter') {
      const keep = 220 * S;
      const dir = d > keep ? 1 : d < keep * 0.7 ? -1 : 0;
      e.x += dx / d * sp * dir * dt;
      e.y += dy / d * sp * dir * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < H * 0.8) {
        e.shotT = Math.max(1.0, 1.8 - G.t * 0.003);
        const a = Math.atan2(dy, dx);
        for (let k = -2; k <= 2; k++) {
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a + k * 0.15) * 260 * S,
            vy: Math.sin(a + k * 0.15) * 260 * S,
            r: 4.8 * S, dmg: 8, col: '#ef4444', life: 5
          });
        }
        beep(280, 0.05, 'square', 0.008, -80);
      }
    } else if (e.type === 'charger') {
      e.stateT -= dt;
      if (e.state === 'charging') {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (Math.random() < 0.35) burst(e.x, e.y, 1, '#ff4500', 70 * S, 0.25);
        if (e.stateT <= 0) { e.state = 'cooldown'; e.stateT = 0.9; }
      } else if (e.state === 'telegraph') {
        if (e.stateT <= 0) {
          e.state = 'charging';
          e.stateT = 0.42;
          const a = Math.atan2(p.y - e.y, p.x - e.x);
          e.vx = Math.cos(a) * 580 * S * slow;
          e.vy = Math.sin(a) * 580 * S * slow;
          beep(400, 0.1, 'sawtooth', 0.03, 300);
        }
      } else {
        e.x += dx / d * sp * dt;
        e.y += dy / d * sp * dt;
        if (e.stateT <= 0 && d < 260 * S) {
          e.state = 'telegraph';
          e.stateT = 0.32;
          e.flash = 0.32;
        }
      }
    } else if (e.type === 'spinner') {
      e.rot += dt * 4.0;
      const curAng = Math.atan2(e.y - p.y, e.x - p.x) + dt * 1.8;
      const orbitR = 210 * S;
      e.x += (p.x + Math.cos(curAng) * orbitR - e.x) * dt * 3.2;
      e.y += (p.y + Math.sin(curAng) * orbitR - e.y) * dt * 3.2;
      e.shotT -= dt * slow;
      if (e.shotT <= 0) {
        e.shotT = 1.7;
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * TAU + e.rot;
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 220 * S, vy: Math.sin(a) * 220 * S,
            r: 4.5 * S, dmg: 7, col: '#ff2a4b', life: 5
          });
        }
        beep(340, 0.04, 'square', 0.007, -90);
      }
    } else if (e.type === 'artillery') {
      const keep = 280 * S;
      const dir = d > keep ? 1 : d < keep * 0.75 ? -1 : 0;
      e.x += dx / d * sp * dir * dt;
      e.y += dy / d * sp * dir * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0) {
        e.shotT = 2.0;
        G.hazards.push({
          x: clamp(p.x + p.lastDir.x * 40 * S, 40 * S, worldW - 40 * S),
          y: clamp(p.y + p.lastDir.y * 40 * S, 40 * S, worldH - 40 * S),
          r: 48 * S, fuse: 0.65, dmg: 22, col: '#dc2626'
        });
        beep(180, 0.1, 'sine', 0.02, 100);
      }
    } else if (e.type === 'beamer') {
      const keep = 200 * S;
      const dir = d > keep ? 1 : d < keep * 0.7 ? -1 : 0;
      e.x += dx / d * sp * dir * dt;
      e.y += dy / d * sp * dir * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0) {
        e.shotT = 2.2;
        const ang = Math.atan2(dy, dx);
        G.ebeams.push({
          x: e.x, y: e.y, ang, len: W * 0.95, w: 12 * S, t: 0.55, active: false, dmg: 35
        });
        beep(600, 0.12, 'sawtooth', 0.02, -150);
      }
    // ─── NEBULA BIOME ENEMIES ───
    } else if (e.type === 'neb_drifter') {
      const orbitA = Math.atan2(e.y - p.y, e.x - p.x) + dt * 1.6;
      e.x += (p.x + Math.cos(orbitA) * 200 * S - e.x) * dt * 2.8;
      e.y += (p.y + Math.sin(orbitA) * 200 * S - e.y) * dt * 2.8;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < H * 0.85) {
        e.shotT = 1.7;
        const a = Math.atan2(dy, dx);
        for (let k of [-0.08, 0.08]) {
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a + k) * 290 * S, vy: Math.sin(a + k) * 290 * S,
            r: 4.2 * S, dmg: 9, col: '#ef4444', life: 5
          });
        }
        beep(420, 0.04, 'sine', 0.01, 80);
      }
    } else if (e.type === 'neb_weaver') {
      const keep = 240 * S;
      const dir = d > keep ? 1 : d < keep * 0.7 ? -1 : 0;
      e.x += dx / d * sp * dir * dt;
      e.y += dy / d * sp * dir * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < H * 0.85) {
        e.shotT = 2.0;
        const a = Math.atan2(dy, dx);
        for (let k = -1; k <= 1; k++) {
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a + k * 0.22) * 240 * S, vy: Math.sin(a + k * 0.22) * 240 * S,
            r: 4.5 * S, dmg: 10, col: '#ff0033', life: 5
          });
        }
        beep(520, 0.05, 'triangle', 0.015, -60);
      }
    } else if (e.type === 'neb_nova') {
      e.x += dx / d * sp * 1.15 * dt;
      e.y += dy / d * sp * 1.15 * dt;
      e.shotT -= dt * slow;
      if (d < 180 * S && e.shotT <= 0) {
        e.shotT = 2.6;
        burst(e.x, e.y, 10, '#f43f5e', 140 * S, 0.35);
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * TAU;
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 230 * S, vy: Math.sin(a) * 230 * S,
            r: 4.8 * S, dmg: 12, col: '#ef4444', life: 4.5
          });
        }
        beep(240, 0.1, 'sawtooth', 0.02, 120);
      }
    } else if (e.type === 'neb_prism') {
      const keep = 270 * S;
      const dir = d > keep ? 1 : d < keep * 0.7 ? -1 : 0;
      e.x += dx / d * sp * dir * dt;
      e.y += dy / d * sp * dir * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < H * 0.9) {
        e.shotT = 2.4;
        const a = Math.atan2(dy, dx);
        G.ebeams.push({
          x: e.x, y: e.y, ang: a, len: W * 0.88, w: 9 * S, t: 0.55, active: false, dmg: 26
        });
        beep(650, 0.09, 'sine', 0.02, -180);
      }
    // ─── MAGMA BIOME ENEMIES ───
    } else if (e.type === 'mag_crawler') {
      e.x += dx / d * sp * dt;
      e.y += dy / d * sp * dt;
      e.shotT -= dt;
      if (e.shotT <= 0) {
        e.shotT = 0.85;
        G.hazards.push({
          x: e.x, y: e.y, r: 24 * S, fuse: 2.2, dmg: 14, col: '#dc2626'
        });
        burst(e.x, e.y, 2, '#ea580c', 40 * S, 0.3);
      }
    } else if (e.type === 'mag_spitter') {
      const keep = 260 * S;
      const dir = d > keep ? 1 : d < keep * 0.7 ? -1 : 0;
      e.x += dx / d * sp * dir * dt;
      e.y += dy / d * sp * dir * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < H * 0.9) {
        e.shotT = 1.8;
        G.hazards.push({
          x: clamp(p.x + rand(-35, 35) * S, 40 * S, worldW - 40 * S),
          y: clamp(p.y + rand(-35, 35) * S, 40 * S, worldH - 40 * S),
          r: 42 * S, fuse: 0.7, dmg: 22, col: '#ef4444'
        });
        const a = Math.atan2(dy, dx);
        for (let k of [-0.15, 0.15]) {
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a + k) * 220 * S, vy: Math.sin(a + k) * 220 * S,
            r: 5 * S, dmg: 11, col: '#ff2a4b', life: 4.5
          });
        }
        beep(210, 0.1, 'sawtooth', 0.02, 40);
      }
    } else if (e.type === 'mag_golem') {
      e.x += dx / d * sp * dt;
      e.y += dy / d * sp * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < 280 * S) {
        e.shotT = 2.8;
        addRing(e.x, e.y, 120 * S, '#b45309', 0.5);
        G.shake = Math.min(10 * S, G.shake + 4 * S);
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * TAU;
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 190 * S, vy: Math.sin(a) * 190 * S,
            r: 6 * S, dmg: 16, col: '#b91c1c', life: 5
          });
        }
        beep(90, 0.2, 'sawtooth', 0.04, -40);
      }
    } else if (e.type === 'mag_phoenix') {
      e.stateT -= dt;
      if (e.state === 'dive') {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (Math.random() < 0.4) burst(e.x, e.y, 1, '#ef4444', 90 * S, 0.3);
        if (e.stateT <= 0) { e.state = 'idle'; e.stateT = 1.3; }
      } else {
        e.x += dx / d * sp * dt;
        e.y += dy / d * sp * dt;
        if (e.stateT <= 0 && d < 280 * S) {
          e.state = 'dive';
          e.stateT = 0.45;
          const a = Math.atan2(dy, dx);
          e.vx = Math.cos(a) * 580 * S * slow;
          e.vy = Math.sin(a) * 580 * S * slow;
          for (let k of [-0.3, 0.3]) {
            G.ebullets.push({
              x: e.x, y: e.y,
              vx: Math.cos(a + k) * 170 * S, vy: Math.sin(a + k) * 170 * S,
              r: 4.8 * S, dmg: 12, col: '#ef4444', life: 4
            });
          }
          beep(480, 0.12, 'sawtooth', 0.03, 200);
        }
      }
    // ─── CYBER BIOME ENEMIES ───
    } else if (e.type === 'cyb_drone') {
      const strafe = Math.sin(G.t * 4 + e.id) * 0.6;
      e.x += (dx / d * sp + dy / d * sp * strafe) * dt;
      e.y += (dy / d * sp - dx / d * sp * strafe) * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < H * 0.85) {
        e.shotT = 1.3;
        const a = Math.atan2(dy, dx);
        G.ebullets.push({
          x: e.x, y: e.y,
          vx: Math.cos(a) * 330 * S, vy: Math.sin(a) * 330 * S,
          r: 4.2 * S, dmg: 9, col: '#ff2a4b', life: 4
        });
        beep(720, 0.03, 'square', 0.008, 0);
      }
    } else if (e.type === 'cyb_turret') {
      e.x += dx / d * sp * 0.4 * dt;
      e.y += dy / d * sp * 0.4 * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < H * 0.95) {
        e.shotT = 2.2;
        const a = Math.atan2(dy, dx);
        G.ebullets.push({
          x: e.x, y: e.y,
          vx: Math.cos(a) * 520 * S, vy: Math.sin(a) * 520 * S,
          r: 5.5 * S, dmg: 24, col: '#dc2626', life: 3.5
        });
        burst(e.x, e.y, 4, '#06b6d4', 180 * S, 0.2);
        beep(850, 0.08, 'square', 0.025, -300);
      }
    } else if (e.type === 'cyb_glitch') {
      e.x += dx / d * sp * dt;
      e.y += dy / d * sp * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0) {
        e.shotT = 2.2;
        burst(e.x, e.y, 8, '#ec4899', 160 * S, 0.3);
        const jumpA = rand(0, TAU);
        e.x = clamp(e.x + Math.cos(jumpA) * 95 * S, e.r, worldW - e.r);
        e.y = clamp(e.y + Math.sin(jumpA) * 95 * S, e.r, worldH - e.r);
        for (let k = 0; k < 4; k++) {
          const a = k / 4 * TAU + jumpA;
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 240 * S, vy: Math.sin(a) * 240 * S,
            r: 4.8 * S, dmg: 12, col: '#e11d48', life: 4.5
          });
        }
        beep(500, 0.06, 'sawtooth', 0.02, 180);
      }
    } else if (e.type === 'cyb_firewall') {
      e.x += dx / d * sp * dt;
      e.y += dy / d * sp * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < H * 0.9) {
        e.shotT = 2.8;
        const a = Math.atan2(dy, dx);
        for (let k = -2; k <= 2; k++) {
          const pA = a + Math.PI / 2;
          const ox = Math.cos(pA) * k * 22 * S;
          const oy = Math.sin(pA) * k * 22 * S;
          G.ebullets.push({
            x: e.x + ox, y: e.y + oy,
            vx: Math.cos(a) * 200 * S, vy: Math.sin(a) * 200 * S,
            r: 5 * S, dmg: 13, col: '#ff0033', life: 5
          });
        }
        beep(260, 0.1, 'square', 0.02, -80);
      }
    // ─── ABYSSAL BIOME ENEMIES ───
    } else if (e.type === 'aby_eel') {
      const sine = Math.sin(G.t * 5 + e.id) * 0.8;
      e.x += (dx / d * sp + dy / d * sp * sine) * dt;
      e.y += (dy / d * sp - dx / d * sp * sine) * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < H * 0.85) {
        e.shotT = 1.6;
        const a = Math.atan2(dy, dx);
        G.ebullets.push({
          x: e.x, y: e.y,
          vx: Math.cos(a) * 260 * S, vy: Math.sin(a) * 260 * S,
          r: 4.5 * S, dmg: 12, col: '#ef4444', life: 5
        });
        beep(380, 0.05, 'triangle', 0.015, 60);
      }
    } else if (e.type === 'aby_jelly') {
      e.x += dx / d * sp * dt;
      e.y += dy / d * sp * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0) {
        e.shotT = 2.5;
        for (let k = 0; k < 3; k++) {
          const a = rand(0, TAU);
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 65 * S, vy: Math.sin(a) * 65 * S,
            r: 6.5 * S, dmg: 14, col: '#b91c1c', life: 6.0
          });
        }
        beep(220, 0.08, 'sine', 0.02, -30);
      }
    } else if (e.type === 'aby_leech') {
      e.x += dx / d * sp * 1.1 * dt;
      e.y += dy / d * sp * 1.1 * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < 240 * S) {
        e.shotT = 2.1;
        const a = Math.atan2(dy, dx);
        for (let k of [-0.18, 0.18]) {
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a + k) * 270 * S, vy: Math.sin(a + k) * 270 * S,
            r: 4.5 * S, dmg: 13, col: '#ff2a4b', life: 4.5
          });
        }
        beep(420, 0.06, 'sawtooth', 0.018, -120);
      }
    } else if (e.type === 'aby_leviathan') {
      e.x += dx / d * sp * dt;
      e.y += dy / d * sp * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < 320 * S) {
        e.shotT = 3.2;
        p.x -= dx / d * 45 * dt;
        p.y -= dy / d * 45 * dt;
        for (let k = 0; k < 10; k++) {
          const a = k / 10 * TAU + G.t * 0.4;
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 210 * S, vy: Math.sin(a) * 210 * S,
            r: 6 * S, dmg: 18, col: '#dc2626', life: 5.5
          });
        }
        addRing(e.x, e.y, 140 * S, '#4338ca', 0.5);
        beep(100, 0.22, 'sawtooth', 0.04, -50);
      }
    // ─── CHRONO BIOME ENEMIES ───
    } else if (e.type === 'chr_phantom') {
      const phase = 0.5 + 0.5 * Math.sin(G.t * 6 + e.id);
      e.x += dx / d * sp * (phase > 0.3 ? 1.2 : 0.4) * dt;
      e.y += dy / d * sp * (phase > 0.3 ? 1.2 : 0.4) * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < H * 0.9) {
        e.shotT = 1.9;
        const a = Math.atan2(dy, dx);
        G.ebullets.push({
          x: e.x, y: e.y,
          vx: Math.cos(a) * 310 * S, vy: Math.sin(a) * 310 * S,
          r: 5 * S, dmg: 14, col: '#f43f5e', life: 4.5
        });
        beep(600, 0.04, 'triangle', 0.015, -100);
      }
    } else if (e.type === 'chr_warp') {
      const keep = 250 * S;
      const dir = d > keep ? 1 : d < keep * 0.7 ? -1 : 0;
      e.x += dx / d * sp * dir * dt;
      e.y += dy / d * sp * dir * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0) {
        e.shotT = 2.2;
        G.hazards.push({
          x: clamp(p.x + p.lastDir.x * 45 * S, 40 * S, worldW - 40 * S),
          y: clamp(p.y + p.lastDir.y * 45 * S, 40 * S, worldH - 40 * S),
          r: 46 * S, fuse: 0.75, dmg: 20, col: '#dc2626'
        });
        beep(300, 0.1, 'sine', 0.02, 150);
      }
    } else if (e.type === 'chr_rewind') {
      e.x += dx / d * sp * dt;
      e.y += dy / d * sp * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < 260 * S) {
        e.shotT = 2.6;
        burst(e.x, e.y, 6, '#d97706', 120 * S, 0.3);
        e.x = clamp(e.x - dx / d * 80 * S, e.r, worldW - e.r);
        e.y = clamp(e.y - dy / d * 80 * S, e.r, worldH - e.r);
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * TAU;
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 220 * S, vy: Math.sin(a) * 220 * S,
            r: 4.8 * S, dmg: 13, col: '#ef4444', life: 4.5
          });
        }
        beep(450, 0.08, 'sawtooth', 0.02, -200);
      }
    } else if (e.type === 'chr_decay') {
      e.x += dx / d * sp * dt;
      e.y += dy / d * sp * dt;
      e.shotT -= dt * slow;
      if (e.shotT <= 0 && d < H * 0.9) {
        e.shotT = 2.4;
        const a = Math.atan2(dy, dx);
        for (let k = -1; k <= 1; k++) {
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a + k * 0.25) * 140 * S, vy: Math.sin(a + k * 0.25) * 140 * S,
            r: 7 * S, dmg: 16, col: '#b91c1c', life: 6.0
          });
        }
        beep(160, 0.12, 'sawtooth', 0.025, -40);
      }
    } else {
      const wob = Math.sin(G.t * 3 + e.wob) * 0.25;
      e.x += (dx / d * sp + dy / d * sp * wob) * dt;
      e.y += (dy / d * sp - dx / d * sp * wob) * dt;
      if (e.elite) {
        e.shotT -= dt * slow;
        if (e.shotT <= 0 && d < H * 0.8) {
          e.shotT = 2.2;
          const a = Math.atan2(dy, dx);
          G.ebullets.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 260 * S, vy: Math.sin(a) * 260 * S,
            r: 5 * S, dmg: 12, col: '#ff2a4b', life: 5
          });
          beep(320, 0.04, 'square', 0.01, -40);
        }
      }
    }

    e.rot += dt * (e.boss ? 0.4 : 1.3);

    // ═══════════════════════════════════════════════════════════════
    // AGGRESSIVE MEGA-BOSS PURSUIT, RAM CHARGE & DIRECTED WEAPONS
    // ═══════════════════════════════════════════════════════════════
    if (e.boss) {
      const enraged = e.hp <= e.maxHp * 0.5;
      const cdMul = enraged ? 0.7 : 1.0;
      const bossSpeed = (enraged ? 280 : 210) * S * slow * eSlow;

      // Aggressive Pursuit & Dash Ram Charge
      e.dashCooldown = (e.dashCooldown === undefined ? 4.5 : e.dashCooldown) - dt;
      if (e.dashChargeT > 0) {
        // Telegraphing Ram Dash: pauses briefly, gathers energy, flashes crimson
        e.dashChargeT -= dt;
        e.flash = 0.2;
        burst(e.x, e.y, 2, '#ef4444', 90 * S, 0.25);
        if (e.dashChargeT <= 0) {
          e.isDashing = 0.8;
          e.dashVx = (dx / d) * (enraged ? 560 : 460) * S;
          e.dashVy = (dy / d) * (enraged ? 560 : 460) * S;
          beep(220, 0.22, 'sawtooth', 0.05, 120);
          G.shake = Math.min(18 * S, G.shake + 9 * S);
        }
      } else if (e.isDashing > 0) {
        // High-velocity Ram Charge through the arena
        e.isDashing -= dt;
        e.x += e.dashVx * dt;
        e.y += e.dashVy * dt;
        burst(e.x - e.dashVx * 0.04, e.y - e.dashVy * 0.04, 3, '#f97316', 100 * S, 0.3);
      } else {
        // Decisive aggressive chase towards player plane
        e.x += (dx / d) * bossSpeed * dt;
        e.y += (dy / d) * bossSpeed * dt;

        if (e.dashCooldown <= 0 && d > 140 * S && d < 750 * S) {
          e.dashCooldown = enraged ? 3.2 : 4.8;
          e.dashChargeT = 0.55; // 0.55s telegraph
          beep(460, 0.15, 'sawtooth', 0.03, 250);
        }
      }

      // Minion Spawning
      e.spawnT -= dt * (1 / cdMul);
      if (e.spawnT <= 0) {
        e.spawnT = enraged ? 3.8 : 5.0;
        spawnEnemy('charger', e.x + rand(-e.r, e.r), e.y + rand(-e.r, e.r));
      }

      // Boss Weapon Kits
      e.shotT -= dt * slow * (1 / cdMul);
      if (e.shotT <= 0) {
        e.shotT = enraged ? 1.5 : 2.1;
        if (e.kit === 0) {
          // Inferno Drake: Radial flame barrage
          const n = enraged ? 14 : 10;
          for (let k = 0; k < n; k++) {
            const a = k / n * TAU + G.t * 0.5;
            G.ebullets.push({
              x: e.x, y: e.y,
              vx: Math.cos(a) * 230 * S, vy: Math.sin(a) * 230 * S,
              r: 5.2 * S, dmg: 11, col: '#ef4444', life: 5
            });
          }
          beep(150, 0.12, 'sawtooth', 0.03, -40);
        } else if (e.kit === 1) {
          // Vortex Titan: Graviton shock ring + ground hazards
          for (let k = 0; k < 14; k++) {
            const a = k / 14 * TAU;
            G.ebullets.push({
              x: e.x, y: e.y,
              vx: Math.cos(a) * 200 * S, vy: Math.sin(a) * 200 * S,
              r: 5 * S, dmg: 11, col: '#ff2a4b', life: 5
            });
          }
          G.hazards.push({ x: p.x, y: p.y, r: 54 * S, fuse: 0.9, dmg: 24, col: '#ff2a4b' });
          beep(120, 0.16, 'triangle', 0.04, -30);
        } else if (e.kit === 2) {
          // Storm Sentinel: Directed fan barrage
          const baseA = Math.atan2(p.y - e.y, p.x - e.x);
          for (let k = -6; k <= 6; k++) {
            if (Math.abs(k) === 1 || Math.abs(k) === 2) continue; // Dodge gap
            const a = baseA + k * 0.14;
            G.ebullets.push({
              x: e.x, y: e.y,
              vx: Math.cos(a) * 240 * S, vy: Math.sin(a) * 240 * S,
              r: 5 * S, dmg: 10, col: '#ef4444', life: 5
            });
          }
          beep(170, 0.14, 'sawtooth', 0.03, -50);
        } else if (e.kit === 3) {
          // Nexus Core: DIRECTED BEAM CANNON from Boss directly to player
          for (let k = -2; k <= 2; k++) {
            const a = Math.atan2(p.y - e.y, p.x - e.x) + k * 0.22;
            G.ebullets.push({
              x: e.x, y: e.y,
              vx: Math.cos(a) * 260 * S, vy: Math.sin(a) * 260 * S,
              r: 5 * S, dmg: 12, col: '#dc2626', life: 5
            });
          }
          const beamAng = Math.atan2(p.y - e.y, p.x - e.x);
          G.ebeams.push({
            source: e,
            x: e.x, y: e.y,
            ang: beamAng,
            len: Math.max(W, H) * 1.6,
            w: 16 * S,
            t: 0.8,
            active: false,
            dmg: 45
          });
          beep(420, 0.1, 'square', 0.02, -100);
        } else {
          // Chronos Prime: Spiral time barrage
          const n = enraged ? 18 : 12;
          for (let k = 0; k < n; k++) {
            const a = k / n * TAU + Math.sin(G.t * 2);
            G.ebullets.push({
              x: e.x, y: e.y,
              vx: Math.cos(a) * 220 * S, vy: Math.sin(a) * 220 * S,
              r: 5.5 * S, dmg: 12, col: '#ef4444', life: 6
            });
          }
          addRing(e.x, e.y, 140 * S, '#f59e0b', 0.5);
          beep(200, 0.15, 'triangle', 0.03, 50);
        }
      }
    }

    // Clamp inside world bounds
    e.x = clamp(e.x, e.r, worldW - e.r);
    e.y = clamp(e.y, e.r, worldH - e.r);

    if (d < e.r + p.r && p.inv <= 0 && e.warnT <= 0) hurt(e.dmg);
    if (e.hp <= 0) killEnemy(e, i);
  }
}

function updateBullets(dt) {
  for (let i = G.bullets.length - 1; i >= 0; i--) {
    const b = G.bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0 || b.x < -100 || b.x > worldW + 100 || b.y < -100 || b.y > worldH + 100) {
      G.bullets.splice(i, 1);
      continue;
    }

    let dead = false;
    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      if (e.warnT > 0 || b.hit.includes(e.id)) continue;
      const rr = e.r + b.r;
      if ((e.x - b.x) ** 2 + (e.y - b.y) ** 2 > rr * rr) continue;

      b.hit.push(e.id);
      damageEnemy(e, b.dmg * (b.crit ? 2 : 1));
      if (b.burn > 0) e.burn = { dps: b.burn, t: 2.2 };
      if (b.explode > 0) explodeAt(b.x, b.y, b.dmg * 0.35 * b.explode, 44 * S + 8 * S * b.explode);
      if (b.lifesteal > 0) G.player.hp = Math.min(G.player.maxHp, G.player.hp + 0.12 * b.lifesteal);
      if (e.hp <= 0) killEnemy(e, j);

      if (b.pierce > 0) b.pierce--;
      else { dead = true; break; }
    }
    if (dead) G.bullets.splice(i, 1);
  }
}

function updateEnemyBullets(dt) {
  const p = G.player;
  const slow = G.slowT > 0 ? Math.pow(0.5, G.slowStacks) : 1;

  for (let i = G.ebullets.length - 1; i >= 0; i--) {
    const b = G.ebullets[i];
    b.x += b.vx * slow * dt;
    b.y += b.vy * slow * dt;
    b.life -= dt;

    if (b.life <= 0 || b.x < -100 || b.x > worldW + 100 || b.y < -100 || b.y > worldH + 100) {
      G.ebullets.splice(i, 1);
      continue;
    }

    const rr = p.r + b.r;
    if ((b.x - p.x) ** 2 + (b.y - p.y) ** 2 < rr * rr) {
      const hitOk = hurt(b.dmg);
      if (hitOk) {
        if (p.shield > 0 && ((p.trees && p.trees.shield && p.trees.shield[2]) === 'reflect') && G.bullets.length < 400) {
          G.bullets.push({
            x: b.x, y: b.y, vx: -b.vx * 1.35, vy: -b.vy * 1.35,
            r: b.r * 1.3,
            dmg: (6 + p.shield * 6) * 1.6,
            pierce: 1, crit: Math.random() < (p.crit || 0),
            burn: 0, explode: 0, lifesteal: 0, col: '#9ef0ff', life: 1.5, hit: []
          });
        }
        burst(b.x, b.y, 8, '#ff2a4b', 140 * S, 0.3);
      } else {
        // Bullet hit during invulnerability/dash: visual deflect
        burst(b.x, b.y, 4, '#38bdf8', 90 * S, 0.2);
        beep(480, 0.03, 'sine', 0.01, 60);
      }
      G.ebullets.splice(i, 1);
    }
  }

  if (G.ebullets.length > 250) G.ebullets.splice(0, G.ebullets.length - 250);
}
