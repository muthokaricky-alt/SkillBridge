// server/routes/profile.routes.js
import { Router } from "express";
import { profile, addProfileSkill, removeProfileSkill, adjustCoins } from "../db.js";

const router = Router();

// GET /api/profile — the signed-in user's offers, wants, coins, and coin history
router.get("/", (req, res) => {
  res.json(profile);
});

// POST /api/profile/skills — add a skill to "offers" or "wants"
// body: { type: "offer" | "want", value: "Python" }
router.post("/skills", (req, res) => {
  const { type, value } = req.body;

  if (!value || !["offer", "want"].includes(type)) {
    return res.status(400).json({ error: "type must be 'offer' or 'want', and value is required" });
  }

  const key = type === "offer" ? "offers" : "wants";
  const alreadyHasIt = profile[key].some((s) => s.toLowerCase() === value.toLowerCase());
  if (alreadyHasIt) {
    return res.status(409).json({ error: "Skill already in list" });
  }

  addProfileSkill(type, value);
  // teaching a skill earns a Skill Coin — wanting one doesn't
  if (type === "offer") adjustCoins(1, `Added skill: ${value}`);

  res.status(201).json(profile);
});

// DELETE /api/profile/skills/:type/:value — remove a skill
router.delete("/skills/:type/:value", (req, res) => {
  const { type, value } = req.params;
  if (!["offer", "want"].includes(type)) {
    return res.status(400).json({ error: "type must be 'offer' or 'want'" });
  }
  removeProfileSkill(type, decodeURIComponent(value));
  res.json(profile);
});

// PATCH /api/profile/coins — earn or spend Skill Coins
// body: { delta: number, reason: string }
router.patch("/coins", (req, res) => {
  const { delta, reason } = req.body;
  if (typeof delta !== "number") {
    return res.status(400).json({ error: "delta must be a number" });
  }
  adjustCoins(delta, reason);
  res.json(profile);
});

export default router;
