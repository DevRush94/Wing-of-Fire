// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — GLASSMORPHIC UI SCREENS & OVERLAYS
// ═══════════════════════════════════════════════════════════════

function drawLoadout(now) {
  ctx.fillStyle = 'rgba(5,4,12,0.96)';
  ctx.fillRect(0, 0, W, H);
  const cx = W / 2, top = 20;
  txt('LOADOUT ARSENAL', cx, top + 24 * S, 26 * S, '#ffe3b3', 'center', 800);
  txt('\uD83E\uDE99 ' + meta.coins + ' COINS AVAILABLE  ·  EQUIP UP TO 3  ·  MASTERY PERSISTS', cx, top + 48 * S, 14.5 * S, '#ffd166', 'center', 700);

  // Equipped bar
  const eqList = getLoadout().map(id => WEAPONS[id].name).join('   ·   ');
  txt('EQUIPPED: ' + eqList, cx, top + 70 * S, 16 * S, '#ffd166', 'center', 700);

  const pad = 14 * S;
  const start = top + 86 * S;
  const viewBottom = H - 68 * S;
  const viewH = Math.max(100, viewBottom - start);
  const rowH = 68 * S;
  const totalH = WEAPON_IDS.length * rowH;
  loadoutMaxScroll = Math.max(0, totalH - viewH + 16 * S);
  loadoutScrollY = clamp(loadoutScrollY, 0, loadoutMaxScroll);

  loadoutRects.rows = [];

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, start, W, viewH);
  ctx.clip();
  ctx.translate(0, -loadoutScrollY);

  for (let i = 0; i < WEAPON_IDS.length; i++) {
    const wid = WEAPON_IDS[i];
    const w = WEAPONS[wid];
    const eq = getLoadout().includes(wid);
    const mast = masteryFor(wid);
    const tierCount = Object.keys(mast.trees).length;
    const x = pad, y = start + i * rowH, wd = W - pad * 2, h = rowH - 8 * S;

    const upgW = 106 * S, upgH = Math.min(34 * S, h - 8 * S);
    const upgX = x + wd - upgW - 10 * S, upgY = y + (h - upgH) / 2;
    const eqW = 94 * S, eqH = upgH;
    const eqX = upgX - eqW - 8 * S, eqY = upgY;

    loadoutRects.rows.push({
      x, y, w: wd, h, id: wid,
      upgRect: { x: upgX, y: upgY, w: upgW, h: upgH },
      eqRect: { x: eqX, y: eqY, w: eqW, h: eqH }
    });

    if (y + h < start + loadoutScrollY - 20 * S || y > start + loadoutScrollY + viewH + 20 * S) {
      continue;
    }

    ctx.fillStyle = eq ? 'rgba(38,30,58,0.96)' : 'rgba(22,17,38,0.9)';
    rr(x, y, wd, h, 10 * S);
    ctx.fill();
    ctx.strokeStyle = eq ? w.color : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = eq ? 2 * S : 1.2 * S;
    ctx.stroke();

    ctx.fillStyle = w.color;
    rr(x + 8 * S, y + 10 * S, 3.5 * S, h - 20 * S, 1.8 * S);
    ctx.fill();

    // UPGRADE button (far right)
    const cost = weaponUpgradeCost(mast.lv);
    const canAfford = mast.lv < 30 && meta.coins >= cost;
    const maxed = mast.lv >= 30;

    ctx.fillStyle = maxed ? 'rgba(123,255,178,0.14)' : canAfford ? 'rgba(255,209,102,0.18)' : 'rgba(255,255,255,0.05)';
    rr(upgX, upgY, upgW, upgH, upgH / 2);
    ctx.fill();
    ctx.strokeStyle = maxed ? '#7bffb2' : canAfford ? '#ffd166' : 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1.2 * S;
    ctx.stroke();

    const upgText = maxed ? 'MAX LV30' : '▲ LV' + (mast.lv + 1) + ' · \uD83E\uDE99' + (cost >= 1000 ? Math.round(cost / 1000) + 'k' : cost);
    txt(upgText, upgX + upgW / 2, upgY + upgH / 2, 13.5 * S, maxed ? '#7bffb2' : canAfford ? '#ffd166' : 'rgba(255,255,255,0.4)', 'center', 700);

    // EQUIP button (left of upgrade button)
    ctx.fillStyle = eq ? 'rgba(38,30,58,0.96)' : 'rgba(255,255,255,0.06)';
    rr(eqX, eqY, eqW, eqH, eqH / 2);
    ctx.fill();
    ctx.strokeStyle = eq ? w.color : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = eq ? 1.5 * S : 1.1 * S;
    ctx.stroke();
    txt(eq ? 'EQUIPPED' : '+ EQUIP', eqX + eqW / 2, eqY + eqH / 2, 14 * S, eq ? w.color : 'rgba(255,255,255,0.85)', 'center', 700);

    // Name and description (left side)
    txt(w.name + '  ·  LV ' + mast.lv + (tierCount ? ' (T' + tierCount + ')' : ''), x + 20 * S, y + h * 0.35, 16 * S, '#fff', 'left', 700);
    txt(w.role + '  ·  ' + w.desc, x + 20 * S, y + h * 0.72, 13 * S, 'rgba(255,255,255,0.6)', 'left', 500);
  }
  ctx.restore();

  // Draw subtle scrollbar on right edge
  if (loadoutMaxScroll > 0) {
    const sbW = 3.5 * S;
    const sbH = Math.max(22 * S, viewH * (viewH / totalH));
    const sbY = start + (loadoutScrollY / loadoutMaxScroll) * (viewH - sbH);
    ctx.fillStyle = 'rgba(255, 209, 102, 0.45)';
    rr(W - pad + 3 * S, sbY, sbW, sbH, sbW / 2);
    ctx.fill();
  }

  // Footer Buttons
  const bh = 46 * S, bw = (W - pad * 3) / 2;
  const back = { x: pad, y: H - 58 * S, w: bw, h: bh };
  const startBtn = { x: pad * 2 + bw, y: H - 58 * S, w: bw, h: bh };
  loadoutRects.back = back;
  loadoutRects.start = startBtn;

  for (const b of [back, startBtn]) {
    ctx.fillStyle = b === startBtn ? 'rgba(255,209,102,0.15)' : 'rgba(255,255,255,0.07)';
    rr(b.x, b.y, b.w, b.h, b.h / 2);
    ctx.fill();
    ctx.strokeStyle = b === startBtn ? 'rgba(255,209,102,0.6)' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.2 * S;
    ctx.stroke();
  }
  txt('BACK', back.x + back.w / 2, back.y + back.h / 2, 16 * S, '#fff', 'center', 700);
  txt('START RUN', startBtn.x + startBtn.w / 2, startBtn.y + startBtn.h / 2, 16 * S, '#ffd166', 'center', 800);

  if (loadoutNote && now < loadoutNote.until) {
    ctx.globalAlpha = clamp((loadoutNote.until - now) / 250, 0, 1);
    txt(loadoutNote.text, cx, H - 76 * S, 15 * S, '#ffd166', 'center', 700);
    ctx.globalAlpha = 1;
  }
}

