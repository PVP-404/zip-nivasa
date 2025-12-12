import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/api/mess-owner" ||"http://localhost:5000/api/mess-owner";


export const addMessOwner = async (data) => {
  const res = await axios.post(`${API}/add`, data);
  return res.data;
};

export const getAllMessOwners = async () => {
  const res = await axios.get(`${API}/all`);
  return res.data;
};
