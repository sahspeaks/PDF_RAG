const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadPDF } = require("../controllers/uploadController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log("File upload attempt:", file);
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Error handling middleware for multer
const uploadMiddleware = (req, res, next) => {
  console.log("Upload middleware called");

  upload.single("pdf")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({
        error: "File upload error",
        message: err.message,
      });
    }

    console.log(
      "File upload successful in middleware:",
      req.file
        ? {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "No file"
    );

    next();
  });
};

// Upload PDF route with explicit CORS handling
router.options("/upload", (req, res) => {
  console.log("Handling OPTIONS request for /upload");
  res.status(200).end();
});

router.post(
  "/upload",
  (req, res, next) => {
    console.log("Upload route accessed");
    next();
  },
  uploadMiddleware,
  uploadPDF
);

module.exports = router;
