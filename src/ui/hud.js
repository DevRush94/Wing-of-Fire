// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — IN-GAME HUD, RADAR MINIMAP & JOYSTICKS
// ═══════════════════════════════════════════════════════════════

function drawHud(now) {
  const pad = 12 * S;
  const p = G.player;

  // ═════════════════════════════════════════════════════════════════
  // 1. TOP STATUS BAR — WEAPONS, SKILLS, BUFFS, TIMER & STATS
  // ═════════════════════════════════════════════════════════════════
  const topH = 34 * S;
  ctx.fillStyle = 'rgba(7, 6, 13, 0.72)';
  ctx.fillRect(0, 0, W, topH);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1 * S;
  ctx.beginPath();
  ctx.moveTo(0, topH);
  ctx.lineTo(W, topH);
  ctx.stroke();

  // Left: Run Timer & Level / Biome
  txt(fmt(G.t), pad, topH * 0.44, 15 * S, '#ffffff', 'left', 800);
  const diffCol = G.diff === 'hard' ? '#ff4d6d' : G.diff === 'normal' ? '#ffd166' : '#7bffb2';
  const envName = (G.env && ENVIRONMENTS[G.env]) ? ENVIRONMENTS[G.env].name.split(' ')[0] : 'NEON';
  txt(`LV ${G.level} · ${DIFF[G.diff].name.toUpperCase()} · ${envName}`, pad, topH * 0.82, 9 * S, diffCol, 'left', 700);

  // Center: Active Weapon Badges (Blue), Passive Skills (Yellow), and Temp Boosts
  let pillX = pad + 130 * S;
  const pillY = 6 * S, pillH = 22 * S;

  // Active Equipped Weapons (Blue cards from screenshot: #38bdf8)
  for (const wid of getLoadout()) {
    const wInfo = WEAPONS[wid];
    if (!wInfo) continue;
    const wLv = p[wid] || 1;
    const wName = (wInfo.name || wid).split(' ')[0].toUpperCase();
    const label = `${wName} ${wLv}`;
    ctx.font = '700 ' + (9.5 * S) + 'px ' + FONT;
    const tw = ctx.measureText(label).width;
    const pw = tw + 14 * S;
    if (pillX + pw > W - 140 * S) break;

    ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    rr(pillX, pillY, pw, pillH, 4 * S);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1 * S;
    ctx.stroke();
    txt(label, pillX + pw / 2, pillY + pillH / 2, 9.5 * S, '#9ef0ff', 'center', 700);
    pillX += pw + 5 * S;
  }

  // Active Passive Skills (Yellow badges: #facc15)
  const passives = [];
  if (p.dmg > 7) passives.push(`+${Math.round((p.dmg / 7 - 1) * 100)}% DMG`);
  if (p.crit > 0) passives.push(`+${Math.round(p.crit * 100)}% CRIT`);
  if (p.rate > 2.2) passives.push(`+${Math.round((p.rate / 2.2 - 1) * 100)}% SPD`);
  if (p.burn > 0) passives.push(`BURN ${p.burn}`);
  if (p.explode > 0) passives.push(`BLAST ${p.explode}`);
  if (p.lifesteal > 0) passives.push(`VAMP ${p.lifesteal}`);

  for (const pass of passives) {
    ctx.font = '700 ' + (9 * S) + 'px ' + FONT;
    const tw = ctx.measureText(pass).width;
    const pw = tw + 12 * S;
    if (pillX + pw > W - 140 * S) break;

    ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
    rr(pillX, pillY, pw, pillH, 4 * S);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1 * S;
    ctx.stroke();
    txt(pass, pillX + pw / 2, pillY + pillH / 2, 9 * S, '#fef08a', 'center', 700);
    pillX += pw + 5 * S;
  }

  // Active Temp Boosts (Frenzy, Aegis, Slow)
  if (p.buffRapid > 0) {
    const rLabel = `⚡ FRENZY (${Math.ceil(p.buffRapid)}s)`;
    ctx.font = '700 ' + (9 * S) + 'px ' + FONT;
    const pw = ctx.measureText(rLabel).width + 12 * S;
    if (pillX + pw <= W - 140 * S) {
      ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
      rr(pillX, pillY, pw, pillH, 4 * S);
      ctx.fill();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1 * S;
      ctx.stroke();
      txt(rLabel, pillX + pw / 2, pillY + pillH / 2, 9 * S, '#fed7aa', 'center', 800);
      pillX += pw + 5 * S;
    }
  }
  if (p.aegisT > 0) {
    const aLabel = `🛡 AEGIS (${Math.ceil(p.aegisT)}s)`;
    ctx.font = '700 ' + (9 * S) + 'px ' + FONT;
    const pw = ctx.measureText(aLabel).width + 12 * S;
    if (pillX + pw <= W - 140 * S) {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      rr(pillX, pillY, pw, pillH, 4 * S);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1 * S;
      ctx.stroke();
      txt(aLabel, pillX + pw / 2, pillY + pillH / 2, 9 * S, '#fef08a', 'center', 800);
      pillX += pw + 5 * S;
    }
  }

  // Right: Kills & Coins & Pause Button
  const coinPulse = (G.goldFlash > 0 || G.coinFlash > 0) ? '#ffffff' : '#ffd166';
  txt(`💀 ${G.kills}  ·  🪙 ${G.coins || 0}`, W - 48 * S, topH * 0.5, 11 * S, coinPulse, 'right', 700);

  // Pause Button
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  rr(W - 38 * S, 4 * S, 28 * S, 26 * S, 6 * S);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1 * S;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  rr(W - 29 * S, 10 * S, 3 * S, 14 * S, 1 * S);
  ctx.fill();
  rr(W - 22 * S, 10 * S, 3 * S, 14 * S, 1 * S);
  ctx.fill();

  // ═════════════════════════════════════════════════════════════════
  // 2. BOTTOM COCKPIT DOCK — HEALTH, KINETIC BARRIER, XP & BOSS
  // ═════════════════════════════════════════════════════════════════
  const dockW = Math.min(520 * S, W - 24 * S);
  const dockX = (W - dockW) / 2;
  const dockY = H - 36 * S;

  // Boss bar docked cleanly above the player cockpit console
  const boss = G.enemies.find(e => e.boss);
  if (boss) {
    const bFrac = clamp(boss.hp / boss.maxHp, 0, 1);
    const enraged = boss.hp <= boss.maxHp * 0.5;
    const bNames = ['INFERNO DRAKE', 'VORTEX TITAN', 'STORM SENTINEL', 'NEXUS CORE', 'CHRONOS PRIME'];
    const bName = (enraged ? '⚡ ENRAGED ' : '👹 ') + bNames[boss.kit % 5] + ` (${Math.ceil(bFrac * 100)}%)`;
    const bossBarY = (p.shieldCap > 0 ? dockY - 36 * S : dockY - 26 * S);
    const bossBarW = Math.min(560 * S, W - 20 * S);
    const bossBarX = (W - bossBarW) / 2;

    txt(bName, W / 2, bossBarY - 6 * S, 11 * S, enraged ? '#ff3344' : '#ff7a45', 'center', 800);
    bar(bossBarX, bossBarY, bossBarW, 9 * S, bFrac, enraged ? '#ff2a4b' : '#ff3d6e');
  }

  // Kinetic Shield Barrier (if player has Shield Capacitor buffer)
  if (p.shieldCap > 0) {
    const shieldY = dockY - 11 * S;
    const sFrac = clamp(p.shieldCap / 120, 0, 1);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    rr(dockX, shieldY, dockW, 8 * S, 4 * S);
    ctx.fill();
    const sFillW = Math.max(8 * S, dockW * sFrac);
    ctx.fillStyle = '#06b6d4';
    rr(dockX, shieldY, sFillW, 8 * S, 4 * S);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1 * S;
    ctx.stroke();
    txt(`🛡 SHIELD BARRIER: ${Math.round(p.shieldCap)}`, W / 2, shieldY + 4 * S, 7.5 * S, '#ffffff', 'center', 800);
  }

  // Player Core Health Bar
  const hpFrac = clamp(p.hp / p.maxHp, 0, 1);
  const hpCol = hpFrac < 0.28 ? '#ef4444' : hpFrac < 0.6 ? '#f59e0b' : '#10b981';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  rr(dockX, dockY, dockW, 14 * S, 7 * S);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1 * S;
  ctx.stroke();

  if (hpFrac > 0) {
    const hpW = Math.max(14 * S, dockW * hpFrac);
    const hpGrad = ctx.createLinearGradient(dockX, 0, dockX + hpW, 0);
    hpGrad.addColorStop(0, hpCol);
    hpGrad.addColorStop(1, hpFrac < 0.28 ? '#dc2626' : '#34d399');
    ctx.fillStyle = hpGrad;
    rr(dockX, dockY, hpW, 14 * S, 7 * S);
    ctx.fill();
  }
  txt(`${Math.ceil(p.hp)} / ${p.maxHp} HP`, W / 2, dockY + 7 * S, 9.5 * S, '#ffffff', 'center', 800);

  // Redesigned Sleek XP Progress Bar
  const xpY = dockY + 17 * S, xpH = 8 * S;
  ctx.fillStyle = 'rgba(10, 16, 30, 0.85)';
  rr(dockX, xpY, dockW, xpH, xpH / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 1 * S;
  ctx.stroke();

  const xpFrac = clamp(G.xp / G.xpNext, 0, 1);
  if (xpFrac > 0.001) {
    const xpGrad = ctx.createLinearGradient(dockX, 0, dockX + dockW * xpFrac, 0);
    xpGrad.addColorStop(0, '#06b6d4');
    xpGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = xpGrad;
    rr(dockX, xpY, Math.max(xpH, dockW * xpFrac), xpH, xpH / 2);
    ctx.fill();
  }

  // Milestone pips at 25%, 50%, 75%
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1 * S;
  for (const pip of [0.25, 0.5, 0.75]) {
    const px = dockX + dockW * pip;
    ctx.beginPath();
    ctx.moveTo(px, xpY + 1 * S);
    ctx.lineTo(px, xpY + xpH - 1 * S);
    ctx.stroke();
  }
  txt(`XP: ${Math.floor(G.xp)} / ${G.xpNext} (${Math.floor(xpFrac * 100)}%)`, W / 2, xpY + xpH / 2, 6.5 * S, '#ffffff', 'center', 700);

  // Toast Banner
  if (G.toast) {
    ctx.globalAlpha = clamp(G.toast.t, 0, 1);
    txt(G.toast.text, W / 2, H * 0.28, 17 * S, G.toast.col, 'center', 800);
    ctx.globalAlpha = 1;
  }
}

function inRect(x, y, r) {
  return !!r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function enterShop() {
  mode = MODE.SHOP;
  modeAt = performance.now();
  shopNote = null;
  shopRects = { rows: [], back: null };
  if (G) G.path.length = 0;
}

function enterLoadout() {
  mode = MODE.LOADOUT;
  modeAt = performance.now();
  loadoutNote = null;
  loadoutPage = 0;
  loadoutRects = { rows: [], back: null, start: null, prevPage: null, nextPage: null };
  if (G) G.path.length = 0;
}

function weaponUpgradeCost(lvl) {
  return Math.min(2000000, Math.round(300 * Math.pow(1.24, Math.max(0, lvl - 1)) / 10) * 10);
}

function upgradeWeaponMastery(wid) {
  const m = masteryFor(wid);
  if (m.lv >= 30) {
    loadoutNote = { text: WEAPONS[wid].name.toUpperCase() + ' IS AT MAX LEVEL 30', until: performance.now() + 1300 };
    return false;
  }
  const cost = weaponUpgradeCost(m.lv);
  if (meta.coins < cost) {
    loadoutNote = { text: 'NEED ' + cost + ' COINS TO UPGRADE', until: performance.now() + 1300 };
    beep(180, 0.08, 'square', 0.02, -60);
    return false;
  }
  meta.coins -= cost;
  meta.weapons = meta.weapons || defaultMastery();
  meta.weapons[wid] = meta.weapons[wid] || { lv: 1, trees: {} };
  meta.weapons[wid].lv = Math.min(30, (meta.weapons[wid].lv || 1) + 1);
  saveMeta();
  loadoutNote = { text: WEAPONS[wid].name.toUpperCase() + ' UPGRADED TO LV ' + meta.weapons[wid].lv + '!', until: performance.now() + 1500 };
  beep(840, 0.07, 'triangle', 0.03, 200);
  setTimeout(() => beep(1260, 0.09, 'triangle', 0.03, 160), 80);
  return true;
}

function toggleLoadout(wid) {
  let lo = getLoadout();
  if (lo.includes(wid)) {
    if (lo.length <= 1) { loadoutNote = { text: 'EQUIP AT LEAST ONE WEAPON', until: performance.now() + 1300 }; return; }
    lo = lo.filter(id => id !== wid);
  } else {
    if (lo.length >= 3) { loadoutNote = { text: 'MAX 3 WEAPONS EQUIPPED', until: performance.now() + 1300 }; return; }
    lo.push(wid);
  }
  meta.loadout = lo;
  saveMeta();
  beep(700, 0.06, 'triangle', 0.02, 120);
}
