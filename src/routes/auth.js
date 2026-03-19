const express = require("express");
const Player = require("../models/Player");
const Session = require("../models/Session");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { name, machineId } = req.body;
    if (!name || !machineId) {
      return res
        .status(400)
        .json({ message: "name and machineId are required" });
    }

    const normalized = name.trim().toLowerCase();
    const player = await Player.findOne({ name: normalized });
    if (!player) {
      return res
        .status(404)
        .json({ message: "Player not found. Create player first." });
    }

    const session = await Session.findOneAndUpdate(
      { playerId: player._id, machineId },
      { $set: { isActive: true, lastSeenAt: new Date() } },
      { returnDocument: "after", upsert: true },
    );

    return res.json({ player, session });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/heartbeat", async (req, res) => {
  try {
    const { playerId, machineId } = req.body;
    if (!playerId || !machineId) {
      return res
        .status(400)
        .json({ message: "playerId and machineId are required" });
    }

    await Session.findOneAndUpdate(
      { playerId, machineId },
      { $set: { lastSeenAt: new Date(), isActive: true } },
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
