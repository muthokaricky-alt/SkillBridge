// server/routes/auth.routes.js
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createUser,
  findUserByUsername,
  verifyPassword,
  createAuthToken,
  deleteAuthToken,
  changePassword,
  toSafeUser,
} from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Every account starts on the same default password ("1234") until
// changed, so brute-forcing a username is meaningfully easier here than
// on a normal app — this caps how many login attempts a single IP can
// make. 10 tries per 15 minutes is generous for a real person mistyping
// their password, but slow enough to make guessing usernames impractical.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait a few minutes and try again." },
});

// Looser limit on signup — mainly to slow down someone scripting mass
// account creation, not a real person occasionally mistyping a field.
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many signup attempts from this connection. Please wait a few minutes." },
});

router.post("/signup", signupLimiter, asyncHandler(async (req, res) => {
  const { name, username, phone, password } = req.body;

  if (!name || !username || !phone || !password) {
    return res.status(400).json({ error: "name, username, phone, and password are required" });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }

  const user = await createUser({ name, username, phone, password });
  const token = await createAuthToken(user.id);
  res.status(201).json({ token, user });
}));

router.post("/login", loginLimiter, asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const row = await findUserByUsername(username);
  // Same error for "no such username" and "wrong password" — don't help
  // an attacker enumerate which usernames have accounts.
  if (!row || !row.password_hash || !(await verifyPassword(password, row.password_hash))) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = await createAuthToken(row.id);
  res.json({ token, user: toSafeUser(row) });
}));

router.post("/logout", requireAuth, asyncHandler(async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) await deleteAuthToken(token);
  res.status(204).end();
}));

// Called on app load to check whether a locally-stored token is still
// valid, and to rehydrate the user object without asking them to log in
// again every time they refresh the page.
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Self-service password change — requires the current password. (Admin
// has a separate no-old-password-needed reset in admin.routes.js.)
router.patch("/password", requireAuth, asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "oldPassword and newPassword are required" });
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ error: "New password must be at least 4 characters" });
  }
  await changePassword(req.user.id, oldPassword, newPassword);
  res.status(204).end();
}));

export default router;
