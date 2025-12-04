// frontend/src/services/pgService.js
import api from "../utils/api";

export const fetchPGById = (id) => api.get(`/pgs/${id}`);

export const fetchPGsNearMe = (lat, lng, radiusKm) =>
  api.get("/pgs/search/near-me", {
    params: { lat, lng, radiusKm },
  });
