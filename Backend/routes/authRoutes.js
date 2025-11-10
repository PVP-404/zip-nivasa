import express from "express";
import {
  register,
  login,
  getMe,
  getUserPublic,
} from "../controllers/authController.js";;
import { protect } from "../middleware/auth.js";



const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logged-in User Info
router.get("/me", protect, getMe);

// ✅ Public user info for chat heads
// ✅ Public user info for chat
router.get("/user/:id", getUserPublic);
export default router;
