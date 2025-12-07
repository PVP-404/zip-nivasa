import User from "../models/User.js";

export const registerFcmToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "FCM token required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { fcmTokens: token } // prevents duplicates automatically
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("registerFcmToken error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
