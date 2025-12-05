import express from "express";
import { protect } from "../middleware/auth.js";
import { getNotifications, markAsRead } from "../controllers/userNotificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.post("/mark-read", protect, markAsRead);

export default router;
