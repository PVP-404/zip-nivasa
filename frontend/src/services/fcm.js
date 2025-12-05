import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase";
import axios from "axios";

export async function requestFCMToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch {
    return null;
  }
}

let callbackFn = null;

export function subscribeForegroundNotifications(cb) {
  callbackFn = cb;

  onMessage(messaging, (payload) => {
    const pathname = window.location.pathname;
    const chatUserId = payload.data?.chatUserId;

    if (pathname.startsWith("/chat/") && pathname.endsWith(chatUserId)) return;

    const notif = {
      title: payload.notification?.title,
      body: payload.notification?.body,
      chatUserId,
    };

    if (callbackFn) callbackFn(notif);
  });
}

export async function registerTokenWithBackend(token) {
  try {
    const jwt = localStorage.getItem("token");
    if (!jwt || !token) return;

    await axios.post(
      "http://localhost:5000/api/notifications/register-token",
      { token },
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
  } catch {}
}
