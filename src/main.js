// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — MAIN GAME LOOP & LIFECYCLE BOOTSTRAP
// ═══════════════════════════════════════════════════════════════

function update(dt, now) {
  if (mode === MODE.PLAY) {
    G.t += dt;
    updatePlayer(dt);

    if (G.t >= G.nextBoss) {
      G.nextBoss += Math.max(50, 85 - G.bossKills * 5);
      spawnEnemy('boss');
    }

    updateSpawn(dt);
    updateWeapons(dt);
    updateNukes(dt);
    updateDisks(dt);
    updateRifts(dt);
    updateMines(dt);
    updateScythes(dt);
    updateTethers(dt);
    updateParasites(dt);
    updateEchoes(dt);
    updateFlakShells(dt);
    updateOrbitalStrikes(dt);
    updateFlamePools(dt);
    updateRailTrails(dt);
    updateHazards(dt);
    updateEBeams(dt);
    updateRings(dt);
    updateEnemies(dt);
    updateHoles(dt);
    updateEnemyBullets(dt);
    updateBullets(dt);
    updateGems(dt);
    updatePows(dt);

    for (const m of MILESTONES) {
      if (!G.milestones.has(m.id) && m.check(G)) {
        G.milestones.add(m.id);
        G.toast = { text: m.label, t: 2.0, col: m.col };
        fanfare();
        haptic([40, 30, 80]);
      }
    }

    if (G.toast) { G.toast.t -= dt; if (G.toast.t <= 0) G.toast = null; }
    fire(dt);
    checkLevel();
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 30 * S);
    updateParts(dt);
  }
}

let last = performance.now();
function frame(now) {
  if (window.innerWidth !== W || window.innerHeight !== H) resize();
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (mode === MODE.PLAY) update(dt, now);
  render(now);
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(frame);
