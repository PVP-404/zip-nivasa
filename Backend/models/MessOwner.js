import mongoose from "mongoose";

const dailyMenuSchema = new mongoose.Schema({
  lunch: { type: String, default: "" },
  dinner: { type: String, default: "" },
});

const messSchema = new mongoose.Schema(
  {
    messName: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    description: { type: String },
    images: { type: [String], default: [] },
    subscriptions: [
      {
        planName: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    dailyMenu: {
      monday: dailyMenuSchema,
      tuesday: dailyMenuSchema,
      wednesday: dailyMenuSchema,
      thursday: dailyMenuSchema,
      friday: dailyMenuSchema,
      saturday: dailyMenuSchema,
      sunday: dailyMenuSchema,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("MessOwner", messSchema);
