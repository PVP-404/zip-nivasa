import mongoose from "mongoose";

const pgSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "PG name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "PG address is required"],
      trim: true,
    },
    totalBeds: {
      type: Number,
      required: [true, "Total beds must be specified"],
      min: [1, "PG must have at least 1 bed"],
    },
    occupiedBeds: {
      type: Number,
      default: 0,
      min: [0, "Occupied beds cannot be negative"],
      validate: {
        validator: function (val) {
          return val <= this.totalBeds;
        },
        message: "Occupied beds cannot exceed total beds",
      },
    },
    pricePerMonth: {
      type: Number,
      required: [true, "Price per month is required"],
      min: [100, "Price per month should be at least 100"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Pg = mongoose.model("Pg", pgSchema);

export default Pg;
