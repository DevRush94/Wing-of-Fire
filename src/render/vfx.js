// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — GLOW SPRITES, PARTICLES & VECTOR VFX
// ═══════════════════════════════════════════════════════════════

function drawGlow(spr, x, y, w) {
  if (!spr) return;
  const h = w;
  ctx.drawImage(spr, x - w / 2, y - h / 2, w, h);
}

function rr(x, y, w, h, r) {
  if (w <= 0 || h <= 0) { ctx.beginPath(); return; }
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function txt(s, x, y, size, color, align, weight) {
  ctx.font = (weight || 600) + ' ' + size + 'px ' + FONT;
  ctx.fillStyle = color || '#fff';
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function bar(x, y, w, h, frac, color) {
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  rr(x, y, w, h, h / 2);
  ctx.fill();
  const f = clamp(frac, 0, 1);
  if (f > 0.001) {
    ctx.fillStyle = color;
    rr(x, y, Math.max(h, w * f), h, h / 2);
    ctx.fill();
  }
}

function wrapText(text, maxW, size, weight) {
  ctx.font = (weight || 500) + ' ' + size + 'px ' + FONT;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

// ═══════ SHAPE PRIMITIVES — Reusable polygon/shape drawers ═══════
function _poly(n, r) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const a = i/n*TAU; i ? ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r) : ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r); }
  ctx.closePath();
}
function _tri(r, h) { ctx.beginPath(); ctx.moveTo(0,-r*(h||1.3)); ctx.lineTo(r,r*0.9); ctx.lineTo(-r,r*0.9); ctx.closePath(); }
function _diamond(r, h) { ctx.beginPath(); ctx.moveTo(0,-r*(h||1.2)); ctx.lineTo(r,0); ctx.lineTo(0,r*(h||1.2)); ctx.lineTo(-r,0); ctx.closePath(); }
function _chevron(r) { ctx.beginPath(); ctx.moveTo(0,-r*1.4); ctx.lineTo(r,r*0.8); ctx.lineTo(0,r*0.2); ctx.lineTo(-r,r*0.8); ctx.closePath(); }
function _star(pts, r, ir) {
  ctx.beginPath();
  for (let i = 0; i < pts; i++) {
    const a1 = i/pts*TAU, a2 = (i+0.5)/pts*TAU;
    i===0 ? ctx.moveTo(Math.cos(a1)*r, Math.sin(a1)*r) : ctx.lineTo(Math.cos(a1)*r, Math.sin(a1)*r);
    ctx.lineTo(Math.cos(a2)*r*(ir||0.55), Math.sin(a2)*r*(ir||0.55));
  }
  ctx.closePath();
}
function _bossShape(r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i/8*TAU, rad = r*(i%2?0.72:1); i ? ctx.lineTo(Math.cos(a)*rad, Math.sin(a)*rad) : ctx.moveTo(Math.cos(a)*rad, Math.sin(a)*rad); }
  ctx.closePath();
}
// ═══════════════════════════════════════════════════════════════
// DIVERSE HOSTILE ENEMY CRAFT & BOSS FLAGSHIP RENDERERS
// ═══════════════════════════════════════════════════════════════

