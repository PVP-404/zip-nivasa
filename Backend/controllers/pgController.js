// Backend/controllers/pgController.js
import PG from "../models/pgModel.js";
import User from "../models/User.js";

// ✅ CREATE PG LISTING
export const createPG = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.role !== "pgowner") {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized" });
    }

    const {
      title,
      propertyType,
      location,
      address,
      monthlyRent,
      deposit,
      occupancyType,
      amenities,
      description,
    } = req.body;

    const images = req.files?.map((file) => `/uploads/pgs/${file.filename}`) || [];

    const pg = new PG({
      title,
      propertyType,
      location,
      address,
      monthlyRent,
      deposit,
      occupancyType,
      amenities: JSON.parse(amenities),
      description,
      images,
      owner: userId,
      beds: 1,
    });

    await pg.save();

    res.json({
      success: true,
      message: "PG listing created successfully",
      pg,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ FETCH PGs by logged-in owner
export const getPGsByOwner = async (req, res) => {
  try {
    const userId = req.user.id;

    const pgs = await PG.find({ owner: userId }).sort({ createdAt: -1 });

    res.json({ success: true, pgs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching PGs" });
  }
};
