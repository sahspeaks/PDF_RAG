const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Load environment variables
dotenv.config();

// Import routes
const uploadRoutes = require("./routes/uploadRoutes");
const askRoutes = require("./routes/askRoutes");

// Initialize Express app
const app = express();

// Enable CORS with permissive configuration
app.use(
  cors({
    origin: ["http://localhost:5173"], // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
  })
);

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Parse JSON requests
app.use(
  express.json({
    limit: "50mb",
  })
);

// Parse URL-encoded requests
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use("/api", uploadRoutes);
app.use("/api", askRoutes);

// Error handling middleware - should be after routes
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    error: "Server error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Basic route for testing
app.get("/", (req, res) => {
  res.send("PDF AI Research Assistant API is running");
});

// Initialize Qdrant collection
const { initializeCollection } = require("./utils/qdrantService");

// Start server
const PORT = process.env.PORT || 5001; // Changed port to 5001
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await initializeCollection();
    console.log("Qdrant collection initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Qdrant collection:", error);
  }
});

// Handle process events to prevent unexpected shutdowns
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Keep the process running
process.stdin.resume();
