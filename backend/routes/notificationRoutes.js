import express from "express";
import { protect } from "../middleware/auth.js";
import { registerFcmToken } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/register-token", protect, registerFcmToken);

export default router;
