import User from "../models/User.js";

export const registerFcmToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "FCM token required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const tokens = new Set(user.fcmTokens || []);
    tokens.add(token);
    user.fcmTokens = Array.from(tokens).slice(-5);

    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error("registerFcmToken error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
