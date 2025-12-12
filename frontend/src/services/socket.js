import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL|| "http://localhost:5000", {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  withCredentials: false,
});

socket.on("connect", () => console.log("socket connected:", socket.id));
socket.on("connect_error", (e) => console.warn(" socket connect_error:", e.message));
socket.on("reconnect_attempt", (n) => console.log("↻ reconnect_attempt", n));

export const registerSocket = (userId) => {
  if (!userId) return;
  if (socket.connected) socket.emit("register", userId);
  socket.once("connect", () => socket.emit("register", userId));
};

export const sendTyping = (sender, receiver) => {
  socket.emit("typing", { sender, receiver });
};

export const stopTyping = (sender, receiver) => {
  socket.emit("stop_typing", { sender, receiver });
};
export const sendReadReceipt = (readerId, partnerId) => {
  socket.emit("read_messages", { readerId, partnerId });
};


export default socket;
