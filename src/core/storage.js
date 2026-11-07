// ═══════════════════════════════════════════════════════════════
// WINGS OF FIRE — CLOUD PERSISTENCE, INDEXEDDB & AUTH SUITE
// ═══════════════════════════════════════════════════════════════

// CLOUD SYNC CONFIGURATION (Xperia Phone Cloudflare Tunnel API)
// ═══════════════════════════════════════════════════════════════════
const CLOUD_API_BASE = (typeof window !== 'undefined' && (window.location.hostname === '192.168.1.200' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('trycloudflare.com')))
  ? window.location.origin
  : 'https://customs-wins-wallace-ultimately.trycloudflare.com';

async function syncUserToCloud(userObj) {
  if (!userObj || !userObj.username) return false;
  try {
    const payload = {
      username: userObj.username,
      passwordHash: userObj.passwordHash || '',
      coins: Math.max(0, Math.floor(userObj.coins || 0)),
      up: userObj.up || {},
      loadout: userObj.loadout || ['mg', 'drone', 'hole'],
      weapons: userObj.weapons || defaultMastery(),
      diff: userObj.diff || 'easy',
      best: userObj.best || {}
    };
    const res = await fetch(CLOUD_API_BASE + '/api/user/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return data && data.ok;
    }
  } catch (e) {}
  return false;
}

async function fetchUserFromCloud(username) {
  if (!username) return null;
  try {
    const res = await fetch(CLOUD_API_BASE + '/api/user?username=' + encodeURIComponent(username));
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok && data.user) return data.user;
    }
  } catch (e) {}
  return null;
}

async function authUserWithCloud(username, passwordHash, password) {
  try {
    const res = await fetch(CLOUD_API_BASE + '/api/user/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, passwordHash, password })
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: 'Network error connecting to Xperia phone cloud' };
  }
}

function getUserFromDB(username) {
  return new Promise(async resolve => {
    const uKey = (username || '').toLowerCase().trim();
    if (!uKey) { resolve(null); return; }

    // 1. Check synchronous LocalStorage first
    let localUser = null;
    try {
      const raw = localStorage.getItem('wof.user.' + uKey);
      if (raw) localUser = JSON.parse(raw);
      if (!localUser) {
        const all = JSON.parse(localStorage.getItem('wof.users') || '{}');
        if (all[uKey]) localUser = all[uKey];
      }
    } catch (e) {}

    // 2. If authDB is open, query IndexedDB and merge
    let dbUser = null;
    if (authDB) {
      try {
        dbUser = await new Promise(r => {
          const tx = authDB.transaction('users', 'readonly');
          const store = tx.objectStore('users');
          const req = store.get(uKey);
          req.onsuccess = () => r(req.result || null);
          req.onerror = () => r(null);
        });
      } catch (e) {}
    }

    let merged = localUser || dbUser || null;
    if (localUser && dbUser) {
      merged = { ...localUser, ...dbUser };
      merged.coins = Math.max(localUser.coins || 0, dbUser.coins || 0);
      merged.up = Object.keys(localUser.up || {}).length >= Object.keys(dbUser.up || {}).length ? localUser.up : dbUser.up;
      merged.weapons = localUser.weapons || dbUser.weapons;
      merged.loadout = localUser.loadout || dbUser.loadout;
    }

    // 3. Query Xperia Phone Cloud API in background/async
    try {
      const cloudUser = await fetchUserFromCloud(uKey);
      if (cloudUser) {
        if (!merged) {
          merged = cloudUser;
        } else {
          merged.passwordHash = cloudUser.passwordHash || merged.passwordHash;
          merged.coins = Math.max(merged.coins || 0, cloudUser.coins || 0);
          merged.up = { ...(cloudUser.up || {}), ...(merged.up || {}) };
          merged.weapons = merged.weapons || cloudUser.weapons;
          merged.loadout = merged.loadout || cloudUser.loadout;
          if (cloudUser.best && (!merged.best || (cloudUser.best.time || 0) > (merged.best.time || 0))) {
            merged.best = cloudUser.best;
          }
        }
        try {
          localStorage.setItem('wof.user.' + uKey, JSON.stringify(merged));
        } catch (e) {}
      }
    } catch (e) {}

    resolve(merged);
  });
}

