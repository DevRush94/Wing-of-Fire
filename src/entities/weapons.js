// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — 20 WEAPONS ARSENAL & EVOLUTION TREES
// ═══════════════════════════════════════════════════════════════

function weaponCard(wid) {
  const w = WEAPONS[wid];
  const next = (G.player[wid] || 0) + 1;
  const mile = (next === 10 || next === 20 || next === 30) ? ' · EVOLUTION AT LV' + next : '';
  return {
    id: 'w_' + wid, wid,
    name: w.name + ' Lv' + next,
    desc: w.desc + mile,
    max: 30, color: '#38bdf8',
    apply: p => { p[wid] = (p[wid] || 0) + 1; }
  };
}

function layoutCards(n) {
  const cw = Math.min(W - 44 * S, 430 * S), ch = 96 * S, gap = 14 * S;
  const total = ch * n + gap * (n - 1);
  const y0 = H / 2 - total / 2 + (G.bonusPick ? 36 * S : 24 * S);
  G.cardRects = G.cards.map((c, i) => ({ x: W / 2 - cw / 2, y: y0 + i * (ch + gap), w: cw, h: ch, i }));
}

function showTree(wid, tier) {
  const nodes = TREES[wid] && TREES[wid][tier - 1];
  if (!nodes) return false;
  G.treeChoice = { wid, tier };
  G.cards = nodes.map(n => ({ id: n.id, name: n.name, desc: n.desc, color: '#38bdf8', apply: () => {} }));
  layoutCards(G.cards.length);
  beep(660, 0.1, 'triangle', 0.035, 200);
  return true;
}

function resumeAfterCard() {
  mode = MODE.PLAY;
  modeAt = performance.now();
  if (G.xp >= G.xpNext) checkLevel();
}

function rollCards(excludeIds) {
  excludeIds = excludeIds || [];
  const pool = UPGRADES.filter(u => !WEAPON_IDS.includes(u.id) && (G.up[u.id] || 0) < u.max && !excludeIds.includes(u.id));
  const wpool = getLoadout()
    .filter(wid => G.player[wid] > 0 && G.player[wid] < 30 && !excludeIds.includes('w_' + wid))
    .map(weaponCard);

  G.cards = [];
  G.treeChoice = null;
  while (G.cards.length < 3 && (pool.length || wpool.length)) {
    if (wpool.length && (Math.random() < 0.45 || !pool.length)) {
      G.cards.push(wpool.splice(randi(wpool.length), 1)[0]);
    } else if (pool.length) {
      G.cards.push(pool.splice(randi(pool.length), 1)[0]);
    }
  }
  while (G.cards.length < 3) {
    G.cards.push({
      id: 'heal', name: 'Second Wind', desc: 'Restore 50% of max HP', max: 99, color: '#f8fafc',
      apply: p => { p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.5); }
    });
  }
  layoutCards(3);
}

function afterFreeCard() {
  const cost = Math.floor(25 + 5 * G.level);
  if (!G.bonusPickDone && G.coins >= cost) {
    G.bonusPick = true;
    G.bonusPickCost = cost;
    G.afterTree = 'resume';
    rollCards();
    mode = MODE.LEVEL;
    modeAt = performance.now();
    beep(980, 0.08, 'triangle', 0.03, 140);
  } else {
    G.bonusPick = false;
    resumeAfterCard();
  }
}

function triggerVictory() {
  mode = MODE.VICTORY;
  modeAt = performance.now();
  fanfare();
  boomBass();
  haptic([80, 40, 120, 40, 200]);
  G.toast = { text: 'VICTORY ACHIEVED! 🏆', t: 4.0, col: '#ffd700' };
}

function checkLevel() {
  if (mode !== MODE.PLAY) return;
  if (G.level >= MAX_RUN_LEVEL) {
    G.xp = G.xpNext;
    return;
  }
  if (G.xp >= G.xpNext) {
    G.xp -= G.xpNext;
    G.level++;
    if (G.level >= MAX_RUN_LEVEL) {
      triggerVictory();
      return;
    }
    G.xpNext = xpFor(G.level);
    G.bonusPickDone = false;
    G.bonusPick = false;
    G.afterTree = 'bonus';
    rollCards();
    mode = MODE.LEVEL;
    modeAt = performance.now();
    fanfare();
    haptic([30, 30, 80]);
  }
}

function pickCard(i) {
  const c = G.cards[i];
  if (!c) return;

  if (G.treeChoice) {
    const tw = G.treeChoice;
    G.player.trees[tw.wid][tw.tier] = c.id;
    saveMastery(tw.wid);
    G.treeChoice = null;
    G.cards = [];
    G.cardRects = [];
    beep(1040, 0.09, 'triangle', 0.03, 200);
    if (G.afterTree === 'bonus') afterFreeCard();
    else resumeAfterCard();
    return;
  }

  if (G.bonusPick) {
    G.coins -= G.bonusPickCost;
    G.coinsSpent += G.bonusPickCost;
    G.bonusPickDone = true;
    G.bonusPick = false;
  }

  G.up[c.id] = (G.up[c.id] || 0) + 1;
  c.apply(G.player);
  G.cards = [];
  G.cardRects = [];
  beep(900, 0.08, 'sine', 0.03, 120);

  if (c.wid) {
    const lvl = G.player[c.wid];
    const tier = lvl >= 30 ? 3 : lvl >= 20 ? 2 : lvl >= 10 ? 1 : 0;
    if (tier && !G.player.trees[c.wid][tier] && showTree(c.wid, tier)) return;
    saveMastery(c.wid);
  }

  if (G.afterTree === 'bonus' && !G.bonusPickDone) {
    afterFreeCard();
  } else {
    resumeAfterCard();
  }
}

function skipBonusPick() {
  G.bonusPick = false;
  G.bonusPickDone = true;
  G.cards = [];
  G.cardRects = [];
  resumeAfterCard();
}

