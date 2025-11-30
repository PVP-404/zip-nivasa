// backend/utils/geocode.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function geocodeAddress(address) {
  try {
    const key = process.env.OPENCAGE_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      address
    )}&key=${key}`;

    const res = await axios.get(url);

    if (!res.data || !res.data.results || res.data.results.length === 0) {
      throw new Error("No geocoding results found.");
    }

    const { lat, lng } = res.data.results[0].geometry;
    return { lat, lng };
  } catch (err) {
    console.error("Geocoding Error:", err.message);
    return { lat: null, lng: null };
  }
}
