import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL + "/api" || "http://localhost:5000/api";

export function fetchNearbyServices(lat, lng, radiusKm) {
  return axios.get(`${API_BASE}/map/nearby`, {
    params: { lat, lng, radiusKm },
  });
}
