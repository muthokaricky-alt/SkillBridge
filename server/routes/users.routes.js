import { Router } from "express";
import { getUsers, getUserById } from "../db.js";

const router = Router();

router.get("/", (req, res) => res.json(getUsers()));

router.get("/:id", (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

export default router;