function _drawBossShip(e, now, bt) {
  const r = e.r;
  const enraged = e.hp <= e.maxHp * 0.5;
  const mainCol = e.flash > 0 ? '#ff9f1c' : (enraged ? (bt.eCol || '#ff2a4b') : (e.col || '#ea580c'));
  const glowCol = enraged ? '#ff0033' : '#ff6b35';

  if (e.kit === 0) {
    // Kit 0: INFERNO DRAKE (Draconic Heavy Battleship)
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.3); // Nose rammer
    ctx.lineTo(-r * 0.35, -r * 0.8);
    ctx.lineTo(-r * 1.25, r * 0.1); // Swept dragon wing
    ctx.lineTo(-r * 0.5, r * 0.45);
    ctx.lineTo(-r * 0.4, r * 0.85); // Left thruster
    ctx.lineTo(0, r * 0.65);
    ctx.lineTo(r * 0.4, r * 0.85); // Right thruster
    ctx.lineTo(r * 0.5, r * 0.45);
    ctx.lineTo(r * 1.25, r * 0.1);
    ctx.lineTo(r * 0.35, -r * 0.8);
    ctx.closePath();
    ctx.fillStyle = mainCol;
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2.5 * S;
    ctx.stroke();

    // Reactor Core
    ctx.fillStyle = enraged ? '#ff0033' : '#ff781f';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.38, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 1.5 * S; ctx.stroke();

  } else if (e.kit === 1) {
    // Kit 1: VORTEX TITAN (Spiked Citadel Dreadnought)
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      const rad = r * (i % 2 === 0 ? 1.15 : 0.65);
      i === 0 ? ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad) : ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = mainCol;
    ctx.fill();
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 2.5 * S;
    ctx.stroke();

    // Quad Shield Pylons
    for (let k = 0; k < 4; k++) {
      const pa = k * Math.PI / 2 + now * 0.002;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(Math.cos(pa) * r * 0.72, Math.sin(pa) * r * 0.72, r * 0.22, 0, TAU);
      ctx.fill();
    }

  } else if (e.kit === 2) {
    // Kit 2: STORM SENTINEL (Twin-Hull Stealth Titan)
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.55, -r * 1.2);
      ctx.lineTo(side * r * 0.95, -r * 0.3);
      ctx.lineTo(side * r * 0.85, r * 0.8);
      ctx.lineTo(side * r * 0.35, r * 0.7);
      ctx.lineTo(side * r * 0.35, -r * 0.4);
      ctx.closePath();
      ctx.fillStyle = mainCol;
      ctx.fill();
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 2 * S;
      ctx.stroke();
    }
    // Central Plasma Bridge
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(-r * 0.35, -r * 0.25, r * 0.7, r * 0.6);
    ctx.fillStyle = '#ff2a4b';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.28, 0, TAU); ctx.fill();

  } else if (e.kit === 3) {
    // Kit 3: NEXUS CORE (Orbital Laser Cannon Platform)
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.25); // Heavy forward focusing emitter
    ctx.lineTo(-r * 0.45, -r * 0.5);
    ctx.lineTo(-r * 1.1, -r * 0.1);
    ctx.lineTo(-r * 0.95, r * 0.65);
    ctx.lineTo(-r * 0.35, r * 0.85);
    ctx.lineTo(0, r * 0.5);
    ctx.lineTo(r * 0.35, r * 0.85);
    ctx.lineTo(r * 0.95, r * 0.65);
    ctx.lineTo(r * 1.1, -r * 0.1);
    ctx.lineTo(r * 0.45, -r * 0.5);
    ctx.closePath();
    ctx.fillStyle = mainCol;
    ctx.fill();
    ctx.strokeStyle = '#831843';
    ctx.lineWidth = 2.5 * S;
    ctx.stroke();

    // Iris Laser Cannon Muzzle
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(0, -r * 0.85, r * 0.25, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ff0055';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, TAU); ctx.fill();

  } else {
    // Kit 4: CHRONOS PRIME (Temporal Void Dreadnought)
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.1);
    ctx.lineTo(-r * 1.2, r * 0.25);
    ctx.lineTo(-r * 0.75, r * 0.9);
    ctx.lineTo(0, r * 0.45);
    ctx.lineTo(r * 0.75, r * 0.9);
    ctx.lineTo(r * 1.2, r * 0.25);
    ctx.closePath();
    ctx.fillStyle = mainCol;
    ctx.fill();
    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 2.5 * S;
    ctx.stroke();

    // Temporal Distortion Core
    ctx.fillStyle = '#c026d3';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 2 * S; ctx.stroke();
  }

  // Thruster Fire Plumes
  if (e.isDashing > 0 || Math.sin(now * 0.02) > 0) {
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.7);
    ctx.lineTo(r * 0.3, r * 0.7);
    ctx.lineTo(0, r * (e.isDashing > 0 ? 1.6 : 1.1));
    ctx.closePath();
    ctx.fill();
  }
}

