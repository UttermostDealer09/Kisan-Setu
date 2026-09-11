import express from "express";
import { bookings, farmers, adjustmentReasons } from "../data/store.js";

const router = express.Router();

const BASELINE_RATES = { Wheat: 2400, Maize: 2050, Rice: 2183 };
const STATUS_ORDER = [
  "Slot Booked", "Arrived", "Weighed & Graded",
  "Bill Generated", "Payment Processed", "Amount Credited",
];

function advanceStatus(record, newStatus) {
  record.status = newStatus;
  record.history.push({ status: newStatus, at: new Date().toISOString() });
}

// ---- QR verify (buyer scans at the gate) ----
router.post("/qr/verify", (req, res) => {
  const { qrPayload } = req.body;
  if (!qrPayload) return res.status(400).json({ error: "qrPayload required" });

  const [, bookingId, farmerId] = qrPayload.split("|");
  const record = bookings.get(bookingId);
  if (!record) return res.json({ valid: false, error: "Unknown or invalid QR" });

  advanceStatus(record, "Arrived");
  const farmer = farmers.find((f) => f.id === farmerId);
  res.json({
    valid: true,
    bookingId,
    farmerName: farmer?.name ?? "Unknown Farmer",
    crop: record.crop,
    estWeightQtl: record.estWeightQtl,
    status: record.status,
  });
});

// ---- Baseline price ----
router.get("/pricing/baseline", (req, res) => {
  const { crop, grade } = req.query;
  const rate = BASELINE_RATES[crop];
  if (!rate) return res.status(404).json({ error: "No baseline rate for that crop" });
  res.json({ crop, grade, govRatePerQtl: rate });
});

router.get("/pricing/adjustment-reasons", (req, res) => {
  res.json(adjustmentReasons);
});

// ---- Submit grading (this is where the anomaly-flag rule lives) ----
router.post("/transactions/:bookingId/grade", (req, res) => {
  const { bookingId } = req.params;
  const { actualWeightQtl, grade, adjustmentReason, adjustedRatePerQtl, photoUrl } = req.body;
  const record = bookings.get(bookingId);
  if (!record) return res.status(404).json({ error: "Unknown booking" });

  const baseline = BASELINE_RATES[record.crop] ?? 0;
  const reasonDef = adjustmentReasons.find((r) => r.reason === adjustmentReason);
  let anomalyFlagged = false;

  if (reasonDef) {
    const pctChange = ((adjustedRatePerQtl - baseline) / baseline) * 100;
    if (pctChange < reasonDef.minPct || pctChange > reasonDef.maxPct) anomalyFlagged = true;
  } else {
    anomalyFlagged = true; // no valid reason on file = flag it, no silent free-typed price
  }

  record.actualWeightQtl = actualWeightQtl;
  record.grade = grade;
  record.finalRatePerQtl = adjustedRatePerQtl;
  record.photoUrl = photoUrl ?? null;
  record.billAmount = Math.round(actualWeightQtl * adjustedRatePerQtl);
  record.anomalyFlagged = anomalyFlagged;
  advanceStatus(record, "Weighed & Graded");

  res.json({
    bookingId,
    status: record.status,
    actualWeightQtl,
    grade,
    finalRatePerQtl: adjustedRatePerQtl,
    billAmount: record.billAmount,
    anomalyFlagged,
  });
});

// ---- Advance to next payment states (buyer/admin ops action, or a cron in real build) ----
router.post("/transactions/:bookingId/advance", (req, res) => {
  const { bookingId } = req.params;
  const record = bookings.get(bookingId);
  if (!record) return res.status(404).json({ error: "Unknown booking" });

  const idx = STATUS_ORDER.indexOf(record.status);
  if (idx === -1 || idx >= STATUS_ORDER.length - 1) {
    return res.status(400).json({ error: "Cannot advance further" });
  }
  advanceStatus(record, STATUS_ORDER[idx + 1]);
  res.json({ bookingId, status: record.status });
});

// ---- Payment status tracker ----
router.get("/transactions/:bookingId/status", (req, res) => {
  const { bookingId } = req.params;
  const record = bookings.get(bookingId);
  if (!record) return res.status(404).json({ error: "Unknown booking" });
  res.json({ bookingId, status: record.status, history: record.history });
});

export default router;
