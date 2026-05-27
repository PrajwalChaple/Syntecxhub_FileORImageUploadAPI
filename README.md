# 📁 SyntecxHub - File / Image Upload API

A production-ready REST API for uploading, storing, retrieving, and managing images. Built with **Node.js**, **Express**, **Multer**, and **MongoDB**.

---

## ✨ Features

- **Image Upload** — Upload images via multipart/form-data using Multer
- **File Validation** — Only image types allowed (JPEG, PNG, GIF, WebP, SVG)
- **Size Limit** — Max 5MB per file
- **MongoDB Storage** — File metadata (filename, path, URL, type, size) stored in MongoDB
- **Serve Images** — Files served via static URL endpoints
- **CRUD Operations** — Upload, list all, get by ID, and delete files
- **Beautiful UI** — Drag & drop upload with live preview and image gallery
- **Error Handling** — Consistent JSON error responses with proper HTTP status codes

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web framework |
| Multer | Multipart/form-data file handling |
| Mongoose | MongoDB ODM |
| CORS | Cross-origin resource sharing |
| Morgan | HTTP request logging |
| dotenv | Environment variable management |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd Syntecxhub_FileORImageUploadAPI

# 2. Install dependencies
npm install

# 3. Create .env file (already provided)
# Edit the MONGO_URI if needed

# 4. Start the server
npm run dev
```

### Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/file_upload_db
BASE_URL=http://localhost:5000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/files/upload` | Upload a single image |
| `GET` | `/api/files` | List all uploaded files |
| `GET` | `/api/files/:id` | Get single file by ID |
| `DELETE` | `/api/files/:id` | Delete file (disk + DB) |
| `GET` | `/uploads/:filename` | Serve the actual image |
| `GET` | `/api/health` | Health check |

### Upload Example (cURL)

```bash
curl -X POST http://localhost:5000/api/files/upload \
  -F "file=@/path/to/your/image.jpg"
```

### Response Format

```json
{
  "success": true,
  "message": "File uploaded successfully! 🎉",
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "originalName": "profile-photo.jpg",
    "fileName": "1716849600000-123456789.jpg",
    "filePath": "uploads/1716849600000-123456789.jpg",
    "fileUrl": "http://localhost:5000/uploads/1716849600000-123456789.jpg",
    "fileType": "image/jpeg",
    "fileSize": 245760,
    "uploadedAt": "2025-05-28T00:00:00.000Z"
  }
}
```

---

## 📂 Project Structure

```
Syntecxhub_FileORImageUploadAPI/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   └── fileController.js   # Business logic (CRUD)
├── middleware/
│   ├── upload.js           # Multer config (storage, filter, limits)
│   └── errorHandler.js     # Global error handler
├── models/
│   └── File.js             # Mongoose schema
├── public/
│   ├── index.html          # Frontend UI
│   ├── style.css           # Styles
│   └── script.js           # Client-side JS
├── routes/
│   └── fileRoutes.js       # API route definitions
├── uploads/                # Uploaded files (gitignored)
├── .env                    # Environment variables
├── .gitignore
├── package.json
├── README.md
└── server.js               # App entry point
```

---

## 📜 License

ISC © SyntecxHub
