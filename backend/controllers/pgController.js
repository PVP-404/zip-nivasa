// backend/controllers/pgController.js
import PG from "../models/pgModel.js";
import User from "../models/User.js";
import { geocodeAddress } from "../utils/geocode.js";

import { calculateDistanceKm } from "../services/pgService.js";

//  CREATE PG LISTING (with Mappls Geocoding)
export const createPG = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.role !== "pgowner") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const {
      title,
      propertyType,
      monthlyRent,
      deposit,
      occupancyType,
      amenities,
      description,
      beds,
      // ⭐ NEW STRUCTURED ADDRESS FIELDS
      streetAddress, // Now used for the main address line
      pincode,
      district,
      state,
    } = req.body;
    
    // Derived location fields
    const location = `${district}, ${state}`; 
    const address = streetAddress; // Keep the original `address` field in DB as the primary line

    const images =
      req.files?.map((file) => `/uploads/pgs/${file.filename}`) || [];

    // ⭐ IMPROVED GEOCODING: Use the full structured address for high accuracy
    const geocodeQuery = {
      address: streetAddress,
      city: district, // Use district/city for better geocoding context
      state: state,
      pincode: pincode,
    };
    
    console.log("Geocoding Query:", geocodeQuery);

    let latitude = null;
    let longitude = null;

    try {
      // Pass the structured query object to the geocoder
      const coords = await geocodeAddress(geocodeQuery); 
      latitude = coords.lat;
      longitude = coords.lng;
      console.log("Geocoding coordinates:", coords);
    } catch (err) {
      console.error("Geocoding failed:", err.message);
      // It's acceptable to proceed without coords, but log a warning.
    }

    // ⭐ Store all structured fields for better data quality
    const pg = await PG.create({
      title,
      propertyType,
      location, // Stored as 'District, State'
      address, // Stored as the main streetAddress line
      streetAddress, // NEW: Full address line
      pincode, // NEW
      district, // NEW
      state, // NEW
      monthlyRent,
      deposit,
      occupancyType,
      amenities: amenities ? JSON.parse(amenities) : [],
      description,
      images,
      beds: beds || 1,
      owner: userId,
      latitude,
      longitude,
    });

    res.json({
      success: true,
      message: "PG listing created successfully",
      pg,
    });
  } catch (error) {
    console.error("PG CREATE ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//  PUBLIC – FETCH ALL PGs
export const getAllPGs = async (req, res) => {
  try {
    const pgs = await PG.find().sort({ createdAt: -1 });
    res.json(pgs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching PGs" });
  }
};

// FETCH SINGLE PG WITH OWNER INFO
export const getPGById = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id).populate(
      "owner",
      "name email phone role"
    );

    if (!pg) {
      return res
        .status(404)
        .json({ success: false, message: "PG not found" });
    }

    res.json({
      success: true,
      pg,
      ownerDetails: pg.owner,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching PG" });
  }
};

// OWNER – FETCH PGs BY OWNER
export const getPGsByOwner = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const pgs = await PG.find({ owner: ownerId }).sort({ createdAt: -1 });

    res.json({ success: true, pgs });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching PGs" });
  }
};

// ⭐ PG NEAR ME (for Leaflet radius search)
export const getPGsNearMe = async (req, res) => {
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

    const nearby = allPgs
      .map((pg) => {
        const dist = calculateDistanceKm(
          latitude,
          longitude,
          pg.latitude,
          pg.longitude
        );
        return { ...pg.toObject(), distanceKm: dist };
      })
      .filter((pg) => pg.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      count: nearby.length,
      pgs: nearby,
    });
  } catch (err) {
    console.error("PG NEAR ME ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching nearby PGs",
    });
  }
};
