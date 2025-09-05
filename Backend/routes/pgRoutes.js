import express from "express";
import Pg from "../models/pgModel.js"; // ✅ correct file name
const router = express.Router();

// Create a new PG
router.post("/", async (req, res) => {
  try {
    const pg = new Pg(req.body);
    await pg.save();
    res.status(201).json(pg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all PGs
router.get("/", async (req, res) => {
  try {
    const pgs = await Pg.find();
    res.json(pgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
