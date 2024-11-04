/*jshint esversion: 8 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pinoLogger = require("./logger");

const connectToDatabase = require("./models/db");
const { loadData } = require("./util/import-mongo/index");

const app = express();
const port = process.env.PORT || 3060;  // Use the port from environment variables if available

// CORS Configuration - allow requests from any origin
app.use(cors({
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Limit methods to what your app needs
  credentials: true // Allow credentials if needed (cookies, etc.)
}));

// Body parser - to handle JSON requests
app.use(express.json());

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    pinoLogger.info("Connected to DB");
  })
  .catch((e) => console.error("Failed to connect to DB", e));

// Route files
const giftRoutes = require("./routes/giftRoutes");
const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");

// Logger middleware
const pinoHttp = require("pino-http");
const logger = require("./logger");
app.use(pinoHttp({ logger }));

// Use Routes
app.use("/api/gifts", giftRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);

// Test route to check if the server is running
app.get("/", (req, res) => {
  res.send("Inside the server");
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(err); // Use your logger to log errors
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message || "Something went wrong"
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});