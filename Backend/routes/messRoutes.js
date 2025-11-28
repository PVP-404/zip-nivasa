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

// // ADD MESS
// router.post("/add", upload.array("images", 5), addMess);

// // GET ALL
// router.get("/all", getAllMesses);

// // 🔥 IMPORTANT: get by ID MUST come BEFORE owner route
// router.get("/:id", getMessById);

// // Owner messes
// router.get("/owner/:ownerId", getMessesByOwner);

// // Update
// router.put("/:id", updateMess);

// // Delete
// router.delete("/:id", deleteMess);



// // Rating
// router.post("/:id/rate", addRating);

// ADD MESS
router.post("/add", upload.array("images", 5), addMess);

// GET ALL
router.get("/all", getAllMesses);

// OWNER ROUTE (static prefix)
router.get("/owner/:ownerId", getMessesByOwner);

// RATING ROUTE (specific)
router.post("/:id/rate", addRating);

// GET BY ID (generic → MUST be last)
router.get("/:id", getMessById);

// Today's special
router.post("/publish-special", publishSpecial);


export default router;
