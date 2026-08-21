<<<<<<< HEAD
import { Router } from "express";
import { getUsers, getUserById } from "../db.js";

const router = Router();

router.get("/", (req, res) => res.json(getUsers()));

router.get("/:id", (req, res) => {
  const user = getUserById(req.params.id);
=======
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
>>>>>>> 222be3cf76ee4a9544f389594999507f18fe9e2f
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

export default router;