function _drawStandardEnemy(e, now, th) {
  const r = e.r;
  const col = e.flash > 0 ? '#ff8533' : (e.col || th.body || '#ef4444');

  if (th.shape === 'tri' || e.type === 'chaser' || e.type === 'swarmer') {
    // 1. Sleek Twin-Pronged Interceptor / Needle Craft
    ctx.beginPath();
    ctx.moveTo(-r * 0.32, -r * 1.15); // Left prong
    ctx.lineTo(0, -r * 0.65);
    ctx.lineTo(r * 0.32, -r * 1.15);  // Right prong
    ctx.lineTo(r * 0.95, r * 0.35);   // Wingtip right
    ctx.lineTo(r * 0.35, r * 0.75);   // Thruster right
    ctx.lineTo(0, r * 0.45);
    ctx.lineTo(-r * 0.35, r * 0.75);  // Thruster left
    ctx.lineTo(-r * 0.95, r * 0.35);  // Wingtip left
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 1.4 * S;
    ctx.stroke();

    // Sensor Slit Eye
    ctx.fillStyle = '#ff0033';
    ctx.fillRect(-r * 0.22, -r * 0.35, r * 0.44, r * 0.2);

  } else if (th.shape === 'chevron' || e.type === 'charger' || e.type === 'artillery') {
    // 2. Heavy Swept-Wing Armored Striker
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.15); // Needle nose
    ctx.lineTo(r * 0.35, -r * 0.4);
    ctx.lineTo(r * 1.1, r * 0.2);
    ctx.lineTo(r * 0.65, r * 0.8);
    ctx.lineTo(0, r * 0.35);
    ctx.lineTo(-r * 0.65, r * 0.8);
    ctx.lineTo(-r * 1.1, r * 0.2);
    ctx.lineTo(-r * 0.35, -r * 0.4);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();

    // Heavy Weapon Pylons
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-r * 0.65, -r * 0.1, r * 0.25, r * 0.55);
    ctx.fillRect(r * 0.4, -r * 0.1, r * 0.25, r * 0.55);

  } else if (th.shape === 'poly' || th.shape === 'rect' || e.type === 'tank' || e.type === 'mag_golem') {
    // 3. Heavy Armored Cruiser / Battle Tank
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.0);
    ctx.lineTo(r * 0.75, -r * 0.55);
    ctx.lineTo(r * 0.95, r * 0.4);
    ctx.lineTo(r * 0.5, r * 0.9);
    ctx.lineTo(-r * 0.5, r * 0.9);
    ctx.lineTo(-r * 0.95, r * 0.4);
    ctx.lineTo(-r * 0.75, -r * 0.55);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 1.8 * S;
    ctx.stroke();

    // Armored Center Hull
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, TAU); ctx.fill();

  } else if (th.shape === 'star' || e.type === 'spinner' || e.type === 'cyb_turret') {
    // 4. Mechanical Octagonal Hunter Sentry
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU + e.rot * 0.5;
      const rad = r * (k % 2 ? 0.65 : 1.05);
      k === 0 ? ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad) : ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = '#831843';
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();

    // Center Targeting Eye
    ctx.fillStyle = '#ff2a4b';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.32, 0, TAU); ctx.fill();

  } else {
    // 5. Spiked Biomechanical Horror / Abyssal Craft
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.15);
    ctx.quadraticCurveTo(r * 0.8, -r * 0.4, r * 1.1, r * 0.15);
    ctx.lineTo(r * 0.5, r * 0.7);
    ctx.lineTo(0, r * 0.35);
    ctx.lineTo(-r * 0.5, r * 0.7);
    ctx.lineTo(-r * 1.1, r * 0.15);
    ctx.quadraticCurveTo(-r * 0.8, -r * 0.4, 0, -r * 1.15);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();

    ctx.fillStyle = '#c026d3';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, TAU); ctx.fill();
  }
}

// Draw a single enemy with dynamic hostile silhouettes & orientation
function drawEnemyBody(e, now) {
  const th = THEME.en[e.type] || THEME.en.chaser;

  if (e.warnT > 0) {
    const pFrac = e.warnT / (e.boss ? 1.0 : 0.4);
    ctx.save();
    ctx.strokeStyle = e.col;
    ctx.lineWidth = 2 * S;
    ctx.setLineDash(THEME.vfx.warnDash.map(v => v * S));
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now * THEME.vfx.warnPulse);
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r * (1 + pFrac * THEME.vfx.warnExpand), 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  drawGlow(e.boss ? SPR.boss : SPR.enemy, e.x, e.y, e.r * (e.boss ? 7.5 : 4.5));

  ctx.save();
  ctx.translate(e.x, e.y);

  // Orient towards flight heading or movement vector
  const facing = (e.heading !== undefined ? e.heading : (Math.atan2(G.player.y - e.y, G.player.x - e.x))) + Math.PI / 2;
  ctx.rotate(e.boss ? facing : (th.shape === 'star' ? e.rot : facing));

  if (e.boss) {
    const bt = THEME.boss[e.kit] || THEME.boss[0];
    _drawBossShip(e, now, bt);
  } else {
    _drawStandardEnemy(e, now, th);
  }

  ctx.restore();

  if (e.elite) {
    ctx.strokeStyle = THEME.vfx.eliteRing;
    ctx.lineWidth = THEME.vfx.eliteW * S;
    ctx.setLineDash(THEME.vfx.eliteDash.map(v => v * S));
    ctx.lineDashOffset = -now * 0.02;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r + 6 * S, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (e.burn) {
    ctx.strokeStyle = THEME.vfx.burnRing;
    ctx.lineWidth = THEME.vfx.burnW * S;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r + 4 * S, 0, TAU);
    ctx.stroke();
  }
}

