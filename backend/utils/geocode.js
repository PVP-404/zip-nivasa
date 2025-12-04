import axios from "axios";

function cleanAddress(raw) {
  if (!raw) return "";

  return raw
    .replace(/S\.?No\.?\s*\d+/gi, "") // remove S.No. 133/1
    .replace(/Nr\s+/gi, "Near ")      // Nr → Near
    .replace(/\s{2,}/g, " ")          // extra spaces
    .replace(/,\s*,/g, ", ")          // double commas
    .trim();
}

export async function geocodeAddress(structuredAddress) {
  try {
    const apiKey = process.env.OPENCAGE_KEY;
    if (!apiKey) throw new Error("OPENCAGE_KEY missing");

    const cleanedAddress = cleanAddress(structuredAddress.address || "");

    const parts = [];
    if (cleanedAddress) parts.push(cleanedAddress);
    if (structuredAddress.city) parts.push(structuredAddress.city);
    if (structuredAddress.state) parts.push(structuredAddress.state);
    if (structuredAddress.pincode) parts.push(structuredAddress.pincode);

    const fullAddress = parts.join(", ");

    console.log("OpenCage Final Query →", fullAddress);

    const response = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          key: apiKey,
          q: fullAddress,
          limit: 1,
          countrycode: "in",
        },
      }
    );

    const result = response.data.results?.[0];
    if (!result) throw new Error("No OpenCage result");

    return {
      lat: result.geometry.lat,
      lng: result.geometry.lng,
      cleanedAddress,
    };
  } catch (error) {
    console.error("OpenCage Error:", error.response?.data || error.message);
    throw error;
  }
}
