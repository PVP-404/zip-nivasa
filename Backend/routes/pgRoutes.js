import express from "express";
import multer from "multer";
import { addPG, fetchPGs } from "../controllers/pgController.js";

const router = express.Router();

// ✅ Configure Multer Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// ✅ Add PG route
router.post("/", upload.array("images"), addPG);

// ✅ Fetch all PGs
router.get("/", fetchPGs);

export default router;
