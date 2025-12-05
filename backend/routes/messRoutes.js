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

router.post("/add", upload.array("images", 5), addMess);
router.get("/all", getAllMesses);
router.get("/owner/:ownerId", getMessesByOwner);
router.post("/:id/rate", addRating);
router.get("/:id", getMessById);
router.post("/publish-special", publishSpecial);


export default router;
