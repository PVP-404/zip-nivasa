import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/pgs"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

export default upload;
