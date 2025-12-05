import mongoose from "mongoose";

const messSchema = new mongoose.Schema(
  {
    messOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },

    location: { type: String, required: true },
    streetAddress: { type: String },
    pincode: { type: String, minlength: 6, maxlength: 6 },
    district: { type: String },
    state: { type: String },

    price: { type: Number, required: true },
    type: { type: String, enum: ["Veg", "Non-Veg", "Both"], default: "Veg" },
    capacity: { type: Number },

    menu: [{ type: String }],
    contact: { type: String },

    specialToday: {
      lunch: String,
      dinner: String,
      imageUrl: String,
      date: { type: Date, default: new Date() },
    },

    images: { type: [String], default: [] },

    ratings: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        stars: Number,
        comment: String,
        date: { type: Date, default: new Date() },
      },
    ],

    latitude: { type: Number },
    longitude: { type: Number },

    mapplsEloc: { type: String },
    mapplsAddress: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Mess", messSchema);
