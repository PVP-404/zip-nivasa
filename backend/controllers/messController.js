// backend/controllers/messController.js
import Mess from "../models/Mess.js";
import User from "../models/User.js";
import { geocodeAddress } from "../utils/geocode.js";
import { geocodeEloc } from "../utils/mapplsGeocode.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { distanceKm } from "../utils/distance.js";



export const addMess = async (req, res) => {
  try {
    // 🔒 Require logged-in mess owner
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "messowner") {
      return res
        .status(403)
        .json({ success: false, message: "Only mess owners can add mess listings" });
    }

    // 📸 Upload images to Cloudinary (if any)
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer, "messes"))
      );
    }

    // 🧹 Extract & normalize body
    const {
      title,
      description,
      streetAddress,
      pincode,
      district,
      state,
      price,
      type,
      contact,
      menu,
      specialToday,
    } = req.body;

    if (!title || !streetAddress || !pincode || !district || !state || !price) {
      return res.status(400).json({
        success: false,
        message:
          "title, streetAddress, pincode, district, state and price are required",
      });
    }

    // 🧾 Parse menu & specialToday (they come as JSON strings from FormData)
    let parsedMenu = [];
    if (menu) {
      if (typeof menu === "string") {
        try {
          parsedMenu = JSON.parse(menu);
        } catch (e) {
          console.warn("Invalid menu JSON, falling back to []");
          parsedMenu = [];
        }
      } else if (Array.isArray(menu)) {
        parsedMenu = menu;
      }
    }

    let parsedSpecial = {};
    if (specialToday) {
      if (typeof specialToday === "string") {
        try {
          parsedSpecial = JSON.parse(specialToday);
        } catch (e) {
          console.warn("Invalid specialToday JSON, ignoring");
        }
      } else if (typeof specialToday === "object") {
        parsedSpecial = specialToday;
      }
    }

    const {
      lunch = "",
      dinner = "",
      imageUrl = "",
    } = parsedSpecial || {};

    // 📍 Geocode (lat/lng + Mappls eLoc)
    let latitude = null;
    let longitude = null;
    let mapplsEloc = null;
    let mapplsAddress = null;

    if (streetAddress && district && state && pincode) {
      const geocodeQuery = {
        address: streetAddress,
        city: district,
        state,
        pincode,
      };

      try {
        const [coords, mappls] = await Promise.all([
          geocodeAddress(geocodeQuery),
          geocodeEloc(geocodeQuery),
        ]);

        if (coords) {
          latitude = coords.lat;
          longitude = coords.lng;
        }
        if (mappls) {
          mapplsEloc = mappls.eLoc;
          mapplsAddress = mappls.formattedAddress;
        }
      } catch (e) {
        console.error("Mess geocode error:", e.message);
      }
    }

    const location =
      req.body.location || `${district || ""}, ${state || ""}`.trim();

    const newMess = new Mess({
      messOwnerId: userId,
      title,
      description,
      location,
      streetAddress,
      pincode,
      district,
      state,
      price: Number(price),
      type: type || "Veg",
      contact,
      menu: parsedMenu,
      specialToday: {
        lunch,
        dinner,
        imageUrl,
        date: new Date(),
      },
      images: imagePaths,
      latitude,
      longitude,
      mapplsEloc,
      mapplsAddress,
    });

    const savedMess = await newMess.save();

    res.status(201).json({
      success: true,
      message: "Mess added successfully!",
      mess: savedMess,
    });
  } catch (err) {
    console.error("ADD MESS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessById = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);

    if (!mess)
      return res.status(404).json({ success: false, message: "Mess not found" });

    res.json({ success: true, mess });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllMesses = async (req, res) => {
  try {
    const messes = await Mess.find().sort({ createdAt: -1 });
    res.json({ success: true, messes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessesByOwner = async (req, res) => {
  try {
    // 🔒 use logged-in user instead of trusting param
    const ownerId = req.user.id;

    const messes = await Mess.find({ messOwnerId: ownerId })
      .populate("ratings.studentId", "name email")
      .sort({ createdAt: -1 });

    res.json(messes); // keep as array for existing frontend mapping
  } catch (err) {
    console.error("GET MESSES BY OWNER ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMess = async (req, res) => {
  try {
    const updated = await Mess.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ success: true, mess: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteMess = async (req, res) => {
  try {
    await Mess.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Mess deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const publishSpecial = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const mess = await Mess.findOne({ messOwnerId: ownerId });
    if (!mess)
      return res.status(404).json({ success: false, message: "Mess not found" });

    const { lunch = "", dinner = "", imageUrl = "" } = req.body;

    mess.specialToday = {
      lunch,
      dinner,
      imageUrl,
      date: new Date(),
    };

    await mess.save();

    res.json({ success: true, message: "Special updated", mess });
  } catch (err) {
    console.error("PUBLISH SPECIAL ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addRating = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);
    if (!mess)
      return res.status(404).json({ success: false, message: "Mess not found" });

    mess.ratings.push(req.body);
    await mess.save();

    res.json({ success: true, message: "Rating added" });
  } catch (err) {
    console.error("ADD RATING ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}; 
export const getMessesNearMe = async (req, res) => {
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

    const allMesses = await Mess.find({
      latitude: { $ne: null },
      longitude: { $ne: null },
    });

    const nearby = allMesses
      .map((mess) => {
        const dist = distanceKm(       // ✅ use local helper
          latitude,
          longitude,
          mess.latitude,
          mess.longitude
        );

        return {
          ...mess.toObject(),
          distanceKm: dist,
        };
      })
      .filter((mess) => mess.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      count: nearby.length,
      messes: nearby,
    });
  } catch (err) {
    console.error("MESS NEAR ME ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching nearby Messes",
    });
  }
};