function updateWeapons(dt) {
  const p = G.player;
  const fm = Math.max(0.4, p.rate / 2.2);

  for (let i = G.zaps.length - 1; i >= 0; i--) {
    G.zaps[i].life -= dt;
    if (G.zaps[i].life <= 0) G.zaps.splice(i, 1);
  }

  // 1. MACHINE GUN (Directional aim)
  if (p.mg > 0) {
    const tr = p.trees.mg || {};
    p.mgT -= dt;
    if (p.mgT <= 0) {
      const rateMul = tr[1] === 'rate' ? 1.3 : 1;
      let dmgMul = tr[1] === 'dmg' ? 1.35 : 1;
      if (tr[3] === 'execute') dmgMul *= 1.5;
      const pierce = (p.mg >= 3 ? 1 : 0) + (tr[2] === 'pierce' ? 2 : 0);
      const burn = tr[2] === 'burn' ? 6 : 0;
      p.mgT = Math.max(0.08, 0.16 - p.mg * 0.0025) / fm / rateMul / (1 + (p.buffRapid > 0 ? p.rapidStacks : 0));
      const base = getAimAngle(p);
      let n = 1 + Math.floor(p.mg / 5) + (p.multi - 1) + (tr[3] === 'split' ? 1 : 0);
      n = Math.min(36, n * p.coreProj);
      for (let i = 0; i < n; i++) {
        const a = base + (i - (n - 1) / 2) * 0.07 + rand(-0.025, 0.025);
        weaponBullet(p.x + Math.cos(a) * p.r, p.y + Math.sin(a) * p.r, a, 800 * S, (2.2 + p.mg * 1.0) * dmgMul, '#ffffff', 2.0, pierce, burn);
      }
      beep(1050 + rand(-50, 50), 0.02, 'square', 0.003, -180);
    }
  }

  // 2. ORBIT DRONE (Auto-target nearest)
  if (p.drone > 0) {
    const tr = p.trees.drone || {};
    p.droneT -= dt;
    if (p.droneT <= 0) {
      const t = nearestEnemy(p.x, p.y);
      if (t) {
        let rateMul = tr[1] === 'rate' ? 1.3 : 1;
        if (tr[3] === 'rapid') rateMul *= 1.4;
        const dmgMul = tr[2] === 'power' ? 1.45 : 1;
        const pierce = (p.drone >= 5 ? 1 : 0) + (tr[2] === 'pierce' ? 2 : 0);
        p.droneT = Math.max(0.5, 1.15 - p.drone * 0.02) / fm / rateMul / (1 + (p.buffRapid > 0 ? p.rapidStacks : 0));
        let n = 1 + Math.floor((p.drone - 1) / 5) + (p.multi - 1) + (tr[1] === 'extra' ? 1 : 0) + (tr[3] === 'swarm' ? 1 : 0);
        n = Math.min(36, n * p.coreProj);
        for (let i = 0; i < n; i++) {
          const a = G.t * 1.8 + i * TAU / n;
          const dx = p.x + Math.cos(a) * 64 * S, dy = p.y + Math.sin(a) * 64 * S;
          const ang = Math.atan2(t.y - dy, t.x - dx);
          weaponBullet(dx, dy, ang, 620 * S, (5 + p.drone * 2.2) * dmgMul, '#f8fafc', 2.4, pierce);
        }
        beep(1400, 0.025, 'sine', 0.004, -300);
      } else p.droneT = 0.12;
    }
  }

  // 3. BLACK HOLE (Spawn in aim direction)
  if (p.hole > 0) {
    const tr = p.trees.hole || {};
    p.holeT -= dt;
    if (p.holeT <= 0) {
      p.holeT = Math.max(3.2, 9.2 - p.hole * 0.18) / fm;
      const aimA = getAimAngle(p);
      const placeDist = 180 * S;
      const radMul = tr[1] === 'wide' ? 1.35 : 1;
      const durMul = tr[1] === 'long' ? 1.35 : 1;
      const dpsMul = tr[2] === 'deep' ? 1.55 : 1;
      const implMul = tr[3] === 'collapse' ? 1.7 : 1;
      let count = 1 + (tr[2] === 'twin' ? 1 : 0) + (tr[3] === 'singularity' ? 1 : 0);
      count = Math.min(10, count * p.coreProj);
      for (let k = 0; k < count; k++) {
        const ox = (k === 0 ? 0 : rand(-50, 50) * S);
        const oy = (k === 0 ? 0 : rand(-50, 50) * S);
        G.holes.push({
          x: clamp(p.x + Math.cos(aimA) * placeDist + ox, 60 * S, worldW - 60 * S),
          y: clamp(p.y + Math.sin(aimA) * placeDist + oy, 60 * S, worldH - 60 * S),
          r: (100 + p.hole * 8) * S * radMul,
          t: 2.4 * durMul, max: 2.4 * durMul,
          dps: (6 + p.hole * 3.2) * dpsMul, lvl: p.hole, implodeMul: implMul
        });
      }
      while (G.holes.length > 10) G.holes.shift();
      beep(70, 0.5, 'sine', 0.05, -20);
    }
  }

  // 4. SHIELD (Surrounds player)
  if (p.shield > 0) {
    const tr = p.trees.shield || {};
    p.shieldPulse -= dt;
    if (p.shieldPulse <= 0) {
      p.shieldPulse = 0.5;
      const rr = p.r + (tr[2] === 'wide' ? 50 : 32) * S;
      const dmg = (2.0 + p.shield * 1.4) * (tr[1] === 'pulse' ? 1.4 : 1);
      for (let j = G.enemies.length - 1; j >= 0; j--) {
        const e = G.enemies[j];
        if (e.warnT > 0) continue;
        if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (rr + e.r) ** 2) {
          damageEnemy(e, dmg);
          if (e.hp <= 0) killEnemy(e, j);
        }
      }
    }
  }

  // 5. CHAIN LIGHTNING (Auto-chains)
  if (p.zap > 0) {
    const tr = p.trees.zap || {};
    p.zapT -= dt;
    if (p.zapT <= 0) {
      const first = nearestEnemy(p.x, p.y);
      if (first) {
        let dmgMul = tr[1] === 'power' ? 1.35 : 1;
        if (tr[3] === 'overload') dmgMul *= 1.6;
        const chainBonus = (tr[1] === 'chain' ? 3 : 0) + (tr[2] === 'fork' ? 2 : 0);
        const strikes = 1 + (tr[2] === 'strike' ? 1 : 0) + (tr[3] === 'storm' ? 1 : 0);
        p.zapT = Math.max(1.1, 3.2 - p.zap * 0.08) / fm;
        const chainMax = Math.min(36, (2 + Math.floor(p.zap / 2) + chainBonus) * p.coreProj + (strikes - 1) * 2);
        const chain = [], used = new Set();
        let cur = first;
        while (cur && chain.length < chainMax) {
          chain.push(cur);
          used.add(cur.id);
          let next = null, bd = (180 * S) ** 2;
          for (const e of G.enemies) {
            if (e.warnT > 0 || used.has(e.id)) continue;
            const d = (e.x - cur.x) ** 2 + (e.y - cur.y) ** 2;
            if (d < bd) { bd = d; next = e; }
          }
          cur = next;
        }
        const pts = [{ x: p.x, y: p.y }];
        let px = p.x, py = p.y;
        for (const e of chain) {
          const segs = Math.max(2, Math.ceil(Math.hypot(e.x - px, e.y - py) / (24 * S)));
          for (let k = 1; k < segs; k++) {
            const t = k / segs;
            pts.push({ x: px + (e.x - px) * t + rand(-8, 8) * S, y: py + (e.y - py) * t + rand(-8, 8) * S });
          }
          pts.push({ x: e.x, y: e.y });
          px = e.x; py = e.y;
          damageEnemy(e, (8 + p.zap * 3.4) * dmgMul);
        }
        G.zaps.push({ pts, life: 0.22, max: 0.22 });
        for (const e of chain) {
          const idx = G.enemies.indexOf(e);
          if (e.hp <= 0 && idx >= 0) killEnemy(e, idx);
        }
        beep(1900, 0.06, 'sawtooth', 0.02, -1000);
      } else p.zapT = 0.2;
    }
  }

  // 6. ROCKET (Directional straight shot)
  if (p.nuke > 0) {
    const tr = p.trees.nuke || {};
    p.nukeT -= dt;
    if (p.nukeT <= 0) {
      const yieldMul = tr[1] === 'yield' ? 1.45 : 1;
      const spdMul = tr[1] === 'fast' ? 1.4 : 1;
      const fuseTime = (tr[1] === 'fast' ? 1.2 : 1.8);
      p.nukeT = Math.max(2.4, 6.2 - p.nuke * 0.15) / fm;
      let count = 1 + (tr[2] === 'twin' ? 1 : 0) + (tr[3] === 'mirv' ? 2 : 0);
      count = Math.min(8, count * p.coreProj);
      const baseAng = getAimAngle(p);
      for (let k = 0; k < count; k++) {
        const ang = baseAng + (k - (count - 1) / 2) * 0.2;
        G.nukes.push({
          x: p.x, y: p.y,
          vx: Math.cos(ang) * 320 * S * spdMul, vy: Math.sin(ang) * 320 * S * spdMul,
          r: 7 * S, life: fuseTime, maxLife: fuseTime,
          dmg: (40 + p.nuke * 22),
          blastR: (115 + p.nuke * 14) * S * yieldMul,
          cluster: tr[2] === 'cluster',
          fallout: tr[3] === 'fallout'
        });
      }
      beep(220, 0.18, 'sawtooth', 0.04, 300);
    }
  }

  // 7. BOUNCING DISK (Directional launch, bounces off world walls)
  if (p.disk > 0) {
    const tr = p.trees.disk || {};
    p.diskT -= dt;
    if (p.diskT <= 0) {
      p.diskT = Math.max(1.4, 4.0 - p.disk * 0.12) / fm;
      const bBonus = tr[1] === 'bounce' ? 3 : 0;
      const spdMul = tr[1] === 'spin' ? 1.35 : 1;
      let count = 1 + (tr[2] === 'twin' ? 1 : 0);
      count = Math.min(6, count * p.coreProj);
      const baseA = getAimAngle(p);
      for (let k = 0; k < count; k++) {
        const a = baseA + (k - (count - 1) / 2) * 0.3 + rand(-0.08, 0.08);
        G.disks.push({
          x: p.x, y: p.y,
          vx: Math.cos(a) * 440 * S * spdMul, vy: Math.sin(a) * 440 * S * spdMul,
          r: 11 * S, dmg: (12 + p.disk * 4.5),
          bounces: 4 + bBonus,
          shatter: tr[2] === 'shatter',
          plasma: tr[3] === 'plasma',
          life: 8.0, hitCd: new Map()
        });
      }
      beep(880, 0.09, 'triangle', 0.03, -300);
    }
  }

  // 8. LASER BEAM (Directional continuous beam)
  if (p.laser > 0) {
    const tr = p.trees.laser || {};
    p.laserActive = 0.65;
    const dmgMul = (tr[1] === 'heat' ? 1.35 : 1) * (tr[3] === 'overcharge' ? 1.65 : 1);
    const beamW = (tr[1] === 'wide' ? 24 : 15) * S;
    const split = tr[2] === 'split';

    let baseAng = getAimAngle(p);
    const angles = split ? [baseAng - 0.22, baseAng + 0.22] : [baseAng];

    for (const ang of angles) {
      const cosA = Math.cos(ang), sinA = Math.sin(ang);
      const beamLen = Math.max(W, H) * 1.5;
      for (let j = G.enemies.length - 1; j >= 0; j--) {
        const e = G.enemies[j];
        if (e.warnT > 0) continue;
        const dx = e.x - p.x, dy = e.y - p.y;
        const proj = dx * cosA + dy * sinA;
        if (proj > 0 && proj < beamLen) {
          const perp = Math.abs(-dx * sinA + dy * cosA);
          if (perp < beamW + e.r) {
            damageEnemy(e, (20 + p.laser * 7) * dmgMul * dt);
            if (tr[2] === 'trail' && Math.random() < 0.15) {
              burst(e.x, e.y, 2, '#ff6b35', 60 * S, 0.3);
            }
            if (e.hp <= 0) killEnemy(e, j);
          }
        }
      }
    }
  }

  // 9. SPIRAL SHOT (Auto-orbit ring)
  if (p.spiral > 0) {
    const tr = p.trees.spiral || {};
    const speedMul = tr[1] === 'gyro' ? 1.35 : 1;
    p.spiralAng = (p.spiralAng || 0) + dt * 2.8 * speedMul;
    p.spiralT -= dt;
    if (p.spiralT <= 0) {
      p.spiralT = 0.12;
      const radMul = tr[1] === 'wide' ? 1.4 : 1;
      const count = (tr[2] === 'double' ? 2 : 1);
      const baseR = (75 + p.spiral * 8) * S * radMul;
      for (let arm = 0; arm < count; arm++) {
        const ang = p.spiralAng + arm * Math.PI;
        const bx = p.x + Math.cos(ang) * baseR * 1.2;
        const by = p.y + Math.sin(ang) * baseR * 0.8;
        weaponBullet(bx, by, ang + Math.PI / 2, 280 * S, (4.5 + p.spiral * 2.2), '#ffffff', 3.0, tr[2] === 'phase' ? 2 : 0);
      }
    }
  }

  // 10. BULLET EATER (Spawn portal in aim direction)
  if (p.wormhole > 0) {
    const tr = p.trees.wormhole || {};
    p.wormholeT -= dt;
    if (p.wormholeT <= 0) {
      p.wormholeT = Math.max(3.0, 7.5 - p.wormhole * 0.2) / fm;
      const rangeMul = tr[1] === 'range' ? 1.45 : 1;
      const count = 1 + (tr[2] === 'twin' ? 1 : 0);
      const aimA = getAimAngle(p);
      const placeDist = 140 * S;
      for (let k = 0; k < count; k++) {
        const ox = (k === 0 ? 0 : rand(-50, 50) * S);
        const oy = (k === 0 ? 0 : rand(-50, 50) * S);
        G.rifts.push({
          x: clamp(p.x + Math.cos(aimA) * placeDist + ox, 60 * S, worldW - 60 * S),
          y: clamp(p.y + Math.sin(aimA) * placeDist + oy, 60 * S, worldH - 60 * S),
          r: (60 + p.wormhole * 7) * S * rangeMul,
          life: 4.5, maxLife: 4.5,
          reflectBonus: tr[1] === 'reflect' ? 1.7 : 1.2,
          pulse: tr[2] === 'pulse',
          cleanse: tr[3] === 'void'
        });
      }
      beep(500, 0.2, 'sine', 0.03, 300);
    }
  }

  // 11. CRYO MINEFIELD (Drop mines along path)
  if (p.mine > 0) {
    const tr = p.trees.mine || {};
    p.mineT -= dt;
    if (p.mineT <= 0) {
      const maxMines = 6 + Math.floor(p.mine / 3) + (tr[1] === 'count' ? 3 : 0);
      p.mineT = Math.max(0.4, 1.2 - p.mine * 0.03) / fm / (1 + (p.buffRapid > 0 ? p.rapidStacks : 0));
      if (tr[1] === 'fast') p.mineT *= 0.65;
      const aimA = getAimAngle(p);
      G.mines.push({
        x: p.x + Math.cos(aimA) * 30 * S, y: p.y + Math.sin(aimA) * 30 * S,
        r: 8 * S, triggerR: 55 * S, blastR: (75 + p.mine * 5) * S,
        dmg: 15 + 8 * p.mine, armT: 0.3, life: 8 + (tr[1] === 'fast' ? 4 : 0),
        slowAmt: 0.6, slowDur: 2.5 + (tr[2] === 'range' ? 1.0 : 0),
        cluster: tr[2] === 'cluster', execute: tr[3] === 'execute', tesla: tr[3] === 'tesla'
      });
      while (G.mines.length > maxMines) G.mines.shift();
      beep(2400, 0.04, 'sine', 0.015, -1200);
    }
  }

  // 12. GAUSS RAILGUN (Charge then hitscan)
  if (p.railgun > 0) {
    const tr = p.trees.railgun || {};
    p.railgunT -= dt;
    if (p.railgunT <= 0) {
      const chargeMul = tr[1] === 'charge' ? 0.7 : 1;
      p.railgunT = Math.max(1.2, 2.8 / (1 + p.railgun * 0.12)) / fm * chargeMul;
      const ang = getAimAngle(p);
      const cosA = Math.cos(ang), sinA = Math.sin(ang);
      const baseDmg = 45 + 22 * p.railgun;
      let dmgMul = 1;
      const isDual = tr[3] === 'dual';
      const megaMul = tr[3] === 'mega' ? 1.8 : 1;
      const offsets = isDual ? [-9 * S, 9 * S] : [0];
      for (const off of offsets) {
        const ox = p.x + (-sinA) * off, oy = p.y + cosA * off;
        let cumDmg = baseDmg * megaMul;
        for (let j = G.enemies.length - 1; j >= 0; j--) {
          const e = G.enemies[j];
          if (e.warnT > 0) continue;
          const dx = e.x - ox, dy = e.y - oy;
          const proj = dx * cosA + dy * sinA;
          if (proj > 0 && proj < Math.max(W, H) * 1.5) {
            const perp = Math.abs(-dx * sinA + dy * cosA);
            if (perp < 12 * S + e.r) {
              damageEnemy(e, cumDmg * (Math.random() < p.crit ? 2 : 1));
              if (tr[2] === 'conduct') cumDmg *= 1.2;
              if (tr[2] === 'shrapnel' && Math.random() < p.crit) {
                for (let s = 0; s < 6; s++) {
                  const sa = ang + rand(-0.4, 0.4);
                  weaponBullet(e.x, e.y, sa, 500 * S, baseDmg * 0.3, '#f8fafc', 2.0, 0);
                }
              }
              burst(e.x, e.y, 4, '#d946ef', 180 * S, 0.25);
              if (e.hp <= 0) killEnemy(e, j);
            }
          }
        }
        if (tr[1] === 'trail') {
          G.railTrails.push({ x: ox, y: oy, ang, len: Math.max(W, H) * 1.5, life: 1.5, dps: 8 * p.railgun });
        }
      }
      G.shake = Math.min(10 * S, G.shake + 8 * S);
      beep(55, 0.15, 'sawtooth', 0.07, -20);
      setTimeout(() => beep(1800, 0.03, 'sine', 0.04, 0), 30);
    }
  }

  // 13. SWARM DRONES (Manage drone formation)
  if (p.swarm > 0) {
    const tr = p.trees.swarm || {};
    const maxDrones = 4 + Math.floor(p.swarm / 2) + (tr[1] === 'count' ? 4 : 0);
    while (p.swarmDrones.length < maxDrones) {
      const ang = rand(0, TAU);
      p.swarmDrones.push({ x: p.x + Math.cos(ang) * 50 * S, y: p.y + Math.sin(ang) * 50 * S, state: 'orbit', target: null, cd: 0, ang });
    }
    while (p.swarmDrones.length > maxDrones) p.swarmDrones.pop();
    const spdMul = tr[1] === 'speed' ? 1.4 : 1;
    for (const dr of p.swarmDrones) {
      dr.cd = Math.max(0, dr.cd - dt);
      if (dr.state === 'orbit') {
        dr.ang += dt * 2.5;
        const orbitR = rand(40, 65) * S;
        dr.x += (p.x + Math.cos(dr.ang) * orbitR - dr.x) * dt * 5;
        dr.y += (p.y + Math.sin(dr.ang) * orbitR - dr.y) * dt * 5;
        if (dr.cd <= 0) {
          const t = nearestEnemy(dr.x, dr.y, 180 * S);
          if (t) { dr.target = t.id; dr.state = 'attack'; }
        }
      } else if (dr.state === 'attack') {
        const t = G.enemies.find(e => e.id === dr.target);
        if (!t || t.warnT > 0) { dr.state = 'return'; dr.target = null; }
        else {
          const dx = t.x - dr.x, dy = t.y - dr.y, d = Math.hypot(dx, dy) || 1;
          dr.x += dx / d * 480 * S * spdMul * dt;
          dr.y += dy / d * 480 * S * spdMul * dt;
          if (d < t.r + 8 * S) {
            const dmg = (12 + 6 * p.swarm) * (tr[2] === 'kamikaze' ? 2 : 1);
            damageEnemy(t, dmg);
            if (tr[3] === 'leech') p.hp = Math.min(p.maxHp, p.hp + dmg * 0.05);
            if (tr[2] === 'kamikaze') { explodeAt(dr.x, dr.y, dmg * 0.5, 35 * S, '#fbbf24'); }
            burst(dr.x, dr.y, 4, '#fbbf24', 120 * S, 0.2);
            const idx = G.enemies.indexOf(t);
            if (t.hp <= 0 && idx >= 0) killEnemy(t, idx);
            dr.state = 'return';
            dr.target = null;
            dr.cd = tr[2] === 'kamikaze' ? 1.5 : 1.2;
          }
        }
      } else {
        const dx = p.x - dr.x, dy = p.y - dr.y, d = Math.hypot(dx, dy) || 1;
        dr.x += dx / d * 380 * S * dt;
        dr.y += dy / d * 380 * S * dt;
        if (d < 50 * S) dr.state = 'orbit';
      }
      // Shield interceptor: destroy incoming bullets
      if (tr[2] === 'shield' && dr.state === 'orbit') {
        for (let b = G.ebullets.length - 1; b >= 0; b--) {
          const eb = G.ebullets[b];
          if ((eb.x - dr.x) ** 2 + (eb.y - dr.y) ** 2 < (100 * S) ** 2) {
            burst(eb.x, eb.y, 3, '#6ee7ff', 80 * S, 0.15);
            G.ebullets.splice(b, 1);
            p.hp = Math.min(p.maxHp, p.hp + 1);
            break;
          }
        }
      }
      // Missile barrage
      if (tr[3] === 'barrage' && dr.state === 'orbit' && dr.cd <= 0) {
        const t = nearestEnemy(dr.x, dr.y, 200 * S);
        if (t) {
          const a = Math.atan2(t.y - dr.y, t.x - dr.x);
          weaponBullet(dr.x, dr.y, a, 500 * S, 6 + p.swarm * 2, '#ffffff', 2.2, 0);
          dr.cd = 0.5;
        }
      }
    }
  }

  // 14. PLASMA TORCH (Continuous flame cone)
  if (p.flame > 0) {
    const tr = p.trees.flame || {};
    p.flameActive = 0.5;
    const ang = getAimAngle(p);
    const coneAngle = 0.44; // ~50 degrees total
    const reach = (120 + 15 * p.flame) * S * (tr[1] === 'range' ? 1.4 : 1);
    const tickDmg = (4 + 2.5 * p.flame) * (tr[1] === 'tick' ? 1.35 : 1) * (tr[3] === 'blue' ? 1.4 : 1) * dt;
    const burnDps = 3 + p.flame;
    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      if (e.warnT > 0) continue;
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
      if (d > reach + e.r) continue;
      const eAng = Math.atan2(dy, dx);
      let dAng = eAng - ang;
      while (dAng > Math.PI) dAng -= TAU;
      while (dAng < -Math.PI) dAng += TAU;
      if (Math.abs(dAng) < coneAngle) {
        const resist = (tr[3] === 'blue') ? 0 : (e.resist || 0);
        damageEnemy(e, tickDmg * (1 - resist));
        e.burn = { dps: burnDps * (e.burn ? Math.min(5, (e.burn.stacks || 1) + 1) : 1), t: 3, stacks: e.burn ? Math.min(5, (e.burn.stacks || 1) + 1) : 1, spread: tr[3] === 'spread' ? 3 : 0 };
        if (e.hp <= 0) killEnemy(e, j);
      }
    }
    // Napalm ground pools
    if (tr[2] === 'napalm' && Math.random() < 0.08) {
      G.flamePools.push({
        x: p.x + Math.cos(ang) * reach * 0.7, y: p.y + Math.sin(ang) * reach * 0.7,
        r: 40 * S, life: 4, dps: 6 * p.flame
      });
    }
    // Thermobaric blast
    if (tr[2] === 'blast') {
      p.flameBlastT = (p.flameBlastT || 3) - dt;
      if (p.flameBlastT <= 0) {
        p.flameBlastT = 3;
        for (let j = G.enemies.length - 1; j >= 0; j--) {
          const e = G.enemies[j];
          if (e.warnT > 0) continue;
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < 100 * S) {
            const kd = d || 1;
            e.x = clamp(e.x + (e.x - p.x) / kd * 60 * S, e.r, worldW - e.r);
            e.y = clamp(e.y + (e.y - p.y) / kd * 60 * S, e.r, worldH - e.r);
          }
        }
        addRing(p.x, p.y, 100 * S, '#ff4500', 0.3);
        beep(180, 0.12, 'sawtooth', 0.04, -80);
      }
    }
    // Flame particles
    if (Math.random() < 0.5) {
      const pa = ang + rand(-coneAngle, coneAngle);
      const pd = rand(20, reach) * 0.8;
      burst(p.x + Math.cos(pa) * pd, p.y + Math.sin(pa) * pd, 1, Math.random() < 0.5 ? '#ff4500' : '#ff007f', 60 * S, 0.15);
    }
  }

  // 15. GRAVITON SCYTHE (Throw boomerang)
  if (p.scythe > 0) {
    const tr = p.trees.scythe || {};
    p.scytheT -= dt;
    if (p.scytheT <= 0) {
      p.scytheT = Math.max(0.8, 2.2 / (1 + p.scythe * 0.08)) / fm;
      const ang = getAimAngle(p);
      const count = (tr[3] === 'twin' ? 2 : 1);
      for (let k = 0; k < count; k++) {
        const a = ang + (count > 1 ? (k === 0 ? -0.25 : 0.25) : 0);
        G.scythes.push({
          x: p.x, y: p.y, ang: a,
          vx: Math.cos(a) * 320 * S, vy: Math.sin(a) * 320 * S,
          r: 14 * S, dmg: 18 + 10 * p.scythe,
          maxRange: (220 + 20 * p.scythe) * S * (tr[1] === 'range' ? 1.5 : 1),
          pullR: 65 * S, pullForce: 120 * S * (tr[1] === 'pull' ? 1.4 : 1),
          state: 'out', pauseT: 0, distTraveled: 0, rot: 0,
          grow: tr[2] === 'grow', growScale: 1,
          orbit: tr[2] === 'orbit', orbitT: 0,
          vuln: tr[3] === 'vuln', hitCd: new Map()
        });
      }
      beep(440, 0.1, 'triangle', 0.03, 80);
    }
  }

  // 16. FLAK CANNON (Fire shell)
  if (p.flak > 0) {
    const tr = p.trees.flak || {};
    p.flakT -= dt;
    if (p.flakT <= 0) {
      p.flakT = Math.max(0.6, 1.6 / (1 + p.flak * 0.1)) / fm * (tr[1] === 'speed' ? 0.7 : 1);
      const ang = getAimAngle(p);
      G.flakShells.push({
        x: p.x, y: p.y,
        vx: Math.cos(ang) * 380 * S, vy: Math.sin(ang) * 380 * S,
        r: 6 * S, ang,
        pellets: 10 + Math.floor(p.flak / 2) + (tr[1] === 'pellets' ? 6 : 0),
        pelletDmg: 8 + 3 * p.flak,
        pelletRange: 90 * S,
        maxDist: 160 * S, dist: 0,
        flechette: tr[2] === 'flechette', incendiary: tr[2] === 'incendiary',
        breach: tr[3] === 'breach', spreadAngle: (tr[3] === 'spread' ? 0.85 : 0.52)
      });
      beep(80, 0.08, 'sawtooth', 0.05, 0);
    }
  }

  // 17. ORBITAL BEAM LANCE (Lock-on and smite)
  if (p.orbital > 0) {
    const tr = p.trees.orbital || {};
    p.orbitalT -= dt;
    if (p.orbitalT <= 0) {
      p.orbitalT = Math.max(1.8, 4.5 / (1 + p.orbital * 0.08)) / fm;
      const lockTime = 0.5 * (tr[1] === 'lock' ? 0.7 : 1);
      const beamR = 45 * S * (tr[1] === 'radius' ? 1.5 : 1);
      const count = tr[2] === 'tri' ? 3 : 1;
      const targets = [];
      // Find highest-HP enemies
      const sorted = G.enemies.filter(e => e.warnT <= 0).sort((a, b) => b.hp - a.hp);
      for (let k = 0; k < count; k++) {
        if (sorted[k]) targets.push({ x: sorted[k].x, y: sorted[k].y });
        else targets.push({ x: p.x + Math.cos(getAimAngle(p)) * 150 * S + rand(-30, 30) * S, y: p.y + Math.sin(getAimAngle(p)) * 150 * S + rand(-30, 30) * S });
      }
      for (const t of targets) {
        G.orbitalStrikes.push({
          x: t.x, y: t.y, r: beamR, lockT: lockTime,
          beamT: tr[2] === 'sweep' ? 2.0 : 0.4,
          dmg: 60 + 30 * p.orbital,
          vaporize: tr[3] === 'vaporize' ? 0.3 : 0,
          conduit: tr[3] === 'conduit',
          sweep: tr[2] === 'sweep', sweepAng: 0,
          active: false, hitCd: new Map()
        });
      }
      beep(880, 0.5, 'sine', 0.03, 880);
    }
  }

  // 18. PHANTOM ECHO (Record position + summon ghost)
  if (p.echo > 0) {
    const tr = p.trees.echo || {};
    // Record position buffer (180 entries = 3s at 60fps)
    G.echoBuffer[G.echoIdx % 180] = { x: p.x, y: p.y, ang: getAimAngle(p) };
    G.echoIdx++;
    p.echoT -= dt;
    if (p.echoT <= 0) {
      const dur = (3.0 + p.echo * 0.15) + (tr[1] === 'duration' ? 1.5 : 0);
      const dmgMul = tr[1] === 'power' ? 0.8 : (tr[3] === 'overlock' ? 1.5 : 0.6);
      const delayFrames = tr[2] === 'delay' ? 60 : 120; // 1s or 2s
      const count = tr[3] === 'triple' ? 3 : 1;
      p.echoT = Math.max(3.0, 6.0 / (1 + p.echo * 0.06)) / fm;
      for (let k = 0; k < count; k++) {
        G.echoes.push({
          life: dur, maxLife: dur, dmgMul,
          delayFrames: delayFrames + (tr[3] === 'triple' ? k * 60 : 0),
          contactDmg: 5 * p.echo + (tr[2] === 'contact' ? 10 * p.echo : 0),
          readIdx: ((G.echoIdx - delayFrames - k * 60) % 180 + 180) % 180,
          x: p.x, y: p.y, ang: getAimAngle(p), fireT: 0
        });
      }
      beep(660, 0.08, 'sine', 0.02, 8);
      setTimeout(() => beep(668, 0.08, 'sine', 0.02, 8), 20);
    }
  }

  // 19. GRAVITY TETHER (Fire grapple)
  if (p.tether > 0) {
    const tr = p.trees.tether || {};
    p.tetherT -= dt;
    if (p.tetherT <= 0 && G.tethers.length < (tr[2] === 'dual' ? 2 : 1)) {
      p.tetherT = Math.max(1.2, 3.0 / (1 + p.tether * 0.07)) / fm;
      const t = nearestEnemy(p.x, p.y, 250 * S);
      if (t) {
        G.tethers.push({
          targetId: t.id, life: 4.0, maxLen: 320 * S * (tr[1] === 'length' ? 1.4 : 1),
          wireDmg: (10 + 5 * p.tether) * (tr[1] === 'dmg' ? 1.5 : 1),
          grabDps: 3 * p.tether,
          electric: tr[2] === 'electric', anchor: tr[3] === 'anchor',
          snap: tr[3] === 'snap', hitCd: new Map()
        });
        beep(165, 0.12, 'sawtooth', 0.03, 0);
      }
    }
  }

  // 20. VOID PARASITE (Fire spore)
  if (p.parasite > 0) {
    const tr = p.trees.parasite || {};
    p.parasiteT -= dt;
    const maxActive = 1 + Math.floor(p.parasite / 8) + (tr[2] === 'hive' ? 2 : 0);
    if (p.parasiteT <= 0 && G.parasites.length < maxActive) {
      p.parasiteT = Math.max(2.0, 5.0 / (1 + p.parasite * 0.06)) / fm;
      const t = nearestEnemy(p.x, p.y, 300 * S);
      if (t && !t.infected) {
        G.parasites.push({
          hostId: t.id, life: (4.0 + p.parasite * 0.2) + (tr[1] === 'duration' ? 2 : 0) + (tr[3] === 'neural' ? 2 : 0),
          dmgBoost: 0.3 + 0.1 * p.parasite + (tr[1] === 'boost' ? 0.5 : 0),
          spdBoost: 1.5 + (tr[3] === 'neural' ? 1.0 : 0),
          volatile: tr[2] === 'volatile', neural: tr[3] === 'neural',
          plague: tr[3] === 'plague' ? 2 : 0, state: 'infect'
        });
        t.infected = true;
        burst(t.x, t.y, 8, '#84cc16', 100 * S, 0.3);
        beep(90, 0.06, 'sine', 0.04, 5);
      }
    }
  }
}

