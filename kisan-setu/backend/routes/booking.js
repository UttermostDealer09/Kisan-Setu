import express from "express";
import { nanoid } from "nanoid";
import {
  centres, bookings, bookingCounts, capacityKey, statusFromLoad,
} from "../data/store.js";

const router = express.Router();

router.get("/centres", (req, res) => {
  res.json(centres);
});

router.get("/centres/:centreId/availability", (req, res) => {
  const { centreId } = req.params;
  const { date } = req.query;
  const centre = centres.find((c) => c.id === centreId);
  if (!centre) return res.status(404).json({ error: "Unknown centre" });
  if (!date) return res.status(400).json({ error: "date query param required (YYYY-MM-DD)" });

  const booked = bookingCounts.get(capacityKey(centreId, date)) || 0;
  res.json({
    centreId,
    date,
    capacity: centre.dailyCapacity,
    booked,
    status: statusFromLoad(booked, centre.dailyCapacity),
  });
});

router.post("/bookings", (req, res) => {
  const { farmerId, centreId, date, crop, estWeightQtl } = req.body;
  if (!farmerId || !centreId || !date || !crop) {
    return res.status(400).json({ error: "farmerId, centreId, date, crop are required" });
  }
  const centre = centres.find((c) => c.id === centreId);
  if (!centre) return res.status(404).json({ error: "Unknown centre" });

  const key = capacityKey(centreId, date);
  const booked = bookingCounts.get(key) || 0;

  // ---- THIS is the capacity-lock check. Real version: wrap in a DB
  // transaction so two simultaneous requests can't both succeed. ----
  if (booked >= centre.dailyCapacity) {
    return res.status(409).json({ error: "This day is already fully booked (Red)" });
  }
  bookingCounts.set(key, booked + 1);

  const bookingId = `bk_${nanoid(6)}`;
  const qrPayload = `KSETU|${bookingId}|${farmerId}|${centreId}|${date}`;
  const record = {
    bookingId, farmerId, centreId, date, crop,
    estWeightQtl: estWeightQtl ?? null,
    status: "Slot Booked",
    qrPayload,
    history: [{ status: "Slot Booked", at: new Date().toISOString() }],
  };
  bookings.set(bookingId, record);
  res.status(201).json(record);
});

router.get("/centres/nearby", (req, res) => {
  const { lat, lon, excludeCentreId } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat & lon required" });

  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const today = new Date().toISOString().slice(0, 10);
  const results = centres
    .filter((c) => c.id !== excludeCentreId)
    .map((c) => {
      const booked = bookingCounts.get(capacityKey(c.id, today)) || 0;
      return {
        id: c.id,
        name: c.name,
        distanceKm: Math.round(haversineKm(+lat, +lon, c.lat, c.lon) * 10) / 10,
        status: statusFromLoad(booked, c.dailyCapacity),
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json(results);
});

export default router;
