// server/db.js
// SQLite-backed persistence for SkillBridge (via better-sqlite3 — a
// single local file, zero server setup). Every exported function here is
// declared `async` even though better-sqlite3 itself is synchronous under
// the hood — that's deliberate: it keeps every route file's `await db.fn()`
// calls working unchanged, so nothing above this file needs to know or
// care that the database is SQLite rather than something else.

import "dotenv/config";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new Database(path.join(__dirname, "..", "skillbridge.db"));

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dept TEXT NOT NULL,
    initials TEXT NOT NULL,
    online INTEGER NOT NULL DEFAULT 0,
    rating REAL NOT NULL DEFAULT 0,
    reviews INTEGER NOT NULL DEFAULT 0,
    swaps INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS user_skills (
    user_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('offer', 'want')),
    PRIMARY KEY (user_id, skill_id, type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_id INTEGER,
    to_id INTEGER,
    offer TEXT,
    want TEXT NOT NULL,
    type TEXT NOT NULL,
    msg TEXT NOT NULL,
    time_text TEXT NOT NULL DEFAULT 'Just now',
    status TEXT NOT NULL DEFAULT 'sent',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (to_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    with_user TEXT NOT NULL,
    skill TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    dur INTEGER NOT NULL DEFAULT 60,
    color TEXT NOT NULL DEFAULT '#10B981',
    reviewed INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS profiles (
    user_id INTEGER PRIMARY KEY,
    coins INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS coin_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    change INTEGER NOT NULL,
    date_text TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS auth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Admin audit log — every admin-performed action on another account
  -- (register/edit/delete/password-reset), for accountability.
  -- target_user_id is ON DELETE SET NULL (not CASCADE) so a log entry
  -- survives even after the account it was about gets deleted;
  -- target_username is stored redundantly as plain text for the same
  -- reason — the log should still say who it was about.
  CREATE TABLE IF NOT EXISTS admin_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    admin_username TEXT NOT NULL,
    action TEXT NOT NULL,
    target_user_id INTEGER,
    target_username TEXT,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);

const seedUsers = [
  // [id, name, dept, initials, online, rating, reviews, swaps, estate, lat, lng]
  [1, "Bill Amani", "Technology", "BA", 1, 4.9, 23, 12, "Kileleshwa, Nairobi", -1.2762, 36.7816],
  [2, "Jessica", "Design", "J", 1, 4.8, 17, 8, "Lavington, Nairobi", -1.2790, 36.7690],
  [3, "William Kasongo", "Business", "WK", 0, 5.0, 31, 15, "Karen, Nairobi", -1.3192, 36.7076],
  [4, "K.Dot", "Music & Arts", "KD", 1, 4.7, 12, 6, "Westlands, Nairobi", -1.2676, 36.8108],
  [5, "La Pulga", "Fitness & Sports", "LP", 0, 4.9, 40, 20, "Kilimani, Nairobi", -1.2921, 36.7833],
  [6, "Walter White", "Academic Subjects", "WW", 1, 4.6, 19, 9, "South B, Nairobi", -1.3095, 36.8280],
  [7, "Bruce Wayne", "Business", "BW", 0, 4.8, 22, 11, "Runda, Nairobi", -1.2136, 36.8125],
  [8, "Lelouch", "Life Skills", "L", 1, 4.5, 8, 4, "Kasarani, Nairobi", -1.2233, 36.8967],
  [9, "Naruto Uzumaki", "Fitness & Sports", "NU", 1, 4.7, 14, 7, "Embakasi, Nairobi", -1.3242, 36.8938],
  [10, "Ichigoat", "Fitness & Sports", "IG", 0, 4.9, 26, 13, "Rongai, Kajiado", -1.3958, 36.7539],
  [11, "Jordan Lee", "Languages", "JL", 1, 4.8, 17, 8, "Ngong, Kajiado", -1.3529, 36.6564],
  [12, "Priya Sharma", "Academic Subjects", "PS", 0, 5.0, 31, 15, "Thika Road, Nairobi", -1.2192, 36.8896],
  [13, "Amina Farah", "Agriculture", "AF", 1, 4.9, 18, 9, "Ruiru, Kiambu", -1.1466, 36.9615],
  [14, "Samuel Mwangi", "Agriculture", "SM", 0, 4.6, 11, 5, "Limuru, Kiambu", -1.1122, 36.6417],
];

const userSkills = {
  1: { offer: ["AI & Automation", "Web Development", "Python"], want: ["UI/UX Design", "Public Speaking", "Sales"] },
  2: { offer: ["UI/UX Design", "Figma", "Content Creation"], want: ["Web Development", "Data Analysis", "Digital Marketing"] },
  3: { offer: ["Sales", "Taxes", "Digital Marketing"], want: ["Web Development", "Cybersecurity", "Public Speaking"] },
  4: { offer: ["Music Production", "Songwriting", "Content Creation"], want: ["Digital Marketing", "Sales", "AI & Automation"] },
  5: { offer: ["Football Coaching", "Fitness Training"], want: ["Sales", "Digital Marketing", "Public Speaking"] },
  6: { offer: ["Chemistry", "Academic Tutoring"], want: ["UI/UX Design", "Public Speaking", "Sales"] },
  7: { offer: ["Cybersecurity", "Cloud Computing", "Sales"], want: ["Public Speaking", "Content Creation", "AI & Automation"] },
  8: { offer: ["Public Speaking", "Strategy & Planning"], want: ["Web Development", "Cybersecurity", "Digital Marketing"] },
  9: { offer: ["Fitness Training", "Public Speaking"], want: ["AI & Automation", "Cloud Computing", "Sales"] },
  10: { offer: ["Karate", "Fitness Training"], want: ["Web Development", "Digital Marketing", "Music Production"] },
  11: { offer: ["Spanish", "French", "Translation"], want: ["Web Development", "Data Analysis", "Cybersecurity"] },
  12: { offer: ["Data Analysis", "Statistics", "Academic Tutoring"], want: ["Web Development", "Cybersecurity", "UI/UX Design"] },
  13: { offer: ["Agronomy", "Soil Health", "Irrigation Systems", "Crop Disease Management"], want: ["Digital Marketing", "Data Analysis", "Web Development"] },
  14: { offer: ["Farm Tech", "Livestock Management", "Organic Farming"], want: ["Sales", "Content Creation", "AI & Automation"] },
};

const seed = db.transaction(() => {
  if (db.prepare("SELECT COUNT(*) AS count FROM users").get().count > 0) return;

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, dept, initials, online, rating, reviews, swaps, estate, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertSkill = db.prepare("INSERT OR IGNORE INTO skills (name) VALUES (?)");
  const getSkill = db.prepare("SELECT id FROM skills WHERE name = ?");
  const insertUserSkill = db.prepare(`
    INSERT OR IGNORE INTO user_skills (user_id, skill_id, type)
    VALUES (?, ?, ?)
  `);

  for (const user of seedUsers) insertUser.run(...user);

  for (const [userId, groups] of Object.entries(userSkills)) {
    for (const type of ["offer", "want"]) {
      for (const name of groups[type]) {
        insertSkill.run(name);
        insertUserSkill.run(Number(userId), getSkill.get(name).id, type);
      }
    }
  }

  const insertRequest = db.prepare(`
    INSERT INTO requests
      (id, from_id, to_id, offer, want, type, msg, time_text, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertRequest.run(1, 2, 1, "UI/UX Design", "Web Development", "swap",
    "Hey! I want to learn web dev. I could teach you UI/UX in return!", "10m ago", "incoming");
  insertRequest.run(2, 4, 1, "Music Production", "AI & Automation", "swap",
    "I want to learn AI & Automation for my next project. Happy to teach music production!", "2h ago", "incoming");
  insertRequest.run(3, 11, 1, null, "Data Analysis", "coin",
    "I used 3 Skill Coins for this. I really need Data Analysis skills!", "1d ago", "sent");

  const insertSession = db.prepare(`
    INSERT INTO sessions (id, with_user, skill, date, time, dur, color, reviewed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSession.run(1, "Jessica", "UI/UX Design basics", "2026-06-26", "14:00", 60, "#1FD4A0", 0);
  insertSession.run(2, "K.Dot", "Music Production intro", "2026-06-28", "10:30", 45, "#F5B731", 0);
  insertSession.run(3, "Jordan Lee", "Spanish for beginners", "2026-06-30", "16:00", 60, "#8B6BF5", 0);

  db.prepare("INSERT INTO profiles (user_id, coins) VALUES (1, 12)").run();
  const history = db.prepare(`
    INSERT INTO coin_history (id, user_id, action, change, date_text)
    VALUES (?, 1, ?, ?, ?)
  `);
  history.run(1, "Joined SkillBridge", 10, "1 month ago");
  history.run(2, "Completed swap with Jordan Lee", 2, "10h ago");
});

// ---------------------------------------------------------------------------
// Migrations: add columns that didn't exist in the original schema. All
// guarded by checking PRAGMA table_info first, so this is safe to run on
// every startup, on both a fresh database and one created before these
// features existed.
// ---------------------------------------------------------------------------
function columnExists(table, column) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column);
}

if (!columnExists("users", "estate")) {
  db.exec(`
    ALTER TABLE users ADD COLUMN estate TEXT;
    ALTER TABLE users ADD COLUMN lat REAL;
    ALTER TABLE users ADD COLUMN lng REAL;
  `);
}
if (!columnExists("skills", "category")) {
  db.exec(`ALTER TABLE skills ADD COLUMN category TEXT;`);
}
if (!columnExists("users", "username")) {
  // Note: SQLite doesn't allow UNIQUE directly on a column added via
  // ALTER TABLE — enforce it with a separate unique index instead.
  db.exec(`
    ALTER TABLE users ADD COLUMN username TEXT;
    ALTER TABLE users ADD COLUMN phone TEXT;
    ALTER TABLE users ADD COLUMN password_hash TEXT;
    ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);
}
if (!columnExists("users", "must_change_password")) {
  db.exec(`ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0;`);
}

seed();

// Backfill new seed users that were added AFTER an install was already
// seeded (Amina Farah / Samuel Mwangi, added with Agriculture skills) —
// seed() only ever runs once on a truly empty database, so anyone whose
// skillbridge.db already existed needs these rows inserted directly.
{
  const existingIds = new Set(db.prepare("SELECT id FROM users").all().map((r) => r.id));
  const newUsers = seedUsers.filter((u) => !existingIds.has(u[0]));
  if (newUsers.length > 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, dept, initials, online, rating, reviews, swaps, estate, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertSkill = db.prepare("INSERT OR IGNORE INTO skills (name) VALUES (?)");
    const getSkill = db.prepare("SELECT id FROM skills WHERE name = ?");
    const insertUserSkill = db.prepare(`
      INSERT OR IGNORE INTO user_skills (user_id, skill_id, type)
      VALUES (?, ?, ?)
    `);
    for (const user of newUsers) {
      insertUser.run(...user);
      const groups = userSkills[user[0]];
      if (!groups) continue;
      for (const type of ["offer", "want"]) {
        for (const name of groups[type]) {
          insertSkill.run(name);
          insertUserSkill.run(user[0], getSkill.get(name).id, type);
        }
      }
    }
  }
}

// Backfill estate/coordinates for any user row still missing them.
{
  const estateBackfill = new Map(seedUsers.map((u) => [u[0], { estate: u[8], lat: u[9], lng: u[10] }]));
  const usersMissingLocation = db.prepare("SELECT id FROM users WHERE estate IS NULL").all();
  const updateUserLocation = db.prepare("UPDATE users SET estate = ?, lat = ?, lng = ? WHERE id = ?");
  for (const { id } of usersMissingLocation) {
    const loc = estateBackfill.get(id) || { estate: "Nairobi", lat: -1.2921, lng: 36.8219 };
    updateUserLocation.run(loc.estate, loc.lat, loc.lng, id);
  }
}

// Backfill skill categories using SkillBridge's existing CATEGORIES
// taxonomy via keyword matching. Anything unmatched falls back to
// "Life Skills" so /api/skills?tag= always has something to filter.
const CATEGORY_KEYWORDS = {
  Technology: ["web development", "ai & automation", "python", "cybersecurity", "cloud computing", "data analysis", "statistics"],
  Design: ["ui/ux design", "figma"],
  Business: ["sales", "taxes", "digital marketing", "strategy & planning"],
  Languages: ["spanish", "french", "translation"],
  "Music & Arts": ["music production", "songwriting", "content creation"],
  "Fitness & Sports": ["football coaching", "fitness training", "karate"],
  "Academic Subjects": ["chemistry", "academic tutoring"],
  Agriculture: [
    "agronomy", "soil health", "irrigation systems", "crop disease management",
    "farm tech", "livestock management", "organic farming", "pest management",
    "urban farming", "greenhouse",
  ],
};
function categorize(name) {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return category;
  }
  return "Life Skills";
}
{
  const skillsMissingCategory = db.prepare("SELECT id, name FROM skills WHERE category IS NULL").all();
  const updateSkillCategory = db.prepare("UPDATE skills SET category = ? WHERE id = ?");
  for (const skill of skillsMissingCategory) {
    updateSkillCategory.run(categorize(skill.name), skill.id);
  }
}

// ---------------------------------------------------------------------------
// Auth credentials backfill. Every account (existing seed students + one
// dedicated admin) gets username/phone/password "1234", and is flagged
// must_change_password = 1 so the frontend forces them to pick a real
// password on first login. New signups (via createUser below) skip this
// flag since they chose their own password already.
// ---------------------------------------------------------------------------
const DEFAULT_PASSWORD = "1234";
const ADMIN_USERNAME = "admin";

function generateUniqueUsername(name, excludeUserId = null) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "") || "user";
  let candidate = base;
  let suffix = 1;
  const existsStmt = excludeUserId
    ? db.prepare("SELECT id FROM users WHERE username = ? AND id != ?")
    : db.prepare("SELECT id FROM users WHERE username = ?");
  while (true) {
    const existing = excludeUserId ? existsStmt.get(candidate, excludeUserId) : existsStmt.get(candidate);
    if (!existing) return candidate;
    candidate = `${base}${++suffix}`;
  }
}

// Turns a full name into initials like "V.J" for "Vini Jr". Single-word
// names fall back to the first two letters ("Cher" -> "CH").
function generateInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}.${words[1][0]}`.toUpperCase();
}

{
  const usersMissingAuth = db.prepare("SELECT id, name FROM users WHERE password_hash IS NULL").all();
  if (usersMissingAuth.length > 0) {
    const defaultHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
    const updateAuth = db.prepare(
      "UPDATE users SET username = ?, phone = ?, password_hash = ?, must_change_password = 1 WHERE id = ?"
    );
    for (const user of usersMissingAuth) {
      const username = generateUniqueUsername(user.name, user.id);
      // Synthetic placeholder phone numbers for fictional seed students —
      // deterministic (based on id) so they're stable across restarts.
      const phone = `07${String(user.id).padStart(8, "0")}`;
      updateAuth.run(username, phone, defaultHash, user.id);
    }
  }

  const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!adminExists) {
    const adminHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
    const result = db.prepare(`
      INSERT INTO users (name, dept, initials, online, rating, reviews, swaps, estate, username, phone, password_hash, role, must_change_password)
      VALUES (?, ?, ?, 1, 0, 0, 0, ?, ?, ?, ?, 'admin', 1)
    `).run("Admin", "Administration", "AD", "Nairobi", ADMIN_USERNAME, "0700000000", adminHash);
    db.prepare("INSERT INTO profiles (user_id, coins) VALUES (?, 0)").run(result.lastInsertRowid);
  }
}

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------
async function getSkillsForUser(userId, type) {
  return db.prepare(`
    SELECT s.name
    FROM skills s
    JOIN user_skills us ON us.skill_id = s.id
    WHERE us.user_id = ? AND us.type = ?
    ORDER BY s.name
  `).all(userId, type).map((row) => row.name);
}

export async function getUsers() {
  const users = db.prepare("SELECT * FROM users ORDER BY id").all();
  return Promise.all(users.map(async (user) => ({
    id: user.id,
    name: user.name,
    dept: user.dept,
    initials: user.initials,
    online: Boolean(user.online),
    rating: user.rating,
    reviews: user.reviews,
    swaps: user.swaps,
    estate: user.estate,
    lat: user.lat,
    lng: user.lng,
    offers: await getSkillsForUser(user.id, "offer"),
    wants: await getSkillsForUser(user.id, "want"),
  })));
}

export async function getUserById(id) {
  const users = await getUsers();
  return users.find((user) => user.id === Number(id));
}

// ---------------------------------------------------------------------------
// Downstream API — served TO Farmers-AgroConnect (see
// src/documentation/API_NEEDS_DOWNSTREAM.md and ENDPOINT_LIST.md).
// ---------------------------------------------------------------------------
function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getExperts({ estate, sort, lat, lng } = {}) {
  const users = await getUsers();
  let experts = users.map((u) => ({
    id: u.id, name: u.name, estate: u.estate,
    coordinates: { lat: u.lat, lng: u.lng },
    rating: u.rating, reviews: u.reviews, skills: u.offers,
  }));

  if (estate) {
    const needle = estate.toLowerCase();
    experts = experts.filter((e) => e.estate?.toLowerCase().includes(needle));
  }

  if (sort === "proximity" && lat != null && lng != null) {
    experts = experts
      .map((e) => ({ ...e, distanceKm: Math.round(distanceKm(Number(lat), Number(lng), e.coordinates.lat, e.coordinates.lng) * 10) / 10 }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  } else {
    experts.sort((a, b) => b.rating - a.rating);
  }
  return experts;
}

export async function getExpertById(id) {
  const u = await getUserById(id);
  if (!u) return null;
  return {
    id: u.id, name: u.name, dept: u.dept, estate: u.estate,
    coordinates: { lat: u.lat, lng: u.lng },
    rating: u.rating, reviews: u.reviews, swaps: u.swaps, skills: u.offers,
  };
}

export async function getExpertReviews(id) {
  const u = await getUserById(id);
  if (!u) return null;
  return { expertId: u.id, rating: u.rating, reviews: u.reviews, completedSwaps: u.swaps };
}

const DAILY_SLOT_TEMPLATE = ["09:00", "11:00", "14:00", "16:00"];

export async function getExpertAvailability(id) {
  const u = await getUserById(id);
  if (!u) return null;

  const sessions = await getSessions();
  const bookedByDate = new Set(
    sessions.filter((s) => s.with.toLowerCase() === u.name.toLowerCase()).map((s) => `${s.date}_${s.time}`)
  );

  const slots = [];
  const today = new Date();
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    const dateStr = d.toISOString().slice(0, 10);
    for (const time of DAILY_SLOT_TEMPLATE) {
      if (!bookedByDate.has(`${dateStr}_${time}`)) slots.push({ date: dateStr, time, durationMinutes: 60 });
    }
  }
  return { expertId: u.id, slots };
}

export async function getSkillsByCategory(tag) {
  const sql = `
    SELECT s.name, s.category, COUNT(us.user_id) AS offeredBy
    FROM skills s
    LEFT JOIN user_skills us ON us.skill_id = s.id AND us.type = 'offer'
    ${tag ? "WHERE s.category = ?" : ""}
    GROUP BY s.id
    ORDER BY s.category, s.name
  `;
  return db.prepare(sql).all(...(tag ? [tag] : []));
}

// ---------------------------------------------------------------------------
// Requests / sessions / profile
// ---------------------------------------------------------------------------
export async function getRequests() {
  return db.prepare(`
    SELECT id, from_id AS fromId, to_id AS toId, offer, want, type,
           msg, time_text AS time, status
    FROM requests ORDER BY id
  `).all();
}

export async function addRequest({ fromId, toId, offer, want, type, msg }) {
  const result = db.prepare(`
    INSERT INTO requests (from_id, to_id, offer, want, type, msg, time_text, status)
    VALUES (?, ?, ?, ?, ?, ?, 'Just now', 'sent')
  `).run(fromId ?? null, toId ?? fromId ?? null, offer ?? null, want, type, msg);

  return db.prepare(`
    SELECT id, from_id AS fromId, to_id AS toId, offer, want, type,
           msg, time_text AS time, status
    FROM requests WHERE id = ?
  `).get(result.lastInsertRowid);
}

export async function addConsultationRequest({ farmerName, topic, expertId, date }) {
  const msg = `Consultation request from ${farmerName} (via Farmers-AgroConnect) for ${date}.`;
  return addRequest({ fromId: null, toId: Number(expertId), offer: null, want: topic, type: "consult", msg });
}

export async function updateRequestStatus(id, status) {
  const result = db.prepare("UPDATE requests SET status = ? WHERE id = ?").run(status, id);
  if (!result.changes) return null;
  return db.prepare(`
    SELECT id, from_id AS fromId, to_id AS toId, offer, want, type,
           msg, time_text AS time, status
    FROM requests WHERE id = ?
  `).get(id);
}

export async function removeRequest(id) {
  db.prepare("DELETE FROM requests WHERE id = ?").run(id);
}

export async function getSessions() {
  return db.prepare(`
    SELECT id, with_user AS "with", skill, date, time, dur, color, reviewed
    FROM sessions ORDER BY date, time
  `).all().map((s) => ({ ...s, reviewed: Boolean(s.reviewed) }));
}

export async function addSession({ withUser, skill, date, time, dur, color }) {
  const result = db.prepare(`
    INSERT INTO sessions (with_user, skill, date, time, dur, color, reviewed)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).run(withUser, skill, date, time, dur || 60, color || "#10B981");

  const s = db.prepare(`
    SELECT id, with_user AS "with", skill, date, time, dur, color, reviewed
    FROM sessions WHERE id = ?
  `).get(result.lastInsertRowid);
  return { ...s, reviewed: Boolean(s.reviewed) };
}

export async function markSessionReviewed(id) {
  const result = db.prepare("UPDATE sessions SET reviewed = 1 WHERE id = ?").run(id);
  if (!result.changes) return null;
  const s = db.prepare(`
    SELECT id, with_user AS "with", skill, date, time, dur, color, reviewed
    FROM sessions WHERE id = ?
  `).get(id);
  return { ...s, reviewed: Boolean(s.reviewed) };
}

export async function getProfile(userId) {
  const profile = db.prepare("SELECT coins FROM profiles WHERE user_id = ?").get(userId);
  return {
    offers: await getSkillsForUser(userId, "offer"),
    wants: await getSkillsForUser(userId, "want"),
    coins: profile?.coins ?? 0,
    coinHistory: db.prepare(`
      SELECT id, action, change, date_text AS date
      FROM coin_history WHERE user_id = ?
      ORDER BY id DESC
    `).all(userId),
  };
}

// Self-service edit of your own basic info. Deliberately a small,
// separate whitelist from ADMIN_EDITABLE_FIELDS below — a user can update
// their own dept/estate, but NOT their role, rating, reviews, or swap
// count (those stay admin-only / system-computed).
const SELF_EDITABLE_FIELDS = ["dept", "estate"];

export async function updateOwnProfileInfo(userId, fields) {
  const updates = Object.entries(fields).filter(
    ([key, value]) => SELF_EDITABLE_FIELDS.includes(key) && value !== undefined
  );
  if (updates.length === 0) {
    const err = new Error(`No editable fields provided. Allowed: ${SELF_EDITABLE_FIELDS.join(", ")}`);
    err.status = 400;
    throw err;
  }
  const setClause = updates.map(([key]) => `${key} = ?`).join(", ");
  const values = updates.map(([, value]) => value);
  db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...values, userId);

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  return toSafeUser(row);
}

export async function addProfileSkill(userId, type, value) {
  const name = value.trim();
  db.prepare("INSERT OR IGNORE INTO skills (name) VALUES (?)").run(name);
  const skill = db.prepare("SELECT id FROM skills WHERE name = ?").get(name);
  db.prepare("INSERT OR IGNORE INTO user_skills (user_id, skill_id, type) VALUES (?, ?, ?)")
    .run(userId, skill.id, type);
  return getProfile(userId);
}

export async function removeProfileSkill(userId, type, value) {
  const skill = db.prepare("SELECT id FROM skills WHERE name = ?").get(value.trim());
  if (skill) {
    db.prepare("DELETE FROM user_skills WHERE user_id = ? AND skill_id = ? AND type = ?")
      .run(userId, skill.id, type);
  }
  return getProfile(userId);
}

export async function adjustCoins(userId, delta, reason) {
  const profile = db.prepare("SELECT coins FROM profiles WHERE user_id = ?").get(userId);
  const current = profile?.coins ?? 0;
  if (current + delta < 0) {
    const err = new Error("Insufficient Skill Coins");
    err.status = 400;
    throw err;
  }
  const tx = db.transaction(() => {
    db.prepare("UPDATE profiles SET coins = coins + ? WHERE user_id = ?").run(delta, userId);
    db.prepare(`
      INSERT INTO coin_history (user_id, action, change, date_text)
      VALUES (?, ?, ?, 'Just now')
    `).run(userId, reason || (delta > 0 ? "Coins earned" : "Coins spent"), delta);
  });
  tx();
  return getProfile(userId);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export function toSafeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    phone: row.phone,
    dept: row.dept,
    initials: row.initials,
    role: row.role,
    online: Boolean(row.online),
    rating: row.rating === null ? null : Number(row.rating),
    reviews: row.reviews,
    swaps: row.swaps,
    estate: row.estate,
    mustChangePassword: Boolean(row.must_change_password),
  };
}

export async function findUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username.toLowerCase().trim()) || null;
}

// Like getUserById, but returns the full account shape (username, phone,
// role, etc.) rather than the AgroConnect-facing "expert" shape — used
// wherever admin routes need to know who they're acting on.
export async function findUserByIdFull(id) {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(id));
  return toSafeUser(row);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

const PHONE_PATTERN = /^0[17]\d{8}$/; // Kenyan format: 07xxxxxxxx or 01xxxxxxxx

export async function createUser({ name, username, phone, password }) {
  const normalizedUsername = username.toLowerCase().trim();
  if (!/^[a-z0-9._-]{3,30}$/.test(normalizedUsername)) {
    const err = new Error("Username must be 3-30 characters (letters, numbers, dots, dashes, underscores only)");
    err.status = 400;
    throw err;
  }
  if (!PHONE_PATTERN.test(phone)) {
    const err = new Error("Phone number must be in the format 07XXXXXXXX or 01XXXXXXXX");
    err.status = 400;
    throw err;
  }
  if (await findUserByUsername(normalizedUsername)) {
    const err = new Error("That username is already taken");
    err.status = 409;
    throw err;
  }

  const initials = generateInitials(name);
  const passwordHash = await bcrypt.hash(password, 10);

  const tx = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO users (name, dept, initials, online, rating, reviews, swaps, username, phone, password_hash, role, must_change_password)
      VALUES (?, ?, ?, 1, 0, 0, 0, ?, ?, ?, 'user', 0)
    `).run(name.trim(), "Undeclared", initials, normalizedUsername, phone, passwordHash);
    const userId = result.lastInsertRowid;
    db.prepare("INSERT INTO profiles (user_id, coins) VALUES (?, 5)").run(userId);
    db.prepare(`
      INSERT INTO coin_history (user_id, action, change, date_text)
      VALUES (?, 'Welcome bonus', 5, 'Just now')
    `).run(userId);
    return userId;
  });
  const userId = tx();

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  return toSafeUser(row);
}

// Sessions expire after 7 days of being issued (not 7 days of inactivity —
// keeping this simple). A logged-in tab just gets treated as logged-out
// once its token is past this age; the frontend's existing "token invalid"
// handling (redirect to AuthScreen) covers it with no extra code needed.
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export async function createAuthToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO auth_tokens (user_id, token) VALUES (?, ?)").run(userId, token);
  return token;
}

