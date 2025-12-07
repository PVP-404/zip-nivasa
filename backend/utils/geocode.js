import axios from "axios";

export async function geocodeAddress(structured) {
  const apiKey = process.env.OPENCAGE_KEY;
  if (!apiKey) throw new Error("OPENCAGE_KEY missing");

  let full = `${structured.address}`
    // .replace(/,\s*,/g, ",")   // remove empty commas
    // .replace(/\s{2,}/g, " ")  // extra spaces
    .trim();

  console.log(" Starting OpenCage with:", full);

  // Split address into comma-separated segments
  let parts = full.split(",").map(s => s.trim()).filter(Boolean);

  // Try again and again removing first part each time
  while (parts.length > 0) {
    const query = parts.join(", ");
    console.log("Trying OpenCage Query →", query);

    try {
      const response = await axios.get(
        "https://api.opencagedata.com/geocode/v1/json",
        {
          params: {
            key: apiKey,
            q: query,
            limit: 1,
            no_annotations: 1,
            countrycode: "in"
          }
        }
      );

      const result = response.data.results?.[0];

      if (result) {
        console.log("OpenCage SUCCESS ", query);
        console.log(result.geometry.lat, result.geometry.lng);
        return {
          lat: result.geometry.lat,
          lng: result.geometry.lng,
          usedQuery: query,
        };
      }
    } catch (err) {
      console.log(" OpenCage Error:", err.response?.data || err.message);
    }

    // Remove the FIRST segment and retry
    console.log(" No result. Removing first segment:", parts[0]);
    parts.shift();
  }

  throw new Error("OpenCage failed for all fallback queries.");
}
