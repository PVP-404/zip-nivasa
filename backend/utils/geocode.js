import axios from "axios";

function normalizeAddress(structured) {
  let address = structured.address || "";

  const remove = [
    structured.city,
    structured.state,
    structured.pincode,
  ]
    .filter(Boolean)
    .map(v => v.toLowerCase());

  return address
    .split(",")
    .map(p => p.trim())
    .filter(p => !remove.some(r => p.toLowerCase().includes(r)))
    .join(", ");
}

export async function geocodeAddress(structured) {
  const apiKey = process.env.OPENCAGE_KEY;
  if (!apiKey) throw new Error("OPENCAGE_KEY missing");

  const cleanStreet = normalizeAddress(structured);

  const query = [
    cleanStreet,
    structured.city,
    structured.state,
    structured.pincode,
    "India",
  ].filter(Boolean).join(", ");

  const { data } = await axios.get(
    "https://api.opencagedata.com/geocode/v1/json",
    {
      params: {
        key: apiKey,
        q: query,
        limit: 1,
        countrycode: "in",
        no_annotations: 1,
      },
    }
  );

  const result = data.results?.[0];

  if (!result || result.confidence < 6) {
    throw new Error("LOW_CONFIDENCE");
  }

  return {
    lat: result.geometry.lat,
    lng: result.geometry.lng,
    confidence: result.confidence,
  };
}
