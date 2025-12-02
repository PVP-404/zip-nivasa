// backend/routes/pgRoutes.js
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

// PUBLIC
router.get("/", getAllPGs);

// NEAR ME (keep BEFORE /:id)
router.get("/search/near-me", getPGsNearMe);

// SINGLE PG
router.get("/:id", getPGById);

// OWNER
router.get("/owner/list", protect, getPGsByOwner);

// CREATE
router.post("/", protect, upload.array("images", 10), createPG);

export default router;
