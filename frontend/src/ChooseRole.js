import React, { useState } from "react";
import axios from "axios";
import "./ChooseRole.css";

export default function ChooseRole() {
  const [role, setRole] = useState("user");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("Molimo unesite ime, prezime i email!");
      return;
    }

    try {
      // Provjera emaila
      const check = await axios.post("http://localhost:4000/check-email", { email });
      if (check.data.exists) {
        alert("Ovaj email već postoji! Molimo loginaj se.");
        return;
      }

      // Ako ne postoji, ide se na Google OAuth registraciju
      const params = new URLSearchParams({ role, firstName, lastName });
      window.location.href = `http://localhost:4000/auth/google?${params.toString()}`;
    } catch (err) {
      console.error(err);
      alert("Greška pri provjeri emaila");
    }
  };

  const handleLogin = () => {
    window.location.href = `http://localhost:4000/auth/google`;
  };

  return (
    <div className="chooseRole-page">
      <div className="logo-corner">
        <img src={`${process.env.PUBLIC_URL}/travelmateLogo.png`} alt="TravelMate Logo" />
      </div>

      <div className="chooseRole-container">
        <h1 className="registracija">Registracija u aplikaciju TravelMate</h1>
        
        <div className="input-group">
          <input
            type="text"
            placeholder="Ime"
            className="input-field"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Prezime"
            className="input-field"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="radio-group">
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
          <label style={{ marginLeft: "20px" }}>
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

        <div>
          <button className="action-button" onClick={handleRegister}>
            Registriraj se
          </button>
      
          <button className="action-button" onClick={handleLogin}>
            Već imaš račun? Prijavi se
          </button>
        </div>
      </div>
    </div>
  );
}
