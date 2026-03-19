import express from "express";
import { db } from "../db.js";
console.log("✅ Chatbot routes loaded");

const router = express.Router();

router.post("/save-user", async (req, res) => {
  try {
    const { name, phone, age, weight, condition_text } = req.body;

    // Basic validation
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // Phone validation: 10–12 digits only
    const phoneRegex = /^\d{10,12}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (age && isNaN(age)) {
      return res.status(400).json({ message: "Age must be a number" });
    }

    if (weight && isNaN(weight)) {
      return res.status(400).json({ message: "Weight must be a number" });
    }

    const query = `
      INSERT INTO chatbot_crm_users 
      (name, phone, age, weight, condition_text)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      name,
      phone,
      age || null,
      weight || null,
      condition_text || null
    ]);

    res.json({
      status: "success",
      message: "User saved successfully"
    });

  } catch (error) {
    console.error("Chatbot Save Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
