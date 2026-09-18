// server/routes/admin.routes.js
//
// Every route here requires requireAuth + requireAdmin — see
// server/middleware/auth.js. These let an admin see every user's full
// details, register new users, edit info on their behalf (including
// resetting a password), and delete accounts. Every action taken here
// (except plain viewing) is written to the audit log for accountability.

import { Router } from "express";
import {
  adminGetAllUsers,
  adminUpdateUser,
  adminDeleteUser,
  adminSetPassword,
  createUser,
  findUserByIdFull,
  logAdminAction,
  getAdminAuditLog,
} from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", asyncHandler(async (req, res) => {
  res.json(await adminGetAllUsers());
}));

router.get("/audit-log", asyncHandler(async (req, res) => {
  res.json(await getAdminAuditLog());
}));

// Admin-registered accounts reuse the same signup logic (so initials get
// auto-generated the same way, and the new user gets a normal starter
// profile) — the only difference is an admin can also set the role.
router.post("/users", asyncHandler(async (req, res) => {
  const { name, username, phone, password, role } = req.body;
  if (!name || !username || !phone || !password) {
    return res.status(400).json({ error: "name, username, phone, and password are required" });
  }
  let user = await createUser({ name, username, phone, password });
  if (role === "admin") {
    user = await adminUpdateUser(user.id, { role: "admin" });
  }
  await logAdminAction({
    adminId: req.user.id, adminUsername: req.user.username, action: "register_user",
    targetUserId: user.id, targetUsername: user.username,
    details: `Registered new ${role === "admin" ? "admin" : "user"} account`,
  });
  res.status(201).json(user);
}));

router.patch("/users/:id", asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.user.id && "role" in req.body && req.body.role !== "admin") {
    return res.status(400).json({ error: "You can't change your own role away from admin while logged in as it" });
  }

  const updated = await adminUpdateUser(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: "User not found" });

  const changedFields = Object.keys(req.body).join(", ");
  await logAdminAction({
    adminId: req.user.id, adminUsername: req.user.username, action: "edit_user",
    targetUserId: updated.id, targetUsername: updated.username,
    details: `Changed: ${changedFields}`,
  });
  res.json(updated);
}));

// Admin password reset — no old password needed, unlike the self-service
// PATCH /auth/password.
router.patch("/users/:id/password", asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: "newPassword must be at least 4 characters" });
  }
  const target = await findUserByIdFull(req.params.id);
  const ok = await adminSetPassword(Number(req.params.id), newPassword);
  if (!ok) return res.status(404).json({ error: "User not found" });

  await logAdminAction({
    adminId: req.user.id, adminUsername: req.user.username, action: "reset_password",
    targetUserId: Number(req.params.id), targetUsername: target?.username,
    details: "Password reset directly by admin (user must change it on next login)",
  });
  res.status(204).end();
}));

router.delete("/users/:id", asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: "You can't delete your own account while logged in as it" });
  }
  const target = await findUserByIdFull(req.params.id);
  const deleted = await adminDeleteUser(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: "User not found" });

  await logAdminAction({
    adminId: req.user.id, adminUsername: req.user.username, action: "delete_user",
    targetUserId: null, // the row is gone — target_username (plain text) is what survives
    targetUsername: target?.username,
    details: `Deleted account for ${target?.name || "unknown"}`,
  });
  res.status(204).end();
}));

export default router;
