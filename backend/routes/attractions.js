import express from "express";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// PostgreSQL pool
const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Ruta za dohvat svih znamenitosti
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM attractions");
    res.json(result.rows);
  } catch (err) {
    console.error("Greška kod dohvaćanja znamenitosti:", err);
    res.status(500).json({ error: "Greška na serveru" });
  }
});

export default router;
