import React, { useEffect, useState } from "react";

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
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  if (!userData) {
    return <h2 style={{ textAlign: "center" }}>Not logged in</h2>;
  }

  if (userData.role !== "admin") {
    return <h2 style={{ textAlign: "center" }}>Access denied</h2>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "50px auto" }}>
      <h1>Admin panel</h1>

      <p>
        Logged in as <b>{userData.firstName}</b> ({userData.email})
      </p>

      <button onClick={logout} style={{ marginBottom: "20px" }}>
        Logout
      </button>

      <h2>Users</h2>

      <table width="100%" border="1" cellPadding="8">
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
                <button onClick={() => deleteUser(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