function saveUserToDB(userObj) {
  return new Promise(resolve => {
    if (!userObj || !userObj.username) { resolve(false); return; }
    userObj.username = userObj.username.toLowerCase().trim();
    const uKey = userObj.username;

    // 1. Immediately & synchronously persist to LocalStorage
    try {
      const copy = JSON.parse(JSON.stringify(userObj));
      localStorage.setItem('wof.user.' + uKey, JSON.stringify(copy));
      const all = JSON.parse(localStorage.getItem('wof.users') || '{}');
      all[uKey] = copy;
      localStorage.setItem('wof.users', JSON.stringify(all));
    } catch (e) {}

    // 2. Also persist to IndexedDB if available
    if (authDB) {
      try {
        const tx = authDB.transaction('users', 'readwrite');
        const store = tx.objectStore('users');
        store.put(JSON.parse(JSON.stringify(userObj)));
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(true);
      } catch (e) {}
    }

    // 3. Asynchronously push to Xperia Phone Cloud API!
    syncUserToCloud(userObj);

    resolve(true);
  });
}

async function seedDefaultUsers() {
  try {
    const rushHash = await sha256('2694');
    let rushUser = await getUserFromDB('rush');
    if (!rushUser) {
      rushUser = {
        username: 'rush',
        passwordHash: rushHash,
        coins: 50000000,
        up: {},
        loadout: ['mg', 'drone', 'hole'],
        weapons: defaultMastery(),
        diff: 'easy',
        best: null,
        createdAt: Date.now()
      };
      await saveUserToDB(rushUser);
    } else {
      let changed = false;
      if (rushUser.coins === undefined || rushUser.coins === null) {
        rushUser.coins = 50000000;
        changed = true;
      }
      if (rushUser.passwordHash !== rushHash) {
        rushUser.passwordHash = rushHash;
        changed = true;
      }
      if (!rushUser.loadout || !rushUser.loadout.length) {
        rushUser.loadout = ['mg', 'drone', 'hole'];
        changed = true;
      }
      if (!rushUser.weapons) {
        rushUser.weapons = defaultMastery();
        changed = true;
      }
      if (changed) await saveUserToDB(rushUser);
    }
  } catch (e) {}
}

function showAuthModal() {
  const m = document.getElementById('authModal');
  if (m) {
    m.style.display = 'flex';
    const uInput = document.getElementById('authUsername');
    const pInput = document.getElementById('authPassword');
    const lBtn = document.getElementById('btnLogout');
    if (currentUser) {
      if (uInput) uInput.value = currentUser.username;
      if (pInput) pInput.value = '';
      if (lBtn) lBtn.style.display = 'inline-block';
      setAuthMsg('Logged in as ' + currentUser.username + ' (' + meta.coins + ' 🪙)');
    } else {
      if (uInput) uInput.value = '';
      if (pInput) pInput.value = '';
      if (lBtn) lBtn.style.display = 'none';
      setAuthMsg('');
    }
  }
}

function hideAuthModal() {
  const m = document.getElementById('authModal');
  if (m) m.style.display = 'none';
}

function setAuthMsg(msg, isError) {
  const el = document.getElementById('authMsg');
  if (el) {
    el.textContent = msg || '';
    el.style.color = isError ? '#ff4d6d' : '#7bffb2';
  }
}

async function loginUser(username, password) {
  const name = (username || '').trim();
  const pwd = (password || '').trim();
  if (!name || !pwd) { setAuthMsg('Please enter username & password', true); return false; }
  setAuthMsg('Verifying account with Phone Cloud DB...');
  const hash = await sha256(pwd);

  let user = null;
  const cloudRes = await authUserWithCloud(name, hash, pwd);
  if (cloudRes && cloudRes.ok && cloudRes.user) {
    user = cloudRes.user;
  } else {
    // Local / offline fallback
    user = await getUserFromDB(name);
    if (!user) {
      setAuthMsg(cloudRes && cloudRes.error ? cloudRes.error : 'User not found! Click REGISTER to create account', true);
      return false;
    }
    if (user.passwordHash && user.passwordHash !== hash) {
      setAuthMsg('Incorrect password!', true);
      return false;
    }
  }

  currentUser = user;
  localStorage.setItem('wof.active_user', user.username);
  meta = {
    coins: Math.max(0, Math.floor(user.coins || 0)),
    up: sanitizeUpgrades(user.up),
    loadout: sanitizeLoadout(user.loadout),
    weapons: sanitizeWeapons(user.weapons),
    diff: (user.diff && DIFF[user.diff]) ? user.diff : 'easy'
  };
  best = sanitizeBest(user.best);
  saveMeta();
  setAuthMsg('Welcome back, ' + user.username + '! (Synced with Phone DB)');
  setTimeout(() => hideAuthModal(), 500);
  return true;
}

