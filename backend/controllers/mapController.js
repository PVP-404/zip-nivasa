import PG from "../models/pgmodel_temp.js";
import Mess from "../models/Mess.js";
import { distanceKm } from "../utils/distance.js";
import { getMapplsToken } from "../utils/mapplsToken.js";
import axios from "axios";


export const mapHealth = (req, res) => {
  res.json({
    success: true,
    message: "Map API is live and Mappls is integrated on backend.",
  });
};

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

//for auto suggetion of location
export const autosuggestLocation = async (req, res) => {
  try {
    const query = req.query.query?.trim();

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const token = await getMapplsToken();
    console.log(token);

    const url = `https://atlas.mappls.com/api/places/search/json?query=${encodeURIComponent(query)}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json({
      success: true,
      suggestions: response.data.suggestedLocations || [],
    });

  } catch (err) {
    console.error("Autosuggest Error:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Autosuggest API failed",
      error: err.response?.data,
    });
  }
};