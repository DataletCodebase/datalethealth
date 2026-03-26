import { db } from "./server.js";
import { encrypt, decrypt, encryptDeterministic, decryptDeterministic } from "./utils/encryption.js";

async function runTest() {
  const [rows] = await db.query("SELECT id, full_name, email FROM users ORDER BY id DESC LIMIT 1");
  if (!rows[0]) {
    console.log("No users.");
    process.exit(0);
  }
  const u = rows[0];
  console.log("Raw from DB: full_name =", u.full_name);
  console.log("Raw from DB: email =", u.email);
  const decName = decrypt(u.full_name);
  const decEmail = decryptDeterministic(u.email);
  console.log("Decrypted full_name:", decName);
  console.log("Decrypted email:", decEmail);
  process.exit(0);
}

runTest();