// Draw the high-tech military supersonic Fighter Plane
function drawPlayerShip(p, now) {
  const L = p.r * 1.55;
  const W = p.r * 1.35;
  const facing = (p.hasAim ? p.aimAng : Math.atan2(p.lastDir.y, p.lastDir.x)) + Math.PI / 2;

  // Under-glow engine aura
  drawGlow(SPR.player, p.x, p.y, p.r * 7.5);

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(facing);

  // 1. Dual Supersonic Plasma Afterburners
  const isDash = p.dashT > 0;
  const boostPulse = 0.85 + 0.35 * Math.sin(now * 0.04);
  const flameLen = (isDash ? 2.8 : 1.2) * L * 0.55 * boostPulse;
  const flameW = W * 0.18;

  for (const side of [-1, 1]) {
    const ex = side * W * 0.28;
    const ey = L * 0.70;

    // Outer flame sheath
    ctx.beginPath();
    ctx.moveTo(ex - flameW, ey);
    ctx.lineTo(ex + flameW, ey);
    ctx.lineTo(ex, ey + flameLen);
    ctx.closePath();
    const fGrad = ctx.createLinearGradient(ex, ey, ex, ey + flameLen);
    if (isDash) {
      fGrad.addColorStop(0, '#ffffff');
      fGrad.addColorStop(0.3, '#ffd166');
      fGrad.addColorStop(1, 'rgba(255, 60, 0, 0)');
    } else {
      fGrad.addColorStop(0, '#ffffff');
      fGrad.addColorStop(0.3, '#38bdf8');
      fGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    }
    ctx.fillStyle = fGrad;
    ctx.fill();

    // Inner shock diamond core
    ctx.beginPath();
    ctx.moveTo(ex - flameW * 0.45, ey);
    ctx.lineTo(ex + flameW * 0.45, ey);
    ctx.lineTo(ex, ey + flameLen * 0.55);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  // 2. Main Swept-Delta Airframe with LERX (Leading-Edge Root Extensions)
  ctx.beginPath();
  // Nose radome tip
  ctx.moveTo(0, -L);
  // Port (Left) flank & chine
  ctx.lineTo(-W * 0.18, -L * 0.62);
  ctx.lineTo(-W * 0.28, -L * 0.25);
  // Swept delta leading edge to wingtip
  ctx.lineTo(-W * 1.15, L * 0.28);
  // Wingtip missile rail
  ctx.lineTo(-W * 1.15, L * 0.42);
  // Trailing edge with flaperon
  ctx.lineTo(-W * 0.46, L * 0.56);
  // Canted vertical tail fin
  ctx.lineTo(-W * 0.48, L * 0.82);
  ctx.lineTo(-W * 0.24, L * 0.72);
  // Engine nozzle left
  ctx.lineTo(-W * 0.12, L * 0.78);
  // Center beaver tail
  ctx.lineTo(0, L * 0.66);
  // Engine nozzle right
  ctx.lineTo(W * 0.12, L * 0.78);
  // Canted vertical tail fin right
  ctx.lineTo(W * 0.24, L * 0.72);
  ctx.lineTo(W * 0.48, L * 0.82);
  // Trailing edge right
  ctx.lineTo(W * 0.46, L * 0.56);
  // Wingtip right
  ctx.lineTo(W * 1.15, L * 0.42);
  ctx.lineTo(W * 1.15, L * 0.28);
  // Starboard leading edge
  ctx.lineTo(W * 0.28, -L * 0.25);
  ctx.lineTo(W * 0.18, -L * 0.62);
  ctx.closePath();

  // Dark stealth fuselage gradient with metallic sheen
  const bodyGrad = ctx.createLinearGradient(-W, 0, W, 0);
  bodyGrad.addColorStop(0, '#0f172a');
  bodyGrad.addColorStop(0.3, '#1e293b');
  bodyGrad.addColorStop(0.5, '#334155');
  bodyGrad.addColorStop(0.7, '#1e293b');
  bodyGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.4 * S;
  ctx.stroke();

  // 3. Inner Wing Panels & Stealth Seams
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.0 * S;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * W * 0.24, -L * 0.18);
    ctx.lineTo(s * W * 0.95, L * 0.26);
    ctx.lineTo(s * W * 0.44, L * 0.48);
    ctx.stroke();

    // Twin weapon hardpoint pods
    ctx.fillStyle = '#475569';
    ctx.fillRect(s * W * 0.72 - 2 * S, L * 0.08, 4 * S, 12 * S);
  }

  // 4. Supersonic Cockpit Canopy Glass (Faceted Stealth HUD)
  const canopyL = L * 0.48;
  const canopyW = W * 0.20;
  const canopyY = -L * 0.28;

  ctx.beginPath();
  ctx.moveTo(0, canopyY - canopyL * 0.55);
  ctx.lineTo(canopyW, canopyY);
  ctx.lineTo(canopyW * 0.7, canopyY + canopyL * 0.45);
  ctx.lineTo(0, canopyY + canopyL * 0.55);
  ctx.lineTo(-canopyW * 0.7, canopyY + canopyL * 0.45);
  ctx.lineTo(-canopyW, canopyY);
  ctx.closePath();

  const glassGrad = ctx.createLinearGradient(0, canopyY - canopyL * 0.5, 0, canopyY + canopyL * 0.5);
  glassGrad.addColorStop(0, '#bae6fd');
  glassGrad.addColorStop(0.4, '#38bdf8');
  glassGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = glassGrad;
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();

  // Cockpit glare reflection line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.0 * S;
  ctx.beginPath();
  ctx.moveTo(-canopyW * 0.35, canopyY - canopyL * 0.3);
  ctx.lineTo(-canopyW * 0.15, canopyY + canopyL * 0.2);
  ctx.stroke();

  // 5. Wingtip Strobe Beacons
  const strobe = Math.sin(now * 0.01) > 0.3;
  if (strobe) {
    // Port: Red
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(-W * 1.15, L * 0.35, 2.5 * S, 0, TAU); ctx.fill();
    // Starboard: Cyan
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(W * 1.15, L * 0.35, 2.5 * S, 0, TAU); ctx.fill();
  }

  // 6. Invulnerability Hexagonal Energy Field Flicker
  if (p.inv > 0) {
    const invAlpha = 0.4 + 0.35 * Math.sin(now * 0.03);
    ctx.strokeStyle = `rgba(56, 189, 248, ${invAlpha})`;
    ctx.lineWidth = 2 * S;
    ctx.beginPath();
    ctx.arc(0, 0, L * 1.15, 0, TAU);
    ctx.stroke();
  }

  ctx.restore();
}

