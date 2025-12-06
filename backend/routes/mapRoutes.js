import express from "express";
import { mapHealth, getNearbyPGsAndMesses ,autosuggestLocation } from "../controllers/mapController.js";

const router = express.Router();

router.get("/health", mapHealth);
router.get("/nearby", getNearbyPGsAndMesses);
router.get("/autosuggest", autosuggestLocation);

export default router;
