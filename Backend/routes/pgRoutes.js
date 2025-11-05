import express from "express";
import { addPG, fetchPGs } from "../controllers/pgController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/add", upload.array("images", 5), addPG);
router.get("/all", fetchPGs);

export default router;
