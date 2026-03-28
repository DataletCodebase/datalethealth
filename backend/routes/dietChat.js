import express from "express";
import { db } from "../server.js";
import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// ── GET /api/diet-chat/history/:userId ── full message history (patient auth)
router.get("/history/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    // Patients can only read their own history
    if (req.user.role !== "SUPER_ADMIN" && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const [rows] = await db.query(
      `SELECT id, user_id, sender, message, dietician, is_read, created_at
       FROM dietician_messages
       WHERE user_id = ?
       ORDER BY created_at ASC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("DIET-CHAT history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST /api/diet-chat/send ── REST fallback to save a message
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { userId, message, sender, dietician } = req.body;
    if (!userId || !message?.trim() || !sender) {
      return res.status(400).json({ message: "userId, message, sender required" });
    }

    const [result] = await db.query(
      `INSERT INTO dietician_messages (user_id, sender, message, dietician, is_read)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, message.trim(), sender, dietician || null, sender === "dietician" ? 1 : 0]
    );

    res.json({ success: true, id: result.insertId, created_at: new Date().toISOString() });
  } catch (err) {
    console.error("DIET-CHAT send error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET /api/diet-chat/dietician/:userId ── get assigned dietician for user
router.get("/dietician/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      "SELECT assigned_dietician FROM users WHERE id = ?",
      [userId]
    );
    if (!rows[0]) return res.status(404).json({ message: "User not found" });
    res.json({ assigned_dietician: rows[0].assigned_dietician });
  } catch (err) {
    console.error("DIET-CHAT dietician fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST /api/diet-chat/assign ── Admin assigns a dietician to a user
router.post("/assign", adminAuth, async (req, res) => {
  try {
    const { userId, dietician_name } = req.body;
    if (!userId || !dietician_name?.trim()) {
      return res.status(400).json({ message: "userId and dietician_name required" });
    }
    await db.query(
      "UPDATE users SET assigned_dietician = ? WHERE id = ?",
      [dietician_name.trim(), userId]
    );
    res.json({ success: true, message: `Dietician "${dietician_name}" assigned to user ${userId}` });
  } catch (err) {
    console.error("DIET-CHAT assign error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET /api/diet-chat/admin/all-conversations ── all conversations for admin
router.get("/admin/all-conversations", adminAuth, async (req, res) => {
  try {
    // Get distinct users who have messages, with last message + unread count
    const [rows] = await db.query(`
      SELECT 
        dm.user_id,
        u.full_name,
        u.assigned_dietician,
        MAX(dm.created_at) AS last_message_at,
        (SELECT message FROM dietician_messages 
         WHERE user_id = dm.user_id ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT sender FROM dietician_messages 
         WHERE user_id = dm.user_id ORDER BY created_at DESC LIMIT 1) AS last_sender,
        SUM(dm.sender = 'patient' AND dm.is_read = 0) AS unread_count
      FROM dietician_messages dm
      JOIN users u ON u.id = dm.user_id
      GROUP BY dm.user_id, u.full_name, u.assigned_dietician
      ORDER BY last_message_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("DIET-CHAT all-conversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── PATCH /api/diet-chat/mark-read/:userId ── admin marks messages as read
router.patch("/mark-read/:userId", adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    await db.query(
      "UPDATE dietician_messages SET is_read = 1 WHERE user_id = ? AND sender = 'patient'",
      [userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("DIET-CHAT mark-read error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET /api/diet-chat/admin/history/:userId ── admin reads full thread
router.get("/admin/history/:userId", adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      `SELECT id, user_id, sender, message, dietician, is_read, created_at
       FROM dietician_messages
       WHERE user_id = ?
       ORDER BY created_at ASC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("DIET-CHAT admin history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
