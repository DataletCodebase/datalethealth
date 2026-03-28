import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'datalethealth'
    });

    console.log('--- User Assignments ---');
    const [users] = await connection.execute("SELECT id, full_name, assigned_dietician FROM users LIMIT 10");
    console.table(users);

    console.log('\n--- Diet Plan Approvals ---');
    const [plans] = await connection.execute("SELECT patient_id, status, approved_by FROM diet_plans WHERE status='approved' LIMIT 10");
    console.table(plans);

    await connection.end();
}

check().catch(console.error);
