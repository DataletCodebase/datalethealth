import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../server.js";
// import authMiddleware from "../middleware/auth.js";
import { sendWelcomeEmail } from "../utils/sendEmail.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "temporary_secret_key";

/* =========================
   CAPTCHA HOOK (Phase-1 placeholder)
   Later we will integrate Google reCAPTCHA
========================= */
async function verifyCaptcha(token) {
    if (!token) return false; // basic check for now
    return true;
}

/* =========================
   SIGNUP API
========================= */
router.post("/signup", async (req, res) => {
    try {
        const {
            full_name,
            email,
            mobile,
            dob,
            address,
            disease,
            role,
            password,
            captchaToken
        } = req.body;

        // 🔹 CAPTCHA check
        if (!(await verifyCaptcha(captchaToken))) {
            return res.status(400).json({ message: "Captcha verification failed" });
        }

        if (!full_name || !email || !mobile || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check duplicate user
        const [existing] = await db.query(
            "SELECT id FROM users WHERE email = ? OR mobile = ?",
            [email, mobile]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: "User already exists with this email or mobile",
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user
        await db.query(
            `INSERT INTO users
       (full_name, email, mobile, dob, address, disease, role, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                full_name,
                email,
                mobile,
                dob,
                address,
                disease,
                role || "USER",
                password_hash,
            ]
        );

        // ✅ SEND WELCOME EMAIL (NON-BLOCKING)
        sendWelcomeEmail(email, full_name).catch(err =>
      console.error("Welcome email failed:", err)
        );


        return res.status(201).json({ message: "Signup successful" });
    } catch (err) {
  console.error("Signup DB Error:", err);
  return res.status(500).json({ message: err.message });
}

});

/* =========================
   LOGIN API (email OR mobile)
========================= */
router.post("/login", async (req, res) => {
    try {
        const { identifier, password, captchaToken } = req.body;

        // 🔹 CAPTCHA check
        if (!(await verifyCaptcha(captchaToken))) {
            return res.status(400).json({ message: "Captcha verification failed" });
        }

        if (!identifier || !password) {
            return res.status(400).json({ message: "Missing login credentials" });
        }

        // Fetch user
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ? OR mobile = ?",
            [identifier, identifier]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = rows[0];

        // Compare password
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            role: user.role,
            full_name: user.full_name,
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});


export default router;
