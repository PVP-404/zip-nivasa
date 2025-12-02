// backend/routes/mapRoutes.js
import express from "express";
import { mapHealth } from "../controllers/mapController.js";

const router = express.Router();

router.get("/health", mapHealth);

export default router;
