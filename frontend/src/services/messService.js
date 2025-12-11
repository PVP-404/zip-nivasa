// src/services/messService.js
import axios from "axios";

const API = "http://localhost:5000/api/mess";

// --------------------------------------------------------
// SAFE API CALL WRAPPER  (No crashes if backend fails)
// --------------------------------------------------------
const safeRequest = async (callback, defaultValue) => {
  try {
    const res = await callback();
    return res?.data ?? defaultValue;
  } catch (err) {
    console.error("❌ MessService Error:", err);
    return defaultValue;
  }
};

// --------------------------------------------------------
// ADD MESS (multipart form-data)
// --------------------------------------------------------
export const addMess = async (data) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === "images" && Array.isArray(value)) {
      value.forEach((img) => formData.append("images", img));
    } else if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  return safeRequest(
    () =>
      axios.post(`${API}/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    { success: false }
  );
};

// --------------------------------------------------------
// GET ALL MESS LISTINGS (Normalize to ARRAY)
// --------------------------------------------------------
export const getAllMesses = async () => {
  const data = await safeRequest(() => axios.get(`${API}/all`), []);

  // data can be:
  // 1) { success, messes: [...] }
  // 2) [...] (if you ever change backend later)
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.messes)) return data.messes;

  return [];
};

// --------------------------------------------------------
// GET MESS BY OWNER  (Protected)
// --------------------------------------------------------
export const getMessesByOwner = async (ownerId) => {
  return safeRequest(() => axios.get(`${API}/owner/${ownerId}`), []);
};

// --------------------------------------------------------
// UPDATE MESS
// --------------------------------------------------------
export const updateMess = async (id, data) => {
  return safeRequest(() => axios.put(`${API}/${id}`, data), {
    success: false,
  });
};

// --------------------------------------------------------
// DELETE MESS
// --------------------------------------------------------
export const deleteMess = async (id) => {
  return safeRequest(() => axios.delete(`${API}/${id}`), {
    success: false,
  });
};

// --------------------------------------------------------
// PUBLISH TODAY'S SPECIAL
// --------------------------------------------------------
export const publishSpecial = async (data) => {
  return safeRequest(() => axios.post(`${API}/publish-special`, data), {
    success: false,
  });
};

// --------------------------------------------------------
// GET SINGLE MESS BY ID
// --------------------------------------------------------
export const getMessById = async (id) => {
  return safeRequest(() => axios.get(`${API}/${id}`), null);
};

// --------------------------------------------------------
// SUBMIT MESS RATING
// --------------------------------------------------------
export const submitMessRating = async (messId, ratingData) => {
  return safeRequest(
    () =>
      axios.post(`${API}/${messId}/rate`, ratingData, {
        headers: { "Content-Type": "application/json" },
      }),
    { success: false }
  );
};

// near-me search
export const fetchMessesNearMe = async (lat, lng, radiusKm) => {
  return axios.get(
    `${API}/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`
  );
};
