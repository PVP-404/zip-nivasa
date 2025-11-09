// backend/controllers/messageController.js
import Message from "../models/Message.js";
import PG from "../models/pgModel.js";

// Tenant sends message to owner
export const sendMessage = async (req, res) => {
  try {
    const { pgId, ownerId, message } = req.body;

    if (!pgId || !ownerId || !message)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const newMsg = await Message.create({
      pgId,
      ownerId,
      senderId: req.user.id,
      receiverId: ownerId,
      message,
    });

    await PG.findByIdAndUpdate(pgId, { $inc: { inquiries: 1 } });

    res.json({ success: true, data: newMsg });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Owner replies to tenant
export const replyToTenant = async (req, res) => {
  try {
    const { pgId, tenantId, replyText } = req.body;

    if (!pgId || !tenantId || !replyText)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const replyMsg = await Message.create({
      pgId,
      ownerId: req.user.id,
      senderId: req.user.id,
      receiverId: tenantId,
      message: replyText,
    });

    res.json({ success: true, data: replyMsg });
  } catch (err) {
    console.error("replyToTenant error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get messages for PG owner
export const getOwnerMessages = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const messages = await Message.find({ ownerId })
      .populate("pgId", "title location")
      .populate("senderId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Fetch conversation thread (PG + tenant)
export const getChatThread = async (req, res) => {
  try {
    const { pgId, tenantId } = req.params;
    const messages = await Message.find({
      pgId,
      $or: [{ senderId: tenantId }, { receiverId: tenantId }],
    })
      .populate("senderId", "name _id")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error("getChatThread error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
