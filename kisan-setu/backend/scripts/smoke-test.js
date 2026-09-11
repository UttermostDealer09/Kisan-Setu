// Run with: node scripts/smoke-test.js
// Hits every endpoint in API_CONTRACT.md against a running server and checks
// the response shape looks right. This is what F runs before every merge —
// not a full test suite, just "did I just break someone else's module."

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:4000/api";
let failures = 0;

function check(label, condition) {
  if (condition) {
    console.log(`  ✅ ${label}`);
  } else {
    console.log(`  ❌ ${label}`);
    failures++;
  }
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, body: await res.json() };
}
async function post(path, payload) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await res.json() };
}

async function run() {
  console.log(`\nSmoke-testing ${BASE}\n`);

  // 1. Health + centres
  console.log("Health & centres:");
  const health = await get("/health");
  check("GET /health -> ok:true", health.body.ok === true);

  const centres = await get("/centres");
  check("GET /centres -> non-empty array", Array.isArray(centres.body) && centres.body.length > 0);
  const centreId = centres.body[0]?.id;

  // 2. Availability + booking
  console.log("\nBooking flow:");
  const today = new Date().toISOString().slice(0, 10);
  const avail = await get(`/centres/${centreId}/availability?date=${today}`);
  check("GET availability -> has status field", ["Green", "Amber", "Red"].includes(avail.body.status));

  const booking = await post("/bookings", {
    farmerId: "f_101", centreId, date: today, crop: "Wheat", estWeightQtl: 40,
  });
  check("POST /bookings -> 201 + bookingId + qrPayload", booking.status === 201 && !!booking.body.bookingId && !!booking.body.qrPayload);
  const bookingId = booking.body.bookingId;
  const qrPayload = booking.body.qrPayload;

  const nearby = await get(`/centres/nearby?lat=30.7&lon=76.2&excludeCentreId=${centreId}`);
  check("GET nearby centres -> array with distanceKm", Array.isArray(nearby.body) && nearby.body[0]?.distanceKm !== undefined);

  // 3. Weather
  console.log("\nWeather:");
  const weather = await get(`/weather-risk?centreId=${centreId}&date=${today}`);
  check("GET weather-risk -> valid level", ["Low", "Medium", "High", "Unknown"].includes(weather.body.level));

  // 4. QR verify
  console.log("\nQR + grading:");
  const qr = await post("/qr/verify", { qrPayload });
  check("POST qr/verify -> valid:true + status Arrived", qr.body.valid === true && qr.body.status === "Arrived");

  const baseline = await get("/pricing/baseline?crop=Wheat&grade=A");
  check("GET pricing/baseline -> govRatePerQtl present", typeof baseline.body.govRatePerQtl === "number");

  const reasons = await get("/pricing/adjustment-reasons");
  check("GET adjustment-reasons -> non-empty array", Array.isArray(reasons.body) && reasons.body.length > 0);

  const grading = await post(`/transactions/${bookingId}/grade`, {
    actualWeightQtl: 39.5, grade: "A",
    adjustmentReason: reasons.body[0].reason,
    adjustedRatePerQtl: baseline.body.govRatePerQtl,
    photoUrl: "https://example.com/photo.jpg",
  });
  check("POST grade -> status Weighed & Graded + billAmount", grading.body.status === "Weighed & Graded" && typeof grading.body.billAmount === "number");

  // 5. Payment status
  console.log("\nPayment tracker:");
  const status = await get(`/transactions/${bookingId}/status`);
  check("GET status -> history array grows correctly", status.body.history.length >= 3);

  // 6. Grievance
  console.log("\nGrievance:");
  const grievance = await post("/grievances", {
    bookingId, farmerId: "f_101", reason: "Weight disputed", photoUrl: "https://example.com/evidence.jpg",
  });
  check("POST grievances -> 201 + Open status", grievance.status === 201 && grievance.body.status === "Open");

  const openGrievances = await get("/grievances?status=Open");
  check("GET grievances?status=Open -> includes new one", openGrievances.body.some((g) => g.grievanceId === grievance.body.grievanceId));

  // 7. Anomalies, analytics, forecast
  console.log("\nAnalytics:");
  const anomalies = await get(`/anomalies?centreId=${centreId}`);
  check("GET anomalies -> array", Array.isArray(anomalies.body));

  const summary = await get(`/analytics/summary?centreId=${centreId}&date=${today}`);
  check("GET analytics/summary -> has gradeSplit", !!summary.body.gradeSplit);

  const forecast = await get(`/forecast/footfall?centreId=${centreId}&date=${today}`);
  check("GET forecast/footfall -> has basis field", forecast.body.basis === "7-day moving average");

  console.log(`\n${failures === 0 ? "✅ All checks passed." : `❌ ${failures} check(s) failed.`}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

run().catch((e) => {
  console.error("\n❌ Smoke test crashed — is the server running? (npm run dev)\n", e.message);
  process.exit(1);
});
