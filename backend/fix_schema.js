import { db } from "./server.js";

async function fixSchema() {
  try {
    const [medical] = await db.query("DESCRIBE medical_data");
    let alters = [];
    medical.forEach(col => {
      // Only alter measurable data fields
      if (["id", "user_id", "created_at", "updated_at"].includes(col.Field)) return;
      if (!col.Type.includes("varchar") && !col.Type.includes("text")) {
         alters.push(`MODIFY COLUMN \`${col.Field}\` VARCHAR(512)`);
      } else if (col.Type.includes("varchar") && parseInt(col.Type.match(/\d+/)[0]) < 255) {
         alters.push(`MODIFY COLUMN \`${col.Field}\` VARCHAR(512)`);
      }
    });

    if (alters.length > 0) {
      const alterQuery = `ALTER TABLE medical_data ${alters.join(", ")}`;
      console.log("Running alter:", alterQuery);
      await db.query(alterQuery);
    }

    const [users] = await db.query("DESCRIBE users");
    let userAlters = [];
    users.forEach(col => {
      if (["id", "role", "created_at", "updated_at", "password_hash", "profile_image"].includes(col.Field)) return;
      if (!col.Type.includes("varchar") && !col.Type.includes("text")) {
         userAlters.push(`MODIFY COLUMN \`${col.Field}\` VARCHAR(512)`);
      } else if (col.Type.includes("varchar") && parseInt(col.Type.match(/\d+/)[0]) < 255) {
         userAlters.push(`MODIFY COLUMN \`${col.Field}\` VARCHAR(512)`);
      }
    });

    if (userAlters.length > 0) {
      const alterUserQuery = `ALTER TABLE users ${userAlters.join(", ")}`;
      console.log("Running alter user:", alterUserQuery);
      await db.query(alterUserQuery);
    }

    console.log("Schema checked and updated to VARCHAR(512).");
  } catch (err) {
    console.error("Schema error:", err);
  } finally {
    process.exit(0);
  }
}

fixSchema();
