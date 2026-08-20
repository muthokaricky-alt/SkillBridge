import { Router } from "express";
import {
  getRequests,
  addRequest,
  updateRequestStatus,
  removeRequest,
} from "../db.js";

const router = Router();

router.get("/", (req, res) => res.json(getRequests()));

router.post("/", (req, res) => {
  const { fromId, toId, offer, want, type, msg } = req.body;

  if (!msg || !want || !type) {
    return res.status(400).json({ error: "msg, want, and type are required" });
  }

  const newRequest = addRequest({ fromId, toId, offer, want, type, msg });
  res.status(201).json(newRequest);
});

router.patch("/:id", (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "status is required" });

  const updated = updateRequestStatus(Number(req.params.id), status);
  if (!updated) return res.status(404).json({ error: "Request not found" });
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  removeRequest(Number(req.params.id));
  res.status(204).end();
});

export default router;
