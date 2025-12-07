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
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
