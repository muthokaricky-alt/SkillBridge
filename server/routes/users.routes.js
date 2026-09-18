// server/routes/users.routes.js
import { Router } from "express";
import { getUsers, getUserById } from "../db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  res.json(await getUsers());
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}));

export default router;
