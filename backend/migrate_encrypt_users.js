/**
 * migrate_encrypt_users.js
 * 
 * One-time migration: encrypts all plaintext user data in the `users` table.
 * - Deterministic encryption (CBC) for email & mobile (needed for login lookup)
 * - GCM encryption for all other PII fields
 * 
 * SAFE TO RUN MULTIPLE TIMES — already-encrypted values are skipped.
 * 
 * Run with: node migrate_encrypt_users.js
 */

import "./config/env.js";
import mysql from "mysql2/promise";
import { encrypt, decrypt, encryptDeterministic, decryptDeterministic } from "./utils/encryption.js";

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 5,
});

/**
 * Returns true if a string looks like an already-encrypted GCM value (has colons, is hex).
 */
function looksGcmEncrypted(val) {
  if (!val || typeof val !== "string") return false;
  const parts = val.split(":");
  return parts.length === 3 && /^[0-9a-fA-F]+$/.test(parts[0]);
}

/**
 * Returns true if a string looks like an already deterministically encrypted value (pure hex).
 */
function looksDeterministicEncrypted(val) {
  if (!val || typeof val !== "string") return false;
  if (val.includes(":")) return false; // GCM has colons
  return /^[0-9a-fA-F]{32,}$/.test(val);
}

async function migrate() {
  console.log("🔒 Starting user data encryption migration...\n");

  const [users] = await db.query("SELECT * FROM users");
  console.log(`Found ${users.length} users to check.\n`);

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    const updates = {};
    const logParts = [];

    // --- email (deterministic CBC) ---
    if (user.email && !looksDeterministicEncrypted(user.email)) {
      updates.email = encryptDeterministic(user.email);
      logParts.push("email");
    }

    // --- mobile (deterministic CBC) ---
    if (user.mobile && !looksDeterministicEncrypted(user.mobile)) {
      updates.mobile = encryptDeterministic(user.mobile);
      logParts.push("mobile");
    }

    // --- full_name (GCM) ---
    if (user.full_name && !looksGcmEncrypted(user.full_name)) {
      updates.full_name = encrypt(user.full_name);
      logParts.push("full_name");
    }

    // --- dob (GCM) ---
    if (user.dob && !looksGcmEncrypted(String(user.dob))) {
      updates.dob = encrypt(String(user.dob));
      logParts.push("dob");
    }

    // --- address (GCM) ---
    if (user.address && !looksGcmEncrypted(user.address)) {
      updates.address = encrypt(user.address);
      logParts.push("address");
    }

    // --- disease (GCM) ---
    if (user.disease && !looksGcmEncrypted(user.disease)) {
      updates.disease = encrypt(user.disease);
      logParts.push("disease");
    }

    // --- gender (GCM) ---
    if (user.gender && !looksGcmEncrypted(user.gender)) {
      updates.gender = encrypt(user.gender);
      logParts.push("gender");
    }

    // --- height (GCM) ---
    if (user.height != null && !looksGcmEncrypted(String(user.height))) {
      updates.height = encrypt(String(user.height));
      logParts.push("height");
    }

    // --- weight (GCM) ---
    if (user.weight != null && !looksGcmEncrypted(String(user.weight))) {
      updates.weight = encrypt(String(user.weight));
      logParts.push("weight");
    }

    // --- blood_group (GCM) ---
    if (user.blood_group && !looksGcmEncrypted(user.blood_group)) {
      updates.blood_group = encrypt(user.blood_group);
      logParts.push("blood_group");
    }

    // --- city (GCM) ---
    if (user.city && !looksGcmEncrypted(user.city)) {
      updates.city = encrypt(user.city);
      logParts.push("city");
    }

    // --- state (GCM) ---
    if (user.state && !looksGcmEncrypted(user.state)) {
      updates.state = encrypt(user.state);
      logParts.push("state");
    }

    // --- country (GCM) ---
    if (user.country && !looksGcmEncrypted(user.country)) {
      updates.country = encrypt(user.country);
      logParts.push("country");
    }

    if (Object.keys(updates).length === 0) {
      skipped++;
      console.log(`  ⏭  User ID ${user.id} — already encrypted, skipping.`);
      continue;
    }

    // Build SET clause
    const setClause = Object.keys(updates)
      .map((k) => `\`${k}\` = ?`)
      .join(", ");
    const values = [...Object.values(updates), user.id];

    await db.query(`UPDATE users SET ${setClause} WHERE id = ?`, values);

    migrated++;
    console.log(`  ✅ User ID ${user.id} — encrypted: ${logParts.join(", ")}`);
  }

  console.log(`\n✅ Migration complete. Migrated: ${migrated}, Already encrypted/skipped: ${skipped}`);

  // Also migrate medical_data if values are plaintext
  console.log("\n🔒 Checking medical_data table...\n");
  const medFields = [
    "creatinine", "potassium", "sodium", "urea", "estimated_gfr",
    "albumin", "calcium", "phosphate", "uric_acid",
    "cholesterol_total", "cholesterol_ldl", "cholesterol_hdl", "triglycerides",
    "blood_pressure_systolic", "blood_pressure_diastolic", "heart_rate", "bmi",
    "fasting_glucose", "postprandial_glucose", "hba1c"
  ];

  const [medRows] = await db.query("SELECT * FROM medical_data");
  console.log(`Found ${medRows.length} medical records to check.\n`);

  let medMigrated = 0;
  let medSkipped = 0;

  for (const row of medRows) {
    const updates = {};
    const logParts = [];

    for (const field of medFields) {
      const val = row[field];
      if (val !== null && val !== undefined && !looksGcmEncrypted(String(val))) {
        updates[field] = encrypt(String(val));
        logParts.push(field);
      }
    }

    if (Object.keys(updates).length === 0) {
      medSkipped++;
      continue;
    }

    const setClause = Object.keys(updates)
      .map((k) => `\`${k}\` = ?`)
      .join(", ");
    const values = [...Object.values(updates), row.id];

    await db.query(`UPDATE medical_data SET ${setClause} WHERE id = ?`, values);
    medMigrated++;
    console.log(`  ✅ Medical record ID ${row.id} (user ${row.user_id}) — encrypted: ${logParts.join(", ")}`);
  }

  console.log(`\n✅ Medical data migration complete. Migrated: ${medMigrated}, Skipped: ${medSkipped}`);

  await db.end();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
