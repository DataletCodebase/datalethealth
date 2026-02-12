import "./config/env.js"

import express from "express";
import cors from "cors";

import mysql from "mysql2/promise";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import profileRoutes from "./routes/profileRoutes.js";
import medicalRoutes from "./routes/medicalRoutes.js";
import authMiddleware from "./middleware/auth.js"; 
import userRoutes from "./routes/userRoutes.js";
import chatbotRoutes from "./routes/chatbot.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAuth from "./middleware/adminAuth.js";
import dietRoutes from "./routes/diet.js";



console.log("EMAIL_USER:", process.env.EMAIL_USER);

const app = express();

app.use(cors({
  origin: "http://localhost:5174",
  credentials: true
}));

app.use(express.json({ limit: "110mb" }));
app.use(express.urlencoded({ extended: true, limit: "110mb" }));

// ✅ MySQL Pool Connection
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// ✅ DB Test Route
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    return res.json({ status: "DB Connected Successfully", rows });
  } catch (err) {
    console.error("DB TEST ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/medical", authMiddleware, medicalRoutes);
app.use("/api/user", userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/chatbot", chatbotRoutes);
app.use("/admin", adminAuthRoutes);
// app.use("/admin", adminAuth, adminRoutes);
app.use("/admin", adminRoutes);
app.use("/diet",  dietRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API server running on port ${PORT}`);
});
