
import express from "express";
import { db } from "../server.js"; // MySQL pool
import authMiddleware from "../middleware/auth.js";
import { encrypt, decrypt } from "../utils/encryption.js";

const router = express.Router();


router.get("/data", authMiddleware, async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0")
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      // "SELECT * FROM medical_data WHERE user_id = ? LIMIT 1",
      "SELECT * FROM medical_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      // If no data exists, return default zeros
      return res.json({
        // creatinine: 0,
        // potassium: 0,
        // sodium: 0,
        // urea: 0,
        // estimatedGFR: 0,
        // albumin: 0,
        // calcium: 0,
        // phosphate: 0,
        // uricAcid: 0,
        // cholesterolTotal: 0,
        // cholesterolLDL: 0,
        // cholesterolHDL: 0,
        // triglycerides: 0,
        // bloodPressureSystolic: 0,
        // bloodPressureDiastolic: 0,
        // heartRate: 0,
        // bmi: 0,
        // fastingGlucose: 0,
        // postprandialGlucose: 0,
        // hba1c: 0
        creatinine: null,
        potassium: null,
        sodium: null,
        urea: null,
        estimatedGFR: null,
        albumin: null,
        calcium: null,
        phosphate: null,
        uricAcid: null,
        cholesterolTotal: null,
        cholesterolLDL: null,
        cholesterolHDL: null,
        triglycerides: null,
        bloodPressureSystolic: null,
        bloodPressureDiastolic: null,
        heartRate: null,
        bmi: null,
        fastingGlucose: null,
        postprandialGlucose: null,
        hba1c: null
      });
    }

    const row = rows[0];

    const mappedData = {
      creatinine: decrypt(row.creatinine),
      potassium: decrypt(row.potassium),
      sodium: decrypt(row.sodium),
      urea: decrypt(row.urea),
      estimatedGFR: decrypt(row.estimated_gfr),
      albumin: decrypt(row.albumin),
      calcium: decrypt(row.calcium),
      phosphate: decrypt(row.phosphate),
      uricAcid: decrypt(row.uric_acid),
      cholesterolTotal: decrypt(row.cholesterol_total),
      cholesterolLDL: decrypt(row.cholesterol_ldl),
      cholesterolHDL: decrypt(row.cholesterol_hdl),
      triglycerides: decrypt(row.triglycerides),
      bloodPressureSystolic: decrypt(row.blood_pressure_systolic),
      bloodPressureDiastolic: decrypt(row.blood_pressure_diastolic),
      heartRate: decrypt(row.heart_rate),
      bmi: decrypt(row.bmi),
      fastingGlucose: decrypt(row.fasting_glucose),
      postprandialGlucose: decrypt(row.postprandial_glucose),
      hba1c: decrypt(row.hba1c)
    };

    res.json(mappedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch medical data" });
  }
});



const fieldMap = {
  estimatedGFR: "estimated_gfr",
  uricAcid: "uric_acid",
  cholesterolTotal: "cholesterol_total",
  cholesterolLDL: "cholesterol_ldl",
  cholesterolHDL: "cholesterol_hdl",
  bloodPressureSystolic: "blood_pressure_systolic",
  bloodPressureDiastolic: "blood_pressure_diastolic",
  fastingGlucose: "fasting_glucose",
  postprandialGlucose: "postprandial_glucose",
  heartRate: "heart_rate",
  // Other fields are same name in DB, so no need to map
};






router.put("/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateFields = req.body;

    // 1️⃣ Get latest medical record ID
    let latest = null;
    const [rows] = await db.query(
      "SELECT id FROM medical_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      const [insertResult] = await db.query(
        "INSERT INTO medical_data (user_id) VALUES (?)",
        [userId]
      );
      latest = { id: insertResult.insertId };
    } else {
      latest = rows[0];
    }

    // 2️⃣ Build UPDATE query dynamically
    const keys = Object.keys(updateFields).filter(
      key => updateFields[key] !== undefined
    );

    if (keys.length === 0) {
      return res.json({ message: "No changes detected" });
    }

    const dbFields = keys
      .map(key => `${fieldMap[key] || key} = ?`)
      .join(", ");

    const values = keys.map(key => encrypt(updateFields[key]));

    // 3️⃣ Update ONLY the latest row
    await db.query(
      `UPDATE medical_data SET ${dbFields} WHERE id = ?`,
      [...values, latest.id]
    );

    // 4️⃣ Return updated latest record
    const [[updatedRow]] = await db.query(
      "SELECT * FROM medical_data WHERE id = ?",
      [latest.id]
    );
    
    // Decrypt updated data for response
    const decryptedUpdatedRow = { ...updatedRow };
    Object.keys(decryptedUpdatedRow).forEach(key => {
      if (!["id", "user_id", "created_at", "updated_at"].includes(key)) {
         decryptedUpdatedRow[key] = decrypt(decryptedUpdatedRow[key]);
      }
    });

    res.json({
      message: "Medical data updated successfully",
      medicalData: decryptedUpdatedRow
    });

  } catch (err) {
    console.error("Medical update error:", err);
    res.status(500).json({ error: "Failed to update medical data" });
  }
});

export default router;


































// import express from "express";
// import { db } from "../server.js";
// import authMiddleware from "../middleware/auth.js";

// const router = express.Router();

// /**
//  * GET medical data for logged-in user
//  */
// router.get("/update", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [rows] = await db.query(
//       "SELECT * FROM medical_data WHERE user_id = ? LIMIT 1",
//       [userId]
//     );

//     if (rows.length === 0) {
//       return res.json({});
//     }

//     const row = rows[0];

