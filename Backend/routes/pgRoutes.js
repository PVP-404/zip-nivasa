import express from "express";
import { fetchPGs, createPG } from "../controllers/pgController.js";

const router = express.Router();

// Routes call controller functions instead of handling DB logic directly
router.get("/", fetchPGs);
router.post("/", createPG);

export default router;
