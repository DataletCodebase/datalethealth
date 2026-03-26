import express from "express";
import fs from "fs";
// import { runOCR } from "../utils/ocr.js";
// // import { extractMedicalValues } from "../utils/medicalParser.js";
// import { extractMedicalValuesFromTables } from "../utils/medicalParser.js";
// import db from "../db.js";
import { db } from "../server.js";
import authMiddleware from "../middleware/auth.js";
import { uploadProfile } from "../middleware/upload.js";
import { uploadPrescription } from "../middleware/uploadPrescription.js";
import { runOCR } from "../utils/ocr.js";
import { extractMedicalValuesFromTables } from "../utils/medicalParser.js";
import { encrypt, decrypt, encryptDeterministic, decryptDeterministic } from "../utils/encryption.js";

const router = express.Router();


router.get("/me", authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, full_name, email, profile_image FROM users WHERE id = ?",
    [req.user.id]
  );

  if (!rows[0]) return res.json({});
  const user = rows[0];
  user.full_name = decrypt(user.full_name);
  user.email = decryptDeterministic(user.email);

  res.json(user);
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





//Swarup
// router.post(
//   "/prescriptions",
//   authMiddleware,
//   uploadPrescription.array("images", 5), // allow max 5 images at a time
//   async (req, res) => {
//     try {
//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({ message: "No files uploaded" });
//       }

//       const insertedFiles = [];

//       for (const file of req.files) {
//         const sizeKB = file.size / 1024; // convert bytes to KB

//         if (sizeKB < 10 || sizeKB > 100) {
//           return res.status(400).json({
//             message: `File ${file.originalname} must be between 10KB and 100KB`
//           });
//         }

//         const path = `/uploads/prescriptions/${file.filename}`;

//         // Insert into DB
//         const [result] = await db.query(
//           `INSERT INTO prescriptions (user_id, file_path, file_type, file_size, uploaded_at)
//            VALUES (?, ?, ?, ?, NOW())`,
//           [req.user.id, path, file.mimetype, file.size]
//         );

//         insertedFiles.push({
//           id: result.insertId,
//           name: file.originalname,
//           url: path,
//           type: file.mimetype,
//           size: file.size
//         });
//       }

//       res.json(insertedFiles); // return all successfully uploaded images
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );






//Sangram
router.post(
  "/prescriptions",
  authMiddleware,
  uploadPrescription.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const insertedFiles = [];

      for (const file of req.files) {
        const sizeKB = file.size / 1024;
        if (sizeKB < 10 || sizeKB > 100) {
          return res.status(400).json({
            message: `File ${file.originalname} must be between 10KB and 100KB`
          });
        }

        const path = `/uploads/prescriptions/${file.filename}`;
        const fullPath = `.${path}`;

        // 1️⃣ Save prescription file
        const [result] = await db.query(
          `INSERT INTO prescriptions (user_id, file_path, file_type, file_size, uploaded_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [req.user.id, path, file.mimetype, file.size]
        );

        // 2️⃣ Run OCR
        // const extractedText = await runOCR(fullPath);
        const document = await runOCR(fullPath);

        // console.log("OCR TEXT ======");
        // console.log(extractedText);
        // console.log(document);
        // const document = await runOCR(fullPath);

        console.log("PAGES:", document.pages?.length);
        console.log("TABLES:", document.pages?.[0]?.tables);


        // 3️⃣ Parse ALL medical values
        // const medicalData = extractMedicalValues(extractedText);
        const medicalData = extractMedicalValuesFromTables(document);

        console.log("PARSED DATA ======");
        console.log(medicalData);

        // 4️⃣ Save extracted medical data (UPDATE if exists, else INSERT)
        const [rows] = await db.query(
          "SELECT id FROM medical_data WHERE user_id = ?",
          [req.user.id]
        );

        if (rows.length === 0) {
          // INSERT first time
          await db.query(
            `INSERT INTO medical_data
            (user_id,
            creatinine, potassium, sodium, urea, estimated_gfr,
            albumin, calcium, phosphate, uric_acid,
            cholesterol_total, cholesterol_ldl, cholesterol_hdl,
            triglycerides, blood_pressure_systolic, blood_pressure_diastolic,
            heart_rate, bmi,
            fasting_glucose, postprandial_glucose, hba1c)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              req.user.id,
              encrypt(medicalData.creatinine || null),
              encrypt(medicalData.potassium || null),
              encrypt(medicalData.sodium || null),
              encrypt(medicalData.urea || null),
              encrypt(medicalData.estimatedGFR || null),

              encrypt(medicalData.albumin || null),
              encrypt(medicalData.calcium || null),
              encrypt(medicalData.phosphate || null),
              encrypt(medicalData.uricAcid || null),

              encrypt(medicalData.cholesterolTotal || null),
              encrypt(medicalData.cholesterolLDL || null),
              encrypt(medicalData.cholesterolHDL || null),
              encrypt(medicalData.triglycerides || null),

              encrypt(medicalData.bloodPressureSystolic || null),
              encrypt(medicalData.bloodPressureDiastolic || null),
              encrypt(medicalData.heartRate || null),
              encrypt(medicalData.bmi || null),

              encrypt(medicalData.fastingGlucose || null),
              encrypt(medicalData.postprandialGlucose || null),
              encrypt(medicalData.hba1c || null)
            ]
          );
        } else {
          // UPDATE existing row
          await db.query(
            `UPDATE medical_data SET
              creatinine = ?,
              potassium = ?,
              sodium = ?,
              urea = ?,
              estimated_gfr = ?,
              albumin = ?,
              calcium = ?,
              phosphate = ?,
              uric_acid = ?,
              cholesterol_total = ?,
              cholesterol_ldl = ?,
              cholesterol_hdl = ?,
              triglycerides = ?,
              blood_pressure_systolic = ?,
              blood_pressure_diastolic = ?,
              heart_rate = ?,
              bmi = ?,
              fasting_glucose = ?,
              postprandial_glucose = ?,
              hba1c = ?
            WHERE user_id = ?`,
            [
              encrypt(medicalData.creatinine || null),
              encrypt(medicalData.potassium || null),
              encrypt(medicalData.sodium || null),
              encrypt(medicalData.urea || null),
              encrypt(medicalData.estimatedGFR || null),

              encrypt(medicalData.albumin || null),
              encrypt(medicalData.calcium || null),
              encrypt(medicalData.phosphate || null),
              encrypt(medicalData.uricAcid || null),

              encrypt(medicalData.cholesterolTotal || null),
              encrypt(medicalData.cholesterolLDL || null),
              encrypt(medicalData.cholesterolHDL || null),
              encrypt(medicalData.triglycerides || null),

              encrypt(medicalData.bloodPressureSystolic || null),
              encrypt(medicalData.bloodPressureDiastolic || null),
              encrypt(medicalData.heartRate || null),
              encrypt(medicalData.bmi || null),

              encrypt(medicalData.fastingGlucose || null),
              encrypt(medicalData.postprandialGlucose || null),
              encrypt(medicalData.hba1c || null),

              req.user.id
            ]
          );
        }


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
      console.error("OCR error:", err);
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

  fs.unlink(`.${record.file_path}`, () => { });

  await db.query(
    "DELETE FROM prescriptions WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id]
  );

  res.json({ success: true });
});

export default router;