async function registerUser(username, password) {
  const name = (username || '').trim();
  const pwd = (password || '').trim();
  if (!name || !pwd) { setAuthMsg('Please enter username & password', true); return false; }
  if (name.length < 2) { setAuthMsg('Username must be at least 2 characters', true); return false; }
  setAuthMsg('Registering with Phone Cloud DB...');
  const hash = await sha256(pwd);

  const cloudRes = await authUserWithCloud(name, hash, pwd);
  let user = null;
  if (cloudRes && cloudRes.ok && cloudRes.user) {
    user = cloudRes.user;
  } else if (cloudRes && cloudRes.action === 'authenticated') {
    setAuthMsg('Username already exists! Click LOGIN', true);
    return false;
  } else {
    // Local offline registration
    user = {
      username: name,
      passwordHash: hash,
      coins: 0,
      up: {},
      loadout: ['mg', 'drone', 'hole'],
      weapons: defaultMastery(),
      diff: 'easy',
      best: null,
      createdAt: Date.now()
    };
    await saveUserToDB(user);
  }

  currentUser = user;
  localStorage.setItem('wof.active_user', name);
  meta = {
    coins: Math.max(0, Math.floor(user.coins || 0)),
    up: sanitizeUpgrades(user.up),
    loadout: sanitizeLoadout(user.loadout),
    weapons: sanitizeWeapons(user.weapons),
    diff: (user.diff && DIFF[user.diff]) ? user.diff : 'easy'
  };
  saveMeta();
  setAuthMsg('Account created & synced! Welcome, ' + name + '!');
  setTimeout(() => hideAuthModal(), 500);
  return true;
}

function guestUser() {
  currentUser = null;
  localStorage.removeItem('wof.active_user');
  meta = loadMeta();
  hideAuthModal();
}

function loadMeta() {
  const activeName = (localStorage.getItem('wof.active_user') || '').toLowerCase().trim();
  if (activeName) {
    let raw = localStorage.getItem('wof.user.' + activeName);
    if (!raw) {
      try {
        const all = JSON.parse(localStorage.getItem('wof.users') || '{}');
        if (all[activeName]) raw = JSON.stringify(all[activeName]);
      } catch (e) {}
    }
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u && u.username) {
          currentUser = u;
          return {
            coins: Math.max(0, Math.floor(u.coins || 0)),
            up: sanitizeUpgrades(u.up),
            loadout: sanitizeLoadout(u.loadout),
            weapons: sanitizeWeapons(u.weapons),
            diff: (u.diff && DIFF[u.diff]) ? u.diff : 'easy'
          };
        }
      } catch (e) {}
    }
  }

  try {
    const m = JSON.parse(localStorage.getItem('wof.meta.v1'));
    if (m && (typeof m.coins === 'number' || typeof m.embers === 'number')) {
      const up = sanitizeUpgrades(m.up);
      const lo = sanitizeLoadout(m.loadout);
      const weapons = sanitizeWeapons(m.weapons);
      const diff = (m.diff && DIFF[m.diff]) ? m.diff : 'easy';
      const coinVal = m.coins !== undefined ? m.coins : m.embers;
      return { coins: Math.max(0, Math.floor(coinVal || 0)), up, loadout: lo, weapons, diff };
    }
  } catch (e) {}
  const seed = best ? Math.floor(best.time * 2.5 + best.kills * 0.7 + (best.level || 1) * 4) : 0;
  return { coins: seed, up: {}, loadout: ['mg', 'drone', 'hole'], weapons: defaultMastery(), diff: 'easy' };
}

function saveMeta() {
  try {
    meta.up = sanitizeUpgrades(meta.up);
    meta.loadout = sanitizeLoadout(meta.loadout);
    meta.weapons = sanitizeWeapons(meta.weapons);
    localStorage.setItem('wof.meta.v1', JSON.stringify(meta));
    if (currentUser) {
      currentUser.coins = meta.coins;
      currentUser.up = { ...meta.up };
      currentUser.loadout = [ ...meta.loadout ];
      currentUser.weapons = JSON.parse(JSON.stringify(meta.weapons));
      currentUser.diff = meta.diff;
      if (best) currentUser.best = best;
      saveUserToDB(currentUser);
    }
  } catch (e) {}
}

function permCost(u, lvl) { return Math.round(u.base * Math.pow(1.5, lvl) / 5) * 5; }

