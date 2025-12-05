import axios from "axios";

export async function fetchNotifications() {
  const token = localStorage.getItem("token");
  if (!token) return [];

  const res = await axios.get("http://localhost:5000/api/user-notifications", {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data.notifications;
}

export async function markAllNotificationsRead() {
  const token = localStorage.getItem("token");
  if (!token) return;

  await axios.post(
    "http://localhost:5000/api/user-notifications/mark-read",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
