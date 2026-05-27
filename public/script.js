// ============================================
// Frontend JavaScript - File Upload Client
// ============================================
// This script handles all frontend interactions:
// 1. Drag & drop file selection
// 2. File preview before upload
// 3. Upload with progress tracking via XMLHttpRequest
// 4. Gallery rendering & management
// 5. Lightbox for viewing full-size images
// 6. Copy URL & delete functionality
// 7. Health check for API status
// ============================================

// -------------------------------------------
// API Base URL (same origin since served by Express)
// -------------------------------------------
const API_BASE = "/api/files";

// -------------------------------------------
// DOM Element References
// -------------------------------------------
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const previewArea = document.getElementById("preview-area");
const previewImage = document.getElementById("preview-image");
const previewName = document.getElementById("preview-name");
const previewSize = document.getElementById("preview-size");
const btnClear = document.getElementById("btn-clear");
const btnUpload = document.getElementById("btn-upload");
const progressContainer = document.getElementById("progress-container");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const resultMessage = document.getElementById("result-message");
const galleryGrid = document.getElementById("gallery-grid");
const galleryLoading = document.getElementById("gallery-loading");
const galleryEmpty = document.getElementById("gallery-empty");
const fileCount = document.getElementById("file-count");
const btnRefresh = document.getElementById("btn-refresh");
const statusBadge = document.getElementById("status-badge");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxInfo = document.getElementById("lightbox-info");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxOverlay = document.getElementById("lightbox-overlay");

// Currently selected file (stored in memory before upload)
let selectedFile = null;

// -------------------------------------------
// Initialize Lucide Icons
// -------------------------------------------
// Lucide replaces the <i data-lucide="..."> tags
// with actual SVG icons.
lucide.createIcons();

// =============================================
// 1. DRAG & DROP FUNCTIONALITY
// =============================================

// Prevent default browser behavior for drag events
// (browser would normally open the dropped file)
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

// Add visual feedback when dragging over the drop zone
["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, () => {
    dropZone.classList.add("drag-over");
  });
});

// Remove visual feedback when dragging leaves the zone
["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, () => {
    dropZone.classList.remove("drag-over");
  });
});

// Handle the actual file drop
dropZone.addEventListener("drop", (e) => {
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFileSelection(files[0]); // Only take the first file
  }
});

// =============================================
// 2. FILE INPUT (Browse button) HANDLER
// =============================================
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleFileSelection(e.target.files[0]);
  }
});

// =============================================
// 3. FILE SELECTION & PREVIEW
// =============================================

/**
 * Handles a selected file: validates it and shows preview.
 * @param {File} file - The selected file object
 */
function handleFileSelection(file) {
  // Validate file type on the client side
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (!allowedTypes.includes(file.type)) {
    showToast("Invalid file type. Only images are allowed.", "error");
    return;
  }

  // Validate file size (5MB = 5 * 1024 * 1024 bytes)
  if (file.size > 5 * 1024 * 1024) {
    showToast("File is too large. Maximum size is 5MB.", "error");
    return;
  }

  // Store the selected file
  selectedFile = file;

  // Show the preview area with file details
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result; // Set preview image source
    previewName.textContent = file.name;
    previewSize.textContent = formatFileSize(file.size);

    // Toggle visibility: hide drop content, show preview
    document.querySelector(".drop-zone-content").style.display = "none";
    previewArea.style.display = "flex";
    btnUpload.disabled = false; // Enable the upload button
  };
  reader.readAsDataURL(file); // Read file as base64 for preview

  // Hide any previous result messages
  resultMessage.style.display = "none";
}

// -------------------------------------------
// Clear Selection Button
// -------------------------------------------
btnClear.addEventListener("click", () => {
  clearSelection();
});

/**
 * Resets the file selection and hides preview.
 */
function clearSelection() {
  selectedFile = null;
  fileInput.value = ""; // Reset the file input
  previewArea.style.display = "none";
  document.querySelector(".drop-zone-content").style.display = "block";
  btnUpload.disabled = true;
  resultMessage.style.display = "none";
  progressContainer.style.display = "none";
}

// =============================================
// 4. FILE UPLOAD (with progress tracking)
// =============================================

