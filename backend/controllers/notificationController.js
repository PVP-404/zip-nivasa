import User from "../models/User.js";

export const registerFcmToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "FCM token required" });
    }

    //  Remove this token from ALL users first
    await User.updateMany(
      { fcmTokens: token },
      { $pull: { fcmTokens: token } }
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { fcmTokens: token } // prevents duplicates for this user
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

export const deregisterFcmToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "FCM token required" });
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { fcmTokens: token }
      }
    );
    console.log("FCM token deregistered successfully");
    res.json({ success: true, message: "FCM token deregistered successfully" });
  } catch (err) {
    console.error("deregisterFcmToken error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
