import React, { useEffect, useState } from "react";
import "../styles/AdminPage.css";

export default function AdminPage() {
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dohvat trenutno prijavljenog korisnika
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("http://localhost:4000/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Nije autentificiran");

        const data = await res.json();
        setUserData(data);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  // Dohvat svih korisnika (samo admin)
  useEffect(() => {
    if (userData?.role !== "admin") return;

    fetch("http://localhost:4000/api/admin/users", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(setUsers)
  }, [userData]);

  const changeRole = async (id, role) => {
    await fetch(`http://localhost:4000/api/admin/users/${id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });

    setUsers(users =>
      users.map(u => (u.idUser === id ? { ...u, role } : u))
    );
  };

  const deleteUser = async id => {
    if (!window.confirm("Jeste li sigurni da želite obrisati korisnika?")) return;

    await fetch(`http://localhost:4000/api/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setUsers(users => users.filter(u => u.idUser !== id));
  };

  const logout = async () => {
    await fetch("http://localhost:4000/logout", {
      credentials: "include",
    });
    window.location.href = "/";
  };

  if (loading) {
    return <div className="loading"><h2>Učitavanje...</h2></div>;
  }

  if (!userData) {
    return <div className="not-logged"><h2>Niste prijavljeni</h2></div>;
  }

  if (userData.role !== "admin") {
    return <div className="access-denied"><h2>Pristup odbijen</h2></div>;
  }

  return (
    <div className="admin-container">
      <h1>Administratorska ploča</h1>

      <div className="admin-info">
        <p>
          Prijavljeni kao <b>{userData.firstName}</b> ({userData.email})
        </p>
      </div>

      <button onClick={logout} className="logout-btn">
        Odjava
      </button>

      <h2>Korisnici</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Ime</th>
            <th>Uloga</th>
            <th>Akcije</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.idUser}>
              <td>{u.email}</td>
              <td>
                {u.firstName} {u.lastName}
              </td>
              <td>
                <select
                  value={u.role}
                  onChange={e => changeRole(u.idUser, e.target.value)}
                >
                  <option value="user">Korisnik</option>
                  <option value="editor">Uređivač</option>
                  <option value="admin">Administrator</option>
                </select>
              </td>
              <td>
                <button onClick={() => deleteUser(u.idUser)} className="delete-btn">Obriši</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}