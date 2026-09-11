import express from "express";
import fetch from "node-fetch";
import { centres } from "../data/store.js";

const router = express.Router();

function computeWeatherRisk(pop, rainVolumeMm, tempC) {
  if (pop >= 0.6 || rainVolumeMm >= 5) {
    return { level: "High", reason: "Heavy rain likely during your travel window — consider rescheduling or covering your harvest." };
  }
  if (pop >= 0.3 || rainVolumeMm > 0) {
    return { level: "Medium", reason: "Some chance of rain — travel with cover as a precaution." };
  }
  if (tempC >= 40) {
    return { level: "Medium", reason: "Extreme heat expected — travel early to avoid peak heat." };
  }
  return { level: "Low", reason: "Clear conditions expected — safe to travel." };
}

// Deterministic mock so the demo doesn't show different data every reload
// before B has an API key wired in.
function mockForecast(centreId, date) {
  const seed = [...`${centreId}${date}`].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const pop = (seed % 100) / 100;
  const rainVolumeMm = pop > 0.5 ? +(pop * 6).toFixed(1) : 0;
  const tempC = 24 + (seed % 15);
  return { pop, rainVolumeMm, tempC };
}

router.get("/weather-risk", async (req, res) => {
  const { centreId, date } = req.query;
  if (!centreId || !date) return res.status(400).json({ error: "centreId & date required" });
  const centre = centres.find((c) => c.id === centreId);
  if (!centre) return res.status(404).json({ error: "Unknown centre" });

  let pop, rainVolumeMm, tempC;

  if (process.env.OWM_API_KEY) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${centre.lat}&lon=${centre.lon}&appid=${process.env.OWM_API_KEY}&units=metric`;
      const r = await fetch(url);
      const data = await r.json();
      const target = new Date(date).getTime() / 1000;
      const block = data.list?.reduce((closest, b) => (
        Math.abs(b.dt - target) < Math.abs(closest.dt - target) ? b : closest
      ), data.list[0]);
      if (!block) return res.json({ centreId, date, level: "Unknown", reason: "Forecast not yet available — check back closer to your date." });
      pop = block.pop ?? 0;
      rainVolumeMm = block.rain?.["3h"] ?? 0;
      tempC = block.main.temp;
    } catch (e) {
      ({ pop, rainVolumeMm, tempC } = mockForecast(centreId, date)); // fall back rather than 500 during a demo
    }
  } else {
    ({ pop, rainVolumeMm, tempC } = mockForecast(centreId, date));
  }

  const { level, reason } = computeWeatherRisk(pop, rainVolumeMm, tempC);
  res.json({ centreId, date, level, reason, pop, rainVolumeMm, tempC: Math.round(tempC) });
});

export default router;
