import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../server.js"; // use your existing db
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM admin_users WHERE username = ? AND is_active = true",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminId: admin.id, role: admin.role },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", adminAuth, (req, res) => {
  // req.user is available here because of adminAuth middleware
  console.log(`Admin logged out: ${req.user.adminId}`);

  return res.status(200).json({
    message: "Logged out successfully"
  });
});

export default router;