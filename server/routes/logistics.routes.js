// server/routes/logistics.routes.js
//
// The frontend calls these SkillBridge endpoints, and this file calls
// Maji Website on the frontend's behalf. Keeping the external call
// server-side means MAJI_API_KEY (once real) never has to touch the
// browser, and it gives us one place to add caching/retry logic later if
// Maji Website turns out to be slow or flaky.
//
// Updated after receiving Maji's real openapi.yaml — see the comment block
// at the top of server/services/majiClient.js for what changed and why.
// Notably: there is no per-estate "payment methods for checkout" endpoint
// in Maji's real contract (only a single customer's own saved method), so
// that route has been removed rather than left pointing at something that
// doesn't exist.

import { Router } from "express";
import {
  getStations,
  getEstates,
  getDelivery,
  createDelivery,
  registerDriverInterest,
} from "../services/majiClient.js";

const router = Router();

router.get("/stations", async (req, res, next) => {
  try {
    res.json(await getStations(req.query.estate));
  } catch (err) { next(err); }
});

// ?deliveryStatus=active|inactive, matches Maji's real /estates contract
router.get("/estates", async (req, res, next) => {
  try {
    res.json(await getEstates(req.query.deliveryStatus));
  } catch (err) { next(err); }
});

// These two correctly surface a 501 — Maji's real API has no delivery
// tracking capability at all (see CONTRACT_QUESTIONS.md Question 1).
// Kept rather than removed so the gap is visible in the running app
// instead of silently disappearing.
router.get("/deliveries/:id", async (req, res, next) => {
  try {
    res.json(await getDelivery(req.params.id));
  } catch (err) { next(err); }
});

router.post("/deliveries", async (req, res, next) => {
  try {
    res.status(201).json(await createDelivery());
  } catch (err) { next(err); }
});

// POST /logistics/estates/:estateId/driver-interests — not currently used
// by any SkillBridge UI, but wired up since it's a real Maji capability.
router.post("/estates/:estateId/driver-interests", async (req, res, next) => {
  try {
    res.status(201).json(await registerDriverInterest(req.params.estateId, req.body));
  } catch (err) { next(err); }
});

export default router;
