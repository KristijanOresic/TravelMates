import express from "express";
import jwt from "jsonwebtoken";
import pg from "pg";

const router = express.Router();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

const SESSION_SECRET = process.env.SESSION_SECRET || "tajna";

// middleware za autentikaciju
function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    req.user = jwt.verify(token, SESSION_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ➕ dodaj u favorite
router.post("/", auth, async (req, res) => {
  const { attractionId } = req.body;

  if (!attractionId) {
    return res.status(400).json({ error: "Missing attractionId" });
  }

  try {
    await pool.query(
      `INSERT INTO user_favorites (user_id, attraction_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.user.id, attractionId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📥 dohvati favorite
router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*
       FROM user_favorites f
       JOIN attractions a ON a.id = f.attraction_id
       WHERE f.user_id = $1`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// ❌ ukloni iz favorita
router.delete("/:id", auth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM user_favorites WHERE user_id=$1 AND attraction_id=$2",
      [req.user.id, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
