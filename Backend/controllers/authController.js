import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import PGOwner from "../models/PGOwner.js";
import MessOwner from "../models/MessOwner.js";
import LaundryOwner from "../models/LaundryOwner.js";

// ✅ Ensure JWT Secret exists
const ensureJwt = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
    throw new Error("JWT_SECRET is not set in environment");
  }
};

// ✅ REGISTER USER
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

    // Check duplicate
    const already = await User.findOne({ email });
    if (already) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create role-specific document
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create main user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      roleId: roleDoc?._id,
      roleModel: roleModelName,
    });

    // Backlink userId in role model
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

// ✅ LOGIN USER
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

// ✅ GET LOGGED-IN USER PROFILE
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
