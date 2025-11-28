// Backend/controllers/profileController.js
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import PGOwner from "../models/PGOwner.js";
import MessOwner from "../models/MessOwner.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get base user
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let roleData = null;

    switch (user.role) {
      case "tenant":
        roleData = await Tenant.findOne({ userId }).lean();
        break;
      case "pgowner":
        roleData = await PGOwner.findOne({ userId }).lean();
        break;
      case "messowner":
        roleData = await MessOwner.findOne({ userId }).lean();
        break;
      default:
        roleData = {};
    }

    return res.json({
      success: true,
      user,
      roleData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update base user (name, phone only)
    const { name, phone } = req.body;
    await User.findByIdAndUpdate(userId, { name, phone });

    // Update role-based fields dynamically
    let roleModel;
    let filter = { userId };
    let update = req.body.roleData || {};

    if (req.user.role === "tenant") roleModel = Tenant;
    if (req.user.role === "pgowner") roleModel = PGOwner;
    if (req.user.role === "messowner") roleModel = MessOwner;

    await roleModel.findOneAndUpdate(filter, update);

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