let best = loadBest();
let meta = loadMeta();
if (DEV_MODE) {
  meta.coins = Math.max(meta.coins, 10000000);
  saveMeta();
}

// Bind auth modal form & buttons
const authFormEl = document.getElementById('authForm');
if (authFormEl) {
  authFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    loginUser(document.getElementById('authUsername').value, document.getElementById('authPassword').value);
  });
}
const btnLoginEl = document.getElementById('btnLogin');
if (btnLoginEl) {
  btnLoginEl.addEventListener('click', (e) => {
    e.preventDefault();
    loginUser(document.getElementById('authUsername').value, document.getElementById('authPassword').value);
  });
}
const btnRegEl = document.getElementById('btnRegister');
if (btnRegEl) {
  btnRegEl.addEventListener('click', () => {
    registerUser(document.getElementById('authUsername').value, document.getElementById('authPassword').value);
  });
}
const btnGuestEl = document.getElementById('btnGuest');
if (btnGuestEl) {
  btnGuestEl.addEventListener('click', () => guestUser());
}
const btnLogoutEl = document.getElementById('btnLogout');
if (btnLogoutEl) {
  btnLogoutEl.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('wof.active_user');
    meta = { coins: 0, up: {}, loadout: ['mg', 'drone', 'hole'], weapons: defaultMastery(), diff: 'easy' };
    localStorage.setItem('wof.meta.v1', JSON.stringify(meta));
    setAuthMsg('Logged out. Playing as Guest.');
    if (btnLogoutEl) btnLogoutEl.style.display = 'none';
    const uInput = document.getElementById('authUsername');
    const pInput = document.getElementById('authPassword');
    if (uInput) uInput.value = '';
    if (pInput) pInput.value = '';
    setTimeout(() => hideAuthModal(), 500);
  });
}

// Auto-check logged in user on start
initAuthDB().then(async () => {
  await seedDefaultUsers();
  const activeName = (localStorage.getItem('wof.active_user') || '').toLowerCase().trim();
  if (activeName) {
    const u = await getUserFromDB(activeName);
    if (u) {
      currentUser = u;
      meta.coins = Math.max(0, Math.floor(u.coins || 0));
      meta.up = sanitizeUpgrades(u.up);
      meta.loadout = sanitizeLoadout(u.loadout);
      meta.weapons = sanitizeWeapons(u.weapons);
      meta.diff = (u.diff && DIFF[u.diff]) ? u.diff : 'easy';
      best = sanitizeBest(u.best);
      saveMeta();
    }
  }
});

function getLoadout() {
  let lo = Array.isArray(meta.loadout) ? meta.loadout.filter(id => WEAPON_IDS.includes(id)) : [];
  lo = [...new Set(lo)].slice(0, 3);
  return lo.length ? lo : ['mg'];
}
function coreLevel() {
  return PERMS.reduce((n, u) => n + Math.min(u.max, Math.max(0, Math.floor((meta.up && meta.up[u.id]) || 0))), 0);
}
function masteryFor(wid) {
  meta.weapons = meta.weapons || defaultMastery();
  const m = meta.weapons[wid] || { lv: 1, trees: {} };
  return { lv: Math.max(1, Math.min(30, Math.floor(+m.lv || 1))), trees: { ...(m.trees || {}) } };
}
function saveMastery(wid) {
  if (!G || !G.player || !WEAPON_IDS.includes(wid)) return;
  meta.weapons = meta.weapons || defaultMastery();
  const curLv = (meta.weapons[wid] && meta.weapons[wid].lv) || 1;
  const inRunLv = Math.max(1, Math.min(30, Math.floor(G.player[wid] || 1)));
  const mergedTrees = { ...((meta.weapons[wid] && meta.weapons[wid].trees) || {}), ...(G.player.trees[wid] || {}) };
  meta.weapons[wid] = { lv: Math.max(curLv, inRunLv), trees: mergedTrees };
  saveMeta();
}

const MAX_RUN_LEVEL = 50;
function xpFor(level) { return Math.floor(12 + level * 8 + level * level * 0.4); }

function sanitizeBest(b) {
  if (b && typeof b === 'object' && typeof b.time === 'number' && !isNaN(b.time) && b.time > 0) {
    return {
      time: Math.max(0, Math.floor(b.time)),
      kills: Math.max(0, Math.floor(b.kills || 0)),
      level: Math.max(1, Math.floor(b.level || 1)),
      diff: (b.diff && DIFF[b.diff]) ? b.diff : 'easy'
    };
  }
  return null;
}

