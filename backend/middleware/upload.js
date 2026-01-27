import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";

const storage = multer.diskStorage({
  destination: "uploads/profile",
  filename: (req, file, cb) => {
    cb(null, `${uuid()}${path.extname(file.originalname)}`);
  },
});

export const uploadProfile = multer({ storage });
