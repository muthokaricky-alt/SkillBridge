// server/db.js
// SQLite-backed persistence for SkillBridge.
// The database file is created at the project root as skillbridge.db.
// Routes keep using this module, so the frontend/API contract stays the same.

import Database from "better-sqlite3";
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
`);

const seedUsers = [
  [1, "Bill Amani", "Technology", "BA", 1, 4.9, 23, 12],
  [2, "Jessica", "Design", "J", 1, 4.8, 17, 8],
  [3, "William Kasongo", "Business", "WK", 0, 5.0, 31, 15],
  [4, "K.Dot", "Music & Arts", "KD", 1, 4.7, 12, 6],
  [5, "La Pulga", "Fitness & Sports", "LP", 0, 4.9, 40, 20],
  [6, "Walter White", "Academic Subjects", "WW", 1, 4.6, 19, 9],
  [7, "Bruce Wayne", "Business", "BW", 0, 4.8, 22, 11],
  [8, "Lelouch", "Life Skills", "L", 1, 4.5, 8, 4],
  [9, "Naruto Uzumaki", "Fitness & Sports", "NU", 1, 4.7, 14, 7],
  [10, "Ichigoat", "Fitness & Sports", "IG", 0, 4.9, 26, 13],
  [11, "Jordan Lee", "Languages", "JL", 1, 4.8, 17, 8],
  [12, "Priya Sharma", "Academic Subjects", "PS", 0, 5.0, 31, 15],
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
};

const seed = db.transaction(() => {
  if (db.prepare("SELECT COUNT(*) AS count FROM users").get().count > 0) return;

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, dept, initials, online, rating, reviews, swaps)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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

seed();

function getSkillsForUser(userId, type) {
  return db.prepare(`
    SELECT s.name
    FROM skills s
    JOIN user_skills us ON us.skill_id = s.id
    WHERE us.user_id = ? AND us.type = ?
    ORDER BY s.name
  `).all(userId, type).map(row => row.name);
}

export function getUsers() {
  return db.prepare("SELECT * FROM users ORDER BY id").all().map(user => ({
    id: user.id,
    name: user.name,
    dept: user.dept,
    initials: user.initials,
    online: Boolean(user.online),
    rating: user.rating,
    reviews: user.reviews,
    swaps: user.swaps,
    offers: getSkillsForUser(user.id, "offer"),
    wants: getSkillsForUser(user.id, "want"),
  }));
}

export function getUserById(id) {
  return getUsers().find(user => user.id === Number(id));
}

export function getRequests() {
  return db.prepare(`
    SELECT id, from_id AS fromId, to_id AS toId, offer, want, type,
           msg, time_text AS time, status
    FROM requests
    ORDER BY id
  `).all();
}

export function addRequest({ fromId, toId, offer, want, type, msg }) {
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

export function updateRequestStatus(id, status) {
  const result = db.prepare("UPDATE requests SET status = ? WHERE id = ?").run(status, id);
  if (!result.changes) return null;
  return db.prepare(`
    SELECT id, from_id AS fromId, to_id AS toId, offer, want, type,
           msg, time_text AS time, status
    FROM requests WHERE id = ?
  `).get(id);
}

export function removeRequest(id) {
  db.prepare("DELETE FROM requests WHERE id = ?").run(id);
}

export function getSessions() {
  return db.prepare(`
    SELECT id, with_user AS "with", skill, date, time, dur, color,
           reviewed
    FROM sessions ORDER BY date, time
  `).all().map(s => ({ ...s, reviewed: Boolean(s.reviewed) }));
}

export function addSession({ withUser, skill, date, time, dur, color }) {
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

export function markSessionReviewed(id) {
  const result = db.prepare("UPDATE sessions SET reviewed = 1 WHERE id = ?").run(id);
  if (!result.changes) return null;
  const s = db.prepare(`
    SELECT id, with_user AS "with", skill, date, time, dur, color, reviewed
    FROM sessions WHERE id = ?
  `).get(id);
  return { ...s, reviewed: Boolean(s.reviewed) };
}

export function getProfile() {
  const profile = db.prepare("SELECT coins FROM profiles WHERE user_id = 1").get();
  return {
    offers: getSkillsForUser(1, "offer"),
    wants: getSkillsForUser(1, "want"),
    coins: profile?.coins ?? 0,
    coinHistory: db.prepare(`
      SELECT id, action, change, date_text AS date
      FROM coin_history WHERE user_id = 1
      ORDER BY id DESC
    `).all(),
  };
}

export function addProfileSkill(type, value) {
  const insertSkill = db.prepare("INSERT OR IGNORE INTO skills (name) VALUES (?)");
  insertSkill.run(value);
  const skill = db.prepare("SELECT id FROM skills WHERE name = ?").get(value);
  db.prepare(`
    INSERT OR IGNORE INTO user_skills (user_id, skill_id, type)
    VALUES (1, ?, ?)
  `).run(skill.id, type);
  return getProfile();
}

export function removeProfileSkill(type, value) {
  const skill = db.prepare("SELECT id FROM skills WHERE name = ?").get(value);
  if (skill) {
    db.prepare(`
      DELETE FROM user_skills
      WHERE user_id = 1 AND skill_id = ? AND type = ?
    `).run(skill.id, type);
  }
  return getProfile();
}

export function adjustCoins(delta, reason) {
  const transaction = db.transaction(() => {
    db.prepare("UPDATE profiles SET coins = coins + ? WHERE user_id = 1").run(delta);
    db.prepare(`
      INSERT INTO coin_history (user_id, action, change, date_text)
      VALUES (1, ?, ?, 'Just now')
    `).run(reason || (delta > 0 ? "Coins earned" : "Coins spent"), delta);
  });
  transaction();
  return getProfile();
}

export function closeDatabase() {
  db.close();
}
