import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ChooseRole.css";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/me`, { withCredentials: true });
        if (res.status === 200) {
          const user = res.data;
          if (user.role === "admin") {
            window.location.href = "/admin";
          } else if (user.role === "editor") {
            window.location.href = "/editor";
          } else {
            window.location.href = "/user";
          }
        }
      } catch (err) {
        // nije logiran
      }
    };
    checkLoggedIn();
  }, []);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("Molimo unesite ime, prezime i email!");
      return;
    }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Molimo unesite ispravan format email adrese!");
      return;
    }

    try {
      const check = await axios.post(
        `${BACKEND_URL}/check-email`,
        { email },
        { withCredentials: true }
      );
      if (check.data.exists) {
        alert("Ovaj email već postoji! Molimo prijavite se.");
        return;
      }

      // Svi novi korisnici = user
      const params = new URLSearchParams({ role: "user", firstName, lastName });
      window.location.href = `${BACKEND_URL}/auth/google?${params.toString()}`;
    } catch (err) {
      console.error(err);
      alert("Greška pri provjeri emaila!");
    }
  };

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  return (
    <>
      <div className="choose-role-header"></div>
      <div className="choose-role-main">
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

          <button className="sign-up-button" onClick={handleRegister}>
            REGISTRACIJA
          </button>
        </div>
      </div>
    </>
  );
}