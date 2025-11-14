import express from "express";
import upload from "../middleware/upload.js";
import {
  addMess,
  getAllMesses,
  getMessesByOwner,
  updateMess,
  deleteMess,
  publishSpecial,
  getMessById,
  addRating
} from "../controllers/messController.js";

const router = express.Router();

// ADD MESS
router.post("/add", upload.array("images", 5), addMess);

// GET ALL
router.get("/all", getAllMesses);

// 🔥 IMPORTANT: get by ID MUST come BEFORE owner route
router.get("/:id", getMessById);

// Owner messes
router.get("/owner/:ownerId", getMessesByOwner);

// Update
router.put("/:id", updateMess);

// Delete
router.delete("/:id", deleteMess);

// Today's special
router.post("/publish-special", publishSpecial);

// Rating
router.post("/:id/rate", addRating);

export default router;
