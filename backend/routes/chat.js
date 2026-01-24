import express from "express";
import { db } from "../server.js";

const router = express.Router();

// Save a chat message
router.post("/save", async (req, res) => {
  try {
    const {
      patient_id,
      role,
      message,
      context,
      labs_snapshot,
      ai_decision,
      ai_reason
    } = req.body;

    const sql = `
      INSERT INTO chat_logs 
      (patient_id, role, message, context, labs_snapshot, ai_decision, ai_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      patient_id,
      role,
      message,
      context,
      JSON.stringify(labs_snapshot || {}),
      ai_decision || null,
      ai_reason || null
    ]);

    res.json({ success: true, message: "Chat saved" });
  } catch (err) {
    console.error("CHAT SAVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get full chat history
router.get("/history/:patient_id", async (req, res) => {
  try {
    const { patient_id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM chat_logs WHERE patient_id = ? ORDER BY created_at ASC",
      [patient_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get last 7 days
router.get("/last-7-days/:patient_id", async (req, res) => {
  try {
    const { patient_id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM chat_logs 
       WHERE patient_id = ? 
       AND created_at >= NOW() - INTERVAL 7 DAY
       ORDER BY created_at ASC`,
      [patient_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("7 DAY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
