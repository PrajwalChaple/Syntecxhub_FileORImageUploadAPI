// ============================================
// Global Error Handler Middleware
// ============================================
// This middleware catches all errors thrown in
// the application, including Multer-specific errors
// (file too large, invalid type) and sends a
// consistent JSON error response to the client.
// ============================================

const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // -------------------------------------------
  // Handle Multer-specific errors
  // -------------------------------------------
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      // File exceeds the size limit set in multer config
      case "LIMIT_FILE_SIZE":
        statusCode = 413; // 413 = Payload Too Large
        message = "File is too large. Maximum allowed size is 5MB.";
        break;

      // More than expected number of files uploaded
      case "LIMIT_UNEXPECTED_FILE":
        statusCode = 400; // 400 = Bad Request
        message =
          'Unexpected file field. Please use "file" as the field name.';
        break;

      // Too many files uploaded at once
      case "LIMIT_FILE_COUNT":
        statusCode = 400;
        message = "Too many files uploaded at once.";
        break;

      // Fallback for any other Multer error
      default:
        statusCode = 400;
        message = `Upload error: ${err.message}`;
    }
  }

  // -------------------------------------------
  // Handle custom file filter errors
  // (e.g., invalid MIME type rejection from upload.js)
  // -------------------------------------------
  if (err.message && err.message.includes("Invalid file type")) {
    statusCode = 415; // 415 = Unsupported Media Type
    message = err.message;
  }

  // Log the error for debugging (server-side only)
  console.error(`❌ Error: ${message}`);

  // Send consistent JSON error response
  res.status(statusCode).json({
    success: false,
    message: message,
    // Only include stack trace in development mode
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
