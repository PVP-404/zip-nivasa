// backend/services/pgService.js
import PG from "../models/pgModel.js";

// ✅ Create PG listing (if you use this anywhere else)
export const createPGService = async (data) => {
  const pg = new PG(data);
  return await pg.save();
};

// ✅ Fetch all PG listings (latest first)
export const getAllPGsService = async () => {
  return await PG.find().sort({ createdAt: -1 });
};

// ✅ Distance in KM between two points (Haversine)
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
