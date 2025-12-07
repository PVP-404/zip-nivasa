import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

export async function notifyNewMessage({ senderId, receiverId, text }) {
  try {
    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select("name"),
      User.findById(receiverId).select("fcmTokens"),
    ]);

    if (!receiver?.fcmTokens || receiver.fcmTokens.length === 0) return;

    const body =
      text.length > 60 ? text.slice(0, 57).trimEnd() + "..." : text;

    const message = {
      notification: {
        title: `New message from ${sender?.name || "Someone"}`,
        body,
      },
      data: {
        type: "chat",
        senderId: String(senderId),
        receiverId: String(receiverId),
        click_action: `/chat/${senderId}`, // for service worker
      },
      tokens: receiver.fcmTokens,
    };

    await admin.messaging().sendEachForMulticast(message);
  } catch (err) {
    console.error("notifyNewMessage error:", err.message);
  }
}
