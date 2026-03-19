const express = require("express");
const MeleyRun = require("../models/MeleyRun");
const Reservation = require("../models/Reservation");

const router = express.Router();

function validateRunPayload(guild, playerIds, registeredByPlayerId) {
  if (
    !guild ||
    !Array.isArray(playerIds) ||
    playerIds.length < 1 ||
    playerIds.length > 2 ||
    !registeredByPlayerId
  ) {
    return "guild, playerIds(1-2), registeredByPlayerId are required";
  }

  if (playerIds.length === 2 && String(playerIds[0]) === String(playerIds[1])) {
    return "Duo players must be different";
  }

  return null;
}

router.post("/register", async (req, res) => {
  try {
    const { guild, playerIds, registeredByPlayerId } = req.body;

    const validationError = validateRunPayload(
      guild,
      playerIds,
      registeredByPlayerId,
    );
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const run = await MeleyRun.create({
      guild,
      playerIds,
      registeredByPlayerId,
      runAt: new Date(),
      isLate: false,
    });

    await Reservation.updateMany(
      { guild, active: true },
      { $set: { active: false } },
    );

    return res.status(201).json(run);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/register-late", async (req, res) => {
  try {
    const { guild, playerIds, registeredByPlayerId, runAt } = req.body;

    const validationError = validateRunPayload(
      guild,
      playerIds,
      registeredByPlayerId,
    );
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const runDate = new Date(runAt);
    if (!runAt || Number.isNaN(runDate.getTime())) {
      return res
        .status(400)
        .json({ message: "runAt is required and must be a valid date" });
    }

    const run = await MeleyRun.create({
      guild,
      playerIds,
      registeredByPlayerId,
      runAt: runDate,
      isLate: true,
    });

    await Reservation.updateMany(
      { guild, active: true },
      { $set: { active: false } },
    );

    return res.status(201).json(run);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/next", async (_req, res) => {
  try {
    const guilds = ["Faustos", "Mambodoquest"];
    const result = [];

    for (const guild of guilds) {
      const lastRun = await MeleyRun.findOne({ guild }).sort({ runAt: -1 });
      const lastRunAt = lastRun ? lastRun.runAt : null;
      const nextMeleyAt = lastRunAt
        ? new Date(new Date(lastRunAt).getTime() + 3 * 60 * 60 * 1000)
        : null;

      result.push({ guild, lastRunAt, nextMeleyAt });
    }

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
