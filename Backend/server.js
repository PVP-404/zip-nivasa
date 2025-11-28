// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import cron from "node-cron";

// Routes
import pgRoutes from "./routes/pgRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

// Models
import Message from "./models/Message.js";

//messes
import messOwnerRoutes from "./routes/messOwnerRoutes.js";
import messRoutes from "./routes/messRoutes.js";

dotenv.config();

// __dirname support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB
connectDB();

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/pgs", pgRoutes);
app.use("/api/chat", chatRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Zip Nivasa Backend Running ✅");
});

// API mess Routes
app.use("/api/mess-owner", messOwnerRoutes);
app.use("/api/mess", messRoutes);

//profile routes 
app.use("/api/profile", profileRoutes);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ Register userId with socket
  socket.on("register", (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  // ✅ Typing events
  socket.on("typing", ({ sender, receiver }) => {
    const rSock = onlineUsers.get(receiver);
    if (rSock) io.to(rSock).emit("typing", { sender });
  });

  socket.on("stop_typing", ({ sender, receiver }) => {
    const rSock = onlineUsers.get(receiver);
    if (rSock) io.to(rSock).emit("stop_typing", { sender });
  });

  // ✅ SAVE MESSAGE + EMIT (IMPORTANT)
  socket.on("send_message", async (data) => {
    try {
      const { sender, receiver, message } = data;

      if (!sender || !receiver || !message?.trim()) return;

      // ✅ Save message to DB
      const saved = await Message.create({
        sender,
        receiver,
        message: message.trim(),
      });

      const msgToSend = {
        _id: saved._id,
        sender: saved.sender,
        receiver: saved.receiver,
        message: saved.message,
        createdAt: saved.createdAt,
        readAt: saved.readAt,
      };

      // ✅ Send to receiver if online
      const receiverSocket = onlineUsers.get(receiver);
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive_message", msgToSend);
      }

      // ✅ Echo to sender
      const senderSocket = onlineUsers.get(sender);
      if (senderSocket) {
        io.to(senderSocket).emit("receive_message", msgToSend);
      }
    } catch (err) {
      console.error("❌ Socket Error:", err);
    }
  });

  // ✅ Disconnect
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

// Start server
httpServer.listen(PORT, () => {
  console.log(`✅ Server + Socket.io running on port ${PORT}`);
});


// 🕛 Reset today's specials every midnight
cron.schedule("0 0 * * *", async () => {
  try {
    await Mess.updateMany({}, { 
      $set: { 
        "specialToday.lunch": "",
        "specialToday.dinner": "",
        "specialToday.imageUrl": "",
        "specialToday.date": new Date()
      } 
    });
    console.log("✅ Daily specials reset successfully at midnight");
  } catch (err) {
    console.error("❌ Error resetting daily specials:", err.message);
  }
});
