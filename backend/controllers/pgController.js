// backend/controllers/pgController.js
import PG from "../models/pgModel.js";
import User from "../models/User.js";
import { geocodeAddress } from "../utils/geocode.js";
import { geocodeEloc } from "../utils/mapplsGeocode.js";

import { calculateDistanceKm } from "../services/pgService.js";

//  CREATE PG LISTING (with Mappls Geocoding)

// CREATE PG LISTING
//  CREATE PG LISTING (with Mappls Geocoding)
export const createPG = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.role !== "pgowner") {
      return res.status(403).json({ message: "Unauthorized" });
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
      streetAddress,
      pincode,
      district,
      state,
    } = req.body;

    const location = `${district}, ${state}`;
    const images = req.files?.map((f) => `/uploads/pgs/${f.filename}`) || [];

    // ✅ CLEAN STREET ADDRESS (remove S.No, Nr, extra commas)
    const cleanedStreet = streetAddress
      ? streetAddress
          .replace(/S\.?No\.?\s*\d+/gi, "")
          .replace(/Nr\s+/gi, "Near ")
          .replace(/\s{2,}/g, " ")
          .replace(/,\s*,/g, ", ")
          .trim()
      : "";

    // ✅ PASS FULL STRUCTURED ADDRESS TO GEOCODERS
    const geocodeQuery = {
      address: cleanedStreet || streetAddress || "",
      city: district || "",   // "Pune"
      state: state || "",     // "Maharashtra"
      pincode: pincode || "", // "4110xx"
    };

    console.log("FINAL CLEANED GEOCODE QUERY:", geocodeQuery);

    let latitude = null;
    let longitude = null;
    let mapplsEloc = null;
    let mapplsAddress = null;

    try {
      // 🔹 Both in parallel: OpenCage (lat/lng) + Mappls (eLoc)
      const [coords, mappls] = await Promise.all([
        geocodeAddress(geocodeQuery),
        geocodeEloc(geocodeQuery),
      ]);

      latitude = coords.lat;
      longitude = coords.lng;

      mapplsEloc = mappls.eLoc;
      mapplsAddress = mappls.formattedAddress;

      console.log("Geocode Success:", {
        latitude,
        longitude,
        mapplsEloc,
        mapplsAddress,
      });
    } catch (err) {
      console.error("Geocode Error:", err.message);
      // we still save PG without coords/eLoc if geocode fails
    }

    const pg = await PG.create({
      title,
      propertyType,
      location,
      address: cleanedStreet || streetAddress,
      streetAddress: cleanedStreet || streetAddress,
      pincode,
      district,
      state,
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
      mapplsEloc,
      mapplsAddress,
    });

    res.json({ success: true, pg });
  } catch (error) {
    console.error("PG CREATE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
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
