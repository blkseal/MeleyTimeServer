const mongoose = require("mongoose");

const meleyRunSchema = new mongoose.Schema(
  {
    guild: {
      type: String,
      enum: ["Faustos", "Mambodoquest"],
      required: true,
    },
    playerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true,
      },
    ],
    registeredByPlayerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    runAt: { type: Date, required: true, default: Date.now },
    isLate: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MeleyRun", meleyRunSchema);