function drawShop(now) {
  ctx.fillStyle = 'rgba(5,4,12,0.94)';
  ctx.fillRect(0, 0, W, H);
  const cx = W / 2, top = 20;
  txt('CORE SHOP', cx, top + 24 * S, 26 * S, '#ffe3b3', 'center', 800);
  txt('CORE LEVEL ' + coreLevel() + '/100  ·  PERMANENT RUN UPGRADES', cx, top + 48 * S, 14 * S, 'rgba(255,255,255,0.65)', 'center', 600);
  txt('🪙 ' + meta.coins + ' COINS AVAILABLE', cx, top + 72 * S, 16 * S, '#ffd166', 'center', 700);

  const pad = 14 * S;
  const start = top + 90 * S;
  const rowH = Math.max(22 * S, Math.min(58 * S, (H - start - 84 * S) / PERMS.length));
  shopRects.rows = [];

  for (let i = 0; i < PERMS.length; i++) {
    const u = PERMS[i];
    const lvl = Math.min(u.max, Math.max(0, Math.floor((meta.up && meta.up[u.id]) || 0)));
    const maxed = lvl >= u.max, cost = permCost(u, lvl), afford = !maxed && meta.coins >= cost;
    const x = pad, y = start + i * rowH, w = W - pad * 2, h = rowH - 5 * S;

    ctx.fillStyle = 'rgba(22,17,38,0.94)';
    rr(x, y, w, h, 8 * S);
    ctx.fill();
    ctx.strokeStyle = maxed ? 'rgba(123,255,178,0.4)' : afford ? u.color : 'rgba(255,255,255,0.13)';
    ctx.lineWidth = 1.4 * S;
    ctx.stroke();

    ctx.fillStyle = u.color;
    rr(x + 8 * S, y + 8 * S, 3.5 * S, h - 16 * S, 1.8 * S);
    ctx.fill();

    txt(u.name + ' [' + u.cat + ']', x + 20 * S, y + h * 0.34, 15.5 * S, '#fff', 'left', 700);
    txt(u.desc, x + 20 * S, y + h * 0.70, 12.5 * S, 'rgba(255,255,255,0.6)', 'left', 500);
    txt('LV ' + lvl + '/' + u.max, x + w - 14 * S, y + h * 0.34, 13 * S, 'rgba(255,255,255,0.65)', 'right', 600);
    txt(maxed ? 'MAX' : '🪙 ' + cost, x + w - 14 * S, y + h * 0.70, 14.5 * S, maxed ? '#7bffb2' : afford ? '#ffd166' : 'rgba(255,255,255,0.35)', 'right', 700);
    shopRects.rows.push({ x, y, w, h, id: u.id });
  }

  const back = { x: W / 2 - 95 * S, y: H - 52 * S, w: 190 * S, h: 40 * S };
  shopRects.back = back;
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  rr(back.x, back.y, back.w, back.h, back.h / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();
  txt('BACK', back.x + back.w / 2, back.y + back.h / 2, 16 * S, '#fff', 'center', 700);

  if (shopNote && now < shopNote.until) {
    ctx.globalAlpha = clamp((shopNote.until - now) / 250, 0, 1);
    txt(shopNote.text, cx, H - 70 * S, 15 * S, '#ffd166', 'center', 700);
    ctx.globalAlpha = 1;
  }
}

function drawMenu(now) {
  const cx = W / 2;
  const cy = H * 0.28;
  const breathe = 1 + 0.02 * Math.sin(now * 0.0012);

  drawGlow(SPR.player, cx, cy, Math.min(W, H) * 0.9 * breathe);

  // 1. User Account Pill at top
  const acctW = Math.min(360 * S, W * 0.9);
  const acctH = 36 * S;
  const acctX = cx - acctW / 2;
  const acctY = Math.max(14 * S, H * 0.03);
  menuRects.account = { x: acctX, y: acctY, w: acctW, h: acctH };

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  rr(acctX, acctY, acctW, acctH, acctH / 2);
  ctx.fill();
  ctx.strokeStyle = currentUser ? 'rgba(123, 255, 178, 0.5)' : 'rgba(255, 209, 102, 0.5)';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();

  const acctLabel = currentUser ? ('👤 ' + currentUser.username + '  ·  ' + meta.coins + ' 🪙') : ('👤 GUEST (TAP TO LOGIN)  ·  ' + meta.coins + ' 🪙');
  txt(acctLabel, cx, acctY + acctH / 2, 14.5 * S, currentUser ? '#7bffb2' : '#ffd166', 'center', 700);

  // 2. Title Section (Centered Hero)
  const titleY = Math.max(acctY + 54 * S, H * 0.20);
  const titleSize = Math.min(48 * S, W * 0.11);
  const grad = ctx.createLinearGradient(0, titleY - titleSize, 0, titleY + titleSize * 0.4);
  grad.addColorStop(0, '#fff3c4');
  grad.addColorStop(0.5, '#ffb347');
  grad.addColorStop(1, '#ff5d3d');
  ctx.font = '800 ' + titleSize + 'px ' + FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = grad;
  ctx.fillText('WINGS OF FIRE', cx, titleY);

  txt('SURVIVOR CHRONICLES  ·  v0.9.0', cx, titleY + titleSize * 0.85, 14 * S, 'rgba(255,255,255,0.7)', 'center', 700);

  // 3. Difficulty Chips Card
  const diffs = ['easy', 'normal', 'hard'];
  const dw = Math.min(106 * S, (W - 32 * S) / 3.4), dh = 34 * S, dGap = 8 * S;
  const totalDW = dw * 3 + dGap * 2;
  const dStart = cx - totalDW / 2;
  const diffY = titleY + titleSize * 0.85 + 26 * S;
  menuRects.diffs = [];

  for (let i = 0; i < 3; i++) {
    const id = diffs[i];
    const info = DIFF[id];
    const sel = meta.diff === id;
    const r = { x: dStart + i * (dw + dGap), y: diffY, w: dw, h: dh, id };
    menuRects.diffs.push(r);

    const dCol = id === 'hard' ? '#ff4d6d' : id === 'normal' ? '#ffd166' : '#7bffb2';
    ctx.fillStyle = sel ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)';
    rr(r.x, r.y, r.w, r.h, r.h / 2);
    ctx.fill();
    ctx.strokeStyle = sel ? dCol : 'rgba(255,255,255,0.18)';
    ctx.lineWidth = sel ? 2 * S : 1 * S;
    ctx.stroke();
    txt(info.name, r.x + r.w / 2, r.y + r.h / 2, 14.5 * S, sel ? dCol : 'rgba(255,255,255,0.65)', 'center', 800);
  }

  // 4. Biome Chips (5 Biomes)
  const biomes = ENV_IDS;
  const bw = Math.min(72 * S, (W - 36 * S) / 5.4), bh = 30 * S, bGap = 6 * S;
  const totalBW = bw * 5 + bGap * 4;
  const bStart = cx - totalBW / 2;
  const biomeY = diffY + dh + 10 * S;
  menuRects.biomes = [];
  const curEnv = meta.env || 'nebula';

  for (let i = 0; i < 5; i++) {
    const bid = biomes[i];
    const bInfo = ENVIRONMENTS[bid];
    const sel = curEnv === bid;
    const r = { x: bStart + i * (bw + bGap), y: biomeY, w: bw, h: bh, id: bid };
    menuRects.biomes.push(r);

    const bCol = bid === 'nebula' ? '#06b6d4' : bid === 'magma' ? '#f97316' : bid === 'cyber' ? '#10b981' : bid === 'abyss' ? '#818cf8' : '#f59e0b';
    ctx.fillStyle = sel ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)';
    rr(r.x, r.y, r.w, r.h, r.h / 2);
    ctx.fill();
    ctx.strokeStyle = sel ? bCol : 'rgba(255,255,255,0.18)';
    ctx.lineWidth = sel ? 2 * S : 1 * S;
    ctx.stroke();
    txt(bInfo.name.split(' ')[0], r.x + r.w / 2, r.y + r.h / 2, 13 * S, sel ? bCol : 'rgba(255,255,255,0.65)', 'center', 800);
  }

  // 5. Best Run Status Banner (Clean Fallback, Never NaN)
  const bestY = biomeY + bh + 16 * S;
  const hasValidBest = best && typeof best.time === 'number' && !isNaN(best.time) && best.time > 0;
  const bestW = Math.min(380 * S, W * 0.9);
  const bestH = 28 * S;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  rr(cx - bestW / 2, bestY, bestW, bestH, bestH / 2);
  ctx.fill();
  ctx.strokeStyle = hasValidBest ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1 * S;
  ctx.stroke();

  if (hasValidBest) {
    const diffLabel = (DIFF[best.diff] ? DIFF[best.diff].name : 'EASY').toUpperCase();
    txt('🏆 BEST RUN  ' + fmt(best.time) + '  ·  ' + (best.kills || 0) + ' KILLS  ·  ' + diffLabel, cx, bestY + bestH / 2, 12.5 * S, '#ffd700', 'center', 700);
  } else {
    txt('🚀 READY FOR LAUNCH  ·  SELECT BIOME & START', cx, bestY + bestH / 2, 12 * S, 'rgba(255,255,255,0.5)', 'center', 600);
  }

  // 6. Tap to Play (Centered Action Hero)
  const playY = Math.max(bestY + bestH + 28 * S, H * 0.56);
  const pulse = 0.65 + 0.35 * Math.sin(now * 0.005);
  ctx.save();
  ctx.globalAlpha = pulse;
  const playW = Math.min(280 * S, W * 0.75);
  const playH = 46 * S;
  const playR = { x: cx - playW / 2, y: playY - playH / 2, w: playW, h: playH };
  ctx.fillStyle = 'rgba(255, 140, 50, 0.12)';
  rr(playR.x, playR.y, playR.w, playR.h, playH / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 180, 70, 0.6)';
  ctx.lineWidth = 1.5 * S;
  ctx.stroke();
  txt('TAP / CLICK TO PLAY', cx, playY, 20 * S, '#ffe3b3', 'center', 800);
  ctx.restore();

  // 7. Loadout & Shop Buttons (Responsive: Side-by-side on wide screens, stacked on narrow)
  const isWide = W >= 580 * S;
  let ml, ms;
  if (isWide) {
    const btnW = Math.min(220 * S, (W - 48 * S) / 2);
    const btnH = 42 * S;
    const btnY = H - 90 * S;
    ml = { x: cx - btnW - 10 * S, y: btnY, w: btnW, h: btnH };
    ms = { x: cx + 10 * S, y: btnY, w: btnW, h: btnH };
  } else {
    const btnW = Math.min(280 * S, W * 0.85);
    const btnH = 40 * S;
    ml = { x: cx - btnW / 2, y: H - 134 * S, w: btnW, h: btnH };
    ms = { x: cx - btnW / 2, y: H - 86 * S, w: btnW, h: btnH };
  }
  menuRects.loadout = ml;
  menuRects.shop = ms;

  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  rr(ml.x, ml.y, ml.w, ml.h, ml.h / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(160,200,255,0.45)';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();
  txt('LOADOUT ARSENAL (' + getLoadout().length + '/3)', ml.x + ml.w / 2, ml.y + ml.h / 2, 15 * S, '#9ef0ff', 'center', 700);

  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  rr(ms.x, ms.y, ms.w, ms.h, ms.h / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,209,102,0.45)';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();
  txt('CORE SHOP  ·  🪙 ' + meta.coins, ms.x + ms.w / 2, ms.y + ms.h / 2, 15 * S, '#ffd166', 'center', 700);

  // 8. Footer Info
  txt('LEFT: MOVE  ·  RIGHT: AIM  ·  DASH: BUTTON / DOUBLE-TAP / SPACE', cx, H - 42 * S, 12 * S, 'rgba(255,255,255,0.5)', 'center', 600);
  txt('Wings of Fire v0.9.0', cx, H - 18 * S, 11 * S, 'rgba(255,255,255,0.3)', 'center', 600);
}

