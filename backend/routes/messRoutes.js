import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";
import {
  addMess,
  getAllMesses,
  getMessesByOwner,
  updateMess,
  deleteMess,
  publishSpecial,
  getMessById,
  addRating,
  getMessesNearMe,
} from "../controllers/messController.js";

const router = express.Router();

// 🔹 More specific / named routes FIRST
router.get("/all", getAllMesses);
router.get("/nearby", getMessesNearMe);                 // ✅ BEFORE /:id
router.get("/owner/:ownerId", protect, getMessesByOwner);

router.get("/:id", getMessById);                        // ✅ AFTER /nearby
router.post("/:id/rate", addRating);

router.post("/add", protect, upload.array("images", 5), addMess);
router.put("/:id", protect, updateMess);
router.delete("/:id", protect, deleteMess);
router.post("/publish-special", protect, publishSpecial);

export default router;
