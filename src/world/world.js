// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — DYNAMIC INFINITE WORLD, BIOMES & GEMS
// ═══════════════════════════════════════════════════════════════

function updateGems(dt) {
  const p = G.player;
  const d = DIFF[G.diff] || DIFF.easy;
  const xpBonus = G.diff === 'hard' ? 1.30 : G.diff === 'normal' ? 1.15 : 1.0;

  for (let i = G.gems.length - 1; i >= 0; i--) {
    const g = G.gems[i];
    const dx = p.x - g.x, dy = p.y - g.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist < p.magnet * (1 + (p.buffMagnet > 0 ? p.magnetStacks * 0.5 : 0))) {
      const pull = 740 * S * dt;
      g.x += dx / dist * pull;
      g.y += dy / dist * pull;
    } else {
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.vx *= 0.97;
      g.vy *= 0.97;
    }
    if (dist < p.r + g.r + 5 * S) {
      G.xp += g.val * xpBonus;
      G.shake = Math.min(6 * S, G.shake + 0.6 * S);
      beep(1100 + rand(-80, 80), 0.03, 'sine', 0.012, 200);
      G.gems.splice(i, 1);
    }
  }
}

function spawnPower(x, y, forcedType) {
  if (G.pows.length >= 8) return;
  const t = forcedType ? POWERS.find(p => p.id === forcedType) || POWERS[randi(POWERS.length)] : POWERS[randi(POWERS.length)];
  G.pows.push({
    x: clamp(x, 30 * S, worldW - 30 * S),
    y: clamp(y, 30 * S, worldH - 30 * S),
    r: 11 * S, type: t.id, icon: t.icon, col: t.col,
    ph: rand(0, TAU), life: 26
  });
}

function applyPower(type) {
  const p = G.player;
  let label = 'NOVA', col = '#fff3c4';
  if (type === 'rapid') {
    p.rapidStacks = Math.min(9, p.rapidStacks + 1);
    p.buffRapid = 12;
    label = 'OVERDRIVE +' + p.rapidStacks * 100 + '%';
    col = '#ffb347';
  } else if (type === 'magnet') {
    p.magnetStacks = Math.min(9, p.magnetStacks + 1);
    p.buffMagnet = 12;
    label = 'MAGNET +' + p.magnetStacks * 50 + '%';
    col = '#6ee7ff';
  } else if (type === 'aegis') {
    p.aegisStacks = Math.min(3, p.aegisStacks + 1);
    p.aegisT = 6 * p.aegisStacks;
    label = 'AEGIS ' + p.aegisT + 's';
    col = '#8ecbff';
  } else if (type === 'slow') {
    G.slowStacks = Math.min(4, G.slowStacks + 1);
    G.slowT = 8;
    label = 'TIME WARP -' + Math.round((1 - Math.pow(0.5, G.slowStacks)) * 100) + '%';
    col = '#c084fc';
  } else if (type === 'heal') {
    p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.45);
    label = 'MEND (+45%)';
    col = '#7bffb2';
  } else {
    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      damageEnemy(e, 160);
      if (e.hp <= 0) killEnemy(e, j);
    }
    G.ebullets.length = 0;
    G.shake = Math.min(18 * S, G.shake + 12 * S);
    addRing(p.x, p.y, 220 * S, '#fff3c4', 0.5);
    burst(p.x, p.y, 35, '#fff3c4', 350 * S, 0.6);
    beep(90, 0.4, 'sawtooth', 0.06, -50);
  }

  G.powerFlash = 0.25;
  G.toast = { text: label, t: 1.5, col };
  beep(880, 0.08, 'triangle', 0.03, 300);
  setTimeout(() => beep(1180, 0.1, 'triangle', 0.03, 200), 70);
  haptic(30);
}

function updatePows(dt) {
  const p = G.player;
  const mag = p.magnet * (1 + (p.buffMagnet > 0 ? p.magnetStacks * 0.5 : 0));
  for (let i = G.pows.length - 1; i >= 0; i--) {
    const pw = G.pows[i];
    pw.life -= dt;
    if (pw.life <= 0) { G.pows.splice(i, 1); continue; }
    const dx = p.x - pw.x, dy = p.y - pw.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < mag * 0.8) {
      pw.x += dx / d * 520 * S * dt;
      pw.y += dy / d * 520 * S * dt;
    }
    if (d < p.r + pw.r + 5 * S) {
      applyPower(pw.type);
      burst(pw.x, pw.y, 14, pw.col, 200 * S, 0.4);
      G.pows.splice(i, 1);
    }
  }
}

function updateParts(dt) {
  for (let i = G.parts.length - 1; i >= 0; i--) {
    const pt = G.parts[i];
    pt.life -= dt;
    if (pt.life <= 0) { G.parts.splice(i, 1); continue; }
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vx *= 0.96;
    pt.vy *= 0.96;
  }
}
