import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";

import {
  createPG,
  getAllPGs,
  getPGById,
  getPGsByOwner
} from "../controllers/pgController.js";

const router = express.Router();

// ✅ PUBLIC – Get ALL PGs
router.get("/", getAllPGs);

// ✅ OWNER – Get PGs of logged-in owner
// ✅ NOTE: MUST COME BEFORE “/:id”
router.get("/owner/list", protect, getPGsByOwner);

// ✅ PUBLIC – Get PG by ID (keep this at the bottom)
router.get("/:id", getPGById);

// ✅ OWNER – Create PG Listing
router.post("/", protect, upload.array("images", 10), createPG);

export default router;
