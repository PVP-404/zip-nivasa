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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve Uploaded Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Connect MongoDB
connectDB();

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/pgs", pgRoutes);

// ✅ Root Test Route
app.get("/", (req, res) => {
  res.send("Zip Nivasa Backend Running ✅");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
