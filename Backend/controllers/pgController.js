import * as pgService from "../services/pgService.js";

// ✅ Add new PG Listing
export const addPG = async (req, res) => {
  try {
    let amenities = req.body.amenities;

    // ✅ If amenities comes as string → convert to array
    if (typeof amenities === "string") {
      try {
        amenities = JSON.parse(amenities);
      } catch {
        amenities = [];
      }
    }

    // ✅ Uploaded images (multer)
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const pgData = {
      ...req.body,
      amenities,
      images,
    };

    const pg = await pgService.createPG(pgData);

    res.status(201).json({
      message: "PG listing added successfully",
      listing: pg,
    });
  } catch (err) {
    console.error("Error adding PG:", err);
    res.status(500).json({
      message: "Failed to add PG listing",
      error: err.message,
    });
  }
};

// ✅ Fetch all PG Listings
export const fetchPGs = async (req, res) => {
  try {
    const pgs = await pgService.getAllPGs();
    res.status(200).json(pgs);
  } catch (err) {
    console.error("Error fetching PGs:", err);
    res.status(500).json({
      message: "Failed to fetch PG listings",
      error: err.message,
    });
  }
};
