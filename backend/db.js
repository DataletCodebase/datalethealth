import mysql from "mysql2/promise";

export const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "your_db_name",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