// Play weapon SFX from THEME data (replaces inline beep calls)
function playWpSFX(wid, key) {
  const wt = THEME.wp[wid]; if (!wt) return;
  const s = key ? wt[key] : wt.sfx; if (!s) return;
  beep(s[0]+rand(-s[0]*0.04,s[0]*0.04), s[1], s[2], s[3], s[4]);
}

// Draw orbiting drone escorts (reads THEME.wp.drone)
function drawDroneOrbs(p) {
  const dt = THEME.wp.drone;
  const n = 1 + Math.floor((p.drone-1)/2);
  for (let i = 0; i < n; i++) {
    const a = G.t*1.8 + i*TAU/n;
    const dx = p.x+Math.cos(a)*64*S, dy = p.y+Math.sin(a)*64*S;
    drawGlow(SPR.cyan, dx, dy, 24*S);
    ctx.save(); ctx.translate(dx,dy); ctx.rotate(a+Math.PI/2);
    ctx.fillStyle = dt.body; ctx.strokeStyle = dt.stroke; ctx.lineWidth = 1.5*S;
    ctx.beginPath(); ctx.moveTo(0,-6*S); ctx.lineTo(5*S,0); ctx.lineTo(0,6*S); ctx.lineTo(-5*S,0); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = dt.core; ctx.beginPath(); ctx.arc(0,0,2.2*S,0,TAU); ctx.fill();
    ctx.restore();
  }
}

// Draw shield ring arcs (reads THEME.wp.shield)
function drawShieldRing(p, now) {
  const st = THEME.wp.shield;
  const rad = p.r + st.r*S;
  ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(now*st.spin);
  ctx.lineWidth = st.w*S;
  ctx.strokeStyle = p.shieldFlash>0 ? st.flash : st.col;
  for (let i = 0; i < st.segs; i++) {
    ctx.beginPath(); ctx.arc(0,0,rad, i*TAU/st.segs+st.gap, (i+1)*TAU/st.segs-st.gap); ctx.stroke();
  }
  if (p.shieldFlash > 0) {
    ctx.globalAlpha = p.shieldFlash/0.45;
    ctx.beginPath(); ctx.arc(0,0,rad+8*S,0,TAU); ctx.stroke();
  }
  ctx.restore();
}

// Draw laser beam layers (reads THEME.wp.laser)
function drawLaserBeam(p, now) {
  const lt = THEME.wp.laser;
  const tr = p.trees.laser || {};
  const beamW = (tr[1]==='wide' ? 24 : lt.coreW) * S;
  const split = tr[2]==='split';
  let target = nearestEnemy(p.x,p.y);
  let baseAng = target ? Math.atan2(target.y-p.y,target.x-p.x) : Math.atan2(p.lastDir.y,p.lastDir.x);
  const angles = split ? [baseAng-0.22,baseAng+0.22] : [baseAng];
  ctx.save();
  for (const ang of angles) {
    const len = W*0.85;
    const ex = p.x+Math.cos(ang)*len, ey = p.y+Math.sin(ang)*len;
    ctx.strokeStyle = lt.outerCol; ctx.lineWidth = beamW*lt.outerWM;
    ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(ex,ey); ctx.stroke();
    ctx.strokeStyle = lt.coreCol; ctx.lineWidth = beamW;
    ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(ex,ey); ctx.stroke();
    ctx.strokeStyle = lt.centerCol; ctx.lineWidth = beamW*lt.centerWM;
    ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(ex,ey); ctx.stroke();
  }
  ctx.restore();
}

