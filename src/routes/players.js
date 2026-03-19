const express = require("express");
const Player = require("../models/Player");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, guild } = req.body;
    if (!name || !guild) {
      return res.status(400).json({ message: "name and guild are required" });
    }

    const normalized = name.trim().toLowerCase();
    const displayName = name.trim();

    const exists = await Player.findOne({ name: normalized });
    if (exists) {
      return res.status(409).json({ message: "Player already exists" });
    }

    const player = await Player.create({
      name: normalized,
      displayName,
      guild,
    });
    return res.status(201).json(player);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const players = await Player.find().sort({ displayName: 1 });
    return res.json(players);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
