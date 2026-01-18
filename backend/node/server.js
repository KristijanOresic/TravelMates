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

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,    
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});


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
app.use("/api/attractions", attractionsRouter);
app.use("/api/admin", adminRouter);


passport.serializeUser((user, done) => {
  console.log("Serialize user:", user);
  const userId = user.idUser || user.id;
  console.log("User ID:", userId);
  done(null, userId);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE "idUser"=$1', [id]);
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

        const existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        let user;

        if (existing.rows.length > 0) {
           user = existing.rows[0];
           console.log("Existing user from DB:", user);
        } else {
           const insert = await pool.query(
           `INSERT INTO users (email, "firstName", "lastName", role)
            VALUES ($1, $2, $3, $4) RETURNING *`,
           [email, firstName, lastName, newRole]
           );
            user = insert.rows[0];
            console.log("New user from DB:", user);
          }

        done(null, user);
      } catch (err) {
        console.error("GoogleStrategy error:", err);
        done(err, null);
      }
    }
  )
);

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


app.get("/auth/google", (req, res, next) => {
  const role = req.query.role || "user";
  const firstName = req.query.firstName || "";
  const lastName = req.query.lastName || "";

  req.session.role = role;
  req.session.firstName = firstName;
  req.session.lastName = lastName;

  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});


app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login/failed" }),
  (req, res) => {
    const userId = req.user.idUser || req.user.id;
    const token = jwt.sign(
      { id: userId, email: req.user.email, role: req.user.role },
      SESSION_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      maxAge: 60 * 60 * 1000,
    });

    res.redirect("http://localhost:3000/login-success");
  }
);

app.get("/login/failed", (req, res) => res.status(401).send("Login failed"));

app.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const user = jwt.verify(token, SESSION_SECRET);

    pool.query('SELECT "idUser", email, role, "firstName", "lastName" FROM users WHERE "idUser"=$1', [user.id])
      .then(result => {
        if (result.rows.length > 0) {
          res.json({
            id: result.rows[0].idUser,
            email: result.rows[0].email,
            role: result.rows[0].role,
            firstName: result.rows[0].firstName,
            lastName: result.rows[0].lastName
          });
        } else {
          res.status(404).json({ error: "User not found" });
        }
      })
      .catch(err => {
        console.error("Database error in /me:", err);
        res.status(500).json({ error: "Database error" });
      });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});


app.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.session.destroy(() => {
    res.json({ message: "Logged out" }); 
  });
});

app.listen(4000, () => console.log(" Server running on http://localhost:4000"));