function updateNukes(dt) {
  for (let i = G.nukes.length - 1; i >= 0; i--) {
    const n = G.nukes[i];
    n.life -= dt;
    n.x += n.vx * dt;
    n.y += n.vy * dt;
    if (Math.random() < 0.4) burst(n.x, n.y, 1, '#ff6b35', 50 * S, 0.2);

    let explode = (n.life <= 0 || n.x < 10 || n.x > worldW - 10 || n.y < 10 || n.y > worldH - 10);
    if (!explode) {
      for (const e of G.enemies) {
        if (e.warnT > 0) continue;
        if ((e.x - n.x) ** 2 + (e.y - n.y) ** 2 < (e.r + n.r) ** 2) {
          explode = true;
          break;
        }
      }
    }
    if (explode) {
      explodeAt(n.x, n.y, n.dmg, n.blastR, '#ff4500');
      G.shake = Math.min(18 * S, G.shake + 12 * S);
      beep(80, 0.35, 'sawtooth', 0.07, -40);
      if (n.cluster) {
        for (let c = 0; c < 6; c++) {
          const a = c / 6 * TAU;
          const cx = n.x + Math.cos(a) * 35 * S, cy = n.y + Math.sin(a) * 35 * S;
          explodeAt(cx, cy, n.dmg * 0.45, 45 * S, '#ff9f1c');
        }
      }
      G.nukes.splice(i, 1);
    }
  }
}

