import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from "../controllers/userNotificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.post("/mark-read", protect, markAllAsRead);
router.delete("/read-delete/:id", protect, deleteNotification);
router.delete("/clear-all", protect, clearAllNotifications);

export default router;