function loadBest() {
  try {
    const b = JSON.parse(localStorage.getItem('wof.best.v1'));
    return sanitizeBest(b);
  } catch (e) { return null; }
}
function saveBest() {
  const rec = { time: Math.floor(G.t), kills: G.kills, level: G.level, diff: G.diff };
  if (best && (rec.time < best.time || (rec.time === best.time && rec.kills <= best.kills))) return false;
  best = rec;
  try { localStorage.setItem('wof.best.v1', JSON.stringify(rec)); } catch (e) {}
  if (currentUser) { currentUser.best = best; saveUserToDB(currentUser); }
  return true;
}

function applyMeta(p) {
  for (const u of PERMS) {
    const lvl = Math.min(u.max, Math.max(0, Math.floor((meta.up && meta.up[u.id]) || 0)));
    for (let i = 0; i < lvl; i++) u.apply(p);
  }
  p.hp = p.maxHp;
}

function runCoins() {
  const d = DIFF[G.diff] || DIFF.easy;
  let base = G.coinsEarned || 0;
  if (base === 0) {
    base = G.t * 2.5 + G.kills * 0.7 + G.level * 4 + (G.bossKills || 0) * 100;
  }
  if (G.isStreak) base *= 1.3;
  return Math.max(0, Math.floor(base * d.reward - (G.coinsSpent || 0)));
}

function bankRun() {
  if (!G || G.banked) return 0;
  G.banked = true;
  const gain = runCoins();
  G.earned = gain;
  meta.coins += gain;
  saveMeta();
  return gain;
}

function buyPermanent(id) {
  const u = PERMS.find(x => x.id === id);
  if (!u) return false;
  const lvl = Math.min(u.max, Math.max(0, Math.floor((meta.up && meta.up[u.id]) || 0)));
  if (lvl >= u.max) { shopNote = { text: 'MAXED OUT', until: performance.now() + 1200 }; return false; }
  if (coreLevel() >= 100) { shopNote = { text: 'CORE FULL 100/100', until: performance.now() + 1400 }; return false; }
  const cost = permCost(u, lvl);
  if (meta.coins < cost) {
    shopNote = { text: 'NEED ' + cost + ' COINS', until: performance.now() + 1200 };
    beep(180, 0.08, 'square', 0.02, -60);
    return false;
  }
  meta.coins -= cost;
  meta.up = meta.up || {};
  meta.up[id] = lvl + 1;
  saveMeta();
  shopNote = { text: u.name.toUpperCase() + ' UPGRADED', until: performance.now() + 1400 };
  beep(760, 0.07, 'triangle', 0.03, 260);
  setTimeout(() => beep(1120, 0.09, 'triangle', 0.03, 160), 80);
  return true;
}

const MILESTONES = [
  { id: 'first_blood', check: g => g.kills >= 1, label: 'FIRST BLOOD', col: '#ff6b6b' },
  { id: 'kills_50', check: g => g.kills >= 50, label: '50 KILLS', col: '#ffd166' },
  { id: 'kills_100', check: g => g.kills >= 100, label: '100 KILLS! 💀', col: '#ff9f1c' },
  { id: 'kills_250', check: g => g.kills >= 250, label: 'MASSACRE! 🔥', col: '#ff4d6d' },
  { id: 'first_boss', check: g => g.bossKills >= 1, label: 'BOSS SLAYER ⚔', col: '#ffd700' },
  { id: 'level_10', check: g => g.level >= 10, label: 'LEVEL 10 ⭐', col: '#6ee7ff' },
  { id: 'level_25', check: g => g.level >= 25, label: 'LEVEL 25 🌟', col: '#c084fc' },
  { id: 'coins_100', check: g => (g.coinsEarned || 0) >= 100, label: 'LOADED 🪙 100', col: '#ffd700' },
  { id: 'combo_15', check: g => g.maxCombo >= 15, label: 'CHAIN LORD ⚡', col: '#a78bfa' },
  { id: 'survive_5min', check: g => g.t >= 300, label: '5 MINUTES SURVIVED ⏱', col: '#7bffb2' },
  { id: 'survive_10min', check: g => g.t >= 600, label: '10 MINUTES SURVIVED ⏱', col: '#38bdf8' },
  { id: 'survive_20min', check: g => g.t >= 1200, label: '20 MIN SURVIVOR APEX 🏆', col: '#ffd700' }
];
