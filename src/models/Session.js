const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    machineId: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

sessionSchema.index({ playerId: 1, machineId: 1 }, { unique: true });

module.exports = mongoose.model("Session", sessionSchema);
