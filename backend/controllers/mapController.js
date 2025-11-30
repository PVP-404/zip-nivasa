// backend/controllers/mapController.js
import PG from "../models/pgModel.js";
import { geocodeAddress } from "../utils/geocode.js";

export const getAllLocations = async (req, res) => {
  try {
    const pgs = await PG.find({
      latitude: { $ne: null },
      longitude: { $ne: null },
    });

    const markers = pgs.map((pg) => ({
      id: pg._id,
      type: "pg",
      name: pg.title,
      address: pg.address,
      location: pg.location,
      lat: pg.latitude,
      lng: pg.longitude,
      extra: { monthlyRent: pg.monthlyRent },
    }));

    res.json(markers);
  } catch (error) {
    console.log("MAP LOCATIONS ERROR:", error);
    res.status(500).json({ message: "Failed to load map locations" });
  }
};

export const geocodeSearchAddress = async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ message: "Address query is required" });
    }

    const { lat, lng } = await geocodeAddress(address);
    res.json({ lat, lng });
  } catch (error) {
    console.log("SEARCH GEOCODE ERROR:", error);
    res.status(500).json({ message: "Failed to geocode address" });
  }
};
