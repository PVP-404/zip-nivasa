import mongoose from "mongoose";

const laundryOwnerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    laundryName: String,
    serviceLocation: String,
    ratePerKg: Number,
  },
  { timestamps: true }
);

export default mongoose.model("LaundryOwner", laundryOwnerSchema);
