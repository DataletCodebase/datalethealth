import express from "express";
import { db } from "../server.js";
// import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

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
        m.created_at AS medical_created_at

      FROM users u
      LEFT JOIN medical_data m ON m.user_id = u.id
      ORDER BY u.id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("ADMIN USERS + MEDICAL ERROR:", err);
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
    } = req.body;

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
        medicalId,
      ]
    );

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
