// frontend/src/services/mapService.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export function fetchNearbyServices(lat, lng, radiusKm) {
  return axios.get(`${API_BASE}/map/nearby`, {
    params: { lat, lng, radiusKm },
  });
}
