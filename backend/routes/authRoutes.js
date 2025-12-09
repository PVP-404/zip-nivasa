import express from "express";
import {
  register,
  login,
  getMe,
  getUserPublic,
  googleLogin,
  completeProfile,
} from "../controllers/authController.js";;
import { protect } from "../middleware/auth.js";



const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/user/:id", getUserPublic);
router.post("/google-login", googleLogin);
router.put("/complete-profile", protect, completeProfile);
export default router;
