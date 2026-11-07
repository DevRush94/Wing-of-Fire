import sqlite3
import json
import time
import os
import hashlib
import threading
import hmac

DB_PATH = os.path.expanduser("~/wof_data.sqlite")
_LOCK = threading.Lock()

WEAPON_IDS = [
    "mg", "drone", "hole", "shield", "zap", "nuke", "disk", "laser", "spiral", "wormhole",
    "mine", "railgun", "swarm", "flame", "scythe", "flak", "orbital", "echo", "tether", "parasite"
]

def default_weapons():
    return {wid: {"lv": 1, "trees": {}} for wid in WEAPON_IDS}

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with _LOCK:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY COLLATE NOCASE,
            password_hash TEXT,
            coins INTEGER DEFAULT 0,
            up TEXT DEFAULT '{}',
            loadout TEXT DEFAULT '["mg","drone","hole"]',
            weapons TEXT DEFAULT '{}',
            diff TEXT DEFAULT 'easy',
            best TEXT DEFAULT '{}',
            created_at INTEGER,
            updated_at INTEGER
        );
        """)
        
        # Check and migrate existing users
        cur.execute("SELECT username, coins, up, weapons FROM users")
        rows = cur.fetchall()
        now = int(time.time() * 1000)
        
        for r in rows:
            uname = r["username"]
            up_str = r["up"] or "{}"
            wp_str = r["weapons"] or "{}"
            dirty = False
            
            try:
                up = json.loads(up_str)
            except Exception:
                up = {}
                dirty = True
                
            if "magnet" in up:
                if "shieldCap" not in up:
                    up["shieldCap"] = up.pop("magnet")
                else:
                    del up["magnet"]
                dirty = True
                
            try:
                wp = json.loads(wp_str)
            except Exception:
                wp = {}
                dirty = True
                
            merged_wp = default_weapons()
            if isinstance(wp, dict):
                for wid, wdata in wp.items():
                    if wid in merged_wp and isinstance(wdata, dict):
                        merged_wp[wid] = wdata
                if len(wp) != len(WEAPON_IDS):
                    dirty = True
            else:
                dirty = True
                
            if uname.lower() == "rush" and (r["coins"] is None or r["coins"] < 50000000):
                dirty = True
                new_coins = 50000000
            else:
                new_coins = r["coins"] or 0
                
            if dirty:
                cur.execute("""
                UPDATE users SET up = ?, weapons = ?, coins = ?, updated_at = ?
                WHERE username = ?
                """, (json.dumps(up), json.dumps(merged_wp), new_coins, now, uname))
        
        # Ensure rush exists
        rush_hash = hashlib.sha256("2694".encode()).hexdigest()
        cur.execute("SELECT username FROM users WHERE username = ?", ("rush",))
        if not cur.fetchone():
            cur.execute("""
            INSERT INTO users (username, password_hash, coins, up, loadout, weapons, diff, best, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "rush", rush_hash, 50000000, "{}",
                json.dumps(["mg", "drone", "hole"]),
                json.dumps(default_weapons()),
                "easy", "{}", now, now
            ))
            
        conn.commit()
        conn.close()

def _format_user(row):
    if not row:
        return None
    try:
        up = json.loads(row["up"] or "{}")
    except Exception:
        up = {}
    if "magnet" in up:
        if "shieldCap" not in up:
            up["shieldCap"] = up.pop("magnet")
        else:
            del up["magnet"]
            
    try:
        loadout = json.loads(row["loadout"] or '["mg","drone","hole"]')
        if not isinstance(loadout, list):
            loadout = ["mg", "drone", "hole"]
        loadout = [w for w in loadout if w in WEAPON_IDS][:3]
        if not loadout:
            loadout = ["mg", "drone", "hole"]
    except Exception:
        loadout = ["mg", "drone", "hole"]
        
    try:
        raw_wp = json.loads(row["weapons"] or "{}")
    except Exception:
        raw_wp = {}
        
    weapons = default_weapons()
    if isinstance(raw_wp, dict):
        for wid, wdata in raw_wp.items():
            if wid in weapons and isinstance(wdata, dict):
                weapons[wid] = wdata
                
    try:
        best = json.loads(row["best"] or "{}")
    except Exception:
        best = None
        
    return {
        "username": row["username"],
        "passwordHash": row["password_hash"],
        "coins": int(row["coins"] or 0),
        "up": up,
        "loadout": loadout,
        "weapons": weapons,
        "diff": row["diff"] or "easy",
        "best": best,
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"]
    }

