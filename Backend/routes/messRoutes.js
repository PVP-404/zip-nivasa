import express from "express";
import upload from "../middleware/upload.js";
import {
  addMess,
  getAllMesses,
  getMessesByOwner,
  updateMess,
  deleteMess,
  publishSpecial,
} from "../controllers/messController.js";

const router = express.Router();

// ✅ Use multer middleware for image uploads
router.post("/add", upload.array("images", 5), addMess);

router.get("/all", getAllMesses);
router.get("/owner/:ownerId", getMessesByOwner);
router.put("/:id", updateMess);
router.delete("/:id", deleteMess);
router.post("/publish-special", publishSpecial);

export default router;