btnUpload.addEventListener("click", () => {
  if (!selectedFile) return;
  uploadFile(selectedFile);
});

/**
 * Uploads a file to the server using XMLHttpRequest
 * (we use XHR instead of fetch to get upload progress events).
 * @param {File} file - The file to upload
 */
function uploadFile(file) {
  // Create FormData and append the file with field name "file"
  // This matches the multer configuration: upload.single("file")
  const formData = new FormData();
  formData.append("file", file);

  // Show progress bar and disable upload button
  progressContainer.style.display = "block";
  progressFill.style.width = "0%";
  progressText.textContent = "Uploading...";
  btnUpload.disabled = true;
  resultMessage.style.display = "none";

  // Use XMLHttpRequest for upload progress tracking
  const xhr = new XMLHttpRequest();

  // -------------------------------------------
  // Track upload progress
  // -------------------------------------------
  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressFill.style.width = `${percent}%`;
      progressText.textContent = `Uploading... ${percent}%`;
    }
  });

  // -------------------------------------------
  // Handle upload completion
  // -------------------------------------------
  xhr.addEventListener("load", () => {
    const response = JSON.parse(xhr.responseText);

    if (xhr.status >= 200 && xhr.status < 300 && response.success) {
      // Upload successful!
      progressText.textContent = "Upload complete! ✅";
      showResult("success", `✅ ${response.message}`);
      showToast("Image uploaded successfully!", "success");

      // Refresh the gallery to show the new image
      loadGallery();

      // Clear the selection after a short delay
      setTimeout(clearSelection, 1500);
    } else {
      // Server returned an error
      progressText.textContent = "Upload failed ❌";
      showResult("error", `❌ ${response.message || "Upload failed"}`);
      btnUpload.disabled = false;
    }
  });

  // -------------------------------------------
  // Handle network errors
  // -------------------------------------------
  xhr.addEventListener("error", () => {
    progressText.textContent = "Network error ❌";
    showResult(
      "error",
      "❌ Network error. Please check if the server is running."
    );
    btnUpload.disabled = false;
  });

  // Send the request to our upload endpoint
  xhr.open("POST", `${API_BASE}/upload`);
  xhr.send(formData);
}

// =============================================
// 5. GALLERY - Load & Render Images
// =============================================

/**
 * Fetches all uploaded files from the API
 * and renders them in the gallery grid.
 */
async function loadGallery() {
  // Show loading spinner
  galleryLoading.style.display = "block";
  galleryEmpty.style.display = "none";
  galleryGrid.innerHTML = "";

  try {
    const response = await fetch(API_BASE);
    const data = await response.json();

    // Hide loading spinner
    galleryLoading.style.display = "none";

    if (data.success && data.data.length > 0) {
      // Update file count badge
      fileCount.textContent = `${data.count} file${data.count !== 1 ? "s" : ""}`;

      // Render each file as a gallery card
      data.data.forEach((file, index) => {
        const card = createGalleryCard(file, index);
        galleryGrid.appendChild(card);
      });

      // Re-initialize Lucide icons for the new cards
      lucide.createIcons();
    } else {
      // No files found - show empty state
      galleryEmpty.style.display = "block";
      fileCount.textContent = "0 files";
    }
  } catch (error) {
    // API call failed
    galleryLoading.style.display = "none";
    galleryEmpty.style.display = "block";
    console.error("Failed to load gallery:", error);
  }
}

/**
 * Creates a gallery card DOM element for a file.
 * @param {Object} file - The file metadata from the API
 * @param {number} index - Index for staggered animation delay
 * @returns {HTMLElement} - The card DOM element
 */
