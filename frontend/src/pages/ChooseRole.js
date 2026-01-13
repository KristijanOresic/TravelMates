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
      alert("Wrong password!");
      setPassword("");
    }
  };

  // PASSWORD SCREEN
  if (!isUnlocked) {
    return (
      <div className="choose-role-main">
        <div className="sign-up-part">
          <div className="create-an-account">ADMIN ACCESS</div>

          <form onSubmit={handleUnlock} className="choose-role-inputs">
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="sign-up-button">
              UNLOCK
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
          LOG IN
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
              value="editor"
              checked={role === "editor"}
              onChange={() => setRole("editor")}
            />
            Editor
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
          SIGN UP
        </button>
      </div>
    </div>
  );
}