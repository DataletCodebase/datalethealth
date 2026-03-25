// routes/wellnessRoutes.js
// Sleep & AI Wellness Score — replaced Food Tracking with Anxiety Level
// Includes fallback/date-resilience for DB sync issues
import express from "express";
import authMiddleware from "../middleware/auth.js";
import { db } from "../server.js";
import { calculateCalorieTargets } from "../utils/healthCalculators.js";

const router = express.Router();

// ── Table Init (with migration) ───────────────────────────────────────────
let tableReady = false;
async function ensureTable() {
    if (tableReady) return;
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS wellness_scores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                score_date DATE NOT NULL,
                bedtime VARCHAR(20),
                waketime VARCHAR(20),
                sleep_hours FLOAT DEFAULT 0,
                sleep_score INT DEFAULT 0,
                activity_score INT DEFAULT 0,
                anxiety_score INT DEFAULT 0,
                anxiety_level VARCHAR(20) DEFAULT 'Low',
                total_score INT DEFAULT 0,
                score_label VARCHAR(30),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_date (user_id, score_date)
            )
        `);
        // Migration: Add anxiety columns if missing (swallow errors if blocked)
        try { await db.query("ALTER TABLE wellness_scores ADD COLUMN anxiety_score INT DEFAULT 0;"); } catch (e) {}
        try { await db.query("ALTER TABLE wellness_scores ADD COLUMN anxiety_level VARCHAR(20) DEFAULT 'Low';"); } catch (e) {}
    } catch (e) { console.error("ensureTable failed:", e.message); }
    tableReady = true;
}

// ── Helper: Compute wellness score ─────────────────────────────────────────
function computeWellnessScore({ sleepHours, burned, burnTarget }) {
    // 1. Sleep Quality (35%)
    let sleepScore = 0;
    if (sleepHours >= 7 && sleepHours <= 9) sleepScore = 35;
    else if (sleepHours >= 6 && sleepHours < 7) sleepScore = 28;
    else if (sleepHours > 9 && sleepHours <= 10) sleepScore = 26;
    else if (sleepHours >= 5 && sleepHours < 6) sleepScore = 18;
    else if (sleepHours > 10) sleepScore = 15;
    else if (sleepHours >= 4) sleepScore = 10;
    else sleepScore = Math.round(sleepHours * 2);

    // 2. Activity (40%)
    let activityScore = 0;
    if (burnTarget > 0) activityScore = Math.min(40, Math.round((burned / burnTarget) * 40));

    // 3. Anxiety Level (25%) — Based on Sleep Cycle
    let anxietyScore = 0;
    let anxietyLevel = "Low";
    
    if (sleepHours >= 7 && sleepHours <= 9) {
        anxietyScore = 25;
        anxietyLevel = "Low";
    } else if ((sleepHours >= 6 && sleepHours < 7) || (sleepHours > 9 && sleepHours <= 10)) {
        anxietyScore = 15;
        anxietyLevel = "Moderate";
    } else {
        anxietyScore = 5;
        anxietyLevel = "High";
    }

    const total = sleepScore + activityScore + anxietyScore;
    let label = total >= 85 ? "Excellent" : total >= 70 ? "Great" : total >= 55 ? "Good" : total >= 40 ? "Fair" : total >= 25 ? "Poor" : "Critical";

    return { sleepScore, activityScore, anxietyScore, anxietyLevel, total, label };
}

// ── Robust Time Parsing ────────────────────────────────────────────────────
function parseTime(t) {
    if (!t) return 0;
    const cleaned = t.toUpperCase().trim();
    const isPM = cleaned.includes("PM");
    const isAM = cleaned.includes("AM");
    let [hPart, mPart] = cleaned.replace(/[AP]M/, "").split(":");
    let h = parseInt(hPart) || 0;
    let m = parseInt(mPart) || 0;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h * 60 + m;
}

// ── POST /api/wellness/log ──────────────────────────────────────────────────
router.post("/log", authMiddleware, async (req, res) => {
    try {
        await ensureTable();
        const userId = req.user.id;
        const today = new Date().toISOString().split("T")[0];
        const { bedtime, waketime } = req.body;

        const bedMins = parseTime(bedtime);
        let wakeMins = parseTime(waketime);
        if (wakeMins <= bedMins) wakeMins += 24 * 60;
        const sleepHours = Math.round(((wakeMins - bedMins) / 60) * 10) / 10;

        // Date-resilient Activity Sync: Look for latest log in last 2 days (UTC offset bridge)
        const [[activity]] = await db.query(
            "SELECT IFNULL(calories_burned,0) as burned FROM activity_logs WHERE user_id = ? AND log_date >= DATE_SUB(?, INTERVAL 1 DAY) ORDER BY log_date DESC LIMIT 1",
            [userId, today]
        );
        const burned = activity?.burned || 0;

        const [[user]] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
        const targets = calculateCalorieTargets(user);

        const { sleepScore, activityScore, anxietyScore, anxietyLevel, total, label } = computeWellnessScore({
            sleepHours,
            burned, burnTarget: targets.burn_target
        });

        // Robust INSERT with legacy fallback for diet_score
        try {
            await db.query(
                `INSERT INTO wellness_scores 
                    (user_id, score_date, bedtime, waketime, sleep_hours, sleep_score, activity_score, anxiety_score, anxiety_level, total_score, score_label)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    bedtime=VALUES(bedtime), waketime=VALUES(waketime), sleep_hours=VALUES(sleep_hours),
                    sleep_score=VALUES(sleep_score), activity_score=VALUES(activity_score), 
                    anxiety_score=VALUES(anxiety_score), anxiety_level=VALUES(anxiety_level),
                    total_score=VALUES(total_score), score_label=VALUES(score_label)`,
                [userId, today, bedtime, waketime, sleepHours, sleepScore, activityScore, anxietyScore, anxietyLevel, total, label]
            );
        } catch (e) {
            if (e.message.includes("anxiety_score")) {
                // Fallback to diet_score column if migration failed
                await db.query(
                    `INSERT INTO wellness_scores 
                        (user_id, score_date, bedtime, waketime, sleep_hours, sleep_score, activity_score, diet_score, total_score, score_label)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE 
                        bedtime=VALUES(bedtime), waketime=VALUES(waketime), sleep_hours=VALUES(sleep_hours),
                        sleep_score=VALUES(sleep_score), activity_score=VALUES(activity_score), 
                        diet_score=VALUES(diet_score), total_score=VALUES(total_score), score_label=VALUES(score_label)`,
                    [userId, today, bedtime, waketime, sleepHours, sleepScore, activityScore, anxietyScore, total, label]
                );
            } else throw e;
        }

        res.json({ success: true, total_score: total, score_label: label, sleep_hours: sleepHours, sleep_score: sleepScore, activity_score: activityScore, anxiety_score: anxietyScore, anxiety_level: anxietyLevel });
    } catch (err) {
        console.error("Wellness log error:", err);
        res.status(500).json({ message: "Failed to save score" });
    }
});

router.get("/today", authMiddleware, async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];
        const [[row]] = await db.query("SELECT * FROM wellness_scores WHERE user_id = ? AND score_date = ?", [req.user.id, today]);
        
        // Map legacy diet_score to anxiety_score if needed
        if (row && row.diet_score !== undefined && row.anxiety_score === undefined) {
             row.anxiety_score = row.diet_score;
             row.anxiety_level = row.sleep_hours >= 7 && row.sleep_hours <= 9 ? "Low" : (row.sleep_hours >= 6 || row.sleep_hours > 9 ? "Moderate" : "High");
        }
        res.json(row || null);
    } catch (err) { console.error(err); res.status(500).json({ message: "Error" }); }
});

router.get("/history", authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM wellness_scores WHERE user_id = ? AND score_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ORDER BY score_date ASC",
            [req.user.id]
        );
        // Map legacy results for history as well
        const mapped = rows.map(r => {
             if (r.diet_score !== undefined && r.anxiety_score === undefined) {
                 r.anxiety_score = r.diet_score;
                 r.anxiety_level = r.sleep_hours >= 7 && r.sleep_hours <= 9 ? "Low" : (row.sleep_hours >= 6 || row.sleep_hours > 9 ? "Moderate" : "High");
             }
             return r;
        });
        res.json(mapped);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

export default router;
