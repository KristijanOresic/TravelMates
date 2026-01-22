import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

dotenv.config();
const router = express.Router();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Dohvat svih korisnika
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query(
    'SELECT "idUser", email, role, "firstName", "lastName" FROM users'
  );
  res.json(result.rows);
});

// Promjena role
router.put("/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  await pool.query(
    'UPDATE users SET role=$1 WHERE "idUser"=$2',
    [role, id]
  );

  res.json({ message: "Role updated" });
});

// Brisanje korisnika
router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM users WHERE "idUser"=$1', [req.params.id]);
  res.json({ message: "User deleted" });
});

export default router;