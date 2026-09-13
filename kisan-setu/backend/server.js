import express from "express";
import cors from "cors";
import morgan from "morgan";
import bookingRoutes from "./routes/booking.js";
import weatherRoutes from "./routes/weather.js";
import transactionRoutes from "./routes/transactions.js";
import grievanceRoutes from "./routes/grievance.js";
import analyticsRoutes from "./routes/analytics.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.get("/api/health", (req, res) => res.json({ ok: true, service: "kisan-setu-backend" }));
app.use("/api", bookingRoutes);
app.use("/api", weatherRoutes);
app.use("/api", transactionRoutes);
app.use("/api", grievanceRoutes);
app.use("/api", analyticsRoutes);

// keep error shape consistent with the contract: always { error: "..." }
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Kisan Setu mock/real backend running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/centres`);
});
