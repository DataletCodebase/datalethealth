import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'datalet_health'
    });

    console.log('Connected to database for migration...');

    // 1. Get all approved or rejected diet plans that have an approved_by name
    const [plans] = await connection.execute(
        "SELECT patient_id, approved_by FROM diet_plans WHERE status IN ('approved', 'rejected') AND approved_by IS NOT NULL ORDER BY approved_at ASC"
    );

    console.log(`Found ${plans.length} diet plans to sync.`);

    // 2. Update the users table for each plan (latest one for each user will win because of ORDER BY ASC)
    for (const plan of plans) {
        console.log(`Syncing user ${plan.patient_id} with dietician: ${plan.approved_by}`);
        await connection.execute(
            "UPDATE users SET assigned_dietician = ? WHERE id = ?",
            [plan.approved_by, plan.patient_id]
        );
    }

    console.log('Migration completed successfully ✅');
    await connection.end();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
