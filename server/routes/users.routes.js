// server/routes/users.routes.js
import { Router } from "express";
import { users } from "../db.js";

const router = Router();

// GET /api/users — every student on the platform (for Discover, Requests, Schedule)
router.get("/", (req, res) => {
  res.json(users);
});

// GET /api/users/:id — a single student
router.get("/:id", (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

export default router;
