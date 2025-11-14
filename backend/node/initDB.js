import fs from "fs";
import pg from "pg";

const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "TravelMate",
  password: "database",
  port: 5432,
});

async function initDB() {
  try {
    const sql = fs.readFileSync("./database.sql", "utf8");
    await pool.query(sql);
    console.log("Database initialized successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
}

initDB();