// Draw black hole VFX (reads THEME.wp.hole)
function drawHoleVFX(h, now) {
  const ht = THEME.wp.hole;
  const hg = ctx.createRadialGradient(h.x,h.y,h.r*0.08, h.x,h.y,h.r*1.28);
  hg.addColorStop(0,ht.inner); hg.addColorStop(0.5,ht.mid); hg.addColorStop(1,ht.outer);
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(h.x,h.y,h.r*1.28,0,TAU); ctx.fill();
  ctx.save(); ctx.translate(h.x,h.y); ctx.rotate(now*ht.spin);
  ctx.strokeStyle = ht.ring; ctx.lineWidth = ht.ringW*S;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(0,0,h.r*(0.5+k*0.24),k*TAU/3,k*TAU/3+1.6); ctx.stroke(); }
  ctx.restore();
}

// Draw nuke projectile (reads THEME.wp.nuke)
function drawNukeProj(n) {
  const nt = THEME.wp.nuke;
  drawGlow(SPR.gold, n.x, n.y, n.r*6);
  ctx.save(); ctx.translate(n.x,n.y); ctx.rotate(Math.atan2(n.vy,n.vx));
  ctx.fillStyle = nt.body; rr(-n.r,-n.r*0.5,n.r*2,n.r,3*S); ctx.fill();
  ctx.fillStyle = nt.nose; ctx.fillRect(n.r*0.3,-n.r*0.3,n.r*0.6,n.r*0.6);
  ctx.restore();
}

// Draw disk projectile (reads THEME.wp.disk)
function drawDiskProj(d, now) {
  const dt = THEME.wp.disk;
  drawGlow(SPR.green, d.x, d.y, d.r*6);
  ctx.save(); ctx.translate(d.x,d.y); ctx.rotate(now*dt.spin);
  ctx.fillStyle = dt.col; ctx.beginPath();
  for (let k = 0; k < dt.spokes; k++) {
    const a = k/dt.spokes*TAU;
    const x1=Math.cos(a)*d.r, y1=Math.sin(a)*d.r;
    const x2=Math.cos(a+0.3)*d.r*dt.inR, y2=Math.sin(a+0.3)*d.r*dt.inR;
    k===0 ? ctx.moveTo(x1,y1) : ctx.lineTo(x1,y1); ctx.lineTo(x2,y2);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}

// Draw void rift VFX (reads THEME.wp.wormhole)
function drawRiftVFX(rf, now) {
  const rt = THEME.wp.wormhole;
  const a = clamp(rf.life/rf.maxLife,0,1);
  ctx.save(); ctx.globalAlpha = a*0.85; ctx.translate(rf.x,rf.y); ctx.rotate(now*rt.spin);
  ctx.strokeStyle = rt.col; ctx.lineWidth = rt.arcW*S;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(0,0,rf.r*(0.6+k*0.2),k*TAU/3,k*TAU/3+1.8); ctx.stroke(); }
  ctx.restore();
}

// Draw lightning bolts (reads THEME.wp.zap)
function drawZapBolts(now) {
  const zt = THEME.wp.zap;
  for (const z of G.zaps) {
    const a = clamp(z.life/z.max,0,1);
    ctx.save();
    ctx.globalAlpha = a*0.35; ctx.strokeStyle = zt.outer; ctx.lineWidth = zt.outerW*S;
    ctx.beginPath(); z.pts.forEach((pt,i) => i ? ctx.lineTo(pt.x,pt.y) : ctx.moveTo(pt.x,pt.y)); ctx.stroke();
    ctx.globalAlpha = a; ctx.strokeStyle = zt.inner; ctx.lineWidth = zt.innerW*S;
    ctx.beginPath(); z.pts.forEach((pt,i) => i ? ctx.lineTo(pt.x,pt.y) : ctx.moveTo(pt.x,pt.y)); ctx.stroke();
    ctx.restore();
  }
}

