# Kisan Setu — API Contract (FROZEN Day 1)

Base URL (local dev): `http://localhost:4000/api`

**Rule:** this file is the single source of truth. If a shape needs to change after
today, that's a whole-team conversation in the group chat — not a silent edit by
whoever's touching that route. Every endpoint below is already implemented as a
**live mock server** (see `/backend`) — point your frontend at it today.

---

## 1. Centres

`GET /api/centres`

```json
[
  { "id": "c1", "name": "Khanna Procurement Centre", "lat": 30.705, "lon": 76.222, "dailyCapacity": 120 },
  { "id": "c2", "name": "Samrala Procurement Centre", "lat": 30.842, "lon": 76.190, "dailyCapacity": 90 }
]
```

## 2. Booking

### Check availability
`GET /api/centres/:centreId/availability?date=YYYY-MM-DD`

```json
{ "centreId": "c1", "date": "2026-09-15", "capacity": 120, "booked": 84, "status": "Amber" }
```
`status` is always one of: `"Green" | "Amber" | "Red"` — derived server-side from `booked/capacity`, never trust a client-computed value.

### Create booking
`POST /api/bookings`
```json
// request
{ "farmerId": "f_101", "centreId": "c1", "date": "2026-09-15", "crop": "Wheat", "estWeightQtl": 42.5 }
```
```json
// response 201
{
  "bookingId": "bk_8f21",
  "farmerId": "f_101",
  "centreId": "c1",
  "date": "2026-09-15",
  "crop": "Wheat",
  "estWeightQtl": 42.5,
  "status": "Slot Booked",
  "qrPayload": "KSETU|bk_8f21|f_101|c1|2026-09-15"
}
```
`409` if that day is already `"Red"` for the centre — capacity lock happens server-side, never client-side.

## 3. Weather Risk

`GET /api/weather-risk?centreId=c1&date=2026-09-15`

```json
{
  "centreId": "c1",
  "date": "2026-09-15",
  "level": "Medium",
  "reason": "Some chance of rain — travel with cover as a precaution.",
  "pop": 0.35,
  "rainVolumeMm": 1.2,
  "tempC": 29
}
```
`level` is always `"Low" | "Medium" | "High" | "Unknown"`.

## 4. Nearby Centre Suggestion

`GET /api/centres/nearby?lat=30.7&lon=76.2&excludeCentreId=c1`

```json
[{ "id": "c2", "name": "Samrala Procurement Centre", "distanceKm": 15.4, "status": "Green" }]
```

## 5. QR Gate Check-in

### Verify (buyer scans)
`POST /api/qr/verify`
```json
// request
{ "qrPayload": "KSETU|bk_8f21|f_101|c1|2026-09-15" }
```
```json
// response
{
  "valid": true,
  "bookingId": "bk_8f21",
  "farmerName": "Gurpreet Kaur",
  "crop": "Wheat",
  "estWeightQtl": 42.5,
  "status": "Arrived"
}
```
This also flips the booking's status server-side to `"Arrived"` — that's what powers the payment tracker below.

## 6. Weighing & Grading (Buyer Dashboard)

### Get baseline price
`GET /api/pricing/baseline?crop=Wheat&grade=A`
```json
{ "crop": "Wheat", "grade": "A", "govRatePerQtl": 2400 }
```

### Submit grading
`POST /api/transactions/:bookingId/grade`
```json
// request
{
  "actualWeightQtl": 41.8,
  "grade": "A",
  "adjustmentReason": "Grade A — quality premium",
  "adjustedRatePerQtl": 2480,
  "photoUrl": "https://.../photo123.jpg"
}
```
```json
// response
{
  "bookingId": "bk_8f21",
  "status": "Weighed & Graded",
  "actualWeightQtl": 41.8,
  "grade": "A",
  "finalRatePerQtl": 2480,
  "billAmount": 103664,
  "anomalyFlagged": false
}
```
`adjustmentReason` MUST be one of a fixed enum (see `pricing/adjustment-reasons`) — each reason has a server-side capped range. If `adjustedRatePerQtl` falls outside that reason's cap, `anomalyFlagged: true` is returned and it's auto-queued for review — the buyer never types a free-form price.

`GET /api/pricing/adjustment-reasons` →
```json
[
  { "reason": "Grade A — quality premium", "minPct": 0, "maxPct": 8 },
  { "reason": "Grade C — moisture damage", "minPct": -15, "maxPct": -5 }
]
```

## 7. Payment Status Tracker

`GET /api/transactions/:bookingId/status`
```json
{
  "bookingId": "bk_8f21",
  "status": "Weighed & Graded",
  "history": [
    { "status": "Slot Booked", "at": "2026-09-10T08:00:00Z" },
    { "status": "Arrived", "at": "2026-09-15T07:12:00Z" },
    { "status": "Weighed & Graded", "at": "2026-09-15T07:40:00Z" }
  ]
}
```
`status` is always one of, in order:
`"Slot Booked" → "Arrived" → "Weighed & Graded" → "Bill Generated" → "Payment Processed" → "Amount Credited"`
Never skip a state. Every module reads/writes this exact string set.

## 8. Grievance

`POST /api/grievances`
```json
// request
{ "bookingId": "bk_8f21", "farmerId": "f_101", "reason": "Weight disputed", "photoUrl": "https://.../evidence.jpg" }
```
```json
// response 201
{ "grievanceId": "gr_552", "bookingId": "bk_8f21", "status": "Open", "loggedAt": "2026-09-15T07:45:00Z" }
```

`GET /api/grievances?status=Open` → list for officer review dashboard.

## 9. Anomaly Flags (Buyer behaviour)

`GET /api/anomalies?centreId=c1&date=2026-09-15`
```json
[
  { "buyerId": "b_04", "metric": "avgTimePerFarmerSec", "value": 38, "centreAvg": 95, "flagged": true }
]
```

## 10. Admin Analytics

`GET /api/analytics/summary?centreId=c1&date=2026-09-15`
```json
{
  "centreId": "c1",
  "date": "2026-09-15",
  "footfall": 84,
  "avgWaitMinutes": 47,
  "gradeSplit": { "A": 40, "B": 32, "C": 12 }
}
```

## 11. Demand Forecast

`GET /api/forecast/footfall?centreId=c1&date=2026-09-16`
```json
{ "centreId": "c1", "date": "2026-09-16", "predictedFootfall": 91, "basis": "7-day moving average" }
```

---

## Non-negotiable shared conventions
- All dates: `YYYY-MM-DD`. All timestamps: ISO 8601 UTC.
- All IDs are strings, prefixed by type (`bk_`, `f_`, `c_`, `gr_`, `b_`).
- Every error response: `{ "error": "human-readable message" }` with a proper HTTP status code — no silent `200` on failure.
- Money is always in ₹ per quintal, integer paise-free (whole rupees is fine for a demo).
