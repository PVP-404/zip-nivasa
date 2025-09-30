import mongoose from "mongoose";

const pgSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    propertyType: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    monthlyRent: { type: Number, required: true },
    deposit: { type: Number, required: true },
    occupancyType: { type: String, required: true },
    amenities: { type: [String], default: [] },
    description: { type: String },
    images: { type: [String], default: [] },
    owner: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PG", pgSchema);
