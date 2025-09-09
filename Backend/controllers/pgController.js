import { getAllPGs, addPG } from "../services/pgService.js";

// GET all PGs
export const fetchPGs = async (req, res) => {
  try {
    const pgs = await getAllPGs();
    res.json(pgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST a new PG
export const createPG = async (req, res) => {
  try {
    const newPG = await addPG(req.body);
    res.status(201).json(newPG);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
