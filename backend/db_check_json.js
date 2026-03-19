import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

async function checkMeals() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    const [rows] = await db.query("SELECT day, time, meal_name FROM diet_meals LIMIT 5;");
    fs.writeFileSync("output.json", JSON.stringify(rows, null, 2));
    process.exit(0);
}

checkMeals().catch(console.error);
