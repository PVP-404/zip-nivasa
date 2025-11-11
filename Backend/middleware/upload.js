// backend/middleware/upload.js
import multer from "multer";
import fs from "fs";
import path from "path";

// ✅ Dynamic destination based on route
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/pgs"; // default

    // Match proper route folders
    if (req.originalUrl.includes("/mess")) {
      uploadPath = "uploads/messes";
    } else if (req.originalUrl.includes("/laundry")) {
      uploadPath = "uploads/laundries";
    }

    // ✅ Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  // ✅ Unique file name
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// ✅ Allow only image uploads
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Only image files (jpeg, jpg, png, webp, gif) allowed"));
};

// ✅ Multer config
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

export default upload;
