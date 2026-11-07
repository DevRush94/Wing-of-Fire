// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — DUAL-TOUCH & KEYBOARD/MOUSE INPUT CONTROLLER
// ═══════════════════════════════════════════════════════════════

function onDown(ev) {
  ev.preventDefault();
  initAudio();
  const px = ev.clientX, py = ev.clientY;

  if (mode === MODE.SHOP) {
    for (const r of shopRects.rows) if (inRect(px, py, r)) { buyPermanent(r.id); return; }
    if (inRect(px, py, shopRects.back)) { mode = MODE.MENU; modeAt = performance.now(); return; }
    return;
  }
  if (mode === MODE.MENU) {
    if (inRect(px, py, menuRects.account)) {
      showAuthModal();
      return;
    }
    for (const dr of menuRects.diffs) {
      if (inRect(px, py, dr)) {
        meta.diff = dr.id;
        saveMeta();
        beep(750, 0.05, 'triangle', 0.03, 100);
        return;
      }
    }
    if (menuRects.biomes) {
      for (const br of menuRects.biomes) {
        if (inRect(px, py, br)) {
          meta.env = br.id;
          saveMeta();
          beep(820, 0.05, 'triangle', 0.03, 120);
          return;
        }
      }
    }
    if (inRect(px, py, menuRects.loadout)) { enterLoadout(); return; }
    if (inRect(px, py, menuRects.shop)) { enterShop(); return; }
    startGame();
    return;
  }
  if (mode === MODE.LOADOUT) {
    if (inRect(px, py, loadoutRects.back)) { mode = MODE.MENU; modeAt = performance.now(); return; }
    if (inRect(px, py, loadoutRects.start)) { startGame(); return; }
    loadoutTouchStartY = py;
    loadoutTouchStartScroll = loadoutScrollY;
    loadoutIsDragging = false;
    const scrollPy = py + loadoutScrollY;
    for (const r of loadoutRects.rows) {
      if (inRect(px, scrollPy, r.upgRect)) {
        upgradeWeaponMastery(r.id);
        return;
      }
      if (inRect(px, scrollPy, r)) {
        toggleLoadout(r.id);
        return;
      }
    }
    return;
  }
  if (mode === MODE.VICTORY) {
    if (inRect(px, py, victoryRects.restart)) { startGame(); return; }
    if (inRect(px, py, victoryRects.shop)) { enterShop(); return; }
    if (inRect(px, py, victoryRects.menu)) { mode = MODE.MENU; modeAt = performance.now(); return; }
    return;
  }
  if (mode === MODE.DEAD) {
    if (inRect(px, py, deadRects.restart)) { startGame(); return; }
    if (inRect(px, py, deadRects.shop)) { enterShop(); return; }
    if (inRect(px, py, deadRects.menu)) { mode = MODE.MENU; modeAt = performance.now(); return; }
    if (performance.now() - modeAt > 500) startGame();
    return;
  }
  if (mode === MODE.PAUSE) {
    if (inRect(px, py, pauseRects.resume)) { mode = MODE.PLAY; modeAt = performance.now(); return; }
    if (inRect(px, py, pauseRects.quit)) { mode = MODE.MENU; modeAt = performance.now(); return; }
    mode = MODE.PLAY;
    modeAt = performance.now();
    return;
  }
  if (mode === MODE.LEVEL) {
    if (performance.now() - modeAt < 160) return;
    if (G.bonusPick && inRect(px, py, G.skipRect)) { skipBonusPick(); return; }
    for (const r of G.cardRects) {
      if (inRect(px, py, r)) { pickCard(r.i); return; }
    }
    return;
  }
  if (mode === MODE.PLAY) {
    const now = performance.now();
    // Pause button tap (top-right)
    if (px >= W - 56 * S && py <= 16 + 56 * S) {
      mode = MODE.PAUSE;
      modeAt = now;
      if (G) G.path.length = 0;
      return;
    }

    // Dash button tap (bottom-right)
    if (Math.hypot(px - (W - 46 * S), py - (H - 42 * S)) <= 34 * S) {
      doDash();
      return;
    }

    // Double-tap anywhere to dash
    if (now - lastTapTime < 280) {
      doDash();
      lastTapTime = 0;
      return;
    }
    lastTapTime = now;

    // Twin-stick touch controls or desktop mouse
    const p = G.player;
    if (ev.pointerType === 'mouse') {
      p.aimAng = Math.atan2(py + cam.y - p.y, px + cam.x - p.x);
      p.hasAim = true;
    } else {
      if (px < W * 0.48) {
        touchMove = {
          id: ev.pointerId,
          startX: px,
          startY: py,
          curX: px,
          curY: py,
          active: true
        };
      } else {
        touchAim = {
          id: ev.pointerId,
          startX: px,
          startY: py,
          curX: px,
          curY: py,
          active: true
        };
        p.aimAng = Math.atan2(py + cam.y - p.y, px + cam.x - p.x);
        p.hasAim = true;
      }
    }
    try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
  }
}

