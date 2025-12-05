import MessOwner from "../models/MessOwner.js";

export const addMessOwner = async (req, res) => {
  try {
    const messOwner = new MessOwner(req.body);
    await messOwner.save();
    res.status(201).json({ success: true, messOwner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllMessOwners = async (req, res) => {
  try {
    const messOwners = await MessOwner.find();
    res.status(200).json(messOwners);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
