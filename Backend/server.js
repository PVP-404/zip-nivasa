import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// Routes
import pgRoutes from "./routes/pgRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serving uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Connect DB
connectDB();

// ✅ API Routes
app.use("/api/auth", authRoutes);  // Authentication (register, login)
app.use("/api/pgs", pgRoutes);     // PG listings

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("Zip Nivasa Backend Running ✅");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
