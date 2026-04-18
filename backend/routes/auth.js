import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../server.js";
import { encrypt, decrypt, encryptDeterministic, decryptDeterministic } from "../utils/encryption.js";
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
            email,    // optional – user provides email OR mobile
            mobile,   // optional – user provides email OR mobile
            password,
            // Fields below are NOT sent by the UI; backend defaults them
            dob     = "N/A",
            address = "N/A",
            disease = "N/A",
            role    = "USER",
        } = req.body;

        // 🔹 CAPTCHA check disabled for signup per request
        // if (!(await verifyCaptcha(captchaToken))) { ... }

        // At least one identifier (email or mobile) must be provided
        if (!full_name || (!email && !mobile) || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Store NULL for missing identifier — NOT encrypted "N/A" which breaks UNIQUE constraint
        const encryptedEmail  = email  ? encryptDeterministic(email)  : null;
        const encryptedMobile = mobile ? encryptDeterministic(mobile) : null;

        // Check for duplicate user only on the identifier that was actually provided
        let dupQuery = "SELECT id FROM users WHERE ";
        const dupParams = [];
        if (email && mobile) {
            dupQuery += "email = ? OR mobile = ?";
            dupParams.push(encryptedEmail, encryptedMobile);
        } else if (email) {
            dupQuery += "email = ?";
            dupParams.push(encryptedEmail);
        } else {
            dupQuery += "mobile = ?";
            dupParams.push(encryptedMobile);
        }

        const [existing] = await db.query(dupQuery, dupParams);
        if (existing.length > 0) {
            return res.status(400).json({
                message: "User already exists with this email or mobile",
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user – email/mobile are NULL if not provided (avoids UNIQUE constraint clash)
        await db.query(
            `INSERT INTO users
       (full_name, email, mobile, dob, address, disease, role, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                encrypt(full_name),
                encryptedEmail,     // NULL if not provided
                encryptedMobile,    // NULL if not provided
                encrypt(dob),
                encrypt(address),
                encrypt(disease),
                role,
                password_hash,
            ]
        );

        // ✅ SEND WELCOME EMAIL (NON-BLOCKING) – only when email is real
        if (email && email !== "N/A") {
            sendWelcomeEmail(email, full_name).catch(err =>
                console.error("Welcome email failed:", err)
            );
        }

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

        // 🔹 CAPTCHA check disabled for login per request
        // if (!(await verifyCaptcha(captchaToken))) {
        //     return res.status(400).json({ message: "Captcha verification failed" });
        // }

        if (!identifier || !password) {
            return res.status(400).json({ message: "Missing login credentials" });
        }

        // Encrypt the incoming identifier to find the user
        const encryptedIdentifier = encryptDeterministic(identifier);

        // Fetch user
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ? OR mobile = ?",
            [encryptedIdentifier, encryptedIdentifier]
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

        // Decrypt user data for token
        const decryptedEmail = decryptDeterministic(user.email);
        const decryptedFullName = decrypt(user.full_name);

        // Generate token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: decryptedEmail,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // return res.status(200).json({
        //     message: "Login successful",
        //     token,
        //     role: user.role,
        //     full_name: user.full_name,
        // });
        return res.status(200).json({
  message: "Login successful",
  token,
  user: {
    id: user.id,
    full_name: decryptedFullName,
    email: decryptedEmail,
    role: user.role,
  },
});

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});


export default router;
