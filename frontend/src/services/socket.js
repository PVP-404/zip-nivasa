// frontend/src/services/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  withCredentials: false,
});

// Helpful logs (debug only)
socket.on("connect", () => console.log("socket connected:", socket.id));
socket.on("connect_error", (e) => console.warn(" socket connect_error:", e.message));
socket.on("reconnect_attempt", (n) => console.log("↻ reconnect_attempt", n));

export const registerSocket = (userId) => {
  if (!userId) return;
  // ensures we emit after connect as well
  if (socket.connected) socket.emit("register", userId);
  socket.once("connect", () => socket.emit("register", userId));
};

export const sendTyping = (sender, receiver) => {
  socket.emit("typing", { sender, receiver });
};

export const stopTyping = (sender, receiver) => {
  socket.emit("stop_typing", { sender, receiver });
};

export default socket;
