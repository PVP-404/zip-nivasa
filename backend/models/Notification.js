import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },

    senderName: { 
      type: String 
    },

    title: { 
      type: String, 
      default: "" 
    },

    body: { 
      type: String, 
      default: "" 
    },

    chatUserId: { 
      type: String 
    },

    isRead: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
