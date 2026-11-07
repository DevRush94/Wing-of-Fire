// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — PROCEDURAL WEB AUDIO & HAPTIC SYNTHESIS
// ═══════════════════════════════════════════════════════════════

let AC = null;
function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; }
}
function beep(freq, dur, type, vol, slide) {
  if (!AC) return;
  try {
    const t0 = AC.currentTime, d = dur || 0.06;
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + d);
    g.gain.setValueAtTime(vol || 0.02, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(AC.destination);
    o.start(t0); o.stop(t0 + d + 0.01);
  } catch (e) {}
}
function chord(freqs, dur, type, vol) {
  freqs.forEach(f => beep(f, dur, type, vol / freqs.length));
}
function fanfare() {
  [520, 660, 780, 1040].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'triangle', 0.035, 160), i * 75));
}
function boomBass() {
  beep(55, 0.8, 'sawtooth', 0.07, -30);
  setTimeout(() => beep(1200, 0.4, 'sine', 0.04, -400), 280);
}
function haptic(dur) {
  try { if (navigator.vibrate) navigator.vibrate(dur); } catch (e) {}
}
