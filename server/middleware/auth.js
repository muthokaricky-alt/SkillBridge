// server/middleware/auth.js
import { getUserByToken } from "../db.js";

// Reads "Authorization: Bearer <token>", looks it up, and attaches the
// signed-in user to req.user. Responds 401 if the header is missing or the
// token doesn't match anyone (expired/logged-out/never existed — we don't
// distinguish, since telling an attacker which case it was leaks info).
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const user = await getUserByToken(token);
    if (!user) {
      return res.status(401).json({ error: "Session expired or invalid — please log in again" });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Use AFTER requireAuth on a route (requireAuth populates req.user first).
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
