import mongoose from "mongoose";

const pgSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    propertyType: { type: String, required: true },
    
    // ⭐ Existing Fields - Kept for compatibility/derived data
    // 'location' will typically store a high-level view (e.g., "Pune, Maharashtra")
    location: { type: String, required: true }, 
    // 'address' might be used for a full, concatenated address, but now 'streetAddress' is more precise
    address: { type: String, required: true }, 

    // ⭐ NEW: Structured Address Fields for Accuracy (Added after 'address')
    streetAddress: { type: String, required: true }, // Building name, street, etc.
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
    
    // Latitude and Longitude are crucial for proximity search
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("PG", pgSchema);