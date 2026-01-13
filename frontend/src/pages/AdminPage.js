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

        if (!res.ok) throw new Error("Not authenticated");

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
      users.map(u => (u.id === id ? { ...u, role } : u))
    );
  };

  const deleteUser = async id => {
    if (!window.confirm("Are you sure?")) return;

    await fetch(`http://localhost:4000/api/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setUsers(users => users.filter(u => u.id !== id));
  };

  const logout = async () => {
    await fetch("http://localhost:4000/logout", {
      credentials: "include",
    });
    window.location.href = "/";
  };

  if (loading) {
    return <div className="loading"><h2>Loading...</h2></div>;
  }

  if (!userData) {
    return <div className="not-logged"><h2>Not logged in</h2></div>;
  }

  if (userData.role !== "admin") {
    return <div className="access-denied"><h2>Access denied</h2></div>;
  }

  return (
    <div className="admin-container">
      <h1>Admin panel</h1>

      <div className="admin-info">
        <p>
          Logged in as <b>{userData.firstName}</b> ({userData.email})
        </p>
      </div>

      <button onClick={logout} className="logout-btn">
        Logout
      </button>

      <h2>Users</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>
                {u.first_name} {u.last_name}
              </td>
              <td>
                <select
                  value={u.role}
                  onChange={e => changeRole(u.id, e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="editor">editor</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>
                <button onClick={() => deleteUser(u.id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
