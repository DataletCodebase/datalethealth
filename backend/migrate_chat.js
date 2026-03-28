import "./config/env.js";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].cnt > 0;
}

async function migrate() {
  const conn = await db.getConnection();
  try {
    console.log("🔄 Running chat migration...");

    // Add assigned_dietician column to users table (safe check)
    const hasCol = await columnExists(conn, "users", "assigned_dietician");
    if (!hasCol) {
      await conn.query(
        "ALTER TABLE users ADD COLUMN assigned_dietician VARCHAR(255) NULL DEFAULT NULL"
      );
      console.log("✅ Column assigned_dietician added to users table");
    } else {
      console.log("ℹ️  Column assigned_dietician already exists — skipped");
    }

    // Create dietician_messages table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS dietician_messages (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        sender      ENUM('patient','dietician') NOT NULL,
        message     TEXT NOT NULL,
        dietician   VARCHAR(255) DEFAULT NULL,
        is_read     TINYINT(1) DEFAULT 0,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✅ Table dietician_messages ready");

    console.log("\n🎉 Migration complete — chat system ready!");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
    process.exit(1);
  } finally {
    conn.release();
    await db.end();
    process.exit(0);
  }
}

migrate();
