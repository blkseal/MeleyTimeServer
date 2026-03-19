const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: { type: String, required: true, trim: true },
    guild: {
      type: String,
      enum: ["Faustos", "Mambodoquest"],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Player", playerSchema);
