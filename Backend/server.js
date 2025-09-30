import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import pgRoutes from "./routes/pgRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DB connection
connectDB();

// Routes
app.use("/api/pgs", pgRoutes);

app.get("/", (req, res) => res.send("PG Backend Running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
