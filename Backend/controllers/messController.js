// backend/controllers/messController.js
import MessOwner from "../models/MessOwner.js";
import User from "../models/User.js";

// ✅ Create new Mess listing
export const createMess = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.role !== "messowner") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const {
      messName,
      location,
      address,
      contactNumber,
      description,
      subscriptions,
      dailyMenu,
    } = req.body;

    // ✅ Ensure upload folder path matches your upload.js setup
    const images =
      req.files?.map((file) => `/uploads/messes/${file.filename}`) || [];

    const newMess = new MessOwner({
      messName,
      location,
      address,
      contactNumber,
      description,
      images,
      subscriptions: subscriptions ? JSON.parse(subscriptions) : [],
      dailyMenu: dailyMenu ? JSON.parse(dailyMenu) : {},
      owner: userId,
    });

    await newMess.save();

    return res.status(201).json({
      success: true,
      message: "Mess listing created successfully",
      mess: newMess,
    });
  } catch (error) {
    console.error("❌ Error creating mess:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get all mess listings (public)
export const getAllMess = async (req, res) => {
  try {
    const messes = await MessOwner.find().populate("owner", "name email");
    return res.status(200).json({ success: true, messes });
  } catch (error) {
    console.error("❌ Error fetching mess:", error);
    res.status(500).json({ success: false, message: "Error fetching mess data" });
  }
};

// ✅ Get single mess by ID
export const getMessById = async (req, res) => {
  try {
    const mess = await MessOwner.findById(req.params.id).populate("owner", "name email");
    if (!mess)
      return res.status(404).json({ success: false, message: "Mess not found" });

    return res.status(200).json({ success: true, mess });
  } catch (error) {
    console.error("❌ Error fetching single mess:", error);
    res.status(500).json({ success: false, message: "Error fetching mess details" });
  }
};

// ✅ Get all mess listings for logged-in owner
export const getMessByOwner = async (req, res) => {
  try {
    const messes = await MessOwner.find({ owner: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, messes });
  } catch (error) {
    console.error(" Error fetching owner's mess:", error);
    res.status(500).json({ success: false, message: "Error fetching owner's mess" });
  }
};
