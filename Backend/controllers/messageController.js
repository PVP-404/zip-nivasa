import Message from "../models/Message.js";
import PG from "../models/pgModel.js";

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
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

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
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getOwnerMessages = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const messages = await Message.find({ ownerId })
      .populate("pgId", "title location")
      .populate("senderId", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

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
  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ mark as contacted
export const markAsContacted = async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { isContacted: true },
      { new: true }
    );
    if (!msg)
      return res.status(404).json({ success: false, message: "Message not found" });
    res.json({ success: true, msg });
  } catch {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
