import mongoose from "mongoose";

const pgOwnerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Optional metadata
    pgName: String,
    pgLocation: String,
    pgCapacity: Number,
    pgFacilities: String,
  },
  { timestamps: true }
);

export default mongoose.model("PGOwner", pgOwnerSchema);