function updateDisks(dt) {
  for (let i = G.disks.length - 1; i >= 0; i--) {
    const d = G.disks[i];
    d.life -= dt;
    d.x += d.vx * dt;
    d.y += d.vy * dt;

    let bounced = false;
    if (d.x <= d.r) { d.x = d.r; d.vx = Math.abs(d.vx); bounced = true; }
    else if (d.x >= worldW - d.r) { d.x = worldW - d.r; d.vx = -Math.abs(d.vx); bounced = true; }
    if (d.y <= d.r) { d.y = d.r; d.vy = Math.abs(d.vy); bounced = true; }
    else if (d.y >= worldH - d.r) { d.y = worldH - d.r; d.vy = -Math.abs(d.vy); bounced = true; }

    if (bounced) {
      d.bounces--;
      burst(d.x, d.y, 6, '#38ef7d', 160 * S, 0.25);
      beep(1100, 0.03, 'triangle', 0.02, 100);
      if (d.bounces <= 0) {
        if (d.shatter) explodeAt(d.x, d.y, d.dmg * 1.5, 65 * S, '#38ef7d');
        G.disks.splice(i, 1);
        continue;
      }
    }

    if (d.life <= 0) {
      G.disks.splice(i, 1);
      continue;
    }

    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      if (e.warnT > 0) continue;
      if ((e.x - d.x) ** 2 + (e.y - d.y) ** 2 < (e.r + d.r) ** 2) {
        const lastHit = d.hitCd.get(e.id) || 0;
        if (G.t - lastHit > 0.15) {
          d.hitCd.set(e.id, G.t);
          damageEnemy(e, d.dmg);
          burst(e.x, e.y, 3, '#38ef7d', 140 * S, 0.2);
          if (d.plasma) e.burn = { dps: 7, t: 2.2 };
          if (e.hp <= 0) killEnemy(e, j);
        }
      }
    }
  }
}

