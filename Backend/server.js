import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import pgRoutes from "./routes/pgRoutes.js";
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());   // Parse JSON bodies
app.use(cors());           // Enable CORS for frontend
app.use(morgan("dev"));    // Log HTTP requests

// Database connection
connectDB();

// Routes
app.use("/api/pgs", pgRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
