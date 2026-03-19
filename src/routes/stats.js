const express = require("express");
const MeleyRun = require("../models/MeleyRun");
const Player = require("../models/Player");
const { getPeriodStart } = require("../utils/dateRange");

const router = express.Router();

router.get("/players", async (req, res) => {
  try {
    const period = req.query.period || "all";
    const start = getPeriodStart(period);
    const matchStage = start ? { runAt: { $gte: start } } : {};

    const counts = await MeleyRun.aggregate([
      { $match: matchStage },
      { $unwind: "$playerIds" },
      {
        $group: {
          _id: "$playerIds",
          meleyCount: { $sum: 1 },
        },
      },
    ]);

    const playerIds = counts.map((row) => row._id).filter(Boolean);
    const players = await Player.find({ _id: { $in: playerIds } }).select(
      "displayName guild",
    );

    const playerMap = new Map(
      players.map((player) => [String(player._id), player]),
    );

    const rows = counts
      .map((row) => {
        const player = playerMap.get(String(row._id));
        if (!player) {
          return null;
        }

        return {
          playerId: row._id,
          displayName: player.displayName,
          guild: player.guild,
          meleyCount: row.meleyCount,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.meleyCount - a.meleyCount);

    return res.json({ period, rows });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/history", async (req, res) => {
  try {
    const allowedGroups = ["day", "week", "month", "year"];
    const groupBy = allowedGroups.includes(req.query.groupBy)
      ? req.query.groupBy
      : "day";
    const guild = req.query.guild;
    const from = req.query.from;
    const to = req.query.to;

    const match = {};
    if (guild) {
      match.guild = guild;
    }

    if (from || to) {
      match.runAt = {};

      if (from) {
        const fromDate = new Date(from);
        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({ message: "Invalid from date" });
        }
        match.runAt.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({ message: "Invalid to date" });
        }
        match.runAt.$lte = toDate;
      }
    }

    let dateFormat = "%Y-%m-%d";
    if (groupBy === "month") {
      dateFormat = "%Y-%m";
    }
    if (groupBy === "year") {
      dateFormat = "%Y";
    }

    if (groupBy === "week") {
      const rows = await MeleyRun.aggregate([
        { $match: match },
        { $unwind: "$playerIds" },
        {
          $group: {
            _id: {
              playerId: "$playerIds",
              year: { $isoWeekYear: "$runAt" },
              week: { $isoWeek: "$runAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            playerId: "$_id.playerId",
            bucket: {
              $concat: [
                { $toString: "$_id.year" },
                "-W",
                {
                  $cond: [
                    { $lt: ["$_id.week", 10] },
                    { $concat: ["0", { $toString: "$_id.week" }] },
                    { $toString: "$_id.week" },
                  ],
                },
              ],
            },
            count: 1,
          },
        },
      ]);

      const ids = rows.map((row) => row.playerId);
      const players = await Player.find({ _id: { $in: ids } }).select(
        "displayName guild",
      );
      const playerMap = new Map(
        players.map((player) => [String(player._id), player]),
      );

      const enriched = rows
        .map((row) => {
          const player = playerMap.get(String(row.playerId));
          if (!player) {
            return null;
          }
          return {
            bucket: row.bucket,
            playerId: row.playerId,
            displayName: player.displayName,
            guild: player.guild,
            count: row.count,
          };
        })
        .filter(Boolean)
        .sort(
          (a, b) =>
            a.bucket.localeCompare(b.bucket) ||
            a.displayName.localeCompare(b.displayName),
        );

      return res.json({ groupBy, rows: enriched });
    }

    const rows = await MeleyRun.aggregate([
      { $match: match },
      { $unwind: "$playerIds" },
      {
        $group: {
          _id: {
            playerId: "$playerIds",
            bucket: { $dateToString: { format: dateFormat, date: "$runAt" } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          playerId: "$_id.playerId",
          bucket: "$_id.bucket",
          count: 1,
        },
      },
    ]);

    const ids = rows.map((row) => row.playerId);
    const players = await Player.find({ _id: { $in: ids } }).select(
      "displayName guild",
    );
    const playerMap = new Map(
      players.map((player) => [String(player._id), player]),
    );

    const enriched = rows
      .map((row) => {
        const player = playerMap.get(String(row.playerId));
        if (!player) {
          return null;
        }
        return {
          bucket: row.bucket,
          playerId: row.playerId,
          displayName: player.displayName,
          guild: player.guild,
          count: row.count,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.bucket.localeCompare(b.bucket) ||
          a.displayName.localeCompare(b.displayName),
      );

    return res.json({ groupBy, rows: enriched });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