function updateRifts(dt) {
  for (let i = G.rifts.length - 1; i >= 0; i--) {
    const r = G.rifts[i];
    r.life -= dt;
    if (r.cleanse) {
      G.ebullets.length = 0;
      r.cleanse = false;
      addRing(r.x, r.y, 140 * S, '#00d2d3', 0.4);
    }

    for (let b = G.ebullets.length - 1; b >= 0; b--) {
      const eb = G.ebullets[b];
      if ((eb.x - r.x) ** 2 + (eb.y - r.y) ** 2 < r.r * r.r) {
        const t = nearestEnemy(r.x, r.y);
        const ang = t ? Math.atan2(t.y - r.y, t.x - r.x) : rand(0, TAU);
        weaponBullet(r.x, r.y, ang, 500 * S, eb.dmg * r.reflectBonus, '#ffffff', 2.8, 1);
        burst(eb.x, eb.y, 4, '#00d2d3', 120 * S, 0.2);
        G.ebullets.splice(b, 1);
      }
    }

    if (r.life <= 0) G.rifts.splice(i, 1);
  }
}

function updateMines(dt) {
  for (let i = G.mines.length - 1; i >= 0; i--) {
    const m = G.mines[i];
    m.life -= dt;
    if (m.armT > 0) m.armT -= dt;

    if (m.life <= 0) {
      G.mines.splice(i, 1);
      continue;
    }

    if (m.tesla && G.mines.length > 1) {
      for (let k = 0; k < i; k++) {
        const o = G.mines[k];
        if (!o.tesla) continue;
        const tdx = o.x - m.x, tdy = o.y - m.y, td = Math.hypot(tdx, tdy);
        if (td < 160 * S) {
          for (let j = G.enemies.length - 1; j >= 0; j--) {
            const e = G.enemies[j];
            if (e.warnT > 0) continue;
            const edx = e.x - m.x, edy = e.y - m.y;
            const proj = (edx * tdx + edy * tdy) / (td * td);
            if (proj >= 0 && proj <= 1) {
              const perp = Math.abs(-edx * tdy + edy * tdx) / td;
              if (perp < 10 * S + e.r) {
                damageEnemy(e, m.dmg * 0.45 * dt);
                if (e.hp <= 0) killEnemy(e, j);
              }
            }
          }
        }
      }
    }

    if (m.armT <= 0) {
      let triggered = false;
      for (const e of G.enemies) {
        if (e.warnT > 0) continue;
        if ((e.x - m.x) ** 2 + (e.y - m.y) ** 2 < (e.r + m.triggerR) ** 2) {
          triggered = true;
          break;
        }
      }
      if (triggered) {
        addRing(m.x, m.y, m.blastR, '#06b6d4', 0.4);
        burst(m.x, m.y, 14, '#06b6d4', 180 * S, 0.35);
        beep(220, 0.18, 'sawtooth', 0.04, -80);
        G.shake = Math.min(10 * S, G.shake + 5 * S);

        for (let j = G.enemies.length - 1; j >= 0; j--) {
          const e = G.enemies[j];
          if (e.warnT > 0) continue;
          if ((e.x - m.x) ** 2 + (e.y - m.y) ** 2 <= m.blastR * m.blastR) {
            damageEnemy(e, m.dmg);
            e.slow = { factor: m.slowAmt, t: m.slowDur };
            if (m.execute && !e.boss && e.hp < e.maxHp * 0.18) {
              e.hp = 0;
            }
            if (e.hp <= 0) killEnemy(e, j);
          }
        }

        if (m.cluster) {
          for (let c = 0; c < 3; c++) {
            const ca = c / 3 * TAU + rand(-0.2, 0.2);
            G.mines.push({
              x: clamp(m.x + Math.cos(ca) * 36 * S, 20 * S, worldW - 20 * S),
              y: clamp(m.y + Math.sin(ca) * 36 * S, 20 * S, worldH - 20 * S),
              r: 5 * S, triggerR: 35 * S, blastR: m.blastR * 0.65,
              dmg: m.dmg * 0.5, armT: 0.15, life: 4,
              slowAmt: m.slowAmt, slowDur: m.slowDur * 0.6,
              cluster: false, execute: m.execute, tesla: false
            });
          }
        }
        G.mines.splice(i, 1);
      }
    }
  }
}

