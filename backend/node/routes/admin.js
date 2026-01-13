import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

dotenv.config();
const router = express.Router();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Dohvat svih korisnika
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query(
    "SELECT id, email, role, first_name, last_name FROM users"
  );
  res.json(result.rows);
});

// Promjena role
router.put("/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  await pool.query(
    "UPDATE users SET role=$1 WHERE id=$2",
    [role, id]
  );

  res.json({ message: "Role updated" });
});

// Brisanje korisnika
router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
  res.json({ message: "User deleted" });
});

export default router;
