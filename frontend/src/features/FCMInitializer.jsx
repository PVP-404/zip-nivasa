import { useEffect } from "react";
import { requestFCMToken, registerTokenWithBackend } from "../services/fcm";

export default function FCMInitializer() {
  useEffect(() => {
    const jwt = localStorage.getItem("token");
    if (!jwt) return;

    async function init() {
      const token = await requestFCMToken();
      if (token) {
        await registerTokenWithBackend(token);
      }
    }

    init();
  }, []);

  return null;
}
