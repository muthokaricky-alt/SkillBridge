// server/routes/sessions.routes.js
import { Router } from "express";
import { sessions, addSession, markSessionReviewed, getNextSessionId } from "../db.js";

const router = Router();

// GET /api/sessions — every booked session
router.get("/", (req, res) => {
  res.json(sessions);
});

// POST /api/sessions — book a new session
router.post("/", (req, res) => {
  // "with" is a reserved word in JS, so it's renamed on destructure
  const { with: withUser, skill, date, time, dur, color } = req.body;

  if (!withUser || !skill || !date || !time) {
    return res.status(400).json({ error: "with, skill, date, and time are required" });
  }

  const newSession = {
    id: getNextSessionId(),
    with: withUser,
    skill,
    date,
    time,
    dur: dur || 60,
    color: color || "#10B981",
    reviewed: false,
  };

  addSession(newSession);
  res.status(201).json(newSession);
});

// PATCH /api/sessions/:id — mark a session as reviewed
router.patch("/:id", (req, res) => {
  const updated = markSessionReviewed(Number(req.params.id));
  if (!updated) return res.status(404).json({ error: "Session not found" });
  res.json(updated);
});

export default router;
