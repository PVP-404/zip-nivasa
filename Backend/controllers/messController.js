import Mess from "../models/Mess.js";

// ➕ Add Mess
export const addMess = async (req, res) => {
    try {
        // Extract images from multer
        const imagePaths = req.files ? req.files.map(file => `/uploads/pgs/${file.filename}`) : [];

        // Combine text + image data
        const messData = {
            ...req.body,
            images: imagePaths,
        };

        // Ensure some fields are parsed correctly (if sent as JSON strings)
        if (typeof messData.menu === "string") messData.menu = JSON.parse(messData.menu);
        if (typeof messData.specialToday === "string") messData.specialToday = JSON.parse(messData.specialToday);

        const newMess = new Mess(messData);
        const savedMess = await newMess.save();

        res.status(201).json({
            success: true,
            message: "Mess added successfully!",
            mess: savedMess,
        });
    } catch (err) {
        console.error("❌ Error saving mess:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 📋 Get All Messes
export const getAllMesses = async (req, res) => {
    try {
        const messes = await Mess.find().populate("messOwnerId", "messName messLocation messType");
        res.status(200).json(messes);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 🧍 Get Messes by Owner
export const getMessesByOwner = async (req, res) => {
    try {
        const messes = await Mess.find({ messOwnerId: req.params.ownerId });
        res.status(200).json(messes);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✏️ Update Mess
export const updateMess = async (req, res) => {
    try {
        const mess = await Mess.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, mess });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ❌ Delete Mess
export const deleteMess = async (req, res) => {
    try {
        await Mess.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Mess deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 📅 Publish or Update Today's Special
export const publishSpecial = async (req, res) => {
    try {
        const { messOwnerId, lunch, dinner, imageUrl } = req.body;

        if (!messOwnerId) {
            return res.status(400).json({ success: false, message: "Missing messOwnerId" });
        }

        // Find the mess for this owner
        let mess = await Mess.findOne({ messOwnerId });

        if (!mess) {
            return res.status(404).json({ success: false, message: "No mess found for this owner" });
        }

        // Update today's special
        mess.specialToday = {
            lunch,
            dinner,
            imageUrl: imageUrl || "",
            date: new Date(), // today’s date
        };

        await mess.save();

        res.status(200).json({
            success: true,
            message: "Today's special published successfully!",
            mess,
        });
    } catch (err) {
        console.error("❌ Error publishing today's special:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// backend/controllers/messController.js
export const getAllMess = async (req, res) => {
  try {
    const messes = await Mess.find().populate("messOwnerId", "name phone email");
    res.json(messes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch mess list" });
  }
};
export const addRating = async (req, res) => {
  const { stars, comment, studentId } = req.body;

  try {
    const mess = await Mess.findById(req.params.id);
    mess.ratings.push({ stars, comment, studentId });
    await mess.save();

    res.json({ success: true, message: "Rating submitted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit rating" });
  }
};

