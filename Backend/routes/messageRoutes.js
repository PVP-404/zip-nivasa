import express from "express";
import { protect } from "../middleware/auth.js";
import {
  sendMessage,
  replyToTenant,
  getOwnerMessages,
  getChatThread,
  markAsContacted,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.post("/reply", protect, replyToTenant);
router.get("/owner", protect, getOwnerMessages);
router.get("/:pgId/:tenantId", protect, getChatThread);
router.put("/mark/:id", protect, markAsContacted);

export default router;