function createGalleryCard(file, index) {
  const card = document.createElement("div");
  card.className = "gallery-card";
  card.style.animationDelay = `${index * 0.05}s`;

  card.innerHTML = `
    <div class="card-image-wrapper">
      <img
        class="card-image"
        src="${file.fileUrl}"
        alt="${file.originalName}"
        loading="lazy"
        onclick="openLightbox('${file.fileUrl}', '${file.originalName}')"
      />
    </div>
    <div class="card-body">
      <p class="card-name" title="${file.originalName}">${file.originalName}</p>
      <div class="card-meta">
        <span class="card-size">
          <i data-lucide="hard-drive" style="width:12px;height:12px;"></i>
          ${formatFileSize(file.fileSize)}
        </span>
        <div class="card-actions">
          <button
            class="btn-action copy"
            title="Copy URL"
            onclick="copyUrl('${file.fileUrl}')"
          >
            <i data-lucide="copy"></i>
          </button>
          <button
            class="btn-action delete"
            title="Delete"
            onclick="deleteFile('${file._id}')"
          >
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  return card;
}

// =============================================
// 6. DELETE FILE
// =============================================

/**
 * Deletes a file by its MongoDB ID.
 * Sends a DELETE request and refreshes the gallery.
 * @param {string} id - MongoDB ObjectId of the file
 */
async function deleteFile(id) {
  // Confirm deletion with the user
  if (!confirm("Are you sure you want to delete this image?")) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (data.success) {
      showToast("Image deleted successfully!", "success");
      loadGallery(); // Refresh the gallery
    } else {
      showToast(data.message || "Failed to delete", "error");
    }
  } catch (error) {
    showToast("Network error. Could not delete.", "error");
    console.error("Delete error:", error);
  }
}

// =============================================
// 7. COPY URL TO CLIPBOARD
// =============================================

/**
 * Copies the file URL to the clipboard.
 * @param {string} url - The full file URL to copy
 */
async function copyUrl(url) {
  try {
    await navigator.clipboard.writeText(url);
    showToast("URL copied to clipboard! 📋", "info");
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showToast("URL copied!", "info");
  }
}

// =============================================
// 8. LIGHTBOX (Full-size Image Viewer)
// =============================================

/**
 * Opens the lightbox modal to display a full-size image.
 * @param {string} url - The image URL
 * @param {string} name - The original filename
 */
function openLightbox(url, name) {
  lightboxImage.src = url;
  lightboxInfo.textContent = name;
  lightbox.style.display = "flex";
  document.body.style.overflow = "hidden"; // Prevent background scrolling
}

/**
 * Closes the lightbox modal.
 */
function closeLightbox() {
  lightbox.style.display = "none";
  document.body.style.overflow = ""; // Restore scrolling
}

// Close lightbox when clicking the X button or overlay
lightboxClose.addEventListener("click", closeLightbox);
lightboxOverlay.addEventListener("click", closeLightbox);

// Close lightbox on Escape key press
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// =============================================
// 9. API HEALTH CHECK
// =============================================

/**
 * Checks if the API server is running by hitting
 * the /api/health endpoint. Updates the status badge.
 */
async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();

    if (data.success) {
      // API is online
      statusBadge.classList.add("online");
      statusBadge.classList.remove("offline");
      statusBadge.querySelector(".status-text").textContent = "API Online";
    }
  } catch (error) {
    // API is offline or unreachable
    statusBadge.classList.add("offline");
    statusBadge.classList.remove("online");
    statusBadge.querySelector(".status-text").textContent = "API Offline";
  }
}

// =============================================
// 10. UTILITY FUNCTIONS
// =============================================

/**
 * Formats a file size in bytes to a human-readable string.
 * e.g., 1048576 → "1.00 MB"
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Shows a result message below the upload button.
 * @param {string} type - "success" or "error"
 * @param {string} message - The message to display
 */
function showResult(type, message) {
  resultMessage.className = `result-message ${type}`;
  resultMessage.textContent = message;
  resultMessage.style.display = "flex";
}

/**
 * Shows a toast notification at the bottom-right corner.
 * Auto-disappears after 3 seconds.
 * @param {string} message - The toast message
 * @param {string} type - "success", "error", or "info"
 */
function showToast(message, type = "info") {
  // Remove any existing toasts
  document.querySelectorAll(".toast").forEach((t) => t.remove());

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3000);
}

// =============================================
// 11. REFRESH BUTTON HANDLER
// =============================================
btnRefresh.addEventListener("click", () => {
  loadGallery();
  showToast("Gallery refreshed!", "info");
});

// =============================================
// 12. INITIALIZATION
// =============================================
// Run these when the page first loads:
// - Check if the API server is healthy
// - Load existing images into the gallery

document.addEventListener("DOMContentLoaded", () => {
  checkHealth();  // Check API status
  loadGallery();  // Load uploaded images
});
