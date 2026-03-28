import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '13.60.55.59',
        user: process.env.DB_USER || 'dataletuser',
        password: process.env.DB_PASSWORD || 'Datalet@2026',
        database: process.env.DB_NAME || 'datalethealth'
    });

    console.log('Syncing assigned_dietician from diet_plans to users...');
    
    // Update users who have an approved diet plan
    const [result] = await connection.execute(`
        UPDATE users u
        INNER JOIN (
            SELECT patient_id, approved_by
            FROM diet_plans
            WHERE status = 'approved' AND approved_by IS NOT NULL
            ORDER BY id DESC
        ) dp ON u.id = dp.patient_id
        SET u.assigned_dietician = dp.approved_by
        WHERE u.assigned_dietician IS NULL OR u.assigned_dietician = ''
    `);

    console.log(`Updated ${result.affectedRows} users.`);

    // Check Ritish specifically (ID 12)
    const [ritish] = await connection.execute("SELECT id, full_name, assigned_dietician FROM users WHERE id = 12");
    console.log('Ritish after sync:', JSON.stringify(ritish, null, 2));

    await connection.end();
}

migrate().catch(console.error);
