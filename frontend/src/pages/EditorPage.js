import React, { useEffect, useState } from "react";
import "../styles/EditorPage.css";

export default function EditorPage() {
  const [userData, setUserData] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");

  // Dohvat trenutno prijavljenog korisnika
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("http://localhost:4000/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Not logged in");

        const data = await res.json();
        setUserData(data);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  // Dohvat znamenitosti
  useEffect(() => {
    if (!userData) return;
    if (!["editor", "admin"].includes(userData.role)) return;

    fetch("http://localhost:4000/api/attractions", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(setAttractions)
      .catch(err => console.error(err));
  }, [userData]);

  const addAttraction = async e => {
    e.preventDefault();

    if (!name || !description || !locationLat || !locationLng) {
      setError("All fields are required");
      return;
    }

    const lat = parseFloat(locationLat);
    const lng = parseFloat(locationLng);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Coordinates must be valid numbers");
      return;
    }

    if (lat < -90 || lat > 90) {
      setError("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      setError("Longitude must be between -180 and 180");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/attractions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          location_lat: lat,
          location_lng: lng,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Failed to add attraction");
        return;
      }

      const newAttraction = await res.json();
      setAttractions([...attractions, newAttraction]);
      setName("");
      setDescription("");
      setLocationLat("");
      setLocationLng("");
      setError("");
    } catch (err) {
      setError("Failed to add attraction");
    }
  };

  const updateAttraction = async (id, name, description, lat, lng) => {
    try {
      await fetch(`http://localhost:4000/api/attractions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          location_lat: parseFloat(lat),
          location_lng: parseFloat(lng),
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAttraction = async id => {
    if (!window.confirm("Delete attraction?")) return;

    await fetch(`http://localhost:4000/api/attractions/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setAttractions(attractions.filter(a => a.id !== id));
  };

  const logout = async () => {
    await fetch("http://localhost:4000/logout", {
      credentials: "include",
    });
    window.location.href = "/";
  };

  if (loading) return <h2 className="center">Loading...</h2>;
  if (!userData) return <h2 className="center">Not logged in</h2>;
  if (!["editor", "admin"].includes(userData.role))
    return <h2 className="center">Access denied</h2>;

  return (
    <div className="editor-container">
      <h1>Editor panel</h1>

      <p>
        Logged in as <b>{userData.firstName}</b> ({userData.role})
      </p>

      {error && <p className="error">{error}</p>}

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>

      <h2>Add attraction</h2>

      <form onSubmit={addAttraction} className="add-form">
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <div className="coords">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={locationLat}
            onChange={e => setLocationLat(e.target.value)}
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={locationLng}
            onChange={e => setLocationLng(e.target.value)}
          />
        </div>

        <button>Add</button>
      </form>

      <hr />

      <h2>Attractions ({attractions.length})</h2>

      <div className="attractions-list">
        {attractions.length === 0 ? (
          <p className="empty">No attractions yet</p>
        ) : (
          attractions.map(a => (
            <div key={a.id} className="attraction-card">
              <input
                defaultValue={a.name}
                onBlur={e =>
                  updateAttraction(a.id, e.target.value, a.description, a.location_lat, a.location_lng)
                }
                className="title-input"
              />

              <textarea
                defaultValue={a.description}
                onBlur={e =>
                  updateAttraction(a.id, a.name, e.target.value, a.location_lat, a.location_lng)
                }
              />

              <div className="coords">
                <input
                  type="number"
                  step="any"
                  defaultValue={a.location_lat}
                  onBlur={e =>
                    updateAttraction(a.id, a.name, a.description, e.target.value, a.location_lng)
                  }
                />
                <input
                  type="number"
                  step="any"
                  defaultValue={a.location_lng}
                  onBlur={e =>
                    updateAttraction(a.id, a.name, a.description, a.location_lat, e.target.value)
                  }
                />
              </div>

              <div className="coords-text">
                📍 {a.location_lat}, {a.location_lng}
              </div>

              <button
                className="delete-btn"
                onClick={() => deleteAttraction(a.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
