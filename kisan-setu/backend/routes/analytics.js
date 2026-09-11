import express from "express";
import { buyers, bookingCounts, capacityKey } from "../data/store.js";

const router = express.Router();

// Simple threshold check against seeded/demo buyer stats — no ML, fully explainable.
router.get("/anomalies", (req, res) => {
  const { centreId } = req.query;
  const centreBuyers = buyers.filter((b) => b.centreId === centreId);
  // demo-friendly fake per-buyer stats; A/C wire real aggregation off transaction history later
  const stats = centreBuyers.map((b, i) => ({
    buyerId: b.id,
    metric: "avgTimePerFarmerSec",
    value: i === 1 ? 38 : 90 + i * 5, // deliberately makes one buyer look anomalously fast for demo
  }));
  const centreAvg = Math.round(stats.reduce((s, x) => s + x.value, 0) / stats.length);
  res.json(stats.map((s) => ({
    ...s,
    centreAvg,
    flagged: Math.abs(s.value - centreAvg) / centreAvg > 0.4,
  })));
});

router.get("/analytics/summary", (req, res) => {
  const { centreId, date } = req.query;
  const booked = bookingCounts.get(capacityKey(centreId, date)) || 0;
  res.json({
    centreId,
    date,
    footfall: booked,
    avgWaitMinutes: 30 + Math.round(Math.random() * 40),
    gradeSplit: { A: Math.round(booked * 0.45), B: Math.round(booked * 0.35), C: Math.round(booked * 0.2) },
  });
});

router.get("/forecast/footfall", (req, res) => {
  const { centreId, date } = req.query;
  // moving average over the last 7 seeded days for this centre
  const d = new Date(date);
  let total = 0, n = 0;
  for (let i = 1; i <= 7; i++) {
    const day = new Date(d);
    day.setDate(day.getDate() - i);
    const key = capacityKey(centreId, day.toISOString().slice(0, 10));
    if (bookingCounts.has(key)) { total += bookingCounts.get(key); n++; }
  }
  const predictedFootfall = n ? Math.round(total / n) : null;
  res.json({ centreId, date, predictedFootfall, basis: "7-day moving average" });
});

export default router;
