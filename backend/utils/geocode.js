// backend/utils/geocode.js
import axios from "axios";

export async function geocodeAddress(fullAddress) {
  try {
    const apiKey = process.env.OPENCAGE_KEY;
    if (!apiKey) {
      throw new Error("OPENCAGE_KEY missing in environment variables.");
    }

    if (!fullAddress || fullAddress.trim() === "") {
      throw new Error("Address cannot be empty.");
    }

    const url = "https://api.opencagedata.com/geocode/v1/json";

    const response = await axios.get(url, {
      params: {
        key: apiKey,
        q: fullAddress,
        limit: 1,
      },
    });

    const result = response.data.results?.[0];
    if (!result) {
      throw new Error("No result returned from OpenCage.");
    }

    const lat = result.geometry.lat;
    const lng = result.geometry.lng;

    console.log("OpenCage →", { lat, lng, address: result.formatted });

    return { lat, lng };

  } catch (error) {
    console.error("OpenCage Geocode Error:", error.response?.data || error.message);
    throw error;
  }
}
