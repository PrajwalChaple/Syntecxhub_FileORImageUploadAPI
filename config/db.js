// ============================================
// MongoDB Connection Configuration
// ============================================
// This module handles connecting to MongoDB using Mongoose.
// It includes retry logic and event listeners for
// connection state changes (connected, error, disconnected).
// ============================================

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // -------------------------------------------
    // Event Listeners for connection state changes
    // -------------------------------------------

    // Fires when the connection is lost after being established
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    // Fires on any connection error
    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    // Fires when the connection is re-established after a disconnect
    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected successfully!");
    });
  } catch (error) {
    // If initial connection fails, log the error and exit the process
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1); // Exit with failure code so the server doesn't run without DB
  }
};

module.exports = connectDB;
