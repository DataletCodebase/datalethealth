import { db } from "../server.js";

export default function registerChatSockets(io) {
  io.on("connection", (socket) => {
    // ── Join user room ──────────────────────────────────────────────
    socket.on("join_room", ({ userId, role }) => {
      const room = `user_${userId}`;
      socket.join(room);
      socket.data.userId = userId;
      socket.data.role = role || "patient";

      if (role === "admin") {
        socket.join("admin_room");
      }
    });

    // ── Patient sends a message ────────────────────────────────────
    socket.on("patient_message", async ({ userId, message, dietician }) => {
      if (!userId || !message?.trim()) return;

      try {
        const [result] = await db.query(
          `INSERT INTO dietician_messages (user_id, sender, message, dietician, is_read)
           VALUES (?, 'patient', ?, ?, 0)`,
          [userId, message.trim(), dietician || null]
        );

        const msgPayload = {
          id: result.insertId,
          user_id: userId,
          sender: "patient",
          message: message.trim(),
          dietician: dietician || null,
          is_read: 0,
          created_at: new Date().toISOString(),
        };

        // Emit to admin room
        io.to("admin_room").emit("new_patient_message", msgPayload);
        // Confirm back to sender
        socket.emit("message_saved", msgPayload);
      } catch (err) {
        console.error("[Socket] patient_message error:", err.message);
        socket.emit("message_error", { error: "Failed to save message" });
      }
    });

    // ── Admin/Dietician replies ────────────────────────────────────
    socket.on("dietician_message", async ({ userId, message, dietician }) => {
      if (!userId || !message?.trim()) return;

      try {
        const [result] = await db.query(
          `INSERT INTO dietician_messages (user_id, sender, message, dietician, is_read)
           VALUES (?, 'dietician', ?, ?, 1)`,
          [userId, message.trim(), dietician || "Admin"]
        );

        const msgPayload = {
          id: result.insertId,
          user_id: userId,
          sender: "dietician",
          message: message.trim(),
          dietician: dietician || "Admin",
          is_read: 1,
          created_at: new Date().toISOString(),
        };

        // Emit to the specific patient's room
        io.to(`user_${userId}`).emit("dietician_reply", msgPayload);
        // Also echo back to admin room minus the sender
        socket.broadcast.to("admin_room").emit("new_admin_message", msgPayload);
        socket.emit("message_saved", msgPayload);
      } catch (err) {
        console.error("[Socket] dietician_message error:", err.message);
        socket.emit("message_error", { error: "Failed to save message" });
      }
    });

    // ── Typing indicators ─────────────────────────────────────────
    socket.on("typing_start", ({ userId, role }) => {
      if (role === "patient") {
        io.to("admin_room").emit("patient_typing", { userId, typing: true });
      } else {
        io.to(`user_${userId}`).emit("dietician_typing", { typing: true });
      }
    });

    socket.on("typing_stop", ({ userId, role }) => {
      if (role === "patient") {
        io.to("admin_room").emit("patient_typing", { userId, typing: false });
      } else {
        io.to(`user_${userId}`).emit("dietician_typing", { typing: false });
      }
    });

    socket.on("disconnect", () => {
      // Clean up if needed
    });
  });
}
