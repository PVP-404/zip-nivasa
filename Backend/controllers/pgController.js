import * as pgService from "../services/pgService.js";

export const addPG = async (req, res) => {
  try {
    const pg = await pgService.createPG(req.body);
    res.status(201).json(pg);
  } catch (err) {
    res.status(500).json({ message: "Failed to add PG listing", error: err.message });
  }
};

export const fetchPGs = async (req, res) => {
  try {
    const pgs = await pgService.getAllPGs();
    res.status(200).json(pgs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch PG listings", error: err.message });
  }
};