export async function getUserByToken(token) {
  const row = db.prepare(`
    SELECT u.*, t.created_at AS tokenCreatedAt FROM auth_tokens t
    JOIN users u ON u.id = t.user_id
    WHERE t.token = ?
  `).get(token);
  if (!row) return null;

  const tokenAgeMs = Date.now() - new Date(row.tokenCreatedAt.replace(" ", "T") + "Z").getTime();
  if (tokenAgeMs > TOKEN_MAX_AGE_MS) {
    db.prepare("DELETE FROM auth_tokens WHERE token = ?").run(token); // clean up while we're here
    return null;
  }
  return toSafeUser(row);
}

export async function deleteAuthToken(token) {
  db.prepare("DELETE FROM auth_tokens WHERE token = ?").run(token);
}

// Self-service password change — requires the current password. Clears
// must_change_password so the forced-change screen doesn't reappear.
export async function changePassword(userId, oldPassword, newPassword) {
  const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(userId);
  if (!row || !(await bcrypt.compare(oldPassword, row.password_hash))) {
    const err = new Error("Current password is incorrect");
    err.status = 401;
    throw err;
  }
  const newHash = await bcrypt.hash(newPassword, 10);
  db.prepare("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?").run(newHash, userId);
}

// Admin override — sets a user's password directly, no old password
// needed, and flags it as needing to be changed again (since the admin
// now knows the temporary password they just set).
export async function adminSetPassword(userId, newPassword) {
  const newHash = await bcrypt.hash(newPassword, 10);
  const result = db.prepare(
    "UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?"
  ).run(newHash, userId);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// Admin — full read access to every user, plus create/update/delete.
// Gated behind requireAdmin in middleware, not here.
// ---------------------------------------------------------------------------
export async function adminGetAllUsers() {
  const rows = db.prepare("SELECT * FROM users ORDER BY id").all();
  return rows.map((row) => {
    const profile = db.prepare("SELECT coins FROM profiles WHERE user_id = ?").get(row.id);
    return { ...toSafeUser(row), coins: profile?.coins ?? 0 };
  });
}

const ADMIN_EDITABLE_FIELDS = ["name", "username", "phone", "dept", "role", "online", "rating", "reviews", "swaps", "estate"];

export async function adminUpdateUser(id, fields) {
  const updates = Object.entries(fields).filter(([key]) => ADMIN_EDITABLE_FIELDS.includes(key));
  if (updates.length === 0) {
    const err = new Error(`No editable fields provided. Allowed: ${ADMIN_EDITABLE_FIELDS.join(", ")}`);
    err.status = 400;
    throw err;
  }
  const setClause = updates.map(([key]) => `${key} = ?`).join(", ");
  const values = updates.map(([, value]) => value);
  const result = db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...values, id);
  if (!result.changes) return null;

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  const profile = db.prepare("SELECT coins FROM profiles WHERE user_id = ?").get(id);
  return { ...toSafeUser(row), coins: profile?.coins ?? 0 };
}

export async function adminDeleteUser(id) {
  const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// Admin audit log
// ---------------------------------------------------------------------------
export async function logAdminAction({ adminId, adminUsername, action, targetUserId, targetUsername, details }) {
  db.prepare(`
    INSERT INTO admin_audit_log (admin_id, admin_username, action, target_user_id, target_username, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(adminId, adminUsername, action, targetUserId ?? null, targetUsername ?? null, details ?? null);
}

export async function getAdminAuditLog() {
  return db.prepare(`
    SELECT id, admin_username AS adminUsername, action, target_username AS targetUsername,
           details, created_at AS createdAt
    FROM admin_audit_log
    ORDER BY id DESC
    LIMIT 200
  `).all();
}

export async function closeDatabase() {
  db.close();
}
