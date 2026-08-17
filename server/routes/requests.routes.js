// server/routes/requests.routes.js
import { Router } from "express";
import { requests, addRequest, updateRequestStatus, removeRequest, getNextRequestId } from "../db.js";

const router = Router();

// GET /api/requests — every request (incoming / sent / accepted)
router.get("/", (req, res) => {
  res.json(requests);
});

// POST /api/requests — create a new exchange request
router.post("/", (req, res) => {
  const { fromId, toId, offer, want, type, msg } = req.body;

  if (!msg || !want || !type) {
    return res.status(400).json({ error: "msg, want, and type are required" });
  }

  const newRequest = {
    id: getNextRequestId(),
    fromId,
    toId: toId ?? fromId,
    offer: offer ?? null,
    want,
    type,
    msg,
    time: "Just now",
    status: "sent",
  };

  addRequest(newRequest);
  res.status(201).json(newRequest);
});

// PATCH /api/requests/:id — update status (e.g. "accepted")
router.patch("/:id", (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "status is required" });

  const updated = updateRequestStatus(Number(req.params.id), status);
  if (!updated) return res.status(404).json({ error: "Request not found" });
  res.json(updated);
});

// DELETE /api/requests/:id — decline / remove a request
router.delete("/:id", (req, res) => {
  removeRequest(Number(req.params.id));
  res.status(204).end();
});

export default router;
