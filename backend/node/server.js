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
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SESSION_SECRET = process.env.SESSION_SECRET || "tajna";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/auth/google/callback";
const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1); // Render proxy

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api/attractions", attractionsRouter);
app.use("/api/admin", adminRouter);

passport.serializeUser((user, done) => {
  done(null, user.idUser);
});

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
        const email = profile.emails[0].value;

        const existing = await pool.query(
          "SELECT * FROM users WHERE email=$1",
          [email]
        );

        if (existing.rows.length > 0) {
          // LOGIN – USER EXISTS
          return done(null, existing.rows[0]);
        }

        // USER DOES NOT EXIST
        const isRegistration =
          req.session.role &&
          req.session.firstName &&
          req.session.lastName;

        if (!isRegistration) {
          // LOGIN ATTEMPT FOR NON-EXISTENT USER
          return done(null, false);
        }

        // REGISTRATION
        const insert = await pool.query(
          `INSERT INTO users (email, "firstName", "lastName", role)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [
            email,
            req.session.firstName,
            req.session.lastName,
            req.session.role,
          ]
        );

        return done(null, insert.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

app.post("/check-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email je obavezan" });

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  res.json({ exists: result.rows.length > 0 });
});

app.get("/auth/google", (req, res, next) => {
  const { role = "user", firstName = "", lastName = "", from } = req.query;

  req.session.role = role;
  req.session.firstName = firstName;
  req.session.lastName = lastName;

  if (from === "secret-admin-register") {
    req.session.returnTo = `${FRONTEND_URL}/secret-admin-register`;
  } else {
    req.session.returnTo = `${FRONTEND_URL}/`;
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failed",
  }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.idUser,
        email: req.user.email,
        role: req.user.role,
      },
      SESSION_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,          // true na Renderu
      sameSite: isProduction ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });


    res.redirect(`${FRONTEND_URL}/login-success`);
  }
);

app.get("/login/failed", (req, res) => {
  const redirectTo =
    req.session.returnTo || `${FRONTEND_URL}/`;

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <script>
          alert("Korisnik s ovim emailom ne postoji u sustavu. Molimo registrirajte se prvo.");
          window.location.href = "${redirectTo}";
        </script>
      </head>
      <body></body>
    </html>
  `);
});

app.get("/me", async (req, res) => {
  res.set("Cache-Control", "no-store"); // sprječava 304
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    const result = await pool.query(
      'SELECT "idUser", email, role, "firstName", "lastName" FROM users WHERE "idUser"=$1',
      [decoded.id]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});


app.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
