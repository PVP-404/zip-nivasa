// backend/routes/mapRoutes.js
import express from "express";
import {
  getAllLocations,
  geocodeSearchAddress,
} from "../controllers/mapController.js";

const router = express.Router();

router.get("/locations", getAllLocations);        // for Explore map
router.get("/geocode", geocodeSearchAddress);    // for search bar

export default router;
