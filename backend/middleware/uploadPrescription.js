import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/prescriptions",
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + Math.round(Math.random() * 1e9) +
      path.extname(file.originalname)
    );
  }
});

export const uploadPrescription = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB MAX
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files allowed"));
    } else {
      cb(null, true);
    }
  }
});
