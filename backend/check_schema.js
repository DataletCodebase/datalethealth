import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import { decrypt } from "./utils/encryption.js";

dotenv.config({ path: "c:/Users/Asus/OneDrive/Desktop/DataletProd/datalethealth/backend/.env" });

async function checkSchema() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  try {
    const [rows] = await db.query("DESCRIBE users");
    let output = "--- USERS TABLE SCHEMA ---\n";
    rows.forEach(r => {
      output += `${r.Field.padEnd(20)} | ${r.Type}\n`;
    });
    
    // Also check current data for a user to see if it's truncated
    const [users] = await db.query("SELECT id, weight, height, disease FROM users LIMIT 5");
    users.forEach(u => {
        output += `\n--- SAMPLE DATA (User ${u.id}) ---\n`;
        output += `Weight (Raw): ${u.weight}\n`;
        output += `Weight (Decrypted): ${decrypt(u.weight)}\n`;
        output += `Height (Raw): ${u.height}\n`;
        output += `Height (Decrypted): ${decrypt(u.height)}\n`;
        output += `Disease (Raw): ${u.disease}\n`;
        output += `Disease (Decrypted): ${decrypt(u.disease)}\n`;
    });
    
    fs.writeFileSync("schema_output.txt", output);
    console.log("Schema written to schema_output.txt");
    
  } catch (err) {
    console.error(err);
  } finally {
    await db.end();
  }
}

checkSchema();
