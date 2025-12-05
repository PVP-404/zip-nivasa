import express from "express";
import {
  register,
  login,
  getMe,
  getUserPublic,
} from "../controllers/authController.js";;
import { protect } from "../middleware/auth.js";



const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/user/:id", getUserPublic);
export default router;
