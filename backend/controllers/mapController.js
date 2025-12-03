// backend/controllers/mapController.js
import PG from "../models/pgModel.js";
import Mess from "../models/Mess.js";
import { distanceKm } from "../utils/distance.js";

export const mapHealth = (req, res) => {
  res.json({
    success: true,
    message: "Map API is live and Mappls is integrated on backend.",
  });
};

// 🔹 GET /api/map/nearby?lat=..&lng=..&radiusKm=..
export const getNearbyPGsAndMesses = async (req, res) => {
  try {
    const { lat, lng, radiusKm = 4 } = req.query;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radius = parseFloat(radiusKm);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "lat and lng query params are required",
      });
    }

    // PGs with coordinates
    const allPgs = await PG.find({
      latitude: { $ne: null },
      longitude: { $ne: null },
    });

    const nearbyPGs = allPgs
      .map((pg) => {
        const dist = distanceKm(latitude, longitude, pg.latitude, pg.longitude);
        return { ...pg.toObject(), distanceKm: dist };
      })
      .filter((pg) => pg.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    // Messes with coordinates
    const allMesses = await Mess.find({
      latitude: { $ne: null },
      longitude: { $ne: null },
    });

    const nearbyMesses = allMesses
      .map((mess) => {
        const dist = distanceKm(
          latitude,
          longitude,
          mess.latitude,
          mess.longitude
        );
        return { ...mess.toObject(), distanceKm: dist };
      })
      .filter((m) => m.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      center: { lat: latitude, lng: longitude },
      radiusKm: radius,
      pgs: nearbyPGs,
      messes: nearbyMesses,
    });
  } catch (err) {
    console.error("NEARBY PG+MESS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching nearby services",
    });
  }
};
