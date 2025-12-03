// backend/controllers/chatController.js
import Message from "../models/Message.js";
import User from "../models/User.js";

/** Save a message (REST fallback) */
export const sendMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body;
    if (!receiver || !message?.trim()) {
      return res.status(400).json({ success: false, message: "receiver and message are required" });
    }

    const msg = await Message.create({
      sender: req.user.id,
      receiver,
      message: message.trim(),
      readAt: null,
    });

    return res.json({ success: true, msg });
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Conversation history with a specific receiver */
export const getHistory = async (req, res) => {
  try {
    const { receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: receiverId },
        { sender: receiverId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    return res.json({ success: true, messages });
  } catch (err) {
    console.error("getHistory error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** List conversations (distinct partners) with last message + unread */
export const getConversations = async (req, res) => {
  try {
    const myId = req.user.id;

    const msgs = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }]
    }).sort({ createdAt: -1 });

    const map = new Map(); // otherId -> { lastMessage, unreadCount }
    for (const m of msgs) {
      const otherId = String(m.sender) === String(myId) ? String(m.receiver) : String(m.sender);
      if (!map.has(otherId)) map.set(otherId, { lastMessage: m, unreadCount: 0 });

      // unread if they sent to me and readAt is null
      if (String(m.receiver) === String(myId) && String(m.sender) === String(otherId) && !m.readAt) {
        map.get(otherId).unreadCount += 1;
      }
    }

    const partnerIds = [...map.keys()];
    const partners = await User.find({ _id: { $in: partnerIds } }).select("name phone role");
    const pMap = new Map(partners.map(u => [String(u._id), u]));

    const conversations = partnerIds
      .map(pid => ({
        user: pMap.get(pid),
        lastMessage: map.get(pid).lastMessage,
        unreadCount: map.get(pid).unreadCount
      }))
      .filter(c => !!c.user);

    return res.json({ success: true, conversations });
  } catch (err) {
    console.error("getConversations error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Mark messages from a partner as read (set readAt) */
export const markAsRead = async (req, res) => {
  try {
    const myId = req.user.id;
    const { partnerId } = req.body;

    await Message.updateMany(
      { sender: partnerId, receiver: myId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    // 🔵 Notify sender live
    const partnerSocket = onlineUsers.get(partnerId);
    if (partnerSocket) {
      io.to(partnerSocket).emit("message_read", {
        readerId: myId,
        partnerId,
        readAt: new Date().toISOString(),
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    return res.status(500).json({ success: false });
  }
};

