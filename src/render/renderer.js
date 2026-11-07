// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — 16-LAYER CANVAS COMPOSITING PIPELINE
// ═══════════════════════════════════════════════════════════════

function drawWorld(now) {
  const p = G.player;

  // Camera translation for 5W x 3H world
  ctx.save();
  ctx.translate(-cam.x, -cam.y);

  // 1. World Ground Hex/Grid (Visible directional velocity)
  drawWorldGrid(cam, now);

  // 2. World Outer Boundary Glow Walls
  drawWorldWalls(cam, now);

  // 3. Shockwave Rings
  for (const rg of G.rings) {
    const a = clamp(rg.life / rg.max, 0, 1);
    ctx.save();
    ctx.globalAlpha = a * 0.8;
    ctx.strokeStyle = rg.col;
    ctx.lineWidth = 2.5 * S;
    ctx.beginPath();
    ctx.arc(rg.x, rg.y, rg.r, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Hazards (Artillery Mortar ground warning)
  for (const hz of G.hazards) {
    const pulse = 0.6 + 0.4 * Math.sin(now * 0.02);
    ctx.save();
    ctx.strokeStyle = hz.col;
    ctx.lineWidth = 2 * S;
    ctx.globalAlpha = pulse * 0.85;
    ctx.beginPath();
    ctx.arc(hz.x, hz.y, hz.r, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = hz.col;
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = pulse;
    txt('⚠', hz.x, hz.y, 14 * S, hz.col, 'center', 700);
    ctx.restore();
  }

  // 5. Enemy Beams (Direct from Boss / Beamer with directed telegraph)
  for (const bm of G.ebeams) {
    ctx.save();
    if (!bm.active) {
      const chargePulse = 0.5 + 0.5 * Math.sin(now * 0.03);
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + chargePulse * 0.45})`;
      ctx.lineWidth = (chargePulse * 2.2 + 1.8) * S;
      ctx.setLineDash([8 * S, 6 * S]);
      ctx.beginPath();
      ctx.moveTo(bm.x, bm.y);
      ctx.lineTo(bm.x + Math.cos(bm.ang) * bm.len, bm.y + Math.sin(bm.ang) * bm.len);
      ctx.stroke();
      ctx.setLineDash([]);
      drawGlow(SPR.red, bm.x, bm.y, 32 * S * chargePulse);
    } else {
      // Massive destructive red death ray (vibrant crimson & hot pink, no white)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = bm.w * 1.7;
      ctx.beginPath();
      ctx.moveTo(bm.x, bm.y);
      ctx.lineTo(bm.x + Math.cos(bm.ang) * bm.len, bm.y + Math.sin(bm.ang) * bm.len);
      ctx.stroke();

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = bm.w;
      ctx.beginPath();
      ctx.moveTo(bm.x, bm.y);
      ctx.lineTo(bm.x + Math.cos(bm.ang) * bm.len, bm.y + Math.sin(bm.ang) * bm.len);
      ctx.stroke();

      ctx.strokeStyle = '#ff1744';
      ctx.lineWidth = bm.w * 0.45;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6. Void Rifts
  for (const rf of G.rifts) {
    drawRiftVFX(rf, now);
  }

  // 7. XP Gems & Coins
  for (const g of G.gems) {
    drawGlow(g.isGold ? SPR.gemGold : SPR.gem, g.x, g.y, g.r * 8);
    const rad = g.r * (1 + 0.12 * Math.sin(now * 0.008 + g.ph));
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(now * 0.002 + g.ph);
    ctx.fillStyle = g.isGold ? '#ffd700' : '#8ee9ff';
    ctx.beginPath();
    ctx.moveTo(0, -rad); ctx.lineTo(rad, 0); ctx.lineTo(0, rad); ctx.lineTo(-rad, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 8. Enemies (Using modular data-driven renderer)
  for (const e of G.enemies) {
    drawEnemyBody(e, now);
  }

  // 9. Black Holes
  for (const h of G.holes) {
    drawHoleVFX(h, now);
  }

  // 10. Powerups
  for (const pw of G.pows) {
    const blink = pw.life < 4 ? 0.35 + 0.65 * Math.abs(Math.sin(now * 0.012)) : 1;
    ctx.save();
    ctx.globalAlpha = blink;
    drawGlow(SPR.white, pw.x, pw.y, pw.r * 8);
    ctx.translate(pw.x, pw.y);
    ctx.rotate(now * 0.0016 + pw.ph);
    ctx.fillStyle = pw.col;
    rr(-pw.r, -pw.r, pw.r * 2, pw.r * 2, 5 * S);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5 * S;
    rr(-pw.r, -pw.r, pw.r * 2, pw.r * 2, 5 * S);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = blink;
    txt(pw.icon, pw.x, pw.y + 0.5 * S, 9.5 * S, '#0b0a14', 'center', 800);
    ctx.restore();
  }

  // Flame Pools
  for (const fp of G.flamePools) {
    const pulse = 0.8 + 0.2 * Math.sin(now * 0.01 + fp.x);
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(fp.x, fp.y, fp.r * pulse, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();
    ctx.restore();
  }

  // Rail Trails
  for (const rt of G.railTrails) {
    const a = clamp(rt.life / 1.5, 0, 1);
    ctx.save();
    ctx.globalAlpha = a * 0.8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 4 * S;
    ctx.beginPath();
    ctx.moveTo(rt.x, rt.y);
    ctx.lineTo(rt.x + Math.cos(rt.ang) * rt.len, rt.y + Math.sin(rt.ang) * rt.len);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();
    ctx.restore();
  }

  // Cryo Mines
  for (const m of G.mines) {
    const armed = m.armT <= 0;
    ctx.save();
    ctx.fillStyle = armed ? '#ffffff' : '#64748b';
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = armed ? '#f8fafc' : '#94a3b8';
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();
    if (armed) {
      ctx.globalAlpha = 0.4 + 0.4 * Math.sin(now * 0.015);
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r * 1.6, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Orbital Strikes
  for (const os of G.orbitalStrikes) {
    ctx.save();
    if (!os.active) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * S;
      ctx.setLineDash([4 * S, 4 * S]);
      ctx.beginPath();
      ctx.arc(os.x, os.y, os.r, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      txt('TARGET LOCK', os.x, os.y - os.r - 8 * S, 8 * S, '#ffffff', 'center', 700);
    } else {
      const beamGrad = ctx.createLinearGradient(os.x - os.r, 0, os.x + os.r, 0);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.98)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(os.x - os.r, cam.y - 200 * S, os.r * 2, H + 400 * S);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * S;
      ctx.beginPath();
      ctx.arc(os.x, os.y, os.r * 1.2, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Gravity Tethers
  for (const tet of G.tethers) {
    const tgt = G.enemies.find(e => e.id === tet.targetId);
    if (tgt) {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.4 * S;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.0 * S;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Graviton Scythes
  for (const sc of G.scythes) {
    const effR = sc.r * (sc.growScale || 1);
    ctx.save();
    ctx.translate(sc.x, sc.y);
    ctx.rotate(sc.rot);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5 * S;
    ctx.beginPath();
    ctx.arc(0, 0, effR, 0, Math.PI * 1.2);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, effR * 0.4, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Flak Shells
  for (const fs of G.flakShells) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(fs.x, fs.y, fs.r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Echo Phantoms
  for (const ec of G.echoes) {
    const a = clamp(ec.life / ec.maxLife, 0, 1) * 0.55;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(ec.x, ec.y);
    ctx.rotate(ec.ang);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 * S;
    ctx.stroke();
    ctx.restore();
  }

  // Swarm Drones
  if (p.swarmDrones && p.swarmDrones.length > 0) {
    for (const dr of p.swarmDrones) {
      ctx.save();
      ctx.translate(dr.x, dr.y);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5 * S, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.2 * S;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Plasma Torch continuous flame cone
  if (p.flameActive > 0) {
    const fAng = getAimAngle(p);
    const reach = (120 + 15 * (p.flame || 1)) * S;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(fAng);
    const flameGrad = ctx.createRadialGradient(0, 0, 10 * S, reach * 0.8, 0, reach);
    flameGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    flameGrad.addColorStop(0.3, 'rgba(240, 248, 255, 0.7)');
    flameGrad.addColorStop(0.7, 'rgba(220, 235, 255, 0.3)');
    flameGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, reach, -0.44, 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 11. Nukes / Rockets
  for (const n of G.nukes) {
    drawNukeProj(n);
  }

  // 12. Bouncing Disks
  for (const d of G.disks) {
    drawDiskProj(d, now);
  }

  // 13. Laser Beam
  if (p.laserActive > 0) {
    drawLaserBeam(p, now);
  }

  // 14. Player Bullets
  for (const b of G.bullets) {
    drawGlow(SPR.bullet, b.x, b.y, b.r * 8);
    ctx.strokeStyle = b.col || '#ffffff';
    ctx.lineWidth = b.r * 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(b.x - b.vx * 0.016, b.y - b.vy * 0.016);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // 15. Enemy Bullets
  for (const b of G.ebullets) {
    drawGlow(SPR.shot, b.x, b.y, b.r * 9);
    ctx.fillStyle = b.col || '#ef4444';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 0.45, 0, TAU);
    ctx.fill();
  }

  // 16. Player Ship (Using modular data-driven renderer)
  drawPlayerShip(p, now);

  // 17. Directional Aim Reticle / Tracer line
  drawAimReticle(p);

  // 18. Orbit Drones
  if (p.drone > 0) {
    drawDroneOrbs(p);
  }

  // 19. Shield Ring
  if (p.shield > 0) {
    drawShieldRing(p, now);
  }

  // 20. Invulnerability Aura
  if (p.inv > 0 || p.aegisT > 0) {
    ctx.globalAlpha = p.aegisT > 0 ? 0.85 : 0.35 + 0.35 * Math.sin(now * 0.04);
    ctx.strokeStyle = p.aegisT > 0 ? '#ffd166' : '#8ecbff';
    ctx.lineWidth = p.aegisT > 0 ? 2.8 * S : 2 * S;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 6 * S, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // 21. Chain Lightning
  drawZapBolts(now);

  // 22. Particles
  for (const pt of G.parts) {
    const a = clamp(pt.life / pt.max, 0, 1);
    ctx.globalAlpha = a;
    if (pt.text) {
      txt(pt.text, pt.x, pt.y, pt.size, pt.col, 'center', 800);
    } else {
      ctx.fillStyle = pt.col;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(0.4, pt.size * a), 0, TAU);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // 23. Combo Floating Banner
  if (G.combo >= 3 && G.comboT > 0) {
    const cFrac = clamp(G.comboT / 1.6, 0, 1);
    const cCol = G.combo >= 15 ? '#ff4d6d' : G.combo >= 10 ? '#ff9f1c' : G.combo >= 5 ? '#ffd166' : '#ffffff';
    const cText = G.combo >= 20 ? `×${G.combo} GODLIKE!` : G.combo >= 12 ? `×${G.combo} RAMPAGE!` : G.combo >= 7 ? `×${G.combo} CHAIN!` : `×${G.combo} COMBO`;
    ctx.save();
    ctx.globalAlpha = cFrac;
    txt(cText, p.x, p.y + p.r + 20 * S, 11 * S, cCol, 'center', 800);
    ctx.restore();
  }

  ctx.restore();

  // Screen space overlays
  drawMinimap(cam);
  drawVirtualJoysticks();
}

function drawPath(now) {
  if (!G.path.length) return;
  const p = G.player;
  const last = G.path[G.path.length - 1];
  ctx.save();
  ctx.strokeStyle = 'rgba(140,200,255,0.35)';
  ctx.lineWidth = 2 * S;
  ctx.setLineDash([5 * S, 9 * S]);
  ctx.lineDashOffset = -now * 0.03;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  for (const wp of G.path) ctx.lineTo(wp.x, wp.y);
  ctx.stroke();
  ctx.setLineDash([]);
  for (let i = 0; i < G.path.length - 1; i++) {
    ctx.fillStyle = 'rgba(140,200,255,0.5)';
    ctx.beginPath();
    ctx.arc(G.path[i].x, G.path[i].y, 3.2 * S, 0, TAU);
    ctx.fill();
  }
  const pulse = 0.55 + 0.45 * Math.sin(now * 0.012);
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = '#8ecbff';
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.arc(last.x, last.y, 11 * S, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = '#cfe8ff';
  ctx.beginPath();
  ctx.arc(last.x, last.y, 3.2 * S, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawBuffChip(x, y, icon, text, col, frac, alpha) {
  ctx.font = '700 ' + 9 * S + 'px ' + FONT;
  const tw = ctx.measureText(text).width;
  const h = 20 * S, w = 26 * S + tw + 10 * S;
  const cx = x + 11 * S, cy = y + h / 2 - 1 * S;

  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(10,8,20,0.68)';
  rr(x, y, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 1 * S;
  ctx.globalAlpha = alpha * 0.55;
  ctx.stroke();

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.6 * S;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (icon === 'rapid') {
    for (let k = 0; k < 2; k++) {
      const ox = cx - 3 * S + k * 4 * S;
      ctx.beginPath();
      ctx.moveTo(ox, cy - 4 * S);
      ctx.lineTo(ox + 3.5 * S, cy);
      ctx.lineTo(ox, cy + 4 * S);
      ctx.stroke();
    }
  } else if (icon === 'magnet') {
    ctx.beginPath();
    ctx.arc(cx, cy, 3.6 * S, Math.PI, 0, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 3.6 * S, cy); ctx.lineTo(cx - 3.6 * S, cy - 4 * S);
    ctx.moveTo(cx + 3.6 * S, cy); ctx.lineTo(cx + 3.6 * S, cy - 4 * S);
    ctx.stroke();
  } else if (icon === 'slow') {
    ctx.beginPath();
    ctx.arc(cx, cy, 4 * S, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 2.6 * S);
    ctx.moveTo(cx, cy); ctx.lineTo(cx + 2 * S, cy);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 4.5 * S);
    ctx.lineTo(cx + 4 * S, cy - 2 * S);
    ctx.lineTo(cx + 3 * S, cy + 2.5 * S);
    ctx.lineTo(cx, cy + 4.5 * S);
    ctx.lineTo(cx - 3 * S, cy + 2.5 * S);
    ctx.lineTo(cx - 4 * S, cy - 2 * S);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.globalAlpha = alpha;
  txt(text, x + 22 * S, y + h / 2, 9 * S, col, 'left', 700);
  ctx.fillStyle = col;
  ctx.globalAlpha = alpha * 0.7;
  rr(x + 6 * S, y + h - 2.6 * S, Math.max(2 * S, (w - 12 * S) * clamp(frac, 0, 1)), 1.4 * S, 0.7 * S);
  ctx.fill();
  ctx.globalAlpha = 1;
  return w;
}
