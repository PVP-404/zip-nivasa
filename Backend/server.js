// server.js
const express = require("express");
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Hello, Node.js backend!");
});

// Example POST route
app.post("/data", (req, res) => {
  const data = req.body;
  res.json({ message: "Data received", data });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