function onMove(ev) {
  if (mode === MODE.LOADOUT && ev.buttons > 0) {
    const dy = ev.clientY - loadoutTouchStartY;
    if (Math.abs(dy) > 3) {
      loadoutIsDragging = true;
      loadoutScrollY = clamp(loadoutTouchStartScroll - dy, 0, loadoutMaxScroll);
    }
    return;
  }
  if (mode !== MODE.PLAY || !G) return;
  const px = ev.clientX, py = ev.clientY;
  const p = G.player;

  if (ev.pointerType === 'mouse') {
    p.aimAng = Math.atan2(py + cam.y - p.y, px + cam.x - p.x);
    p.hasAim = true;
  } else {
    if (touchMove && touchMove.active && touchMove.id === ev.pointerId) {
      touchMove.curX = px;
      touchMove.curY = py;
    }
    if (touchAim && touchAim.active && touchAim.id === ev.pointerId) {
      touchAim.curX = px;
      touchAim.curY = py;
      const adx = px - touchAim.startX;
      const ady = py - touchAim.startY;
      if (Math.hypot(adx, ady) > 6) {
        p.aimAng = Math.atan2(ady, adx);
        p.hasAim = true;
      }
    }
  }
}

function onUp(ev) {
  if (!G) return;
  if (touchMove && touchMove.id === ev.pointerId) {
    touchMove.active = false;
  }
  if (touchAim && touchAim.id === ev.pointerId) {
    touchAim.active = false;
  }
}

cv.addEventListener('pointerdown', onDown, { passive: false });
cv.addEventListener('pointermove', onMove, { passive: false });
cv.addEventListener('pointerup', onUp);
cv.addEventListener('pointercancel', onUp);

window.addEventListener('wheel', e => {
  if (mode === MODE.LOADOUT) {
    loadoutScrollY = clamp(loadoutScrollY + e.deltaY * 0.5, 0, loadoutMaxScroll);
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  initAudio();

  // DASH (Space or Shift)
  if ((e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') && mode === MODE.PLAY) {
    doDash();
    e.preventDefault();
    return;
  }

  // PAUSE / RESUME (Escape or P)
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (mode === MODE.PLAY) { mode = MODE.PAUSE; modeAt = performance.now(); if (G) G.path.length = 0; }
    else if (mode === MODE.PAUSE) { mode = MODE.PLAY; modeAt = performance.now(); }
    else if (mode === MODE.SHOP || mode === MODE.LOADOUT || mode === MODE.VICTORY) { mode = MODE.MENU; modeAt = performance.now(); }
    e.preventDefault();
    return;
  }

  // LEVEL-UP / BONUS CARD SELECTION (1, 2, 3 or J, K, L)
  if (mode === MODE.LEVEL) {
    if (e.code === 'Digit1' || e.code === 'Numpad1' || e.code === 'KeyJ') { pickCard(0); e.preventDefault(); return; }
    if (e.code === 'Digit2' || e.code === 'Numpad2' || e.code === 'KeyK') { pickCard(1); e.preventDefault(); return; }
    if (e.code === 'Digit3' || e.code === 'Numpad3' || e.code === 'KeyL') { pickCard(2); e.preventDefault(); return; }
    if (G && G.bonusPick && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyX')) { skipBonusPick(); e.preventDefault(); return; }
    return;
  }

  // MENU KEYBOARD
  if (mode === MODE.MENU) {
    if (e.code === 'Space' || e.code === 'Enter') { startGame(); e.preventDefault(); return; }
    if (e.code === 'KeyL' || e.code === 'Tab') { enterLoadout(); e.preventDefault(); return; }
    if (e.code === 'KeyS' || e.code === 'KeyU') { enterShop(); e.preventDefault(); return; }
    if (e.code === 'Digit1') { meta.diff = 'easy'; saveMeta(); beep(700, 0.05, 'triangle', 0.03); return; }
    if (e.code === 'Digit2') { meta.diff = 'normal'; saveMeta(); beep(750, 0.05, 'triangle', 0.03); return; }
    if (e.code === 'Digit3') { meta.diff = 'hard'; saveMeta(); beep(800, 0.05, 'triangle', 0.03); return; }
  }

  // LOADOUT KEYBOARD
  if (mode === MODE.LOADOUT) {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { loadoutScrollY = clamp(loadoutScrollY + 60 * S, 0, loadoutMaxScroll); e.preventDefault(); return; }
    if (e.code === 'ArrowUp' || e.code === 'KeyW') { loadoutScrollY = clamp(loadoutScrollY - 60 * S, 0, loadoutMaxScroll); e.preventDefault(); return; }
    if (e.code === 'Space' || e.code === 'Enter') { startGame(); e.preventDefault(); return; }
    if (e.code === 'Escape' || e.code === 'Backspace') { mode = MODE.MENU; modeAt = performance.now(); e.preventDefault(); return; }
  }

  // VICTORY KEYBOARD
  if (mode === MODE.VICTORY) {
    if (e.code === 'Space' || e.code === 'Enter') { startGame(); e.preventDefault(); return; }
    if (e.code === 'Escape' || e.code === 'Backspace') { mode = MODE.MENU; modeAt = performance.now(); e.preventDefault(); return; }
  }

  // SHOP KEYBOARD
  if (mode === MODE.SHOP) {
    if (e.code === 'Escape' || e.code === 'Backspace') { mode = MODE.MENU; modeAt = performance.now(); e.preventDefault(); return; }
  }

  // DEAD SCREEN KEYBOARD
  if (mode === MODE.DEAD) {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyR') { startGame(); e.preventDefault(); return; }
    if (e.code === 'KeyS' || e.code === 'KeyU') { enterShop(); e.preventDefault(); return; }
    if (e.code === 'Escape' || e.code === 'Backspace') { mode = MODE.MENU; modeAt = performance.now(); e.preventDefault(); return; }
  }
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

document.addEventListener('visibilitychange', () => {
  if (document.hidden && mode === MODE.PLAY) {
    mode = MODE.PAUSE;
    modeAt = performance.now();
    if (G) G.path.length = 0;
  }
});
