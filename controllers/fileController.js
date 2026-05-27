// ============================================
// File Controller - Business Logic
// ============================================
// This controller handles all the business logic
// for file operations:
// - uploadFile:  Save uploaded file metadata to MongoDB
// - getAllFiles: Retrieve all file records from DB
// - getFileById: Retrieve a single file record by its ID
// - deleteFile:  Delete a file from disk AND its DB record
// ============================================

const File = require("../models/File");
const fs = require("fs");
const path = require("path");

// -------------------------------------------
// @desc    Upload a single file/image
// @route   POST /api/files/upload
// @access  Public
// -------------------------------------------
const uploadFile = async (req, res, next) => {
  try {
    // Check if a file was actually provided in the request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please select a file to upload.",
      });
    }

    // Destructure file info provided by Multer after processing
    const { originalname, filename, path: filePath, mimetype, size } = req.file;

    // Construct the full URL where this file can be accessed
    // e.g., "http://localhost:5000/uploads/1716849600000-photo.jpg"
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fileUrl = `${baseUrl}/uploads/${filename}`;

    // Create a new File document in MongoDB with all metadata
    const newFile = await File.create({
      originalName: originalname,
      fileName: filename,
      filePath: filePath,
      fileUrl: fileUrl,
      fileType: mimetype,
      fileSize: size,
    });

    // Respond with success and the file metadata
    res.status(201).json({
      success: true,
      message: "File uploaded successfully! 🎉",
      data: newFile,
    });
  } catch (error) {
    // Pass error to the global error handler
    next(error);
  }
};

// -------------------------------------------
// @desc    Get all uploaded files
// @route   GET /api/files
// @access  Public
// -------------------------------------------
const getAllFiles = async (req, res, next) => {
  try {
    // Fetch all file records, sorted by newest first
    const files = await File.find().sort({ uploadedAt: -1 });

    // Return the list with count
    res.status(200).json({
      success: true,
      message: `Found ${files.length} file(s).`,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// @desc    Get a single file by its MongoDB ID
// @route   GET /api/files/:id
// @access  Public
// -------------------------------------------
const getFileById = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);

    // If no file found with the given ID
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found. Please check the ID and try again.",
      });
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID format.",
      });
    }
    next(error);
  }
};

// -------------------------------------------
// @desc    Delete a file (from disk AND database)
// @route   DELETE /api/files/:id
// @access  Public
// -------------------------------------------
const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);

    // If no file found with the given ID
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found. Nothing to delete.",
      });
    }

    // Build the absolute path to the file on disk
    const absolutePath = path.join(__dirname, "..", file.filePath);

    // Delete the physical file from the filesystem
    // Using fs.unlink to remove the file from disk
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`🗑️  Deleted file from disk: ${file.fileName}`);
    } else {
      console.warn(`⚠️  File not found on disk: ${absolutePath}`);
    }

    // Remove the file record from MongoDB
    await File.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "File deleted successfully! 🗑️",
      data: file,
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID format.",
      });
    }
    next(error);
  }
};

module.exports = {
  uploadFile,
  getAllFiles,
  getFileById,
  deleteFile,
};
