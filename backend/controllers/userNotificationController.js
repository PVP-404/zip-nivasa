import User from "../models/User.js";
import Notification from "../models/Notification.js";

export const addNotification = async ({ userId, senderId, title, body, chatUserId }) => {
  const sender = await User.findById(senderId).select("name");

  return Notification.create({
    userId,
    senderId,
    senderName: sender?.name || "Someone",
    title,
    body,
    chatUserId
  });
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, notifications });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
