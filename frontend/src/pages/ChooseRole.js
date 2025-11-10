import React, { useState } from "react";
import axios from "axios";
import "../styles/ChooseRole.css";

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
      const check = await axios.post("http://localhost:4000/check-email", { email },
  { withCredentials: true });
      if (check.data.exists) {
        alert("Ovaj email već postoji! Molimo loginaj se.");
        return;
      }

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
    <div className="choose-role-main">

      <div className="sign-in-part">


          <div className="welcome-back">WELCOME BACK!</div>
    
          <button className="login-button" onClick={handleLogin}>
           SIGN IN.
          </button>
      </div>

      <div className="sign-up-part">
          <div className="create-an-account">CREATE AN ACCOUNT!</div>

        <div className="choose-role-inputs">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
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
            User
          </label>
          <label>
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

          <button className="sign-up-button" onClick={handleRegister}>
            SIGN UP.
          </button>

      </div>
      
    </div>
  );
}