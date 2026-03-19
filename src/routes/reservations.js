const express = require("express");
const Reservation = require("../models/Reservation");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { guild, playerId } = req.body;
    if (!guild || !playerId) {
      return res
        .status(400)
        .json({ message: "guild and playerId are required" });
    }

    await Reservation.updateMany(
      { guild, active: true },
      { $set: { active: false } },
    );

    const reservation = await Reservation.create({
      guild,
      playerId,
      reservedAt: new Date(),
      active: true,
    });

    return res.status(201).json(reservation);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/active", async (_req, res) => {
  try {
    const rows = await Reservation.find({ active: true }).populate(
      "playerId",
      "displayName guild",
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
