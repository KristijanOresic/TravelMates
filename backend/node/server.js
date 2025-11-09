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

const app = express();

// PostgreSQL pool
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "TravelMate",
  password: "database",
  port: 5432,
});

// Konstante
const SESSION_SECRET = process.env.SESSION_SECRET || "tajna";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth strategija
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const newRole = req.session.role || "user";
        const firstName = req.session.firstName || profile.name?.givenName || "";
        const lastName = req.session.lastName || profile.name?.familyName || "";

        // provjera postoji li korisnik
        const existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        let user;

        if (existing.rows.length > 0) {
           // Postojeći korisnik - zadrži postojeću rolu
           user = existing.rows[0];
        } else {
           // Novi korisnik - koristi rolu iz forme/sessiona
           const insert = await pool.query(
           `INSERT INTO users (email, first_name, last_name, oauth_provider, oauth_id, role)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
           [email, firstName, lastName, "google", profile.id, newRole]
           );
            user = insert.rows[0];
          }


        done(null, user);
      } catch (err) {
        console.error("GoogleStrategy error:", err);
        done(err, null);
      }
    }
  )
);
// Provjera postoji li email
app.post("/check-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email je obavezan" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška na serveru" });
  }
});



// Ruta koja sprema ime, prezime i rolu u session prije redirecta na Google login
app.get("/auth/google", (req, res, next) => {
  const role = req.query.role || "user";
  const firstName = req.query.firstName || "";
  const lastName = req.query.lastName || "";

  req.session.role = role;
  req.session.firstName = firstName;
  req.session.lastName = lastName;

  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

// Callback ruta nakon uspješne prijave
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login/failed" }),
  (req, res) => {
    // Kreiraj JWT
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      SESSION_SECRET,
      { expiresIn: "1h" }
    );

    // Postavi cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      maxAge: 60 * 60 * 1000,
    });

    res.redirect("http://localhost:3000/login-success");
  }
);

app.get("/login/failed", (req, res) => res.status(401).send("Login failed"));

// Ruta koja vraća trenutnog korisnika
app.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const user = jwt.verify(token, SESSION_SECRET);
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});


app.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.session.destroy(() => {
    res.json({ message: "Logged out" }); // samo šaljemo JSON
  });
});



app.listen(4000, () => console.log(" Server running on http://localhost:4000"));