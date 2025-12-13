import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import Mess from "./models/Mess.js";

// Routes
import pgRoutes from "./routes/pgRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import utilityRoutes from "./routes/utilityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userNotificationRoutes from "./routes/userNotificationRoutes.js";
import messOwnerRoutes from "./routes/messOwnerRoutes.js";
import messRoutes from "./routes/messRoutes.js";
import mapRoutes from "./routes/mapRoutes.js";

// Utils / Controllers
import { notifyNewMessage } from "./utils/pushNotifications.js";
import { addNotification } from "./controllers/userNotificationController.js";
import Message from "./models/Message.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;


const normalizeOrigin = (origin) =>
  origin ? origin.replace(/\/$/, "") : origin;

const allowedOrigins = [
  process.env.CLIENT_URL,        // Render frontend
  "http://localhost:5173",       // Local dev
]
  .filter(Boolean)
  .map(normalizeOrigin);

console.log("✅ Allowed CORS Origins:", allowedOrigins);

//health check render
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

//middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman / mobile / SSR

      const normalized = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }

      console.error("Blocked by CORS:", normalized);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDB();

//routes
app.get("/", (req, res) => {
  res.send("Zip Nivasa Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/pgs", pgRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/utilities", utilityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/user-notifications", userNotificationRoutes);
app.use("/api/mess-owner", messOwnerRoutes);
app.use("/api/mess", messRoutes);
app.use("/api/profile", profileRoutes);

//socket.io
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log(" User connected:", socket.id);

  socket.on("register", (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  socket.on("typing", ({ sender, receiver }) => {
    const rSocket = onlineUsers.get(receiver);
    if (rSocket) io.to(rSocket).emit("typing", { sender });
  });

  socket.on("stop_typing", ({ sender, receiver }) => {
    const rSocket = onlineUsers.get(receiver);
    if (rSocket) io.to(rSocket).emit("stop_typing", { sender });
  });

  socket.on("send_message", async ({ sender, receiver, message }) => {
    try {
      if (!sender || !receiver || !message?.trim()) return;

      const saved = await Message.create({
        sender,
        receiver,
        message: message.trim(),
      });

      const payload = {
        _id: saved._id,
        sender,
        receiver,
        message: saved.message,
        createdAt: saved.createdAt,
        readAt: saved.readAt,
      };

      const rSocket = onlineUsers.get(receiver);
      if (rSocket) io.to(rSocket).emit("receive_message", payload);

      const sSocket = onlineUsers.get(sender);
      if (sSocket) io.to(sSocket).emit("receive_message", payload);

      await addNotification({
        userId: receiver,
        senderId: sender,
        title: "New Message",
        body: message.slice(0, 40) + "...",
        chatUserId: sender,
      });

      await notifyNewMessage({
        senderId: sender,
        receiverId: receiver,
        text: message.trim(),
      });

    } catch (err) {
      console.error("Socket error:", err.message);
    }
  });

  socket.on("read_messages", ({ readerId, partnerId }) => {
    const pSocket = onlineUsers.get(partnerId);
    if (pSocket) {
      io.to(pSocket).emit("message_read", {
        readerId,
        partnerId,
        readAt: new Date().toISOString(),
      });
    }
  });

  socket.on("disconnect", () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        break;
      }
    }
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

//Cron Job – Reset daily mess specials
   
cron.schedule("0 0 * * *", async () => {
  try {
    await Mess.updateMany({}, {
      $set: {
        "specialToday.lunch": "",
        "specialToday.dinner": "",
        "specialToday.imageUrl": "",
        "specialToday.date": new Date(),
      },
    });
    console.log("Daily specials reset");
  } catch (err) {
    console.error(" Cron error:", err.message);
  }
});

httpServer.listen(PORT, () => {
  console.log(` Server + Socket.IO running on port ${PORT}`);
});

export { io, onlineUsers };
