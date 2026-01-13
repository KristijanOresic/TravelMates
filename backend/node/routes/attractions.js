import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import { requireAuth, requireEditor } from "../middleware/auth.js";
dotenv.config();

const router = express.Router();

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

// Dodavanje znamenitosti
router.post("/", requireAuth, requireEditor, async (req, res) => {
  const { name, description, location_lat, location_lng } = req.body;

  // Validacija
  if (!name || !description || location_lat === undefined || location_lng === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const lat = parseFloat(location_lat);
  const lng = parseFloat(location_lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO attractions (name, description, location_lat, location_lng) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, lat, lng]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Ažuriranje znamenitosti
router.put("/:id", requireAuth, requireEditor, async (req, res) => {
  const { name, description, location_lat, location_lng } = req.body;

  // Validacija
  if (!name || !description || location_lat === undefined || location_lng === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const lat = parseFloat(location_lat);
  const lng = parseFloat(location_lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  try {
    await pool.query(
      "UPDATE attractions SET name=$1, description=$2, location_lat=$3, location_lng=$4 WHERE id=$5",
      [name, description, lat, lng, req.params.id]
    );

    res.json({ message: "Updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Brisanje znamenitosti
router.delete("/:id", requireAuth, requireEditor, async (req, res) => {
  try {
    await pool.query("DELETE FROM attractions WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ===== FAVORITES ROUTES =====

// Dohvati sve favoruite korisnika
router.get("/favorites/list", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.idUser;
    const result = await pool.query(
      `SELECT a.* FROM attractions a
       INNER JOIN userFavorites uf ON a.id = uf.idAttraction
       WHERE uf.idUser = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Dodaj u favorite
router.post("/favorites", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.idUser;
    const { attraction_id } = req.body;

    if (!attraction_id) {
      return res.status(400).json({ error: "attraction_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO userFavorites (idUser, idAttraction)
       VALUES ($1, $2) RETURNING *`,
      [userId, attraction_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding favorite:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Ukloni iz favorita
router.delete("/favorites/:attraction_id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.idUser;
    const { attraction_id } = req.params;

    await pool.query(
      `DELETE FROM userFavorites WHERE idUser = $1 AND idAttraction = $2`,
      [userId, attraction_id]
    );

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;