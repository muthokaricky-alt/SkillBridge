import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "..", "skillbridge.db");
const walPath = `${dbPath}-wal`;
const shmPath = `${dbPath}-shm`;

for (const file of [dbPath, walPath, shmPath]) {
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

console.log("SkillBridge SQLite database deleted.");
console.log("Run `npm run server` to recreate it with demo data.");
