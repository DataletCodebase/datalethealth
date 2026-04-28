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
            password,
            // Fields below are NOT sent by the UI; backend defaults them
            dob     = "N/A",
            address = "N/A",
            disease = "N/A",
            role    = "USER",
        } = req.body;

        // 🔹 Accept either: { email } / { mobile } / { identifier }
        // Auto-detect: if value is all digits → mobile, else → email
        const rawIdentifier = req.body.identifier || req.body.email || req.body.mobile || "";
        const isMobileInput = /^\d+$/.test(rawIdentifier.trim());

        // Resolve into the correct field
        let resolvedEmail  = null;
        let resolvedMobile = null;

        if (isMobileInput) {
            // Passed digits — treat as mobile regardless of which key was used
            resolvedMobile = rawIdentifier.trim();
        } else {
            // Treat as email
            resolvedEmail = rawIdentifier.trim();
        }

        // ── VALIDATION ─────────────────────────────────────────────
        if (!full_name || !rawIdentifier || !password) {
            return res.status(400).json({ message: "Missing required fields (full_name, email/mobile, password)" });
        }

        if (resolvedMobile && !/^\d{10}$/.test(resolvedMobile)) {
            return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
        }

        if (resolvedEmail && !resolvedEmail.includes("@")) {
            return res.status(400).json({ message: "Invalid email address" });
        }
        // ────────────────────────────────────────────────────────────

        // Encrypt identifiers for DB storage (NULL for the missing one)
        const encryptedEmail  = resolvedEmail  ? encryptDeterministic(resolvedEmail)  : null;
        const encryptedMobile = resolvedMobile ? encryptDeterministic(resolvedMobile) : null;

        // Check duplicate — only on the identifier that was actually provided
        let dupQuery = "SELECT id FROM users WHERE ";
        const dupParams = [];
        if (resolvedEmail && resolvedMobile) {
            dupQuery += "email = ? OR mobile = ?";
            dupParams.push(encryptedEmail, encryptedMobile);
        } else if (resolvedEmail) {
            dupQuery += "email = ?";
            dupParams.push(encryptedEmail);
        } else {
            dupQuery += "mobile = ?";
            dupParams.push(encryptedMobile);
        }

        const [existing] = await db.query(dupQuery, dupParams);
        if (existing.length > 0) {
            return res.status(400).json({
                message: `User already exists with this ${resolvedEmail ? "email" : "mobile"}`,
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert — email/mobile NULL if not provided (avoids UNIQUE constraint clash)
        await db.query(
            `INSERT INTO users
       (full_name, email, mobile, dob, address, disease, role, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                encrypt(full_name),
                encryptedEmail,     // NULL if mobile was given
                encryptedMobile,    // NULL if email was given
                encrypt(dob),
                encrypt(address),
                encrypt(disease),
                role,
                password_hash,
            ]
        );

        // ✅ Welcome email — only when a real email was provided
        if (resolvedEmail) {
            sendWelcomeEmail(resolvedEmail, full_name).catch(err =>
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


/* =========================
   CHECK USER EXISTENCE
========================= */
router.post("/check-user", async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier) return res.status(400).json({ message: "Identifier required" });

        const encryptedIdentifier = encryptDeterministic(identifier);
        const [rows] = await db.query(
            "SELECT id FROM users WHERE email = ? OR mobile = ?",
            [encryptedIdentifier, encryptedIdentifier]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "No account found with this email or phone number." });
        }

        res.status(200).json({ exists: true });
    } catch (err) {
        console.error("Check User Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/* =========================
   RESET PASSWORD API
========================= */
router.post("/reset-password", async (req, res) => {
    try {
        const { identifier, newPassword } = req.body;

        if (!identifier || !newPassword) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Encrypt the identifier to find the user in the DB
        const encryptedIdentifier = encryptDeterministic(identifier);

        // Hash the new password
        const password_hash = await bcrypt.hash(newPassword, 10);

        // Update the password in the users table
        const [result] = await db.query(
            "UPDATE users SET password_hash = ? WHERE email = ? OR mobile = ?",
            [password_hash, encryptedIdentifier, encryptedIdentifier]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Reset Password Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

export default router;
