// backend/controllers/pgController.js
import PG from "../models/PGModel.js";
import User from "../models/User.js";
import { geocodeAddress } from "../utils/geocode.js";
import { geocodeEloc } from "../utils/mapplsGeocode.js";

import { calculateDistanceKm } from "../services/pgService.js";

import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";


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

    // Upload to Cloudinary
    let images = [];

    if (req.files && req.files.length > 0) {
      images = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer, "pgs"))
      );
    }


    // Clean street address
    const cleanedStreet = streetAddress
      ? streetAddress
        .replace(/S\.?No\.?\s*\d+/gi, "")
        .replace(/Nr\s+/gi, "Near ")
        .replace(/\s{2,}/g, " ")
        .replace(/,\s*,/g, ", ")
        .trim()
      : "";

    const geocodeQuery = {
      address: cleanedStreet || streetAddress,
      city: district,
      state: state,
      pincode: pincode,
    };

    console.log("FINAL CLEANED GEOCODE QUERY:", geocodeQuery);

    let latitude = null;
    let longitude = null;
    let mapplsEloc = null;
    let mapplsAddress = null;

    // RUN BOTH IN PARALLEL SAFELY
    const [ocRes, mapplsRes] = await Promise.allSettled([
      geocodeAddress(geocodeQuery),  // OpenCage
      geocodeEloc(geocodeQuery),     // Mappls
    ]);

    // MAPPLS SUCCESS
    if (mapplsRes.status === "fulfilled") {
      mapplsEloc = mapplsRes.value.eLoc;
      mapplsAddress = mapplsRes.value.formattedAddress;
      console.log("✔ SAVED MAPPLS:", mapplsEloc, mapplsAddress);
    } else {
      console.log("❌ Mappls failed:", mapplsRes.reason);
    }

    // OPENCAGE SUCCESS
    if (ocRes.status === "fulfilled") {
      latitude = ocRes.value.lat;
      longitude = ocRes.value.lng;
      console.log("✔ SAVED LAT/LNG:", latitude, longitude);
    } else {
      console.log("❌ OpenCage failed:", ocRes.reason);
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

//  PG NEAR ME (for Leaflet radius search)
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
