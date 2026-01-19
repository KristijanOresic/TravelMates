import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ChooseRole.css";

export default function ChooseRole() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("user");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const SECRET_PASSWORD = "travelmate2025";

  useEffect(() => {
    // Ova funkcija se okida kada korisnik klikne Back u pregledniku
    const handleBackButton = (event) => {
      event.preventDefault();
      window.location.href = "/"; // Prisilni povratak na početnu
    };

    // Dodajemo "slušalicu" na promjenu povijesti preglednika
    window.addEventListener("popstate", handleBackButton);

    return () => {
      // Čistimo slušalicu kada odemo s ove stranice
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;

    const checkLoggedIn = async () => {
      try {
        const res = await axios.get("http://localhost:4000/me", {
          withCredentials: true,
        });

        if (res.status === 200) {
          const user = res.data;
          if (user.role === "admin") {
            window.location.href = "/admin";
          } else if (user.role === "editor") {
            window.location.href = "/editor";
          } else {
            window.location.href = "/";
          }
        }
      } catch (err) {
        // nije logiran
      }
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

  // PASSWORD SCREEN
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
            <button type="submit" className="sign-up-button">
              OTKLJUČAJ
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("Molimo unesite ime, prezime i email!");
      return;
    }

    try {
      const check = await axios.post(
        "http://localhost:4000/check-email",
        { email },
        { withCredentials: true }
      );

      if (check.data.exists) {
        alert("Ovaj email već postoji! Molimo prijavite se.");
        return;
      }

      const params = new URLSearchParams({ role, firstName, lastName });
      window.location.href = `http://localhost:4000/auth/google?${params.toString()}`;
    } catch (err) {
      console.error(err);
      alert("Greška pri provjeri emaila!");
    }
  };

  const handleLogin = () => {
    window.location.href = `http://localhost:4000/auth/google`;
  };

  return (
    <div className={`choose-role-main ${isUnlocked ? "unlocked" : ""}`}>
      <div className="sign-in-part">
        <div className="welcome-back">DOBRO DOŠLI NATRAG!</div>
        <button className="login-button" onClick={handleLogin}>
          PRIJAVA
        </button>
      </div>

      <div className="sign-up-part">
        <div className="create-an-account">IZRADITE RAČUN!</div>

        <div className="choose-role-inputs">
          <input
            type="text"
            placeholder="Ime"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Prezime"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="choose-role-radio">
          <label>
            <input
              type="radio"
              name="role"
              value="user"
              checked={role === "user"}
              onChange={() => setRole("user")}
            />
            Korisnik
          </label>

          <label>
            <input
              type="radio"
              name="role"
              value="editor"
              checked={role === "editor"}
              onChange={() => setRole("editor")}
            />
            Uređivač
          </label>

          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={() => setRole("admin")}
            />
            Administrator
          </label>
        </div>

        <button className="sign-up-button" onClick={handleRegister}>
          REGISTRACIJA
        </button>
      </div>
    </div>
  );
}