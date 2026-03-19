import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function checkMeals() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
    });
    const [rows] = await db.query("SELECT day, time, meal_name FROM diet_meals LIMIT 5;");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
}

checkMeals().catch(console.error);
