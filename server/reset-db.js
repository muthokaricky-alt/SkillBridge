// server/reset-db.js
// Deletes the local SQLite database file (and its WAL/SHM sidecar files),
// so the next `npm run server` recreates it from scratch with fresh seed
// data, credentials, etc.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");

for (const file of ["skillbridge.db", "skillbridge.db-shm", "skillbridge.db-wal"]) {
  const filePath = path.join(root, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted ${file}`);
  }
}

console.log("Run `npm run server` to recreate the database with fresh demo data.");
