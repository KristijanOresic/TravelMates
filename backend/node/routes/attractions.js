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
  const { 
    name, 
    description, 
    location_lat, 
    location_lng,
    working_hours,
    website,
    price_info,
    image_url,
    historical_info,
    interesting_facts
  } = req.body;

  // Validacija
  if (!name || !description || location_lat === undefined || location_lng === undefined) {
    return res.status(400).json({ error: "Name, description and coordinates are required" });
  }

  const lat = parseFloat(location_lat);
  const lng = parseFloat(location_lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO attractions 
       ("nameAttraction", "descriptionAttraction", "locationLat", "locationLng", "workingHours", website, "priceInfo", "imageUrl", "historicalInfo", "interestingFacts") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [name, description, lat, lng, working_hours, website, price_info, image_url, historical_info, interesting_facts]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Ažuriranje znamenitosti
router.put("/:id", requireAuth, requireEditor, async (req, res) => {
  const { 
    name, 
    description, 
    location_lat, 
    location_lng,
    working_hours,
    website,
    price_info,
    image_url,
    historical_info,
    interesting_facts
  } = req.body;

  // Validacija
  if (!name || !description || location_lat === undefined || location_lng === undefined) {
    return res.status(400).json({ error: "Name, description and coordinates are required" });
  }

  const lat = parseFloat(location_lat);
  const lng = parseFloat(location_lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  try {
    await pool.query(
      `UPDATE attractions 
       SET "nameAttraction"=$1, "descriptionAttraction"=$2, "locationLat"=$3, "locationLng"=$4, 
           "workingHours"=$5, website=$6, "priceInfo"=$7, "imageUrl"=$8, "historicalInfo"=$9, "interestingFacts"=$10 
       WHERE "idAttraction"=$11`,
      [name, description, lat, lng, working_hours, website, price_info, image_url, historical_info, interesting_facts, req.params.id]
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
    await pool.query('DELETE FROM attractions WHERE "idAttraction"=$1', [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Dodaj u favorite
router.post("/favorites", requireAuth, async (req, res) => {
  const { attraction_id } = req.body;
  const userId = req.user.id;

  try {
    // Provjeri postoji li već
    const existing = await pool.query(
      'SELECT * FROM "userFavorites" WHERE "idUser"=$1 AND "idAttraction"=$2',
      [userId, attraction_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Already in favorites" });
    }

    await pool.query(
      'INSERT INTO "userFavorites" ("idUser", "idAttraction") VALUES ($1, $2)',
      [userId, attraction_id]
    );

    res.json({ message: "Added to favorites" });
  } catch (err) {
    console.error("Add favorite error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Ukloni iz favorita
router.delete("/favorites/:attractionId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { attractionId } = req.params;

  try {
    await pool.query(
      'DELETE FROM "userFavorites" WHERE "idUser"=$1 AND "idAttraction"=$2',
      [userId, attractionId]
    );

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Remove favorite error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Dohvati favorite korisnika
router.get("/favorites/list", requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT a.* FROM attractions a 
       INNER JOIN "userFavorites" f ON a."idAttraction" = f."idAttraction" 
       WHERE f."idUser" = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get favorites error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;