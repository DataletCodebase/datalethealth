import "./config/env.js";

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { createProxyMiddleware } from "http-proxy-middleware";

import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import profileRoutes from "./routes/profileRoutes.js";
import medicalRoutes from "./routes/medicalRoutes.js";
import authMiddleware from "./middleware/auth.js";
import userRoutes from "./routes/userRoutes.js";
import chatbotRoutes from "./routes/chatbot.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import adminRoutes from "./routes/adminRoutes.js";
import dietRoutes from "./routes/diet.js";
import activityRoutes from "./routes/activityRoutes.js";

console.log("EMAIL_USER:", process.env.EMAIL_USER);

const app = express();

/* ===========================
   CORS CONFIG
=========================== */
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://13.60.55.59:5174",
      "https://datalethealthcare.in",
    ],
    credentials: true,
  })
);

/* ===========================
   DATABASE
=========================== */
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

/* ===========================
   PYTHON FASTAPI PROXIES
=========================== */

/* ---- ✅ ASK AGENT FIX ---- */
app.use(
  "/api/ask-agent",
  createProxyMiddleware({
    target: "http://localhost:8001",
    changeOrigin: true,
    proxyTimeout: 120000,
    timeout: 120000,
    pathRewrite: {
      "^/api/ask-agent": "/ask-agent",
    },
    onProxyReq: (proxyReq, req) => {
      console.log(`[Proxy ASK FIX] ${req.originalUrl} -> ${proxyReq.path}`);
    },
  })
);

/* ---- PHOTO ANALYSIS ---- */
app.use(
  "/ask/analyze-food-photo",
  createProxyMiddleware({
    target: "http://localhost:8001",
    changeOrigin: true,
    proxyTimeout: 120000,
    timeout: 120000,
    pathRewrite: () => "/ask/analyze-food-photo",
  })
);

/* ---- WATER LOGS ---- */
app.use(
  "/water-logs",
  createProxyMiddleware({
    target: "http://localhost:8001",
    changeOrigin: true,
    pathRewrite: (path) => "/water/logs" + path,
  })
);

/* ---- DIRECT PYTHON ROUTES ---- */
const pythonRoutes = [
  "/patient",
  "/leads",
  "/lab-report",
  "/chat-memory",
  "/meal-tracking",
];

pythonRoutes.forEach((route) => {
  app.use(
    route,
    createProxyMiddleware({
      target: "http://localhost:8001",
      changeOrigin: true,
      pathRewrite: (path) => route + path,
    })
  );
});

/* ===========================
   BODY PARSERS
=========================== */
app.use(express.json({ limit: "110mb" }));
app.use(express.urlencoded({ extended: true, limit: "110mb" }));

/* ===========================
   LOCAL NODE ROUTES
=========================== */

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json({ status: "DB Connected Successfully", rows });
  } catch (err) {
    console.error("DB TEST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/medical", authMiddleware, medicalRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.use("/uploads", express.static("uploads"));

app.use("/admin", adminAuthRoutes);
app.use("/admin", adminRoutes);

app.use("/diet", dietRoutes);
app.use("/api/activity", activityRoutes);

/* ===========================
   SERVER START
=========================== */

const PORT = 8000;

app.listen(PORT, () => {
  console.log(
    `✅ API Gateway running on port ${PORT} (Node Public -> Python 8001 Internal)`
  );
});
