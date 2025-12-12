import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/api/profile" || "http://localhost:5000/api/profile";


export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

export const updateProfile = async (payload) => {
  const token = localStorage.getItem("token");

  const res = await axios.put(`${API}/update`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};
