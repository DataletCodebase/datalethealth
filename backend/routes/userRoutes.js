import express from "express";
import fs from "fs";
// import db from "../db.js";
import { db } from "../server.js";
import authMiddleware from "../middleware/auth.js";
import { uploadProfile } from "../middleware/upload.js";
import { uploadPrescription } from "../middleware/uploadPrescription.js";

const router = express.Router();


router.get("/me", authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, full_name, email, profile_image FROM users WHERE id = ?",
    [req.user.id]
  );

  res.json(rows[0]);
});


router.post(
  "/profile-image",
  authMiddleware,
  uploadProfile.single("image"),
  async (req, res) => {
    try {
      const imagePath = `/uploads/profile/${req.file.filename}`;

      await db.query(
        "UPDATE users SET profile_image = ? WHERE id = ?",
        [imagePath, req.user.id]
      );

      res.json({ image: imagePath });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Image upload failed" });
    }
  }
);

// router.post(
//   "/prescriptions",
//   authMiddleware,
//   uploadPrescription.array("images", 5),
//   async (req, res) => {
//     const size = req.file.size;

//     // 🔒 Enforce 50MB minimum
//     if (size < 50 * 1024 * 1024) {
//       return res.status(400).json({
//         message: "Image must be at least 50MB"
//       });
//     }

//     const path = `/uploads/prescriptions/${req.file.filename}`;

//     await db.query(
//       `INSERT INTO prescriptions (user_id, file_path, file_type, file_size)
//        VALUES (?, ?, ?, ?)`,
//       [req.user.id, path, req.file.mimetype, file.size]
//     );

//     res.json({
//       url: path,
//       type: req.file.mimetype,
//       size
//     });
//   }
// );
router.post(
  "/prescriptions",
  authMiddleware,
  uploadPrescription.array("images", 5), // allow max 5 images at a time
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const insertedFiles = [];

      for (const file of req.files) {
        const sizeMB = file.size / (1024 * 1024); // convert bytes to MB

        // Check size limits
        if (sizeMB < 2 || sizeMB > 100) {
          return res.status(400).json({
            message: `File ${file.originalname} must be between 2MB and 100MB`
          });
        }

        const path = `/uploads/prescriptions/${file.filename}`;

        // Insert into DB
        const [result] = await db.query(
          `INSERT INTO prescriptions (user_id, file_path, file_type, file_size, uploaded_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [req.user.id, path, file.mimetype, file.size]
        );

        insertedFiles.push({
          id: result.insertId,
          name: file.originalname,
          url: path,
          type: file.mimetype,
          size: file.size
        });
      }

      res.json(insertedFiles); // return all successfully uploaded images
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


/* FETCH PRESCRIPTIONS */
// router.get("/prescriptions", authMiddleware, async (req, res) => {
//   const [rows] = await db.query(
//     "SELECT * FROM prescriptions WHERE user_id = ? ORDER BY uploaded_at DESC",
//     [req.user.id]
//   );
//   res.json(rows);
// });


// router.get("/prescriptions", authMiddleware, async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT 
//         id,
//         file_path AS url,
//         file_type AS type,
//         file_size AS size,
//         uploaded_at
//        FROM prescriptions
//        WHERE user_id = ?
//        ORDER BY uploaded_at DESC`,
//       [req.user.id]
//     );

//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


router.get("/prescriptions", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        id,
        file_path,
        file_type,
        file_size,
        uploaded_at,
        SUBSTRING_INDEX(file_path, '/', -1) AS file_name
       FROM prescriptions
       WHERE user_id = ?
       ORDER BY uploaded_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



/* DELETE */
router.delete("/prescriptions/:id", authMiddleware, async (req, res) => {
  const [[record]] = await db.query(
    "SELECT file_path FROM prescriptions WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id]
  );

  if (!record) {
    return res.status(404).json({ message: "Not found" });
  }

  fs.unlink(`.${record.file_path}`, () => {});

  await db.query(
    "DELETE FROM prescriptions WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id]
  );

  res.json({ success: true });
});

export default router;