function drawLevelOverlay() {
  ctx.fillStyle = 'rgba(5,4,12,0.76)';
  ctx.fillRect(0, 0, W, H);

  const tree = G.treeChoice;
  const isBonus = G.bonusPick;

  let title = 'LEVEL UP!';
  let sub = 'CHOOSE AN UPGRADE';
  let titleCol = '#ffe3b3';

  if (tree) {
    title = 'WEAPON EVOLUTION';
    sub = WEAPONS[tree.wid].name.toUpperCase() + '  ·  TIER ' + tree.tier;
    titleCol = '#c084fc';
  } else if (isBonus) {
    title = 'BONUS UPGRADE (🪙 ' + G.bonusPickCost + ' COINS)';
    sub = 'PAID LEVEL-UP CARD · PICK ONE OR SKIP (BANK COINS)';
    titleCol = '#ffd166';
  }

  const topY = Math.max(50 * S, H * 0.14);
  txt(title, W / 2, topY, 22 * S, titleCol, 'center', 800);
  txt(sub, W / 2, topY + 22 * S, 9.5 * S, 'rgba(255,255,255,0.5)', 'center', 700);

  for (const r of G.cardRects) {
    const c = G.cards[r.i];
    const isWeaponCard = Boolean(c.wid || (c.id && c.id.startsWith('w_')) || G.treeChoice);
    const isSkillCard = ['dmg', 'rate', 'multi', 'pierce', 'burn', 'explode', 'crit', 'steal'].includes(c.id);
    const cardCol = isWeaponCard ? '#38bdf8' : (isSkillCard ? '#facc15' : '#f8fafc');

    ctx.fillStyle = 'rgba(22,17,38,0.96)';
    rr(r.x, r.y, r.w, r.h, 14 * S);
    ctx.fill();
    ctx.strokeStyle = cardCol;
    ctx.globalAlpha = 0.88;
    ctx.lineWidth = 1.8 * S;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = cardCol;
    rr(r.x + 10 * S, r.y + 14 * S, 5 * S, r.h - 28 * S, 2.5 * S);
    ctx.fill();

    const ix = r.x + 36 * S, iy = r.y + r.h * 0.4;
    ctx.fillStyle = cardCol;
    ctx.beginPath();
    ctx.moveTo(ix, iy - 10 * S); ctx.lineTo(ix + 10 * S, iy); ctx.lineTo(ix, iy + 10 * S); ctx.lineTo(ix - 10 * S, iy);
    ctx.closePath();
    ctx.fill();

    const tx = r.x + 56 * S;
    txt(c.name, tx, r.y + r.h * 0.38 - 10 * S, 14 * S, '#fff', 'left', 700);
    txt('[' + (r.i + 1) + ']', r.x + r.w - 18 * S, r.y + 22 * S, 9.5 * S, 'rgba(255,255,255,0.4)', 'right', 700);
    const lines = wrapText(c.desc, r.w - 70 * S, 10 * S, 500);
    lines.forEach((ln, li) => txt(ln, tx, r.y + r.h * 0.38 + 10 * S + li * 13 * S, 10 * S, 'rgba(255,255,255,0.65)', 'left', 500));
  }

  // Skip button on bonus pick
  if (isBonus) {
    const skipBtn = { x: W / 2 - 110 * S, y: H * 0.86, w: 220 * S, h: 36 * S };
    G.skipRect = skipBtn;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    rr(skipBtn.x, skipBtn.y, skipBtn.w, skipBtn.h, skipBtn.h / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.2 * S;
    ctx.stroke();
    txt('SKIP (BANK COINS) [SPACE / ESC]', skipBtn.x + skipBtn.w / 2, skipBtn.y + skipBtn.h / 2, 9.5 * S, '#ffe3b3', 'center', 700);
  } else {
    G.skipRect = null;
  }
}

function drawPause() {
  ctx.fillStyle = 'rgba(5,4,12,0.84)';
  ctx.fillRect(0, 0, W, H);
  const cx = W / 2;
  txt('GAME PAUSED', cx, H * 0.32, 28 * S, '#fff', 'center', 800);

  // Run progress display
  txt('TIME ' + fmt(G.t) + '   ·   KILLS ' + G.kills + '   ·   LEVEL ' + G.level, cx, H * 0.40, 11 * S, 'rgba(255,255,255,0.65)', 'center', 600);
  txt('COINS ' + G.coins + ' 🪙   ·   DIFFICULTY ' + (DIFF[G.diff].name), cx, H * 0.45, 10 * S, '#ffd166', 'center', 700);

  const res = { x: cx - 110 * S, y: H * 0.55, w: 220 * S, h: 42 * S };
  const quit = { x: cx - 110 * S, y: H * 0.65, w: 220 * S, h: 42 * S };
  pauseRects.resume = res;
  pauseRects.quit = quit;

  ctx.fillStyle = 'rgba(255,209,102,0.18)';
  rr(res.x, res.y, res.w, res.h, res.h / 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1.5 * S;
  ctx.stroke();
  txt('RESUME BATTLE', res.x + res.w / 2, res.y + res.h / 2, 11 * S, '#ffd166', 'center', 800);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  rr(quit.x, quit.y, quit.w, quit.h, quit.h / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();
  txt('QUIT TO MENU', quit.x + quit.w / 2, quit.y + quit.h / 2, 11 * S, '#fff', 'center', 700);
}

function getRunTag() {
  if (G.bossKills >= 2) return '⚔ BOSS HUNTER';
  if (G.maxCombo >= 15) return '⚡ CHAIN LORD';
  if (G.coinsSpent >= 80) return '💰 BIG SPENDER';
  if (G.hitsTaken <= 3 && G.t >= 90) return '🛡 IRONCLAD';
  if (G.kills >= 180) return '💀 MASSACRE';
  if (G.player.nuke > 0) return '🚀 TITAN';
  if (G.player.hole > 0) return '🕳 VOID MASTER';
  if (G.player.disk > 0) return '🌀 DISK RUNNER';
  return '🔥 FIRE RUNNER';
}

function drawDead(now) {
  ctx.fillStyle = 'rgba(5,4,12,0.85)';
  ctx.fillRect(0, 0, W, H);
  const cx = W / 2;

  const grad = ctx.createLinearGradient(0, H * 0.22, 0, H * 0.32);
  grad.addColorStop(0, '#ffd6c2');
  grad.addColorStop(1, '#ff4d6d');
  ctx.font = '800 ' + Math.min(34 * S, W * 0.085) + 'px ' + FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = grad;
  ctx.fillText('YOUR FLAME FADED', cx, H * 0.26);

  // Run Tag
  txt(getRunTag(), cx, H * 0.33, 13 * S, '#ffd166', 'center', 800);

  txt('SURVIVED  ' + fmt(G.t) + '   ·   ' + (DIFF[G.diff].name), cx, H * 0.40, 15 * S, '#fff', 'center', 700);
  txt('LEVEL ' + G.level + '   ·   ' + G.kills + ' KILLS   ·   ' + G.coinsEarned + ' COINS EARNED', cx, H * 0.45, 10.5 * S, 'rgba(255,255,255,0.65)', 'center', 600);

  if (G.isStreak) {
    txt('NEW PERSONAL BEST 🏆 (+30% COINS BONUS!)', cx, H * 0.50, 10 * S, '#7bffb2', 'center', 700);
  } else if (best) {
    txt('BEST RECORD ' + fmt(best.time), cx, H * 0.50, 9.5 * S, 'rgba(255,255,255,0.45)', 'center', 600);
  }

  txt('+' + (G.coinsEarned || 0) + ' COINS BANKED   ·   🪙 ' + meta.coins + ' TOTAL', cx, H * 0.55, 11 * S, '#ffd166', 'center', 700);

  // Buttons: TRY AGAIN, SHOP, MENU
  const bw = 220 * S, bh = 38 * S;
  const restart = { x: cx - bw / 2, y: H * 0.63, w: bw, h: bh };
  const shop = { x: cx - bw / 2, y: H * 0.72, w: bw, h: bh };
  const menuBtn = { x: cx - bw / 2, y: H * 0.81, w: bw, h: bh };
  deadRects.restart = restart;
  deadRects.shop = shop;
  deadRects.menu = menuBtn;

  // Restart Button
  ctx.fillStyle = 'rgba(255,209,102,0.18)';
  rr(restart.x, restart.y, restart.w, restart.h, restart.h / 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1.6 * S;
  ctx.stroke();
  txt('TRY AGAIN (1-TAP)', restart.x + restart.w / 2, restart.y + restart.h / 2, 11 * S, '#ffd166', 'center', 800);

  // Shop Button
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  rr(shop.x, shop.y, shop.w, shop.h, shop.h / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,209,102,0.45)';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();
  txt('CORE SHOP · 🪙 ' + meta.coins, shop.x + shop.w / 2, shop.y + shop.h / 2, 10 * S, '#ffd166', 'center', 700);

  // Menu Button
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  rr(menuBtn.x, menuBtn.y, menuBtn.w, menuBtn.h, menuBtn.h / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();
  txt('BACK TO TITLE', menuBtn.x + menuBtn.w / 2, menuBtn.y + menuBtn.h / 2, 10 * S, '#fff', 'center', 700);
}

function drawVictory(now) {
  ctx.fillStyle = 'rgba(5,4,14,0.92)';
  ctx.fillRect(0, 0, W, H);
  const cx = W / 2;

  if (Math.random() < 0.2) {
    burst(rand(0, W), rand(0, H * 0.4), 4, Math.random() < 0.5 ? '#ffd700' : '#38bdf8', 120 * S, 0.6);
  }

  const grad = ctx.createLinearGradient(0, H * 0.18, 0, H * 0.28);
  grad.addColorStop(0, '#fffbeb');
  grad.addColorStop(0.5, '#fde047');
  grad.addColorStop(1, '#eab308');
  ctx.font = '900 ' + Math.min(36 * S, W * 0.09) + 'px ' + FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = grad;
  ctx.fillText('CAMPAIGN CONQUERED! \uD83C\uDFC6', cx, H * 0.22);

  const envCfg = (G && ENVIRONMENTS[G.env]) || ENVIRONMENTS.nebula;
  const winSub = G.bossKills >= 5
    ? (envCfg.name + ' PURGED · 5 APEX TITANS FELLED')
    : (G.level >= MAX_RUN_LEVEL
      ? (envCfg.name + ' PURGED · LEVEL ' + MAX_RUN_LEVEL + ' REACHED')
      : (envCfg.name + ' PURGED · 20 MIN SURVIVED'));
  txt(winSub, cx, H * 0.29, 12 * S, '#7bffb2', 'center', 800);
  txt('TIME  ' + fmt(G.t) + '   ·   ' + (DIFF[G.diff].name), cx, H * 0.36, 15 * S, '#fff', 'center', 700);
  txt(G.kills + ' KILLS   ·   ' + G.bossKills + ' TITANS FELLED   ·   +' + G.coinsEarned + ' \uD83E\uDE99 BANKED', cx, H * 0.42, 11 * S, '#ffd166', 'center', 700);

  const bw = 220 * S, bh = 38 * S;
  const restart = { x: cx - bw / 2, y: H * 0.55, w: bw, h: bh };
  const shop = { x: cx - bw / 2, y: H * 0.64, w: bw, h: bh };
  const menuBtn = { x: cx - bw / 2, y: H * 0.73, w: bw, h: bh };
  victoryRects.restart = restart;
  victoryRects.shop = shop;
  victoryRects.menu = menuBtn;

  ctx.fillStyle = 'rgba(255,209,102,0.22)';
  rr(restart.x, restart.y, restart.w, restart.h, restart.h / 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1.6 * S;
  ctx.stroke();
  txt('PLAY AGAIN', restart.x + restart.w / 2, restart.y + restart.h / 2, 11 * S, '#ffd166', 'center', 800);

  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  rr(shop.x, shop.y, shop.w, shop.h, shop.h / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,209,102,0.45)';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();
  txt('CORE SHOP · \uD83E\uDE99 ' + meta.coins, shop.x + shop.w / 2, shop.y + shop.h / 2, 10 * S, '#ffd166', 'center', 700);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  rr(menuBtn.x, menuBtn.y, menuBtn.w, menuBtn.h, menuBtn.h / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();
  txt('MAIN MENU', menuBtn.x + menuBtn.w / 2, menuBtn.y + menuBtn.h / 2, 10 * S, '#fff', 'center', 700);
}

function render(now) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawBg(now);

  if (mode === MODE.SHOP) { drawShop(now); return; }
  if (mode === MODE.LOADOUT) { drawLoadout(now); return; }
  if (mode === MODE.MENU || !G) { drawMenu(now); return; }

  ctx.save();
  if (G.shake > 0.1) {
    ctx.translate(rand(-1, 1) * G.shake, rand(-1, 1) * G.shake);
  }
  drawWorld(now);
  ctx.restore();

  drawHud(now);

  if (mode === MODE.LEVEL) drawLevelOverlay();
  else if (mode === MODE.PAUSE) drawPause();
  else if (mode === MODE.DEAD) drawDead(now);
  else if (mode === MODE.VICTORY) drawVictory(now);
}

let lastTapTime = 0;
