import { Router } from "express";
import {
  getProfile,
  addProfileSkill,
  removeProfileSkill,
  adjustCoins,
} from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(getProfile());
});

router.post("/skills", (req, res) => {
  const { type, value } = req.body;

  if (!value || !["offer", "want"].includes(type)) {
    return res.status(400).json({
      error: "type must be 'offer' or 'want', and value is required",
    });
  }

  const profile = getProfile();
  const key = type === "offer" ? "offers" : "wants";
  if (profile[key].some(s => s.toLowerCase() === value.toLowerCase())) {
    return res.status(409).json({ error: "Skill already in list" });
  }

  addProfileSkill(type, value);

  if (type === "offer") {
    adjustCoins(1, `Added skill: ${value}`);
  }

  res.status(201).json(getProfile());
});

router.delete("/skills/:type/:value", (req, res) => {
  const { type, value } = req.params;
  if (!["offer", "want"].includes(type)) {
    return res.status(400).json({ error: "type must be 'offer' or 'want'" });
  }

  removeProfileSkill(type, decodeURIComponent(value));
  res.json(getProfile());
});

router.patch("/coins", (req, res) => {
  const { delta, reason } = req.body;
  if (typeof delta !== "number") {
    return res.status(400).json({ error: "delta must be a number" });
  }

  adjustCoins(delta, reason);
  res.json(getProfile());
});

export default router;
