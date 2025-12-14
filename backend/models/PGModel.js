import mongoose from "mongoose";

const pgSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    propertyType: { type: String, required: true },

    location: { type: String, required: true },
    address: { type: String, required: true },

    streetAddress: { type: String, required: true },
    pincode: { type: String, required: true, minlength: 6, maxlength: 6 },
    district: { type: String, required: true },
    state: { type: String, required: true },

    monthlyRent: { type: Number, required: true },
    deposit: { type: Number, required: true },
    occupancyType: { type: String, required: true },

    amenities: { type: [String], default: [] },
    description: { type: String, required: true },
    images: { type: [String], default: [] },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    beds: { type: Number, default: 1 },
    available: { type: Boolean, default: true },
    latitude: { type: Number },
    longitude: { type: Number },
    locationSource: {
      type: String,
      enum: ["auto", "manual"],
      default: "auto",
    },

    mapplsEloc: { type: String },
    mapplsAddress: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PG", pgSchema);
