import axios from "axios";
import { getMapplsToken } from "./mapplsToken.js";

function cleanAddressForMappls(raw) {
  if (!raw) return "";

  return raw
    // .replace(/S\.?No\.?\s*\d+/gi, "")
    // .replace(/Nr\s+/gi, "Near ")
    // .replace(/\s{2,}/g, " ")
    // .replace(/,\s*,/g, ", ")
    .trim();
}

function extractResult(data) {
  const { copResults } = data || {};
  if (!copResults) return null;

  if (Array.isArray(copResults)) return copResults[0];
  if (typeof copResults === "object") return copResults;

  return null;
}

export async function geocodeEloc(input) {
  let addressStr = "";
  let city = "";
  let state = "";
  let pincode = "";

  if (typeof input === "string") {
    addressStr = input;
  } else if (input && typeof input === "object") {
    addressStr = input.address || "";
    city = input.city || input.district || "";
    state = input.state || "";
    pincode = input.pincode || "";
  }

  const cleaned = cleanAddressForMappls(addressStr);

  const parts = [];
  if (cleaned) parts.push(cleaned);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (pincode) parts.push(pincode);

  const query = parts.join(", ");
  console.log("Mappls Final Query →", query);

  //  Try backend Bearer authentication
  try {
    const oauthToken = await getMapplsToken();
    console.log("Trying Mappls Bearer token…");

    const response = await axios.get(
      "https://atlas.mappls.com/api/places/geocode",
      {
        params: {
          address: query,
          itemCount: 1,
          region: "IND",
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${oauthToken}`,
        },
      }
    );

    const result = extractResult(response.data);
    if (result) {
      console.log(" Mappls (Bearer) Success");
      return {
        eLoc: result.eLoc,
        formattedAddress: result.formattedAddress,
      };
    }
  } catch (err) {
    console.log(" Mappls Bearer failed:", err.message);
  }

  try {
    console.log("Trying Mappls Browser-style…");

    const token = await getMapplsToken(); 
    const response = await axios.get(
      "https://atlas.mappls.com/api/places/geocode",
      {
        params: {
          address: query,
          itemCount: 1,
          extraparam: "true",
          access_token: token,
        },
        headers: {
          Accept: "application/json",
          "X-MAPPLS-APIKEY": process.env.MAPPLS_REST_KEY,
        },
      }
    );

    const result = extractResult(response.data);
    if (!result) throw new Error("Browser fallback returned no result");

    console.log(" Mappls Browser-mode Success");
    return {
      eLoc: result.eLoc,
      formattedAddress: result.formattedAddress,
    };
  } catch (err) {
    console.log(" Mappls Browser-mode failed:", err.message);
    throw new Error("Mappls geocode failed in both modes");
  }
}
