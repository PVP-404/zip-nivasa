// backend/utils/geocode.js
import axios from "axios";

/**
 * Geocodes a structured address using OpenCage.
 * @param {{address: string, city: string, state: string, pincode: string}} structuredAddress - Address components.
 * @returns {{lat: number, lng: number}} - Latitude and longitude.
 */
export async function geocodeAddress(structuredAddress) {
  try {
    const apiKey = process.env.OPENCAGE_KEY;
    if (!apiKey) {
      throw new Error("OPENCAGE_KEY missing in environment variables.");
    }

    const { address, city, state, pincode } = structuredAddress;
    
    // Construct a high-quality query string
    const fullAddress = `${address}, ${city}, ${state} ${pincode}`;
    
    if (!address || !city || !state || !pincode) {
        // Log error but allow for partial address geocoding, if possible
        console.warn("Partial address components provided for geocoding.");
    }
    
    if (!fullAddress || fullAddress.trim() === "") {
      throw new Error("Address query cannot be empty.");
    }

    const url = "https://api.opencagedata.com/geocode/v1/json";

    const response = await axios.get(url, {
      params: {
        key: apiKey,
        q: fullAddress, // Use the structured, joined address
        limit: 1,
        countrycode: 'in', // Force India for better accuracy
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