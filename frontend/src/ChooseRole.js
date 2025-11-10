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
    <div className="chooseRole-container" style={{ textAlign: "center", marginTop: "100px" }}>
      <div className="logo-corner">
        <img src={`${process.env.PUBLIC_URL}/travelmateLogo.png`} alt="TravelMate Logo" />
      </div>
      <h1 className="registracija">Registracija / Prijava u TravelMate</h1>

      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Ime"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Prezime"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "8px" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          <input
            type="radio"
            name="role"
            value="user"
            checked={role === "user"}
            onChange={() => setRole("user")}
          />
          User
        </label>
        <label style={{ marginLeft: "20px" }}>
          <input
            type="radio"
            name="role"
            value="admin"
            checked={role === "admin"}
            onChange={() => setRole("admin")}
          />
          Admin
        </label>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={handleRegister} style={{ padding: "10px 20px", marginBottom: "10px" }}>
          Registriraj se
        </button>
      </div>

      <div>
        <button onClick={handleLogin} style={{ padding: "10px 20px" }}>
          Već imaš račun? Loginaj se
        </button>
      </div>
    </div>
  );
}
