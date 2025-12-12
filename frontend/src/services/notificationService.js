import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/api/user-notifications" ||"http://localhost:5000/api/user-notifications";


export async function fetchNotifications() {
  const token = localStorage.getItem("token");
  if (!token) return [];

  const res = await axios.get(API, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data.notifications;
}

export async function markAllNotificationsRead() {
  const token = localStorage.getItem("token");
  if (!token) return;

  return axios.post(`${API}/mark-read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function deleteNotification(id) {
  const token = localStorage.getItem("token");
  if (!token) return;

  return axios.delete(`${API}/read-delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function clearAllNotifications() {
  const token = localStorage.getItem("token");
  if (!token) return;

  return axios.delete(`${API}/clear-all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
