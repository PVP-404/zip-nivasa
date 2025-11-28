// backend/routes/chatRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  sendMessage,
  getHistory,
  getConversations,
  markAsRead
} from "../controllers/chatController.js";

const router = express.Router();

// REST fallback send
router.post("/send", protect, sendMessage);

// History with specific user
router.get("/history/:receiverId", protect, getHistory);

// All my conversations (distinct partners)
router.get("/conversations", protect, getConversations);

// backend/routes/chatRoutes.js
router.get("/inbox", protect, getConversations); // alias


// Mark messages from partner as read
router.post("/mark-read", protect, markAsRead);

export default router;