function drawBg(now) {
  const envKey = (G && G.env) || meta.env || 'nebula';
  const envCfg = ENVIRONMENTS[envKey] || ENVIRONMENTS.nebula;
  const curBgGrad = ctx.createRadialGradient(W * 0.5, H * 0.2, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.85);
  curBgGrad.addColorStop(0, envCfg.bg[0]);
  curBgGrad.addColorStop(0.55, envCfg.bg[1]);
  curBgGrad.addColorStop(1, envCfg.bg[2]);
  ctx.fillStyle = curBgGrad;
  ctx.fillRect(0, 0, W, H);

  // Parallax Nebula Clouds (Slow distant layer: 8% camera speed)
  for (const neb of nebulae) {
    const nx = (((neb.x * W - cam.x * 0.08) % W) + W) % W;
    const ny = (((neb.y * H - cam.y * 0.08) % H) + H) % H;
    const nr = Math.max(W, H) * neb.r;
    const ngrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
    ngrad.addColorStop(0, `rgba(${neb.col},0.08)`);
    ngrad.addColorStop(0.5, `rgba(${neb.col},0.035)`);
    ngrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ngrad;
    ctx.fillRect(0, 0, W, H);
  }

  // Multi-tier Parallax Stars (Mid layer: 22% camera speed)
  for (const s of stars) {
    const sx = (((s.x - cam.x * 0.22) % W) + W) % W;
    const sy = (((s.y - cam.y * 0.22) % H) + H) % H;
    const tw = 0.55 + 0.45 * Math.sin(now * 0.001 * s.sp + s.ph);
    ctx.globalAlpha = 0.2 + 0.55 * tw;
    ctx.fillStyle = s.tier === 3 ? '#ffecb3' : s.tier === 2 ? '#cdd6ff' : '#9ca3af';
    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Floating flame embers (Near layer: 50% camera speed)
  for (const e of embers) {
    const ey = (((e.y - now * 0.001 * e.sp - cam.y * 0.5) % H) + H) % H;
    const ex = (((e.x + Math.sin(now * 0.0004 + e.ph) * e.dr - cam.x * 0.5) % W) + W) % W;
    ctx.globalAlpha = e.a * (0.6 + 0.4 * Math.sin(now * 0.003 + e.ph));
    ctx.fillStyle = '#ff8a3d';
    ctx.beginPath();
    ctx.arc(ex, ey, e.r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Screen Damage / Powerup Flashes
  if (G) {
    if (G.hitFlash > 0) {
      ctx.fillStyle = `rgba(255,40,60,${G.hitFlash * 0.45})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (G.powerFlash > 0) {
      ctx.fillStyle = `rgba(123,255,178,${G.powerFlash * 0.35})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
}

// ═══════ WORLD GRID & BOUNDARIES ═══════
function drawWorldGrid(cam, now) {
  const gridSize = 120 * S;
  const startX = Math.floor(cam.x / gridSize) * gridSize;
  const startY = Math.floor(cam.y / gridSize) * gridSize;
  const endX = cam.x + W + gridSize;
  const endY = cam.y + H + gridSize;

  const envKey = (G && G.env) || meta.env || 'nebula';
  const envCfg = ENVIRONMENTS[envKey] || ENVIRONMENTS.nebula;

  ctx.save();
  ctx.strokeStyle = envCfg.gridCol || 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1 * S;
  ctx.beginPath();
  for (let x = startX; x <= endX; x += gridSize) {
    if (x >= 0 && x <= worldW) {
      ctx.moveTo(x, Math.max(0, cam.y));
      ctx.lineTo(x, Math.min(worldH, cam.y + H));
    }
  }
  for (let y = startY; y <= endY; y += gridSize) {
    if (y >= 0 && y <= worldH) {
      ctx.moveTo(Math.max(0, cam.x), y);
      ctx.lineTo(Math.min(worldW, cam.x + W), y);
    }
  }
  ctx.stroke();

  // Subtle intersection points for strong sense of directional velocity
  ctx.fillStyle = 'rgba(255, 140, 60, 0.12)';
  for (let x = startX; x <= endX; x += gridSize) {
    if (x < 0 || x > worldW) continue;
    for (let y = startY; y <= endY; y += gridSize) {
      if (y < 0 || y > worldH) continue;
      ctx.fillRect(x - 1.5 * S, y - 1.5 * S, 3 * S, 3 * S);
    }
  }
  ctx.restore();
}

function drawWorldWalls(cam, now) {
  ctx.save();
  const pulse = 0.6 + 0.4 * Math.sin(now * 0.005);
  ctx.strokeStyle = `rgba(255, 60, 90, ${0.45 * pulse})`;
  ctx.lineWidth = 6 * S;
  ctx.strokeRect(3 * S, 3 * S, worldW - 6 * S, worldH - 6 * S);

  ctx.strokeStyle = '#ff4d6d';
  ctx.lineWidth = 2 * S;
  ctx.strokeRect(0, 0, worldW, worldH);
  ctx.restore();
}

function drawAimReticle(p) {
  const ang = (p.hasAim ? p.aimAng : (nearestEnemy(p.x, p.y) ? Math.atan2(nearestEnemy(p.x, p.y).y - p.y, nearestEnemy(p.x, p.y).x - p.x) : Math.atan2(p.lastDir.y, p.lastDir.x)));
  const dist = 70 * S;
  const ax = p.x + Math.cos(ang) * dist;
  const ay = p.y + Math.sin(ang) * dist;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.28)';
  ctx.lineWidth = 1.2 * S;
  ctx.setLineDash([4 * S, 6 * S]);
  ctx.beginPath();
  ctx.moveTo(p.x + Math.cos(ang) * (p.r + 4 * S), p.y + Math.sin(ang) * (p.r + 4 * S));
  ctx.lineTo(ax, ay);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 220, 120, 0.65)';
  ctx.lineWidth = 1.5 * S;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(ax, ay, 4 * S, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawMinimap(cam) {
  if (mode !== MODE.PLAY || !G) return;
  const p = G.player;
  const mapW = 80 * S, mapH = 48 * S;
  const mapX = W - mapW - 14 * S, mapY = 14 * S;

  ctx.save();
  ctx.fillStyle = 'rgba(10, 8, 20, 0.75)';
  rr(mapX, mapY, mapW, mapH, 6 * S);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 120, 60, 0.45)';
  ctx.lineWidth = 1.2 * S;
  rr(mapX, mapY, mapW, mapH, 6 * S);
  ctx.stroke();

  // Viewport camera rect
  const vx = mapX + (cam.x / worldW) * mapW;
  const vy = mapY + (cam.y / worldH) * mapH;
  const vw = Math.max(2, (W / worldW) * mapW);
  const vh = Math.max(2, (H / worldH) * mapH);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(vx, vy, vw, vh);

  // Gems & coins (cyan dots)
  ctx.fillStyle = '#6ee7ff';
  for (let i = 0; i < G.gems.length; i += 3) {
    const gm = G.gems[i];
    ctx.fillRect(mapX + (gm.x / worldW) * mapW, mapY + (gm.y / worldH) * mapH, 1.2, 1.2);
  }

  // Enemies (red dots) & Boss (gold pulsing)
  ctx.fillStyle = '#ff4d6d';
  for (const e of G.enemies) {
    if (e.boss) {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(mapX + (e.x / worldW) * mapW, mapY + (e.y / worldH) * mapH, 3 * S, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ff4d6d';
    } else {
      ctx.fillRect(mapX + (e.x / worldW) * mapW - 0.8, mapY + (e.y / worldH) * mapH - 0.8, 1.8, 1.8);
    }
  }

  // Player dot (bright green)
  const px = mapX + (p.x / worldW) * mapW;
  const py = mapY + (p.y / worldH) * mapH;
  ctx.fillStyle = '#7bffb2';
  ctx.beginPath();
  ctx.arc(px, py, 2.5 * S, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawVirtualJoysticks() {
  if (mode !== MODE.PLAY || !G) return;

  // Move Joystick (Left)
  if (touchMove && touchMove.active) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(touchMove.startX, touchMove.startY, 46 * S, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 140, 60, 0.45)';
    ctx.lineWidth = 2 * S;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 140, 60, 0.8)';
    ctx.beginPath();
    ctx.arc(touchMove.curX, touchMove.curY, 20 * S, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();
    ctx.restore();
  }

  // Aim Joystick (Right)
  if (touchAim && touchAim.active) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(touchAim.startX, touchAim.startY, 46 * S, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(110, 231, 255, 0.5)';
    ctx.lineWidth = 2 * S;
    ctx.stroke();

    ctx.fillStyle = 'rgba(110, 231, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(touchAim.curX, touchAim.curY, 18 * S, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();
    ctx.restore();
  }

  // Dash Button (Bottom Right)
  const p = G.player;
  const dbX = W - 46 * S;
  const dbY = H - 42 * S;
  const dbR = 25 * S;

  ctx.save();
  const ready = p.dashCd <= 0;
  ctx.fillStyle = ready ? 'rgba(255, 120, 40, 0.35)' : 'rgba(30, 25, 45, 0.6)';
  ctx.beginPath();
  ctx.arc(dbX, dbY, dbR, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = ready ? '#ff8a3d' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2.0 * S;
  ctx.stroke();

  if (!ready) {
    const cdFrac = 1 - (p.dashCd / p.dashMax);
    ctx.strokeStyle = '#6ee7ff';
    ctx.lineWidth = 2.8 * S;
    ctx.beginPath();
    ctx.arc(dbX, dbY, dbR, -Math.PI / 2, -Math.PI / 2 + cdFrac * TAU);
    ctx.stroke();
  }

  txt('DASH', dbX, dbY, 10 * S, ready ? '#ffffff' : 'rgba(255,255,255,0.4)', 'center', 700);
  ctx.restore();
}
