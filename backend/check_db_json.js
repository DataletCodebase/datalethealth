import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '13.60.55.59',
        user: process.env.DB_USER || 'dataletuser',
        password: process.env.DB_PASSWORD || 'Datalet@2026',
        database: process.env.DB_NAME || 'datalethealth'
    });

    const [users] = await connection.execute("SELECT id, full_name, assigned_dietician FROM users WHERE full_name LIKE '%Ritish%'");
    console.log('--- TARGET USERS ---');
    console.log(JSON.stringify(users, null, 2));

    const [plans] = await connection.execute("SELECT patient_id, status, approved_by FROM diet_plans WHERE status='approved' AND approved_by IS NOT NULL ORDER BY id DESC LIMIT 5");
    console.log('--- RECENT APPROVED PLANS ---');
    console.log(JSON.stringify(plans, null, 2));

    await connection.end();
}

check().catch(console.error);
