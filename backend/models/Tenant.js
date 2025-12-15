import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    professionType: { type: String, enum: ["student", "job"], required: false },

    collegeName: String,
    course: String,
    year: String,

    companyName: String,
    workLocation: String,
    jobRole: String,

    city: String,
  },
  { timestamps: true }
);

export default mongoose.model("Tenant", tenantSchema);
