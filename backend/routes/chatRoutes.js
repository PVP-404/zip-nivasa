import express from "express";
import { protect } from "../middleware/auth.js";
import {
  sendMessage,
  getHistory,
  getConversations,
  markAsRead
} from "../controllers/chatController.js";

const router = express.Router();
router.post("/send", protect, sendMessage);
router.get("/history/:receiverId", protect, getHistory);
router.get("/conversations", protect, getConversations);
router.get("/inbox", protect, getConversations); 
router.post("/mark-read", protect, markAsRead);

export default router;
