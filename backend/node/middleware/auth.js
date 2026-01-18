import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SESSION_SECRET = process.env.SESSION_SECRET || "tajna";

export function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    req.user = decoded; // { id, email, role } - 'id' je zapravo idUser iz JWT-a
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

export function requireEditor(req, res, next) {
  if (req.user.role !== "editor" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Editor only" });
  }
  next();
}