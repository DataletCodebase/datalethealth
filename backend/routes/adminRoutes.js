import express from "express";
import { db } from "../server.js";
// import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import { encrypt, decrypt, encryptDeterministic, decryptDeterministic } from "../utils/encryption.js";

const router = express.Router();

/**
 * GET /api/admin/users-medical
 * Admin only – fetch all users with their medical data
 */
router.get("/users-medical", adminAuth, async (req, res) => {
  try {
    // 🔐 Admin check
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const [rows] = await db.query(`
      SELECT
        u.id AS userId,
        u.full_name,
        u.customer_id,
        u.email,
        u.mobile,
        u.gender,
        u.dob,
        u.disease,
        u.height,
        u.weight,
        u.blood_group,
        u.city,
        u.state,
        u.country,
        u.assigned_dietician,

        m.id AS medicalId,
        m.creatinine,
        m.potassium,
        m.sodium,
        m.urea,
        m.estimated_gfr,
        m.albumin,
        m.calcium,
        m.phosphate,
        m.uric_acid,
        m.cholesterol_total,
        m.cholesterol_ldl,
        m.cholesterol_hdl,
        m.triglycerides,
        m.blood_pressure_systolic,
        m.blood_pressure_diastolic,
        m.heart_rate,
        m.bmi,
        m.fasting_glucose,
        m.postprandial_glucose,
        m.hba1c,
        m.created_at AS medical_created_at,
        u.created_at AS user_created_at,
        (SELECT status FROM diet_plans dp WHERE dp.patient_id = u.id ORDER BY dp.id DESC LIMIT 1) AS diet_status

      FROM users u
      LEFT JOIN medical_data m ON m.user_id = u.id
      LEFT JOIN (
        SELECT patient_id, status as diet_status FROM diet_plans 
        WHERE id IN (
            SELECT MAX(id) FROM diet_plans GROUP BY patient_id
        )
      ) dp ON dp.patient_id = u.id
      ORDER BY u.id DESC
    `);

    const decryptedRows = rows.map((r) => ({
      ...r,
      full_name: decrypt(r.full_name),
      email: decryptDeterministic(r.email),
      mobile: decryptDeterministic(r.mobile),
      dob: decrypt(r.dob),
      disease: decrypt(r.disease),
      gender: decrypt(r.gender),
      height: decrypt(r.height),
      weight: decrypt(r.weight),
      blood_group: decrypt(r.blood_group),
      city: decrypt(r.city),
      state: decrypt(r.state),
      country: decrypt(r.country),
      creatinine: decrypt(r.creatinine),
      potassium: decrypt(r.potassium),
      sodium: decrypt(r.sodium),
      urea: decrypt(r.urea),
      estimated_gfr: decrypt(r.estimated_gfr),
      albumin: decrypt(r.albumin),
      calcium: decrypt(r.calcium),
      phosphate: decrypt(r.phosphate),
      uric_acid: decrypt(r.uric_acid),
      cholesterol_total: decrypt(r.cholesterol_total),
      cholesterol_ldl: decrypt(r.cholesterol_ldl),
      cholesterol_hdl: decrypt(r.cholesterol_hdl),
      triglycerides: decrypt(r.triglycerides),
      blood_pressure_systolic: decrypt(r.blood_pressure_systolic),
      blood_pressure_diastolic: decrypt(r.blood_pressure_diastolic),
      heart_rate: decrypt(r.heart_rate),
      bmi: decrypt(r.bmi),
      fasting_glucose: decrypt(r.fasting_glucose),
      postprandial_glucose: decrypt(r.postprandial_glucose),
      hba1c: decrypt(r.hba1c),
      user_created_at: r.user_created_at,
      diet_status: r.diet_status,
    }));

    res.json(decryptedRows);
  } catch (err) {
    console.error("ADMIN USERS + MEDICAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * GET /api/admin/dashboard-stats
 * Admin only - fetches overview data for the admin dashboard
 */
router.get("/dashboard-stats", adminAuth, async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }

    // 1. Top Summary Data
    const [[{ total_patients, new_patients }]] = await db.query(`
      SELECT 
        COUNT(*) AS total_patients,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END) AS new_patients
      FROM users
    `);

    const [[{ total_dieticians }]] = await db.query(`
      SELECT COUNT(DISTINCT assigned_dietician) AS total_dieticians 
      FROM users 
      WHERE assigned_dietician IS NOT NULL AND assigned_dietician != ''
    `);

    // We consider "Unassigned" as those who do not have an approved diet or no diet.
    const [[{ unassigned_diet }]] = await db.query(`
      SELECT COUNT(*) AS unassigned_diet
      FROM users u
      LEFT JOIN diet_plans dp ON dp.patient_id = u.id
      WHERE dp.id IS NULL OR dp.status != 'approved'
    `);

    // 2. Dietician Overview (grouped by how many patients they have assigned)
    const [dietician_overview] = await db.query(`
      SELECT assigned_dietician AS name, COUNT(*) AS total_assigned
      FROM users
      WHERE assigned_dietician IS NOT NULL AND assigned_dietician != ''
      GROUP BY assigned_dietician
      ORDER BY total_assigned DESC
    `);

    // 3. Pending Diet Section (patients with status pending or not approved)
    const [pending_diets] = await db.query(`
      SELECT u.id, u.full_name, dp.status 
      FROM users u
      JOIN diet_plans dp ON dp.patient_id = u.id
      WHERE dp.status != 'approved'
      ORDER BY dp.id DESC
      LIMIT 10
    `);

    // Decrypt the full_name for pending_diets response
    const pending_diets_decrypted = pending_diets.map(p => ({
      id: p.id,
      full_name: decrypt(p.full_name),
      status: p.status
    }));

    res.json({
      summary: {
        total_patients: Number(total_patients) || 0,
        new_patients: Number(new_patients) || 0,
        total_dieticians: Number(total_dieticians) || 0,
        unassigned_diet: Number(unassigned_diet) || 0,
      },
      dietician_overview,
      pending_diets: pending_diets_decrypted,
    });
  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Update Medical Data

router.put("/medical/:medicalId", adminAuth, async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { medicalId } = req.params;

    const {
      creatinine,
      potassium,
      sodium,
      urea,
      estimated_gfr,
      albumin,
      calcium,
      phosphate,
      uric_acid,
      cholesterol_total,
      cholesterol_ldl,
      cholesterol_hdl,
      triglycerides,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate,
      bmi,
      fasting_glucose,
      postprandial_glucose,
      hba1c,
      userId,
    } = req.body;

    if (medicalId === "null" || medicalId === "undefined" || !medicalId) {
      if (!userId) {
        return res.status(400).json({ message: "userId required to create new medical data" });
      }
      await db.query(
        `
        INSERT INTO medical_data (
          user_id, creatinine, potassium, sodium, urea, estimated_gfr, albumin, calcium, phosphate, uric_acid,
          cholesterol_total, cholesterol_ldl, cholesterol_hdl, triglycerides, blood_pressure_systolic, blood_pressure_diastolic,
          heart_rate, bmi, fasting_glucose, postprandial_glucose, hba1c
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userId,
          creatinine === undefined ? null : encrypt(creatinine),
          potassium === undefined ? null : encrypt(potassium),
          sodium === undefined ? null : encrypt(sodium),
          urea === undefined ? null : encrypt(urea),
          estimated_gfr === undefined ? null : encrypt(estimated_gfr),
          albumin === undefined ? null : encrypt(albumin),
          calcium === undefined ? null : encrypt(calcium),
          phosphate === undefined ? null : encrypt(phosphate),
          uric_acid === undefined ? null : encrypt(uric_acid),
          cholesterol_total === undefined ? null : encrypt(cholesterol_total),
          cholesterol_ldl === undefined ? null : encrypt(cholesterol_ldl),
          cholesterol_hdl === undefined ? null : encrypt(cholesterol_hdl),
          triglycerides === undefined ? null : encrypt(triglycerides),
          blood_pressure_systolic === undefined ? null : encrypt(blood_pressure_systolic),
          blood_pressure_diastolic === undefined ? null : encrypt(blood_pressure_diastolic),
          heart_rate === undefined ? null : encrypt(heart_rate),
          bmi === undefined ? null : encrypt(bmi),
          fasting_glucose === undefined ? null : encrypt(fasting_glucose),
          postprandial_glucose === undefined ? null : encrypt(postprandial_glucose),
          hba1c === undefined ? null : encrypt(hba1c),
        ]
      );
    } else {
      await db.query(
        `
      UPDATE medical_data SET
        creatinine = COALESCE(?, creatinine),
        potassium = COALESCE(?, potassium),
        sodium = COALESCE(?, sodium),
        urea = COALESCE(?, urea),
        estimated_gfr = COALESCE(?, estimated_gfr),
        albumin = COALESCE(?, albumin),
        calcium = COALESCE(?, calcium),
        phosphate = COALESCE(?, phosphate),
        uric_acid = COALESCE(?, uric_acid),
        cholesterol_total = COALESCE(?, cholesterol_total),
        cholesterol_ldl = COALESCE(?, cholesterol_ldl),
        cholesterol_hdl = COALESCE(?, cholesterol_hdl),
        triglycerides = COALESCE(?, triglycerides),
        blood_pressure_systolic = COALESCE(?, blood_pressure_systolic),
        blood_pressure_diastolic = COALESCE(?, blood_pressure_diastolic),
        heart_rate = COALESCE(?, heart_rate),
        bmi = COALESCE(?, bmi),
        fasting_glucose = COALESCE(?, fasting_glucose),
        postprandial_glucose = COALESCE(?, postprandial_glucose),
        hba1c = COALESCE(?, hba1c)
      WHERE id = ?
      `,
        [
          creatinine === undefined ? undefined : encrypt(creatinine),
          potassium === undefined ? undefined : encrypt(potassium),
          sodium === undefined ? undefined : encrypt(sodium),
          urea === undefined ? undefined : encrypt(urea),
          estimated_gfr === undefined ? undefined : encrypt(estimated_gfr),
          albumin === undefined ? undefined : encrypt(albumin),
          calcium === undefined ? undefined : encrypt(calcium),
          phosphate === undefined ? undefined : encrypt(phosphate),
          uric_acid === undefined ? undefined : encrypt(uric_acid),
          cholesterol_total === undefined ? undefined : encrypt(cholesterol_total),
          cholesterol_ldl === undefined ? undefined : encrypt(cholesterol_ldl),
          cholesterol_hdl === undefined ? undefined : encrypt(cholesterol_hdl),
          triglycerides === undefined ? undefined : encrypt(triglycerides),
          blood_pressure_systolic === undefined ? undefined : encrypt(blood_pressure_systolic),
          blood_pressure_diastolic === undefined ? undefined : encrypt(blood_pressure_diastolic),
          heart_rate === undefined ? undefined : encrypt(heart_rate),
          bmi === undefined ? undefined : encrypt(bmi),
          fasting_glucose === undefined ? undefined : encrypt(fasting_glucose),
          postprandial_glucose === undefined ? undefined : encrypt(postprandial_glucose),
          hba1c === undefined ? undefined : encrypt(hba1c),
          medicalId,
        ]
      );
    }

    res.json({ message: "Medical data updated successfully" });
  } catch (err) {
    console.error("ADMIN UPDATE MEDICAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// Delete medical Data With the Record of User


router.delete("/users/:userId", adminAuth, async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { userId } = req.params;

    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ message: "User and medical data deleted successfully" });
  } catch (err) {
    console.error("ADMIN DELETE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;



//  Uploading prescription of the patient in the admin Dashboard

router.get("/users/:userId/prescriptions", adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

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
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Admin prescription fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
