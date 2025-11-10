import React from "react";

export default function UserPage() {
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:4000/logout", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        alert("Logout failed");
      }
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške prilikom odjave");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>User Page</h1>
      <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px 20px" }}>
        Logout
      </button>

      <a href="/map">MAP</a>
    </div>
  );
}
