// backend/middlewares/upload.js
import multer from "multer";

const storage = multer.memoryStorage(); // Use memory, not disk

const upload = multer({ storage });

export default upload;
