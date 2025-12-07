import express from "express";
import { protect } from "../middleware/auth.js";
import { registerFcmToken, deregisterFcmToken } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/register-token", protect, registerFcmToken);
router.post("/deregister-token", protect, deregisterFcmToken);

export default router;