//     const mappedData = {
//       creatinine: row.creatinine,
//       potassium: row.potassium,
//       sodium: row.sodium,
//       urea: row.urea,
//       estimatedGFR: row.estimated_gfr,
//       albumin: row.albumin,
//       calcium: row.calcium,
//       phosphate: row.phosphate,
//       uricAcid: row.uric_acid,

//       cholesterolTotal: row.cholesterol_total,
//       cholesterolLDL: row.cholesterol_ldl,
//       cholesterolHDL: row.cholesterol_hdl,
//       triglycerides: row.triglycerides,

//       bloodPressureSystolic: row.blood_pressure_systolic,
//       bloodPressureDiastolic: row.blood_pressure_diastolic,
//       heartRate: row.heart_rate,
//       bmi: row.bmi,

//       fastingGlucose: row.fasting_glucose,
//       postprandialGlucose: row.postprandial_glucose,
//       hba1c: row.hba1c
//     };

//     res.json(mappedData);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch medical data" });
//   }
// });

// /**
//  * UPSERT medical data
//  */
// router.put("/", authMiddleware, async (req, res) => {
//   // try {
//   //   const userId = req.user.id;
//   //   const d = req.body;

//   //   await db.query(
//   //     `
//   //     INSERT INTO medical_data (
//   //       user_id, creatinine, potassium, sodium, urea, estimated_gfr,
//   //       albumin, calcium, phosphate, uric_acid,
//   //       cholesterol_total, cholesterol_ldl, cholesterol_hdl, triglycerides,
//   //       blood_pressure_systolic, blood_pressure_diastolic,
//   //       heart_rate, bmi,
//   //       fasting_glucose, postprandial_glucose, hba1c
//   //     )
//   //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   //     ON DUPLICATE KEY UPDATE
//   //       creatinine = VALUES(creatinine),
//   //       potassium = VALUES(potassium),
//   //       sodium = VALUES(sodium),
//   //       urea = VALUES(urea),
//   //       estimated_gfr = VALUES(estimated_gfr),
//   //       albumin = VALUES(albumin),
//   //       calcium = VALUES(calcium),
//   //       phosphate = VALUES(phosphate),
//   //       uric_acid = VALUES(uric_acid),
//   //       cholesterol_total = VALUES(cholesterol_total),
//   //       cholesterol_ldl = VALUES(cholesterol_ldl),
//   //       cholesterol_hdl = VALUES(cholesterol_hdl),
//   //       triglycerides = VALUES(triglycerides),
//   //       blood_pressure_systolic = VALUES(blood_pressure_systolic),
//   //       blood_pressure_diastolic = VALUES(blood_pressure_diastolic),
//   //       heart_rate = VALUES(heart_rate),
//   //       bmi = VALUES(bmi),
//   //       fasting_glucose = VALUES(fasting_glucose),
//   //       postprandial_glucose = VALUES(postprandial_glucose),
//   //       hba1c = VALUES(hba1c)
//   //     `,
//   //     [
//   //       userId,
//   //       d.creatinine, d.potassium, d.sodium, d.urea, d.estimatedGFR,
//   //       d.albumin, d.calcium, d.phosphate, d.uricAcid,
//   //       d.cholesterolTotal, d.cholesterolLDL, d.cholesterolHDL, d.triglycerides,
//   //       d.bloodPressureSystolic, d.bloodPressureDiastolic,
//   //       d.heartRate, d.bmi,
//   //       d.fastingGlucose, d.postprandialGlucose, d.hba1c
//   //     ]
//   //   );

//   //   res.json({ message: "Medical data saved successfully" });
//   // } catch (err) {
//   //   console.error(err);
//   //   res.status(500).json({ error: "Failed to save medical data" });
//   // }
//   const userId = req.user.id;
//   const data = req.body;

//   try {
//     const [existing] = await db.execute("SELECT id FROM medical_data WHERE user_id = ?", [userId]);

//     if (existing.length === 0) {
//       // Insert new row
//       await db.execute(
//         `INSERT INTO medical_data (
//           user_id, creatinine, potassium, sodium, urea, estimated_gfr, albumin, calcium, phosphate, uric_acid,
//           cholesterol_total, cholesterol_ldl, cholesterol_hdl, triglycerides, blood_pressure_systolic,
//           blood_pressure_diastolic, heart_rate, bmi, fasting_glucose, postprandial_glucose, hba1c
//         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
//         [
//           userId,
//           data.creatinine || 0,
//           data.potassium || 0,
//           data.sodium || 0,
//           data.urea || 0,
//           data.estimated_gfr || 0,
//           data.albumin || 0,
//           data.calcium || 0,
//           data.phosphate || 0,
//           data.uric_acid || 0,
//           data.cholesterol_total || 0,
//           data.cholesterol_ldl || 0,
//           data.cholesterol_hdl || 0,
//           data.triglycerides || 0,
//           data.blood_pressure_systolic || 0,
//           data.blood_pressure_diastolic || 0,
//           data.heart_rate || 0,
//           data.bmi || 0,
//           data.fasting_glucose || 0,
//           data.postprandial_glucose || 0,
//           data.hba1c || 0
//         ]
//       );
//     } else {
//       // Partial update existing row
//       const updateFields = [];
//       const updateValues = [];

//       // Only include keys that exist in the request body
//       Object.keys(data).forEach((key) => {
//         if (data[key] !== undefined) {
//           updateFields.push(`${key} = ?`);
//           updateValues.push(data[key]);
//         }
//       });

//       if (updateFields.length > 0) {
//         updateValues.push(userId);
//         const sql = `UPDATE medical_data SET ${updateFields.join(", ")} WHERE user_id = ?`;
//         await db.execute(sql, updateValues);
//       }
//     }

//     res.json({ message: "Medical data saved successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "DB error", error: err });
//   }
// });

// export default router;
