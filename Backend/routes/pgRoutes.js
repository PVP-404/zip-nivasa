import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

import { createPG, getPGsByOwner } from "../controllers/pgController.js";

const router = express.Router();

// ✅ Create PG listing
router.post("/", protect, upload.array("images", 10), createPG);

// ✅ Get PG listings of logged-in owner
router.get("/owner", protect, getPGsByOwner);

export default router;
