import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerUser = async (data) => {
  const { email, password } = data;

  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered");

  // HASH PASSWORD
  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({ ...data, password: hashed });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  // Create JWT
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};
