import "./config/env.js";

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createServer } from "http";
import { Server } from "socket.io";

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
import wellnessRoutes from "./routes/wellnessRoutes.js";
import dietChatRoutes from "./routes/dietChat.js";
import registerChatSockets from "./sockets/chat.js";

console.log("EMAIL_USER:", process.env.EMAIL_USER);

const app = express();

const ALLOWED_ORIGINS = [
  "http://localhost:5174",
  "http://13.60.55.59:5174",
  "https://datalethealthcare.in",
];

/* ===========================
   CORS CONFIG
=========================== */
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
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
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
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
  "/api/ask/analyze-food-photo",
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
  "/api/water-logs",
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
    `/api${route}`,
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
app.use("/api/uploads", express.static("uploads"));

app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/diet", dietRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/diet-chat", dietChatRoutes);

// 🔹 Production Aliases (Handles stale frontend builds that omit /api)
app.use("/diet", dietRoutes);
app.use("/activity", activityRoutes);
app.use("/wellness", wellnessRoutes);
app.use("/meal-tracking", createProxyMiddleware({
    target: "http://localhost:8001",
    changeOrigin: true,
    pathRewrite: (path) => "/meal-tracking" + path,
}));

/* ===========================
   HTTP SERVER + SOCKET.IO
=========================== */

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Register all real-time chat socket events
registerChatSockets(io);

/* ===========================
   7-DAY CHAT AUTO-CLEANUP
=========================== */
async function purgeOldMessages() {
  try {
    const [result] = await db.query(
      `DELETE FROM dietician_messages WHERE created_at < NOW() - INTERVAL 7 DAY`
    );
    if (result.affectedRows > 0) {
      console.log(`🗑️  [Chat Cleanup] Deleted ${result.affectedRows} messages older than 7 days.`);
    }
  } catch (err) {
    console.error("❌ [Chat Cleanup] Failed to purge old messages:", err.message);
  }
}

// Run immediately on startup, then every 24 hours
purgeOldMessages();
setInterval(purgeOldMessages, 24 * 60 * 60 * 1000);

const PORT = 8000;

httpServer.listen(PORT, () => {
  console.log(
    `✅ API Gateway + Socket.io running on port ${PORT} (Node Public -> Python 8001 Internal)`
  );
});
