import express from "express";
import { mapHealth, getNearbyPGsAndMesses } from "../controllers/mapController.js";

const router = express.Router();

router.get("/health", mapHealth);
router.get("/nearby", getNearbyPGsAndMesses);

export default router;
