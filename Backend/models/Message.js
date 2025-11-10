// backend/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    pgId: { type: mongoose.Schema.Types.ObjectId, ref: "PG", required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // tenant
    message: { type: String, required: true },
    reply: { type: String }, // owner's reply
    status: {
      type: String,
      enum: ["Pending", "Replied", "Contacted"],
      default: "Pending",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
