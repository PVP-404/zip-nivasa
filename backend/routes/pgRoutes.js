
import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";
import {
  createPG,
  getAllPGs,
  getPGById,
  getPGsByOwner,
  getPGsNearMe,
} from "../controllers/pgController.js";

const router = express.Router();
router.get("/", getAllPGs);
router.get("/search/near-me", getPGsNearMe);
router.get("/:id", getPGById);
router.get("/owner/list", protect, getPGsByOwner);
router.post("/", protect, upload.array("images", 10), createPG);

export default router;
