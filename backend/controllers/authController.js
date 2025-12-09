import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import admin from "../config/firebaseAdmin.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import PGOwner from "../models/PGOwner.js";
import MessOwner from "../models/MessOwner.js";
import LaundryOwner from "../models/LaundryOwner.js";

const ensureJwt = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
    throw new Error("JWT_SECRET is not set in environment");
  }
};

export const register = async (req, res) => {
  try {
    ensureJwt();

    const { role, email, password, name, phone, ...roleBody } = req.body;

    if (!role || !email || !password || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: "name, email, phone, password and role are required",
      });
    }

    const already = await User.findOne({ email });
    if (already) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    let roleDoc = null;
    let roleModelName = null;

    switch (role) {
      case "tenant":
        if (!roleBody.professionType || !["student", "job"].includes(roleBody.professionType)) {
          return res.status(400).json({
            success: false,
            message: "professionType must be 'student' or 'job'",
          });
        }
        roleDoc = await Tenant.create(roleBody);
        roleModelName = "Tenant";
        break;

      case "pgowner":
        roleDoc = await PGOwner.create(roleBody);
        roleModelName = "PGOwner";
        break;

      case "messowner":
        roleDoc = await MessOwner.create(roleBody);
        roleModelName = "MessOwner";
        break;

      case "laundry":
        roleDoc = await LaundryOwner.create(roleBody);
        roleModelName = "LaundryOwner";
        break;

      default:
        return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      roleId: roleDoc?._id,
      roleModel: roleModelName,
    });

    await roleDoc.updateOne({ userId: user._id });

    return res.json({
      success: true,
      message: "Registration successful",
      userId: user._id,
      role: user.role,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export const login = async (req, res) => {
  try {
    ensureJwt();

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "Invalid email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    let roleData = null;

    switch (user.role) {
      case "tenant": roleData = await Tenant.findById(user.roleId); break;
      case "pgowner": roleData = await PGOwner.findById(user.roleId); break;
      case "messowner": roleData = await MessOwner.findById(user.roleId); break;
      case "laundry": roleData = await LaundryOwner.findById(user.roleId); break;
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: roleData,
      },
    });
  } catch (error) {
    console.error("ME ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserPublic = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name phone role");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, user });
  } catch (err) {
    console.error("getUserPublic error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    // Block non-tenant users
    if (user && user.role !== "tenant" && user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only tenant/student can login with Google.",
      });
    }

    // Create new tenant if first time
    if (!user) {
      user = await User.create({
        name,
        email,
        password: sub, // dummy
        googleId: sub,
        profileImage: picture,
        role: "tenant",
        roleModel: "Tenant",
        profileCompleted: false
      });
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });

  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ success: false, message: "Google login error" });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const { phone, professionType, gender } = req.body;

    if (!phone || !professionType || !gender) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // Create role record if missing
    let tenantData = await Tenant.create({
      professionType,
      gender,
      userId: user._id
    });

    user.phone = phone;
    user.roleId = tenantData._id;
    user.roleModel = "Tenant";
    user.profileCompleted = true;

    await user.save();

    res.json({
      success: true,
      message: "Profile completed",
      user
    });

  } catch (err) {
    console.error("Complete Profile Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//phone otp login
export const phoneLogin = async (req, res) => {
  try {
    ensureJwt();

    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token required",
      });
    }

    // Verify OTP with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);

    const phone = decoded.phone_number; 

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Firebase token does not contain phone number",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ phone });

    // If first-time login auto-create as tenant
    if (!user) {
      // Create tenant record
      const tenant = await Tenant.create({
        professionType: "student",
        gender: "not-set",
      });

      user = await User.create({
        name: "Phone User",
        email: null,
        phone,
        password: phone,
        role: "tenant",
        roleId: tenant._id,
        roleModel: "Tenant",
        profileCompleted: false,
        provider: "phone",
      });

      await tenant.updateOne({ userId: user._id });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });

  } catch (err) {
    console.error("Phone Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Phone login failed",
    });
  }
};
