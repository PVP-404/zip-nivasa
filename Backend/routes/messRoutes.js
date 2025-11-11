// backend/routes/messRoutes.js
import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";
import {
  createMess,
  getAllMess,
  getMessById,
  getMessByOwner,
} from "../controllers/messController.js";

const router = express.Router();

// ⚡ Specific routes first
router.get("/owner/list", protect, getMessByOwner);

// ⚡ Create new mess listing (protected)
router.post("/", protect, upload.array("images", 5), createMess);

// ⚡ Public routes
router.get("/", getAllMess);
router.get("/:id", getMessById);

export default router;
