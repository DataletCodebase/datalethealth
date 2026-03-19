import mysql from "mysql2/promise";

export const db = await mysql.createPool({
  host: "localhost",
  user: "datalet",
  password: "Datalet123!",
  database: "datalethealth",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
