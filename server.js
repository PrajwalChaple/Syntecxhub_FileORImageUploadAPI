// ============================================
// Server Entry Point - Express Application
// ============================================
// This is the main file that:
// 1. Loads environment variables from .env
// 2. Connects to MongoDB
// 3. Sets up Express middleware (CORS, logging, etc.)
// 4. Mounts API routes
// 5. Serves uploaded files as static assets
// 6. Serves the frontend UI
// 7. Starts the HTTP server
// ============================================

// Load environment variables FIRST (before anything else uses them)
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

// Import our custom modules
const connectDB = require("./config/db");
const fileRoutes = require("./routes/fileRoutes");
const errorHandler = require("./middleware/errorHandler");

// Initialize Express application
const app = express();

// -------------------------------------------
// Create uploads directory if it doesn't exist
// -------------------------------------------
// This ensures the 'uploads/' folder is ready
// before any file upload attempt.
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created 'uploads/' directory.");
}

// -------------------------------------------
// Connect to MongoDB
// -------------------------------------------
connectDB();

// =============================================
// Middleware Setup
// =============================================

// Enable CORS - allows requests from any origin
// (useful when frontend and backend are on different ports)
app.use(cors());

// HTTP request logger for development
// Logs method, URL, status code, and response time
app.use(morgan("dev"));

// Parse incoming JSON request bodies
// (for any non-file API requests)
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------
// Serve Static Files
// -------------------------------------------

// Serve uploaded files at /uploads URL path
// e.g., GET /uploads/1716849600000-photo.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve the frontend UI from the 'public/' directory
// e.g., GET / serves public/index.html
app.use(express.static(path.join(__dirname, "public")));

// =============================================
// API Routes
// =============================================

// Mount file routes at /api/files
// All file-related endpoints are prefixed with /api/files
app.use("/api/files", fileRoutes);

// -------------------------------------------
// Health Check Endpoint
// -------------------------------------------
// Quick endpoint to verify the API is running
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 File Upload API is running!",
    timestamp: new Date().toISOString(),
  });
});

// =============================================
// Global Error Handler (must be LAST middleware)
// =============================================
// Catches all errors from routes and middleware
app.use(errorHandler);

// =============================================
// Start the Server
// =============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 ====================================`);
  console.log(`   Server running on port ${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api/files`);
  console.log(`   Health:   http://localhost:${PORT}/api/health`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   ====================================\n`);
});
