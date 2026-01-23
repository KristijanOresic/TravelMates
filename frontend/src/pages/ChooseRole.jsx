import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ChooseRole.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const SECRET_PASSWORD = import.meta.env.VITE_SECRET_PASSWORD;

export default function ChooseRole() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      window.location.href = "/";
    };
    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/me`, { withCredentials: true });
        if (res.status === 200) {
          const user = res.data;
          if (user.role === "admin") window.location.href = "/admin";
          else if (user.role === "editor") window.location.href = "/editor";
          else window.location.href = "/";
        }
      } catch (err) {}
    };
    checkLoggedIn();
  }, [isUnlocked]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === SECRET_PASSWORD) {
      setIsUnlocked(true);
      setPassword("");
    } else {
      alert("Pogrešna lozinka!");
      setPassword("");
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("Molimo unesite ime, prezime i email!");
      return;
    }

    try {
      const check = await axios.post(`${BACKEND_URL}/check-email`, { email }, { withCredentials: true });
      if (check.data.exists) {
        alert("Ovaj email već postoji! Molimo prijavite se.");
        return;
      }
      const params = new URLSearchParams({ role, firstName, lastName });
      window.location.href = `${BACKEND_URL}/auth/google?${params.toString()}`;
    } catch (err) {
      console.error(err);
      alert("Greška pri provjeri emaila!");
    }
  };

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  if (!isUnlocked) {
    return (
      <div className="choose-role-main">
        <div className="sign-up-part">
          <div className="create-an-account">PRISTUP ZA ADMINA</div>
          <form onSubmit={handleUnlock} className="choose-role-inputs">
            <input
              type="password"
              placeholder="Admin Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="sign-up-button">OTKLJUČAJ</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`choose-role-main ${isUnlocked ? "unlocked" : ""}`}>
      <div className="sign-in-part">
        <div className="welcome-back">DOBRO DOŠLI NATRAG!</div>
        <button className="login-button" onClick={handleLogin}>PRIJAVA</button>
      </div>

      <div className="sign-up-part">
        <div className="create-an-account">IZRADITE RAČUN!</div>

        <div className="choose-role-inputs">
          <input type="text" placeholder="Ime" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input type="text" placeholder="Prezime" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="choose-role-radio">
          <label>
            <input type="radio" name="role" value="user" checked={role === "user"} onChange={() => setRole("user")} /> Korisnik
          </label>
          <label>
            <input type="radio" name="role" value="editor" checked={role === "editor"} onChange={() => setRole("editor")} /> Uređivač
          </label>
          <label>
            <input type="radio" name="role" value="admin" checked={role === "admin"} onChange={() => setRole("admin")} /> Administrator
          </label>
        </div>

        <button className="sign-up-button" onClick={handleRegister}>REGISTRACIJA</button>
      </div>
    </div>
  );
}
