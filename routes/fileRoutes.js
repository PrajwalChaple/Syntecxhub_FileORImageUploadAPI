// ============================================
// File Routes - API Endpoints
// ============================================
// This module defines all the routes/endpoints
// for file upload operations.
//
// Route Map:
// POST   /api/files/upload  → Upload a single image
// GET    /api/files          → List all uploaded files
// GET    /api/files/:id      → Get single file by ID
// DELETE /api/files/:id      → Delete a file
// ============================================

const express = require("express");
const router = express.Router();

// Import the multer middleware for handling file uploads
const upload = require("../middleware/upload");

// Import controller functions (business logic)
const {
  uploadFile,
  getAllFiles,
  getFileById,
  deleteFile,
} = require("../controllers/fileController");

// -------------------------------------------
// POST /api/files/upload
// -------------------------------------------
// Upload a single file.
// "upload.single('file')" tells Multer to expect
// ONE file in a form field named "file".
// Multer processes the file first, then passes
// control to our uploadFile controller.
router.post("/upload", upload.single("file"), uploadFile);

// -------------------------------------------
// GET /api/files
// -------------------------------------------
// Retrieve metadata for ALL uploaded files.
// Useful for displaying a gallery or file list.
router.get("/", getAllFiles);

// -------------------------------------------
// GET /api/files/:id
// -------------------------------------------
// Retrieve metadata for a SINGLE file using
// its MongoDB ObjectId.
router.get("/:id", getFileById);

// -------------------------------------------
// DELETE /api/files/:id
// -------------------------------------------
// Delete a file by its MongoDB ObjectId.
// This removes both the DB record AND the
// physical file from the uploads/ directory.
router.delete("/:id", deleteFile);

module.exports = router;
