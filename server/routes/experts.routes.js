// server/routes/experts.routes.js
//
// Downstream API — SkillBridge is the PROVIDER here, and Farmers-AgroConnect
// is the CONSUMER. These routes implement the exact contract documented in
// src/documentation/API_NEEDS_DOWNSTREAM.md and ENDPOINT_LIST.md ("Downstream
// API Endpoints — Provided by SkillBridge for Farmers-AgroConnect"). Anyone
// on AgroConnect's team can call these directly once this server is
// reachable from their side — no SkillBridge-specific auth is wired up yet
// since that was flagged as a later concern in the needs doc (Bearer token /
// OAuth), so treat these as open reads / writes for now.

import { Router } from "express";
import {
  getExperts,
  getExpertById,
  getExpertAvailability,
  getExpertReviews,
  addConsultationRequest,
} from "../db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// GET /api/experts?estate={estate}&sort={rating|proximity}&lat=&lng=
router.get("/", asyncHandler(async (req, res) => {
  const { estate, sort, lat, lng } = req.query;
  res.json(await getExperts({ estate, sort, lat, lng }));
}));

// GET /api/experts/:id
router.get("/:id", asyncHandler(async (req, res) => {
  const expert = await getExpertById(req.params.id);
  if (!expert) return res.status(404).json({ error: "Expert not found" });
  res.json(expert);
}));

// GET /api/experts/:id/availability
router.get("/:id/availability", asyncHandler(async (req, res) => {
  const availability = await getExpertAvailability(req.params.id);
  if (!availability) return res.status(404).json({ error: "Expert not found" });
  res.json(availability);
}));

// GET /api/experts/:id/reviews
router.get("/:id/reviews", asyncHandler(async (req, res) => {
  const reviews = await getExpertReviews(req.params.id);
  if (!reviews) return res.status(404).json({ error: "Expert not found" });
  res.json(reviews);
}));

export default router;

// POST /api/requests (consultation booking) is handled in requests.routes.js
// so both request types share one table/status flow — see the "consult"
// type branch there. Wrapped in asyncHandler where it's actually mounted
// (requests.routes.js), since it's async now.
export const consultationHandler = async (req, res) => {
  const { farmerName, topic, expertId, date } = req.body;
  if (!farmerName || !topic || !expertId || !date) {
    return res.status(400).json({ error: "farmerName, topic, expertId, and date are required" });
  }
  if (!(await getExpertById(expertId))) {
    return res.status(404).json({ error: "expertId does not match any SkillBridge user" });
  }
  const newRequest = await addConsultationRequest({ farmerName, topic, expertId, date });
  res.status(201).json(newRequest);
};
