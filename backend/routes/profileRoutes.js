
import express from "express";
import { db } from "../server.js"; // make sure path is correct
import authMiddleware from "../middleware/auth.js"; // must exist
import { encrypt, decrypt, encryptDeterministic, decryptDeterministic } from "../utils/encryption.js";
// import { verifyToken } from "../middleware/auth.js";


const router = express.Router();

// GET /api/user/profile/basic
router.get("/profile/basic", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // set by authMiddleware
    const [rows] = await db.query(
      `SELECT 
        id, full_name, email, mobile, dob, address, disease,
        gender, height, weight, blood_group, city, state, zip_code, country,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
        assigned_dietician
      FROM users
      WHERE id = ?`,
      [userId]
    );

    if (!rows[0]) return res.status(404).json({ message: "User not found" });

    const user = rows[0];
    const decryptedUser = {
      ...user,
      full_name: decrypt(user.full_name),
      email: decryptDeterministic(user.email),
      mobile: decryptDeterministic(user.mobile),
      dob: decrypt(user.dob),
      address: decrypt(user.address),
      disease: decrypt(user.disease),
      gender: decrypt(user.gender),
      height: decrypt(user.height),
      weight: decrypt(user.weight),
      blood_group: decrypt(user.blood_group),
      city: decrypt(user.city),
      state: decrypt(user.state),
      zip_code: decrypt(user.zip_code),
      country: decrypt(user.country),
      emergency_contact_name: decrypt(user.emergency_contact_name),
      emergency_contact_phone: decrypt(user.emergency_contact_phone),
      emergency_contact_relationship: decrypt(user.emergency_contact_relationship),
    };

    res.json(decryptedUser);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/profile/update", authMiddleware, async (req, res) => {
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
  gender = COALESCE(NULLIF(?, ''), 'NA'),
  height = COALESCE(NULLIF(?, ''), 0),
  weight = COALESCE(NULLIF(?, ''), 0),
  blood_group = COALESCE(NULLIF(?, ''), 'NA'),
  address = ?,
  city = COALESCE(NULLIF(?, ''), 'NA'),
  state = COALESCE(NULLIF(?, ''), 'NA'),
  zip_code = COALESCE(NULLIF(?, ''), 'NA'),
  country = COALESCE(NULLIF(?, ''), 'NA'),
  emergency_contact_name = COALESCE(NULLIF(?, ''), 'NA'),
  emergency_contact_phone = COALESCE(NULLIF(?, ''), 'NA'),
  emergency_contact_relationship = COALESCE(NULLIF(?, ''), 'NA')
WHERE id = ?;
`;

    const values = [
      encrypt(fullName),
      encryptDeterministic(email || null),
      encryptDeterministic(phone || null),
      encrypt(dateOfBirth),
      encrypt(gender),
      encrypt(height),
      encrypt(weight),
      encrypt(bloodGroup),
      encrypt(address),
      encrypt(city),
      encrypt(state),
      encrypt(zipCode),
      encrypt(country),
      encrypt(emergencyContact?.name || "N/A"),
      encrypt(emergencyContact?.phone || "N/A"),
      encrypt(emergencyContact?.relationship || "N/A"),
      userId
    ];

    // Execute update
    await db.query(query, values);

    // Fetch updated profile
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    const user = rows[0];

    // Partially decrypt only what we need for the response or full object
    const decryptedUser = {
      ...user,
      full_name: decrypt(user.full_name),
      email: decryptDeterministic(user.email),
      mobile: decryptDeterministic(user.mobile),
      dob: decrypt(user.dob),
      address: decrypt(user.address),
      disease: decrypt(user.disease),
      gender: decrypt(user.gender),
      height: decrypt(user.height),
      weight: decrypt(user.weight),
      blood_group: decrypt(user.blood_group),
      city: decrypt(user.city),
      state: decrypt(user.state),
      zip_code: decrypt(user.zip_code),
      country: decrypt(user.country),
      emergency_contact_name: decrypt(user.emergency_contact_name),
      emergency_contact_phone: decrypt(user.emergency_contact_phone),
      emergency_contact_relationship: decrypt(user.emergency_contact_relationship),
    };

    res.json({ message: "Profile updated successfully", profile: decryptedUser });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/all", authMiddleware, async (req, res) => {
  try {
    // OPTIONAL: only allow admin
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [rows] = await db.query(`
      SELECT 
        id AS userId,
        full_name,
        email,
        mobile,
        gender,
        dob,
        disease,
        height,
        weight,
        blood_group,
        city,
        state,
        country,
        assigned_dietician,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    const decryptedRows = rows.map(user => ({
      ...user,
      full_name: decrypt(user.full_name),
      email: decryptDeterministic(user.email),
      mobile: decryptDeterministic(user.mobile),
      gender: decrypt(user.gender),
      dob: decrypt(user.dob),
      disease: decrypt(user.disease),
      height: decrypt(user.height),
      weight: decrypt(user.weight),
      blood_group: decrypt(user.blood_group),
      city: decrypt(user.city),
      state: decrypt(user.state),
      country: decrypt(user.country)
    }));

    res.json(decryptedRows);
  } catch (err) {
    console.error("Fetch all users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
