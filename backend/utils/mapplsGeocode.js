// backend/utils/mapplsGeocode.js
import axios from "axios";
import { getMapplsToken } from "./mapplsToken.js";

/**
 * Clean address for Mappls (same logic as OpenCage, but independent)
 */
function cleanAddressForMappls(raw) {
  if (!raw) return "";

  return raw
    .replace(/S\.?No\.?\s*\d+/gi, "")
    .replace(/Nr\s+/gi, "Near ")
    .replace(/\s{2,}/g, " ")
    .replace(/,\s*,/g, ", ")
    .trim();
}

/**
 * Normalise and geocode with Mappls – returns { eLoc, formattedAddress }
 * Accepts either:
 *  - string: "Gurudwara Road, Nigdi, Pimpri-Chinchwad, Pune"
 *  - object: { address, city, state, pincode }
 */
export async function geocodeEloc(input) {
  let addressStr = "";
  let city = "";
  let state = "";
  let pincode = "";

  if (typeof input === "string") {
    addressStr = input;
  } else if (input && typeof input === "object") {
    addressStr = input.address || "";
    // support 'city' or 'district'
    city = input.city || input.district || "";
    state = input.state || "";
    pincode = input.pincode || "";
  }

  const cleaned = cleanAddressForMappls(addressStr);

  // ✅ Build query similar to what you tested in browser
  const parts = [];
  if (cleaned) parts.push(cleaned);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (pincode) parts.push(pincode);

  const query = parts.join(", ");

  console.log("Mappls Final Query →", query);

  const token = await getMapplsToken(); // "access_token" from Mappls

  const response = await axios.get(
    "https://atlas.mappls.com/api/places/geocode",
    {
      params: {
        address: query,
        itemCount: 1,
        region: "IND",
      },
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        // Mappls REST: Authorization: <access_token>
        Authorization: token,
      },
    }
  );

  const { copResults } = response.data;

  // 🔥 IMPORTANT: Mappls returns EITHER array or single object
  let result = null;
  if (Array.isArray(copResults)) {
    result = copResults[0];
  } else if (copResults && typeof copResults === "object") {
    result = copResults;
  }
  console.log(result);

  if (!result) {
    throw new Error("Mappls geocode: no result");
  }

  return {
    eLoc: result.eLoc,
    formattedAddress: result.formattedAddress,
  };
}
