// ============================================
// Multer Configuration - File Upload Middleware
// ============================================
// Multer is a Node.js middleware for handling
// multipart/form-data, primarily used for file uploads.
//
// This config defines:
// 1. WHERE to store files (disk storage with custom naming)
// 2. WHAT files to accept (image MIME types only)
// 3. HOW BIG files can be (5MB max)
// ============================================

const multer = require("multer");
const path = require("path");

// -------------------------------------------
// Storage Configuration
// -------------------------------------------
// diskStorage gives us full control over where
// and how files are saved to the filesystem.
const storage = multer.diskStorage({
  // destination: the folder where uploaded files will be saved
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // All files go into the 'uploads/' directory
  },

  // filename: how the file will be named on disk
  // We prepend a timestamp to avoid name collisions
  filename: function (req, file, cb) {
    // Create a unique suffix using timestamp + random number
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Get the file extension from the original name (e.g., ".jpg")
    const ext = path.extname(file.originalname);

    // Final filename: "1716849600000-123456789.jpg"
    cb(null, uniqueSuffix + ext);
  },
});

// -------------------------------------------
// File Filter - Validate File Types
// -------------------------------------------
// Only allow image files to be uploaded.
// This prevents users from uploading scripts,
// executables, or other potentially harmful files.
const fileFilter = (req, file, cb) => {
  // List of allowed MIME types (images only)
  const allowedMimeTypes = [
    "image/jpeg",   // .jpg, .jpeg
    "image/png",    // .png
    "image/gif",    // .gif
    "image/webp",   // .webp
    "image/svg+xml", // .svg
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // File type is valid - accept it
    cb(null, true);
  } else {
    // File type is NOT allowed - reject it with an error
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only images are allowed (JPEG, PNG, GIF, WebP, SVG).`
      ),
      false
    );
  }
};

// -------------------------------------------
// Multer Instance - Combine all configs
// -------------------------------------------
const upload = multer({
  storage: storage,      // Use our custom disk storage
  fileFilter: fileFilter, // Use our file type validator
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size (in bytes)
    // 5 * 1024 * 1024 = 5,242,880 bytes = 5 MB
  },
});

// Export the configured multer instance
module.exports = upload;
