// ---------------------------------------------------------------------------
// In-memory store standing in for the real DB today.
// A/C: when you wire real persistence, keep these exact function signatures
// so nobody else's route code has to change — swap the body, not the shape.
// ---------------------------------------------------------------------------

export const centres = [
  { id: "c1", name: "Khanna Procurement Centre", lat: 30.705, lon: 76.222, dailyCapacity: 120 },
  { id: "c2", name: "Samrala Procurement Centre", lat: 30.842, lon: 76.190, dailyCapacity: 90 },
  { id: "c3", name: "Payal Procurement Centre", lat: 30.663, lon: 76.183, dailyCapacity: 100 },
];

export const farmers = [
  { id: "f_101", name: "Gurpreet Kaur", phone: "9800000101", lat: 30.71, lon: 76.23 },
  { id: "f_102", name: "Sukhwinder Singh", phone: "9800000102", lat: 30.83, lon: 76.20 },
  { id: "f_103", name: "Harpreet Singh", phone: "9800000103", lat: 30.66, lon: 76.19 },
];

export const buyers = [
  { id: "b_01", name: "Buyer Counter 1", centreId: "c1" },
  { id: "b_04", name: "Buyer Counter 4", centreId: "c1" },
];

export const adjustmentReasons = [
  { reason: "Grade A — quality premium", minPct: 0, maxPct: 8 },
  { reason: "Grade B — standard", minPct: -3, maxPct: 3 },
  { reason: "Grade C — moisture damage", minPct: -15, maxPct: -5 },
];

// bookings keyed by bookingId
export const bookings = new Map();
// grievances keyed by grievanceId
export const grievances = new Map();
// per-centre-per-day booked count, e.g. bookingCounts["c1|2026-09-15"] = 84
export const bookingCounts = new Map();

export function capacityKey(centreId, date) {
  return `${centreId}|${date}`;
}

export function statusFromLoad(booked, capacity) {
  const ratio = booked / capacity;
  if (ratio >= 1) return "Red";
  if (ratio >= 0.75) return "Amber";
  return "Green";
}

// seed a bit of history so charts/analytics aren't empty on Day 1 demos
export function seedHistory() {
  const today = new Date();
  for (let i = 1; i <= 10; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    for (const c of centres) {
      const booked = Math.floor(c.dailyCapacity * (0.4 + Math.random() * 0.5));
      bookingCounts.set(capacityKey(c.id, date), booked);
    }
  }
}
seedHistory();
