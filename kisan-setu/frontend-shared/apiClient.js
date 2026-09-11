// Every frontend (farmer app, buyer dashboard, village agent portal) imports
// this instead of calling fetch() directly. One place to change the base URL
// (e.g. localhost -> deployed staging URL) on Day 7 integration.

const BASE_URL = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  getCentres: () => request("/centres"),
  getAvailability: (centreId, date) => request(`/centres/${centreId}/availability?date=${date}`),
  createBooking: (payload) => request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  getNearbyCentres: (lat, lon, excludeCentreId) =>
    request(`/centres/nearby?lat=${lat}&lon=${lon}&excludeCentreId=${excludeCentreId}`),

  getWeatherRisk: (centreId, date) => request(`/weather-risk?centreId=${centreId}&date=${date}`),

  verifyQr: (qrPayload) => request("/qr/verify", { method: "POST", body: JSON.stringify({ qrPayload }) }),
  getBaselinePrice: (crop, grade) => request(`/pricing/baseline?crop=${crop}&grade=${grade}`),
  getAdjustmentReasons: () => request("/pricing/adjustment-reasons"),
  submitGrading: (bookingId, payload) =>
    request(`/transactions/${bookingId}/grade`, { method: "POST", body: JSON.stringify(payload) }),
  advanceStatus: (bookingId) => request(`/transactions/${bookingId}/advance`, { method: "POST" }),
  getStatus: (bookingId) => request(`/transactions/${bookingId}/status`),

  submitGrievance: (payload) => request("/grievances", { method: "POST", body: JSON.stringify(payload) }),
  getGrievances: (status) => request(`/grievances${status ? `?status=${status}` : ""}`),
  resolveGrievance: (id) => request(`/grievances/${id}/resolve`, { method: "POST" }),

  getAnomalies: (centreId) => request(`/anomalies?centreId=${centreId}`),
  getAnalyticsSummary: (centreId, date) => request(`/analytics/summary?centreId=${centreId}&date=${date}`),
  getFootfallForecast: (centreId, date) => request(`/forecast/footfall?centreId=${centreId}&date=${date}`),
};
