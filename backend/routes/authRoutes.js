import express from "express";
import {
  register,
  login,
  getMe,
  getUserPublic,
  googleLogin,
  completeProfile,
  phoneLogin
} from "../controllers/authController.js";;
import { protect } from "../middleware/auth.js";



const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/user/:id", getUserPublic);
router.post("/google-login", googleLogin);
router.put("/complete-profile", protect, completeProfile);
router.post("/phone-login", phoneLogin);
export default router;
