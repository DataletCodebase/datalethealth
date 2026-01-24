// routes/profileRoutes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { db } from "../server.js"; // ✅ import the MySQL pool from server.js

const router = express.Router();

router.put("/profile/update", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // from token
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      height,
      weight,
      bloodGroup,
      address,
      city,
      state,
      zipCode,
      country,
      emergencyContact
    } = req.body;

    // Update query
    const query = `
      UPDATE users SET
        full_name = ?,
        email = ?,
        mobile = ?,
        dob = ?,
        gender = ?,
        height = ?,
        weight = ?,
        blood_group = ?,
        address = ?,
        city = ?,
        state = ?,
        zip_code = ?,
        country = ?,
        emergency_contact_name = ?,
        emergency_contact_phone = ?,
        emergency_contact_relationship = ?
      WHERE id = ?;
    `;

    const values = [
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      height,
      weight,
      bloodGroup,
      address,
      city,
      state,
      zipCode,
      country,
      emergencyContact?.name || "N/A",
      emergencyContact?.phone || "N/A",
      emergencyContact?.relationship || "N/A",
      userId
    ];

    // Execute update
    await db.query(query, values);

    // Fetch updated profile
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

    res.json({ message: "Profile updated successfully", profile: rows[0] });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
