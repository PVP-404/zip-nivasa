// Backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import PGOwner from "../models/PGOwner.js";
import MessOwner from "../models/MessOwner.js";
import LaundryOwner from "../models/LaundryOwner.js";

// --- helper: require JWT secret early
const ensureJwt = () => {
  if (!process.env.JWT_SECRET || String(process.env.JWT_SECRET).trim() === "") {
    throw new Error("JWT_SECRET is not set in environment");
  }
};

export const register = async (req, res) => {
  try {
    ensureJwt();

    const { role, email, password, name, phone, ...roleBody } = req.body;

    if (!role || !email || !password || !name || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "name, email, phone, password and role are required" });
    }

    // prevent duplicate users BEFORE creating role docs (avoid orphan docs)
    const already = await User.findOne({ email });
    if (already) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // create the role-specific document
    let roleDoc = null;
    let roleModelName = null;

    switch (role) {
      case "tenant": {
        // must include professionType
        if (!roleBody.professionType || !["student", "job"].includes(roleBody.professionType)) {
          return res.status(400).json({
            success: false,
            message: "professionType must be 'student' or 'job' for tenant",
          });
        }
        roleDoc = await Tenant.create(roleBody);
        roleModelName = "Tenant";
        break;
      }

      case "pgowner": {
        roleDoc = await PGOwner.create(roleBody);
        roleModelName = "PGOwner";
        break;
      }

      case "messowner": {
        roleDoc = await MessOwner.create(roleBody);
        roleModelName = "MessOwner";
        break;
      }

      case "laundry": {
        roleDoc = await LaundryOwner.create(roleBody);
        roleModelName = "LaundryOwner";
        break;
      }

      default:
        return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create main user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      roleId: roleDoc?._id,
      roleModel: roleModelName,
    });

    // back-link userId into role doc (optional but neat)
    if (roleDoc && user?._id) {
      const ModelMap = {
        Tenant,
        PGOwner,
        MessOwner,
        LaundryOwner,
      };
      await ModelMap[roleModelName].findByIdAndUpdate(roleDoc._id, { userId: user._id });
    }

    return res.json({
      success: true,
      message: "Registration successful",
      userId: user._id,
      role: user.role,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error?.message || error);
    const msg =
      error?.message === "JWT_SECRET is not set in environment"
        ? error.message
        : "Server error";
    return res.status(500).json({ success: false, message: msg });
  }
};

export const login = async (req, res) => {
  try {
    ensureJwt();

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    if (!user.password) {
      return res
        .status(500)
        .json({ success: false, message: "User has no password stored" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, message: "Invalid password" });
    }

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
    console.error("LOGIN ERROR:", error?.message || error);
    const msg =
      error?.message === "JWT_SECRET is not set in environment"
        ? error.message
        : "Server error";
    return res.status(500).json({ success: false, message: msg });
  }
};
