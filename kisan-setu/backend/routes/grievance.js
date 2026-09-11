import express from "express";
import { nanoid } from "nanoid";
import { grievances } from "../data/store.js";

const router = express.Router();

router.post("/grievances", (req, res) => {
  const { bookingId, farmerId, reason, photoUrl } = req.body;
  if (!bookingId || !farmerId || !reason) {
    return res.status(400).json({ error: "bookingId, farmerId, reason are required" });
  }
  const grievanceId = `gr_${nanoid(6)}`;
  const record = {
    grievanceId, bookingId, farmerId, reason, photoUrl: photoUrl ?? null,
    status: "Open", loggedAt: new Date().toISOString(),
  };
  grievances.set(grievanceId, record);
  res.status(201).json(record);
});

router.get("/grievances", (req, res) => {
  const { status } = req.query;
  const all = [...grievances.values()];
  res.json(status ? all.filter((g) => g.status === status) : all);
});

router.post("/grievances/:grievanceId/resolve", (req, res) => {
  const { grievanceId } = req.params;
  const record = grievances.get(grievanceId);
  if (!record) return res.status(404).json({ error: "Unknown grievance" });
  record.status = "Resolved";
  record.resolvedAt = new Date().toISOString();
  res.json(record);
});

export default router;
