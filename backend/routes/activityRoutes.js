// routes/activityRoutes.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import { db } from "../server.js";
import { calculateCaloriesBurned, calculateCalorieTargets } from "../utils/healthCalculators.js";
import { decrypt, decryptDeterministic } from "../utils/encryption.js";

const router = express.Router();

// =============================================
// Auto-Create Table — Lazy Singleton
// Runs once on first request, not at import time
// =============================================
let tableReady = false;
let tableInit = null;

async function ensureTable() {
    if (tableReady) return;
    if (tableInit) return tableInit; // deduplicate concurrent calls
    tableInit = db.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      log_date DATE NOT NULL,
      km_walked FLOAT DEFAULT 0,
      km_run FLOAT DEFAULT 0,
      weight_lifting_mins INT DEFAULT 0,
      outdoor_activity_mins INT DEFAULT 0,
      calories_burned FLOAT DEFAULT 0,
      calories_consumed FLOAT DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_date (user_id, log_date)
    )
  `).then(async () => {
        // Migration: automatically add calories_consumed if it's missing from an older table
        try {
            await db.query(`ALTER TABLE activity_logs ADD COLUMN calories_consumed FLOAT DEFAULT 0;`);
            console.log("✅ Added calories_consumed column to activity_logs");
        } catch (err) {
            // column likely already exists, ignore
        }
        tableReady = true;
        console.log("✅ activity_logs table ready");
    }).catch((err) => {
        console.error("❌ Failed to create activity_logs table:", err.message);
        tableInit = null; // allow retry on next request
        throw err;
    });
    return tableInit;
}



// =============================================
// POST /api/activity/log — Log today's activity
// =============================================
router.post("/log", authMiddleware, async (req, res) => {
    try {
        await ensureTable();
        const userId = req.user.id;

        // Safe parsers — empty strings and NaN both default to 0
        const safeFloat = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
        const safeInt = (v) => { const n = parseInt(v); return isNaN(n) ? 0 : n; };

        const km_walked = safeFloat(req.body.km_walked);
        const km_run = safeFloat(req.body.km_run);
        const weight_lifting_mins = safeInt(req.body.weight_lifting_mins);
        const outdoor_activity_mins = safeInt(req.body.outdoor_activity_mins);
        const calories_consumed = safeFloat(req.body.calories_consumed);
        const notes = req.body.notes || "";
        const log_date = req.body.log_date;

        const date = log_date || new Date().toISOString().split("T")[0];

        // Fetch user's weight from DB for calorie calculation
        const [[user]] = await db.query(
            "SELECT weight FROM users WHERE id = ?",
            [userId]
        );
        const decryptedWeight = user?.weight ? decrypt(user.weight) : null;
        const weight_kg = safeFloat(decryptedWeight) || 70;

        const calories_burned = calculateCaloriesBurned({
            km_walked, km_run, weight_lifting_mins, outdoor_activity_mins, weight_kg
        });
        // Guarantee calories are never NaN
        const safe_calories = isNaN(calories_burned) ? 0 : calories_burned;

        // Upsert (insert or update if date already exists)
        await db.query(
            `INSERT INTO activity_logs 
        (user_id, log_date, km_walked, km_run, weight_lifting_mins, outdoor_activity_mins, calories_burned, calories_consumed, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        km_walked = VALUES(km_walked),
        km_run = VALUES(km_run),
        weight_lifting_mins = VALUES(weight_lifting_mins),
        outdoor_activity_mins = VALUES(outdoor_activity_mins),
        calories_burned = VALUES(calories_burned),
        calories_consumed = VALUES(calories_consumed),
        notes = VALUES(notes)`,
            [userId, date, km_walked, km_run, weight_lifting_mins, outdoor_activity_mins, safe_calories, calories_consumed, notes]
        );

        res.json({
            success: true,
            calories_burned: safe_calories,
            date,
            message: "Activity logged successfully!"
        });
    } catch (err) {
        console.error("Activity log error:", err);
        res.status(500).json({ message: "Failed to log activity" });
    }
});

// =============================================
// GET /api/activity/history?days=30
// =============================================
router.get("/history", authMiddleware, async (req, res) => {
    try {
        await ensureTable();
        const userId = req.user.id;
        const days = parseInt(req.query.days || 30);

        const [rows] = await db.query(
            `SELECT log_date, km_walked, km_run, weight_lifting_mins, outdoor_activity_mins, calories_burned, calories_consumed, notes
       FROM activity_logs
       WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY log_date ASC`,
            [userId, days]
        );

        res.json(rows);
    } catch (err) {
        console.error("Activity history error:", err);
        res.status(500).json({ message: "Failed to fetch activity history" });
    }
});

// =============================================
// GET /api/activity/streak
// =============================================
router.get("/streak", authMiddleware, async (req, res) => {
    try {
        await ensureTable();
        const userId = req.user.id;

        const [rows] = await db.query(
            `SELECT log_date FROM activity_logs
       WHERE user_id = ? AND (km_walked > 0 OR km_run > 0 OR weight_lifting_mins > 0 OR outdoor_activity_mins > 0)
       ORDER BY log_date DESC`,
            [userId]
        );

        let streak = 0;
        let checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);

        for (const row of rows) {
            const rowDate = new Date(row.log_date);
            rowDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((checkDate - rowDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 0 || diffDays === 1) {
                streak++;
                checkDate = rowDate;
            } else {
                break;
            }
        }

        res.json({ streak });
    } catch (err) {
        console.error("Streak error:", err);
        res.status(500).json({ message: "Failed to calculate streak" });
    }
});

// =============================================
// GET /api/activity/monthly?year=2026&month=3
// =============================================
router.get("/monthly", authMiddleware, async (req, res) => {
    try {
        await ensureTable();
        const userId = req.user.id;
        const year = parseInt(req.query.year || new Date().getFullYear());
        const month = parseInt(req.query.month || new Date().getMonth() + 1);

        const [rows] = await db.query(
            `SELECT log_date, km_walked, km_run, weight_lifting_mins, outdoor_activity_mins, calories_burned, calories_consumed
       FROM activity_logs
       WHERE user_id = ? AND YEAR(log_date) = ? AND MONTH(log_date) = ?
       ORDER BY log_date ASC`,
            [userId, year, month]
        );

        // Monthly totals
        const totals = rows.reduce((acc, r) => ({
            km_walked: acc.km_walked + (r.km_walked || 0),
            km_run: acc.km_run + (r.km_run || 0),
            calories_burned: acc.calories_burned + (r.calories_burned || 0),
            calories_consumed: acc.calories_consumed + (r.calories_consumed || 0),
            active_days: acc.active_days + 1
        }), { km_walked: 0, km_run: 0, calories_burned: 0, calories_consumed: 0, active_days: 0 });

        res.json({ days: rows, totals });
    } catch (err) {
        console.error("Monthly activity error:", err);
        res.status(500).json({ message: "Failed to fetch monthly activity" });
    }
});

// =============================================
// GET /api/activity/today
// =============================================
router.get("/today", authMiddleware, async (req, res) => {
    try {
        await ensureTable();
        const userId = req.user.id;
        const today = new Date().toISOString().split("T")[0];

        const [[row]] = await db.query(
            `SELECT * FROM activity_logs WHERE user_id = ? AND log_date = ?`,
            [userId, today]
        );

        res.json(row || null);
    } catch (err) {
        console.error("Today activity error:", err);
        res.status(500).json({ message: "Failed to fetch today's activity" });
    }
});

// =============================================
// GET /api/activity/calorie-target
// Returns daily calorie burn & intake targets
// Fully dynamic: BMI-aware + multi-condition medical logic
// =============================================
router.get("/calorie-target", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const [[user]] = await db.query(
            `SELECT weight, height, gender, dob, disease, full_name FROM users WHERE id = ?`,
            [userId]
        );

        if (user) {
            user.weight = decrypt(user.weight);
            user.height = decrypt(user.height);
            user.gender = decrypt(user.gender);
            user.dob = decrypt(user.dob);
            user.disease = decrypt(user.disease);
            // full_name is usually not encrypted but let's be safe if it is
            user.full_name = decrypt(user.full_name);
        }

        const targets = calculateCalorieTargets(user);
        res.json({
            ...targets,
            weight_kg: user?.weight || 70,
            height_cm: user?.height || 170,
            age: user?.age || 30, 
            gender: user?.gender,
            condition: user?.disease || "General"
        });
    } catch (err) {
        console.error("Calorie target error:", err);
        res.status(500).json({ message: "Failed to calculate calorie targets" });
    }
});

export default router;
