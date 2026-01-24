import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pg from "pg";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import attractionsRouter from "./routes/attractions.js";
import adminRouter from "./routes/admin.js";

const app = express();

// --- POOL ---
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL, // koristi globalnu bazu Render
  ssl: { rejectUnauthorized: false }, // Render self-signed cert
});

// --- VARIJABLE ---
const SESSION_SECRET = process.env.SESSION_SECRET || "tajna";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/auth/google/callback";
const isProd = process.env.NODE_ENV === "production";


// --- MIDDLEWARE ---
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.set('trust proxy', 1); // bitno za Render/HTTPS
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: isProd,              // HTTPS only
      sameSite: isProd ? "none" : "lax", 
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/attractions", attractionsRouter);
app.use("/api/admin", adminRouter);

// --- PASSPORT ---
passport.serializeUser((user, done) => done(null, user.idUser));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE "idUser"=$1',
      [id]
    );
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("SESSION BEFORE STRATEGY:", req.session);
        console.log("PROFILE EMAIL:", profile.emails[0].value);
        const email = profile.emails[0].value;
        const existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

        if (existing.rows.length > 0) return done(null, existing.rows[0]);

        const isRegistration = req.session.role && req.session.firstName && req.session.lastName;
        if (!isRegistration) return done(null, false);

        const insert = await pool.query(
          `INSERT INTO users (email, "firstName", "lastName", role)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [email, req.session.firstName, req.session.lastName, req.session.role]
        );

        return done(null, insert.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// --- AUTH ROUTES ---
app.post("/check-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email je obavezan" });

  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  res.json({ exists: result.rows.length > 0 });
});

app.get("/auth/google", (req, res, next) => {
  const { role = "user", firstName = "", lastName = "", from } = req.query;
  req.session.role = role;
  req.session.firstName = firstName;
  req.session.lastName = lastName;

  req.session.returnTo = from === "secret-admin-register"
    ? `${FRONTEND_URL}/secret-admin-register`
    : FRONTEND_URL;

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })(req, res, next);
});

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login/failed" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.idUser, email: req.user.email, role: req.user.role },
      SESSION_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 3600 * 1000
    });

    res.redirect(`${FRONTEND_URL}/login-success`);
  }
);

app.get("/login/failed", (req, res) => {
  const redirectTo = req.session.returnTo || FRONTEND_URL;
  res.send(`<script>alert("Korisnik ne postoji. Registrirajte se."); window.location.href="${redirectTo}";</script>`);
});

app.get("/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not logged in" });
  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    const result = await pool.query(
      'SELECT "idUser", email, role, "firstName", "lastName" FROM users WHERE "idUser"=$1',
      [decoded.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
      });

      res.clearCookie("connect.sid", {
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
      });

      res.json({ message: "Logged out" });
    });
  });
});


// --- SERVER LISTEN ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { app, pool };
