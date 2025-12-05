import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, required: true }, 

    roleId: { type: mongoose.Schema.Types.ObjectId, refPath: "roleModel" },
    roleModel: { type: String, required: true }, 
    fcmTokens: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
