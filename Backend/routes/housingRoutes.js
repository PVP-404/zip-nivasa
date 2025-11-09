import express from "express";
import Housing from "../models/Housing.js"; 
 // ✅ Correct path

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const listings = await Housing.find();
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching listings", error });
  }
});

export default router;
