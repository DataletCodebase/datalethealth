import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("ADMIN_JWT_SECRET:", process.env.ADMIN_JWT_SECRET);