const express = require("express");
const cors = require("cors");

const playersRoutes = require("./routes/players");
const authRoutes = require("./routes/auth");
const meleyRoutes = require("./routes/meleys");
const reservationRoutes = require("./routes/reservations");
const statsRoutes = require("./routes/stats");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/players", playersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/meleys", meleyRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/stats", statsRoutes);

module.exports = app;