function updateScythes(dt) {
  const p = G.player;
  for (let i = G.scythes.length - 1; i >= 0; i--) {
    const sc = G.scythes[i];
    sc.rot += dt * 15;
    if (sc.grow && sc.growScale < 1.7) sc.growScale = Math.min(1.7, sc.growScale + dt * 0.6);
    const effR = sc.r * (sc.growScale || 1);

    if (sc.state === 'out') {
      const step = Math.hypot(sc.vx, sc.vy) * dt;
      sc.x += sc.vx * dt;
      sc.y += sc.vy * dt;
      sc.distTraveled += step;

      for (const e of G.enemies) {
        if (e.warnT > 0) continue;
        const pdx = sc.x - e.x, pdy = sc.y - e.y, pd = Math.hypot(pdx, pdy) || 1;
        if (pd < sc.pullR * (sc.growScale || 1)) {
          const force = (e.boss ? sc.pullForce * 0.3 : sc.pullForce) * dt;
          e.x += pdx / pd * force;
          e.y += pdy / pd * force;
        }
      }

      if (sc.distTraveled >= sc.maxRange) {
        sc.state = 'pause';
        sc.pauseT = 0.32;
      }
    } else if (sc.state === 'pause') {
      sc.pauseT -= dt;
      for (const e of G.enemies) {
        if (e.warnT > 0) continue;
        const pdx = sc.x - e.x, pdy = sc.y - e.y, pd = Math.hypot(pdx, pdy) || 1;
        if (pd < sc.pullR * 1.2 * (sc.growScale || 1)) {
          const force = (e.boss ? sc.pullForce * 0.4 : sc.pullForce * 1.3) * dt;
          e.x += pdx / pd * force;
          e.y += pdy / pd * force;
        }
      }
      if (sc.pauseT <= 0) sc.state = 'return';
    } else {
      const rdx = p.x - sc.x, rdy = p.y - sc.y, rd = Math.hypot(rdx, rdy) || 1;
      sc.vx = (rdx / rd) * 380 * S;
      sc.vy = (rdy / rd) * 380 * S;
      sc.x += sc.vx * dt;
      sc.y += sc.vy * dt;
      if (rd < 28 * S) {
        G.scythes.splice(i, 1);
        continue;
      }
    }

    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      if (e.warnT > 0) continue;
      if ((e.x - sc.x) ** 2 + (e.y - sc.y) ** 2 < (e.r + effR) ** 2) {
        const lastHit = sc.hitCd.get(e.id) || 0;
        if (G.t - lastHit > 0.12) {
          sc.hitCd.set(e.id, G.t);
          damageEnemy(e, sc.dmg * (sc.growScale || 1));
          if (sc.vuln) e.vuln = { mul: 1.35, t: 3.0 };
          burst(e.x, e.y, 3, '#c084fc', 120 * S, 0.2);
          if (e.hp <= 0) killEnemy(e, j);
        }
      }
    }
  }
}

