import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/api/mess" || "http://localhost:5000/api/mess";


const safeRequest = async (callback, defaultValue) => {
  try {
    const res = await callback();
    return res?.data ?? defaultValue;
  } catch (err) {
    console.error(" MessService Error:", err);
    return defaultValue;
  }
};

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

export const getAllMesses = async () => {
  const data = await safeRequest(() => axios.get(`${API}/all`), []);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.messes)) return data.messes;

  return [];
};

export const getMessesByOwner = async (ownerId) => {
  const token = localStorage.getItem("token");

  return safeRequest(
    () =>
      axios.get(`${API}/owner/${ownerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,   
        },
      }),
    []
  );
};


export const updateMess = async (id, data) => {
  return safeRequest(() => axios.put(`${API}/${id}`, data), {
    success: false,
  });
};

export const deleteMess = async (id) => {
  return safeRequest(() => axios.delete(`${API}/${id}`), {
    success: false,
  });
};

export const publishSpecial = async (data) => {
  const token = localStorage.getItem("token");

  return safeRequest(
    () =>
      axios.post(`${API}/publish-special`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    { success: false }
  );
};

export const getMessById = async (id) => {
  return safeRequest(() => axios.get(`${API}/${id}`), null);
};

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
