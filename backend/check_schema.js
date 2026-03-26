import { db } from "./server.js";

async function checkSchema() {
  const [medical] = await db.query("DESCRIBE medical_data");
  console.log("medical_data schema:", medical.map(c => `${c.Field} - ${c.Type}`));
  
  const [users] = await db.query("DESCRIBE users");
  console.log("users schema:", users.map(c => `${c.Field} - ${c.Type}`));
  
  process.exit(0);
}

checkSchema();