function updateTethers(dt) {
  const p = G.player;
  for (let i = G.tethers.length - 1; i >= 0; i--) {
    const tet = G.tethers[i];
    let tgt = G.enemies.find(e => e.id === tet.targetId);
    if (!tgt || tgt.hp <= 0) {
      if (tet.snap) {
        const next = nearestEnemy(p.x, p.y, 220 * S);
        if (next && next.id !== tet.targetId) {
          tet.targetId = next.id;
          tgt = next;
        } else {
          G.tethers.splice(i, 1);
          continue;
        }
      } else {
        G.tethers.splice(i, 1);
        continue;
      }
    }

    tet.life -= dt;
    if (tet.life <= 0) { G.tethers.splice(i, 1); continue; }

    const tdx = tgt.x - p.x, tdy = tgt.y - p.y, dist = Math.hypot(tdx, tdy);
    if (dist > tet.maxLen) {
      if (tet.anchor) {
        tgt.x -= tdx / dist * 240 * S * dt;
        tgt.y -= tdy / dist * 240 * S * dt;
      } else {
        G.tethers.splice(i, 1);
        continue;
      }
    }

    damageEnemy(tgt, tet.grabDps * dt);
    if (tgt.hp <= 0) {
      const idx = G.enemies.indexOf(tgt);
      if (idx >= 0) killEnemy(tgt, idx);
    }

    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      if (e.id === tet.targetId || e.warnT > 0) continue;
      const ex = e.x - p.x, ey = e.y - p.y;
      const proj = (ex * tdx + ey * tdy) / (dist * dist || 1);
      if (proj >= 0 && proj <= 1) {
        const perp = Math.abs(-ex * tdy + ey * tdx) / (dist || 1);
        if (perp < 8 * S + e.r) {
          const lastHit = tet.hitCd.get(e.id) || 0;
          if (G.t - lastHit > 0.18) {
            tet.hitCd.set(e.id, G.t);
            damageEnemy(e, tet.wireDmg);
            if (tet.electric) {
              const nearby = nearestEnemy(e.x, e.y, 90 * S);
              if (nearby && nearby.id !== e.id) damageEnemy(nearby, tet.wireDmg * 0.5);
            }
            burst(e.x, e.y, 4, '#ef4444', 130 * S, 0.2);
            if (e.hp <= 0) killEnemy(e, j);
          }
        }
      }
    }
  }
}

function updateParasites(dt) {
  for (let i = G.parasites.length - 1; i >= 0; i--) {
    const par = G.parasites[i];
    const host = G.enemies.find(e => e.id === par.hostId);
    par.life -= dt;

    if (!host || host.hp <= 0 || par.life <= 0) {
      if (host) {
        host.infected = false;
        if (par.volatile) explodeAt(host.x, host.y, 42 * S, 75 * S, '#84cc16');
        if (par.plague > 0) {
          for (const cand of G.enemies) {
            if (cand.id !== host.id && !cand.infected && cand.warnT <= 0) {
              if ((cand.x - host.x) ** 2 + (cand.y - host.y) ** 2 < (140 * S) ** 2) {
                cand.infected = true;
                G.parasites.push({
                  hostId: cand.id, life: 4.5, dmgBoost: par.dmgBoost,
                  spdBoost: par.spdBoost, volatile: par.volatile, neural: par.neural,
                  plague: 0, state: 'infect'
                });
                break;
              }
            }
          }
        }
      }
      G.parasites.splice(i, 1);
      continue;
    }

    if (host.boss) {
      damageEnemy(host, (24 + par.dmgBoost * 18) * dt);
      host.slow = { factor: 0.65, t: 0.5 };
      if (host.hp <= 0) { const idx = G.enemies.indexOf(host); if (idx >= 0) killEnemy(host, idx); }
    } else {
      const other = G.enemies.find(e => e.id !== host.id && !e.infected && e.warnT <= 0);
      if (other) {
        const dx = other.x - host.x, dy = other.y - host.y, d = Math.hypot(dx, dy) || 1;
        const sp = (host.speed || 60 * S) * par.spdBoost;
        host.x += dx / d * sp * dt;
        host.y += dy / d * sp * dt;
        if (d < host.r + other.r) {
          damageEnemy(other, (20 + par.dmgBoost * 25) * dt * 3);
          damageEnemy(host, 12 * dt);
          if (other.hp <= 0) { const oIdx = G.enemies.indexOf(other); if (oIdx >= 0) killEnemy(other, oIdx); }
          if (host.hp <= 0) { const hIdx = G.enemies.indexOf(host); if (hIdx >= 0) killEnemy(host, hIdx); }
        }
      }
    }
  }
}

function updateEchoes(dt) {
  for (let i = G.echoes.length - 1; i >= 0; i--) {
    const ec = G.echoes[i];
    ec.life -= dt;
    if (ec.life <= 0) { G.echoes.splice(i, 1); continue; }

    const bufIdx = ((G.echoIdx - ec.delayFrames) % 180 + 180) % 180;
    const snap = G.echoBuffer[bufIdx];
    if (snap) {
      ec.x += (snap.x - ec.x) * dt * 10;
      ec.y += (snap.y - ec.y) * dt * 10;
      ec.ang = snap.ang;
    }

    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      if (e.warnT > 0) continue;
      if ((e.x - ec.x) ** 2 + (e.y - ec.y) ** 2 < (e.r + 16 * S) ** 2) {
        damageEnemy(e, ec.contactDmg * dt);
        if (e.hp <= 0) killEnemy(e, j);
      }
    }

    ec.fireT -= dt;
    if (ec.fireT <= 0) {
      ec.fireT = 0.22;
      weaponBullet(ec.x, ec.y, ec.ang, 550 * S, 8 * ec.dmgMul, '#f8fafc', 1.8, 0);
    }
  }
}

function updateFlakShells(dt) {
  for (let i = G.flakShells.length - 1; i >= 0; i--) {
    const fs = G.flakShells[i];
    const step = Math.hypot(fs.vx, fs.vy) * dt;
    fs.x += fs.vx * dt;
    fs.y += fs.vy * dt;
    fs.dist += step;

    let detonate = fs.dist >= fs.maxDist;
    if (!detonate) {
      for (const e of G.enemies) {
        if (e.warnT > 0) continue;
        if ((e.x - fs.x) ** 2 + (e.y - fs.y) ** 2 < (e.r + fs.r) ** 2) {
          detonate = true;
          if (fs.breach && e.boss) damageEnemy(e, fs.pelletDmg * 3.5);
          break;
        }
      }
    }

    if (detonate) {
      addRing(fs.x, fs.y, 45 * S, '#facc15', 0.25);
      burst(fs.x, fs.y, 10, '#facc15', 140 * S, 0.25);
      beep(110, 0.08, 'sawtooth', 0.04, -40);
      for (let k = 0; k < fs.pellets; k++) {
        const pa = fs.ang + rand(-fs.spreadAngle, fs.spreadAngle);
        const pSpd = rand(380, 560) * S;
        const b = weaponBullet(fs.x, fs.y, pa, pSpd, fs.pelletDmg, '#ffffff', 2.0, fs.flechette ? 2 : 0);
        if (fs.incendiary && b) b.incendiary = true;
      }
      G.flakShells.splice(i, 1);
    }
  }
}

function updateOrbitalStrikes(dt) {
  for (let i = G.orbitalStrikes.length - 1; i >= 0; i--) {
    const os = G.orbitalStrikes[i];
    if (!os.active) {
      os.lockT -= dt;
      if (os.lockT <= 0) {
        os.active = true;
        G.shake = Math.min(14 * S, G.shake + 8 * S);
        beep(130, 0.4, 'sawtooth', 0.07, -50);
      }
    } else {
      os.beamT -= dt;
      if (os.sweep) {
        os.sweepAng += dt * 1.6;
        os.x += Math.cos(os.sweepAng) * 75 * S * dt;
        os.y += Math.sin(os.sweepAng) * 75 * S * dt;
      }

      for (let j = G.enemies.length - 1; j >= 0; j--) {
        const e = G.enemies[j];
        if (e.warnT > 0) continue;
        if ((e.x - os.x) ** 2 + (e.y - os.y) ** 2 < (e.r + os.r) ** 2) {
          const lastHit = os.hitCd.get(e.id) || 0;
          if (G.t - lastHit > 0.08) {
            os.hitCd.set(e.id, G.t);
            let d = os.dmg * dt * 3.6;
            if (os.vaporize > 0 && e.hp < e.maxHp * os.vaporize && !e.boss) d = e.hp + 1;
            damageEnemy(e, d);
            burst(e.x, e.y, 2, '#fef08a', 90 * S, 0.15);
            if (e.hp <= 0) killEnemy(e, j);
          }
        }
      }

      if (os.conduit) {
        const p = G.player;
        if ((p.x - os.x) ** 2 + (p.y - os.y) ** 2 < (os.r + 20 * S) ** 2) {
          p.buffRapid = Math.max(p.buffRapid, 1.2);
          p.rapidStacks = Math.max(p.rapidStacks, 2);
        }
      }

      if (os.beamT <= 0) {
        G.orbitalStrikes.splice(i, 1);
      }
    }
  }
}

