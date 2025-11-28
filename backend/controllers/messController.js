import Mess from "../models/Mess.js";

//  Add Mess
export const addMess = async (req, res) => {
  try {
    const imagePaths = req.files ? req.files.map(f => `/uploads/pgs/${f.filename}`) : [];

    const messData = {
      ...req.body,
      images: imagePaths,
    };

    if (typeof messData.menu === "string") messData.menu = JSON.parse(messData.menu);

    const newMess = new Mess(messData);
    const savedMess = await newMess.save();

    res.status(201).json({ success: true, message: "Mess added successfully!", mess: savedMess });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  Get mess by ID
export const getMessById = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);

    if (!mess) return res.status(404).json({ message: "Mess not found" });

    res.json(mess);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Mess
export const getAllMesses = async (req, res) => {
  try {
    const messes = await Mess.find();
    res.json(messes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Get messes by owner
export const getMessesByOwner = async (req, res) => {
  try {
    const messes = await Mess.find({ messOwnerId: req.params.ownerId })
      .populate("ratings.studentId", "name email"); // <-- ⭐ important

    res.json(messes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Update Mess
export const updateMess = async (req, res) => {
  try {
    const updated = await Mess.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Delete Mess
export const deleteMess = async (req, res) => {
  try {
    await Mess.findByIdAndDelete(req.params.id);
    res.json({ message: "Mess deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Publish Today's Special
export const publishSpecial = async (req, res) => {
  try {
    const mess = await Mess.findOne({ messOwnerId: req.body.messOwnerId });

    if (!mess) return res.status(404).json({ message: "Mess not found" });

    mess.specialToday = req.body;
    await mess.save();

    res.json({ message: "Special updated", mess });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Add Rating
export const addRating = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    mess.ratings.push(req.body);
    await mess.save();

    res.json({ message: "Rating added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
