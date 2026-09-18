// server/routes/sessions.routes.js
import { Router } from "express";
import { getSessions, addSession, markSessionReviewed } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  res.json(await getSessions());
}));

router.post("/", asyncHandler(async (req, res) => {
  const { with: withUser, skill, date, time, dur, color } = req.body;

  if (!withUser || !skill || !date || !time) {
    return res.status(400).json({ error: "with, skill, date, and time are required" });
  }
  if (dur !== undefined && (typeof dur !== "number" || dur <= 0)) {
    return res.status(400).json({ error: "dur must be a positive number of minutes" });
  }

  const newSession = await addSession({
    withUser,
    skill,
    date,
    time,
    dur,
    color,
  });

  res.status(201).json(newSession);
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  const updated = await markSessionReviewed(Number(req.params.id));
  if (!updated) return res.status(404).json({ error: "Session not found" });
  res.json(updated);
}));

export default router;
