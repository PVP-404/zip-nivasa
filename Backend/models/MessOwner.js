import mongoose from "mongoose";

const messOwnerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    messName: String,
    messLocation: String,
    messCapacity: Number,
    messType: String,
  },
  { timestamps: true }
);

export default mongoose.model("MessOwner", messOwnerSchema);
