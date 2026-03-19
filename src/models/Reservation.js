const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    guild: {
      type: String,
      enum: ["Faustos", "Mambodoquest"],
      required: true,
    },
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    reservedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

reservationSchema.index({ guild: 1, active: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
