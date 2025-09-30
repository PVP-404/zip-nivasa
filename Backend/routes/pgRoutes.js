import express from "express";
import { addPG, fetchPGs } from "../controllers/pgController.js";

const router = express.Router();

router.post("/add", addPG);
router.get("/all", fetchPGs);

export default router;