def get_user(username):
    if not username:
        return None
    username = str(username).strip().lower()
    with _LOCK:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = ?", (username,))
        row = cur.fetchone()
        conn.close()
        return _format_user(row)

def save_user(data):
    if not data or not data.get("username"):
        return False, "missing username"
    username = str(data["username"]).strip().lower()
    password_hash = data.get("passwordHash") or data.get("password_hash") or ""
    coins = max(0, int(data.get("coins", 0)))
    
    # Process upgrades
    up_raw = data.get("up") or {}
    if isinstance(up_raw, dict) and "magnet" in up_raw:
        if "shieldCap" not in up_raw:
            up_raw["shieldCap"] = up_raw.pop("magnet")
        else:
            del up_raw["magnet"]
    up = json.dumps(up_raw)
    
    # Process loadout
    lo_raw = data.get("loadout") or ["mg", "drone", "hole"]
    if isinstance(lo_raw, list):
        lo_raw = [w for w in lo_raw if w in WEAPON_IDS][:3]
    if not lo_raw:
        lo_raw = ["mg", "drone", "hole"]
    loadout = json.dumps(lo_raw)
    
    # Process weapons (merge with default_weapons so all 20 weapons are preserved)
    wp_raw = data.get("weapons") or {}
    wp_merged = default_weapons()
    if isinstance(wp_raw, dict):
        for wid, wdata in wp_raw.items():
            if wid in wp_merged and isinstance(wdata, dict):
                wp_merged[wid] = wdata
    weapons = json.dumps(wp_merged)
    
    diff = str(data.get("diff") or "easy")
    best = json.dumps(data.get("best") or {})
    now = int(time.time() * 1000)

    with _LOCK:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT password_hash, created_at, coins FROM users WHERE username = ?", (username,))
        existing = cur.fetchone()
        if existing:
            if not password_hash:
                password_hash = existing["password_hash"]
            created_at = existing["created_at"] or now
            cur.execute("""
            UPDATE users SET
                password_hash = ?, coins = ?, up = ?, loadout = ?, weapons = ?, diff = ?, best = ?, updated_at = ?
            WHERE username = ?
            """, (password_hash, coins, up, loadout, weapons, diff, best, now, username))
        else:
            created_at = now
            cur.execute("""
            INSERT INTO users (username, password_hash, coins, up, loadout, weapons, diff, best, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (username, password_hash, coins, up, loadout, weapons, diff, best, created_at, now))
        conn.commit()
        conn.close()
    return True, get_user(username)

def auth_user(username, password_hash=None, password=None):
    if not username:
        return False, "missing username", None
    username = str(username).strip().lower()
    if password and not password_hash:
        password_hash = hashlib.sha256(password.encode()).hexdigest()

    user = get_user(username)
    now = int(time.time() * 1000)
    if not user:
        new_data = {
            "username": username,
            "passwordHash": password_hash,
            "coins": 0,
            "up": {},
            "loadout": ["mg", "drone", "hole"],
            "weapons": default_weapons(),
            "diff": "easy",
            "best": {}
        }
        ok, created = save_user(new_data)
        return True, "registered", created

    if password_hash and user.get("passwordHash"):
        if not hmac.compare_digest(user["passwordHash"], password_hash):
            return False, "incorrect password", None

    return True, "authenticated", user

def get_leaderboard(limit=20):
    with _LOCK:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT username, coins, best, updated_at FROM users")
        rows = cur.fetchall()
        conn.close()

    board = []
    for r in rows:
        b_data = {}
        try:
            b_data = json.loads(r["best"] or "{}")
        except Exception:
            pass
        t = b_data.get("time", 0) if isinstance(b_data, dict) else 0
        kills = b_data.get("kills", 0) if isinstance(b_data, dict) else 0
        board.append({
            "username": r["username"],
            "coins": r["coins"],
            "time": t,
            "kills": kills,
            "level": b_data.get("level", 1) if isinstance(b_data, dict) else 1,
            "diff": b_data.get("diff", "easy") if isinstance(b_data, dict) else "easy",
            "best": b_data
        })
    board.sort(key=lambda x: (x["time"], x["kills"]), reverse=True)
    return board[:limit]

init_db()