function updateFlamePools(dt) {
  for (let i = G.flamePools.length - 1; i >= 0; i--) {
    const fp = G.flamePools[i];
    fp.life -= dt;
    if (fp.life <= 0) { G.flamePools.splice(i, 1); continue; }

    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      if (e.warnT > 0) continue;
      if ((e.x - fp.x) ** 2 + (e.y - fp.y) ** 2 < (e.r + fp.r) ** 2) {
        damageEnemy(e, fp.dps * dt);
        e.burn = { dps: fp.dps * 0.7, t: 2.0 };
        if (e.hp <= 0) killEnemy(e, j);
      }
    }
  }
}

function updateRailTrails(dt) {
  for (let i = G.railTrails.length - 1; i >= 0; i--) {
    const rt = G.railTrails[i];
    rt.life -= dt;
    if (rt.life <= 0) { G.railTrails.splice(i, 1); continue; }

    const cosA = Math.cos(rt.ang), sinA = Math.sin(rt.ang);
    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      if (e.warnT > 0) continue;
      const dx = e.x - rt.x, dy = e.y - rt.y;
      const proj = dx * cosA + dy * sinA;
      if (proj > 0 && proj < rt.len) {
        const perp = Math.abs(-dx * sinA + dy * cosA);
        if (perp < 12 * S + e.r) {
          damageEnemy(e, rt.dps * dt);
          if (e.hp <= 0) killEnemy(e, j);
        }
      }
    }
  }
}

function updateHazards(dt) {
  const p = G.player;
  if (G && G.env) {
    G.hazardT = (G.hazardT || 15) - dt;
    if (G.hazardT <= 0) {
      G.hazardT = 16 + Math.random() * 8;
      if (G.env === 'magma') {
        G.hazards.push({
          x: clamp(p.x + rand(-80, 80) * S, 40 * S, worldW - 40 * S),
          y: clamp(p.y + rand(-80, 80) * S, 40 * S, worldH - 40 * S),
          r: 55 * S, fuse: 1.1, dmg: 25, col: '#ef4444'
        });
      } else if (G.env === 'cyber') {
        G.ebeams.push({
          x: p.x + rand(-150, 150) * S, y: p.y + rand(-150, 150) * S,
          ang: rand(0, TAU), len: Math.max(W, H) * 1.2, w: 12 * S, t: 1.0, active: false, dmg: 30
        });
      } else if (G.env === 'abyss') {
        G.holes.push({
          x: p.x + rand(-120, 120) * S, y: p.y + rand(-120, 120) * S,
          r: 60 * S, t: 3.5, dps: 18, lvl: 1, implodeMul: 1.2
        });
      } else if (G.env === 'chrono') {
        G.slowT = 5;
        G.slowStacks = 2;
        G.toast = { text: 'CHRONO TIME SHIFT', t: 2.0, col: '#f59e0b' };
        addRing(p.x, p.y, 160 * S, '#f59e0b', 0.5);
      }
    }
  }

  for (let i = G.hazards.length - 1; i >= 0; i--) {
    const hz = G.hazards[i];
    hz.fuse -= dt;
    if (hz.fuse <= 0) {
      addRing(hz.x, hz.y, hz.r * 1.2, hz.col, 0.35);
      burst(hz.x, hz.y, 18, hz.col, 220 * S, 0.4);
      beep(130, 0.25, 'sawtooth', 0.05, -50);
      G.shake = Math.min(12 * S, G.shake + 6 * S);
      if ((p.x - hz.x) ** 2 + (p.y - hz.y) ** 2 < (p.r + hz.r) ** 2) {
        hurt(hz.dmg);
      }
      G.hazards.splice(i, 1);
    }
  }
}

function updateEBeams(dt) {
  const p = G.player;
  for (let i = G.ebeams.length - 1; i >= 0; i--) {
    const bm = G.ebeams[i];
    bm.t -= dt;

    // Anchor beam directly to boss source
    if (bm.source && bm.source.hp > 0) {
      bm.x = bm.source.x;
      bm.y = bm.source.y;
      if (!bm.active) {
        // Direct tracking aim towards player during charge
        const targetAng = Math.atan2(p.y - bm.y, p.x - bm.x);
        let diff = targetAng - bm.ang;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        bm.ang += diff * Math.min(1, dt * 3.2);
      }
    }

    if (bm.active) {
      const cosA = Math.cos(bm.ang), sinA = Math.sin(bm.ang);
      const dx = p.x - bm.x, dy = p.y - bm.y;
      const proj = dx * cosA + dy * sinA;
      if (proj > 0 && proj < bm.len) {
        const perp = Math.abs(-dx * sinA + dy * cosA);
        if (perp < bm.w + p.r) hurt(bm.dmg * dt);
      }
    }

    if (bm.t <= 0) {
      if (!bm.active) {
        bm.active = true;
        bm.t = 0.65;
        beep(540, 0.25, 'sawtooth', 0.05, -300);
        G.shake = Math.min(18 * S, G.shake + 10 * S);
      } else {
        G.ebeams.splice(i, 1);
      }
    }
  }
}

function updateRings(dt) {
  for (let i = G.rings.length - 1; i >= 0; i--) {
    const rg = G.rings[i];
    rg.life -= dt;
    if (rg.life <= 0) { G.rings.splice(i, 1); continue; }
    rg.r += (rg.maxR - rg.r) * dt * 8;
  }
}

function updateHoles(dt) {
  for (let i = G.holes.length - 1; i >= 0; i--) {
    const h = G.holes[i];
    h.t -= dt;
    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      if (e.warnT > 0) continue;
      const dx = h.x - e.x, dy = h.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < h.r * 2.1) {
        const pull = (e.boss ? 35 : 155) * S * (1 + h.lvl * 0.1) * dt;
        e.x = clamp(e.x + dx / d * pull, e.r, W - e.r);
        e.y = clamp(e.y + dy / d * pull, e.r, H - e.r);
        e.hp -= h.dps * dt * (e.boss ? 0.5 : 1);
        e.flash = Math.max(e.flash, 0.04);
        if (Math.random() < 0.02) burst(e.x, e.y, 1, '#c084fc', 40 * S, 0.3);
        if (e.hp <= 0) killEnemy(e, j);
      }
    }
    if (h.t <= 0) {
      const radius = h.r * 1.35, dmg = (28 + h.lvl * 24) * (h.implodeMul || 1);
      addRing(h.x, h.y, radius, '#c084fc', 0.45);
      explodeAt(h.x, h.y, dmg, radius, '#c084fc');
      G.shake = Math.min(16 * S, G.shake + 8 * S);
      beep(120, 0.25, 'sawtooth', 0.04, -70);
      G.holes.splice(i, 1);
    }
  }
}

function updateSpawn(dt) {
  G.spawnT -= dt;
  if (G.spawnT > 0) return;

  const d = DIFF[G.diff] || DIFF.easy;
  const targetAlive = Math.min(d.cap, 12 + G.level * 2.2 + G.t * 0.06);
  const interval = Math.max(0.18, 0.95 - G.t * 0.005) / (1 + 0.025 * (G.level - 1)) / d.spawn;
  G.spawnT = interval * rand(0.8, 1.2);

  const onScreen = G.enemies.filter(e => e.x >= 0 && e.x <= W && e.y >= 0 && e.y <= H).length;
  if (onScreen >= d.cap) return;

  spawnEnemy();
  if (onScreen < targetAlive - 3) spawnEnemy();
}
