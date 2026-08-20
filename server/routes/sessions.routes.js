import { Router } from "express";
import {
  getSessions,
  addSession,
  markSessionReviewed,
} from "../db.js";

const router = Router();

router.get("/", (req, res) => res.json(getSessions()));

router.post("/", (req, res) => {
  const { with: withUser, skill, date, time, dur, color } = req.body;

  if (!withUser || !skill || !date || !time) {
    return res.status(400).json({ error: "with, skill, date, and time are required" });
  }

  const newSession = addSession({
    withUser,
    skill,
    date,
    time,
    dur,
    color,
  });

  res.status(201).json(newSession);
});

router.patch("/:id", (req, res) => {
  const updated = markSessionReviewed(Number(req.params.id));
  if (!updated) return res.status(404).json({ error: "Session not found" });
  res.json(updated);
});

export default router;
