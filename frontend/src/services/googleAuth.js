import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { requestFCMToken, registerTokenWithBackend } from "./fcm";

export const initializeGoogleLogin = (callback) => {
  google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback,
  });
};

export const renderGoogleButton = (elementId) => {
  google.accounts.id.renderButton(
    document.getElementById(elementId),
    {
      theme: "outline",
      size: "large",
      width: "350",
    }
  );
};

export const handleGoogleResponse = async (response) => {
  try {
    const credential = response.credential;
    const decoded = jwtDecode(credential);

    // Send Google token to backend
    const res = await axios.post(
      "http://localhost:5000/api/auth/google-login",
      { token: credential }
    );

    const { token, user } = res.data;

    // Save JWT + user
    localStorage.setItem("token", token);
    localStorage.setItem("username", user.name);
    localStorage.setItem("email", user.email);
    localStorage.setItem("role", user.role);
    localStorage.setItem("userId", user.id);

    // FCM Token registration
    const browserToken = await requestFCMToken();
    if (browserToken) {
      localStorage.setItem("fcmToken", browserToken);
      await registerTokenWithBackend(browserToken);
    }

    return user;
  } catch (err) {
    console.error("Google login error:", err);
    throw err;
  }
};
