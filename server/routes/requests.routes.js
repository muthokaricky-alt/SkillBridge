// server/routes/requests.routes.js
import { Router } from "express";
import {
  getRequests,
  addRequest,
  updateRequestStatus,
  removeRequest,
  getUserByToken,
  getUserById,
} from "../db.js";
import { consultationHandler } from "./experts.routes.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// GET/PATCH/DELETE are all SkillBridge-internal actions (viewing your
// requests, accepting/declining) — these require a logged-in student.
router.get("/", requireAuth, asyncHandler(async (req, res) => {
  res.json(await getRequests());
}));

// POST is special: it serves TWO different callers with different auth
// needs, distinguished by shape (see below), so it can't use router.use()
// for auth like the other verbs — the consultation branch has to stay
// open since Farmers-AgroConnect has no SkillBridge account to log in with.
router.post("/", asyncHandler(async (req, res) => {
  // Farmers-AgroConnect's consultation-booking shape (see
  // API_NEEDS_DOWNSTREAM.md Needs Statement 4) is distinguished by having
  // an expertId field, which SkillBridge's own swap/coin requests never do.
  // Deliberately NOT behind requireAuth — AgroConnect is an external
  // partner service, not a logged-in SkillBridge student.
  if (req.body.expertId !== undefined) {
    return consultationHandler(req, res);
  }

  // Everything else is a SkillBridge student creating a swap/coin request,
  // which does require login — fromId is taken from the verified token,
  // never trusted from the request body, so nobody can spoof sending a
  // request "as" someone else.
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const user = token ? await getUserByToken(token) : null;
  if (!user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const { toId, offer, want, type, msg } = req.body;

  if (!msg || !want || !type) {
    return res.status(400).json({ error: "msg, want, and type are required" });
  }
  if (!["swap", "coin"].includes(type)) {
    return res.status(400).json({ error: "type must be 'swap' or 'coin' (use expertId for a consultation booking)" });
  }
  if (toId !== undefined && toId !== null && !(await getUserById(toId))) {
    return res.status(400).json({ error: "toId does not match any SkillBridge user" });
  }

  const newRequest = await addRequest({ fromId: user.id, toId, offer, want, type, msg });
  res.status(201).json(newRequest);
}));

router.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "status is required" });

  const updated = await updateRequestStatus(Number(req.params.id), status);
  if (!updated) return res.status(404).json({ error: "Request not found" });
  res.json(updated);
}));

router.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  await removeRequest(Number(req.params.id));
  res.status(204).end();
}));

export default router;
