import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "./.env") });

async function checkDiets() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
    });
    const [rows] = await db.query("SELECT DISTINCT patient_id FROM diet_plans;");
    console.log("DIET_PATIENT_IDS=" + rows.map(r => r.patient_id).join(","));
    process.exit(0);
}

checkDiets().catch(err => {
    console.error(err);
    process.exit(1);
});
