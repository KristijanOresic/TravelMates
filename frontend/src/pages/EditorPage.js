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
  const [openingHours, setOpeningHours] = useState("");
  const [image, setImage] = useState("");

  // Dohvat trenutno prijavljenog korisnika
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("http://localhost:4000/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Niste prijavljeni!");

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

    if (!name || !description || !locationLat || !locationLng || !openingHours || !image) {
      setError("Sva polja su obavezna!");
      return;
    }

    const lat = parseFloat(locationLat);
    const lng = parseFloat(locationLng);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Koordinate moraju biti valjani brojevi!");
      return;
    }

    if (lat < -90 || lat > 90) {
      setError("Geografska širina mora biti između -90 i 90!");
      return;
    }

    if (lng < -180 || lng > 180) {
      setError("Geografska širina mora biti između -180 i 180!");
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
          opening_hours: openingHours,
          image,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Neuspjelo dodavanje znamenitosti!");
        return;
      }

      const newAttraction = await res.json();
      setAttractions([...attractions, newAttraction]);
      setName("");
      setDescription("");
      setLocationLat("");
      setLocationLng("");
      setOpeningHours("");
      setImage("");
      setError("");
    } catch (err) {
      setError("Neuspjelo dodavanje znamenitosti!");
    }
  };

  const updateAttraction = async (id, name, description, lat, lng, openingHours, image) => {
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
          opening_hours: openingHours,
          image,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAttraction = async id => {
    if (!window.confirm("Obrisati znamenitost?")) return;

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

  if (loading) return <h2 className="center">Učitavanje...</h2>;
  if (!userData) return <h2 className="center">Niste prijavljeni</h2>;
  if (!["editor", "admin"].includes(userData.role))
    return <h2 className="center">Pristup odbijen</h2>;

  return (
    <div className="editor-container">
      <h1>Uređivačka ploča</h1>

      <p>
        Prijavljeni kao <b>{userData.firstName}</b> ({userData.role})
      </p>

      {error && <p className="error">{error}</p>}

      <button className="logout-btn" onClick={logout}>
        Odjava
      </button>

      <h2>Dodajte znamenitost</h2>

      <form onSubmit={addAttraction} className="add-form">
        <input
          placeholder="Naziv"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <textarea
          placeholder="Opis"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          placeholder="Radno vrijeme"
          value={openingHours}
          onChange={e => setOpeningHours(e.target.value)}
        />

        <input
          placeholder="URL slike"
          value={image}
          onChange={e => setImage(e.target.value)}
        />

        <div className="coords">
          <input
            type="number"
            step="any"
            placeholder="Geografska širina"
            value={locationLat}
            onChange={e => setLocationLat(e.target.value)}
          />
          <input
            type="number"
            step="any"
            placeholder="Geografska dužina"
            value={locationLng}
            onChange={e => setLocationLng(e.target.value)}
          />
        </div>

        <button>Dodaj</button>
      </form>

      <hr />

      <h2>Znamenitosti ({attractions.length})</h2>

      <div className="attractions-list">
        {attractions.length === 0 ? (
          <p className="empty">Nema dodanih znamenitosti</p>
        ) : (
          attractions.map(a => (
            <div key={a.id} className="attraction-card">
              <input
                defaultValue={a.name}
                onBlur={e =>
                  updateAttraction(a.id, e.target.value, a.description, a.location_lat, a.location_lng, a.opening_hours, a.image)
                }
                className="title-input"
              />

              <textarea
                defaultValue={a.description}
                onBlur={e =>
                  updateAttraction(a.id, a.name, e.target.value, a.location_lat, a.location_lng, a.opening_hours, a.image)
                }
              />

              <input
                defaultValue={a.opening_hours || ""}
                onBlur={e =>
                  updateAttraction(a.id, a.name, a.description, a.location_lat, a.location_lng, e.target.value, a.image)
                }
                className="extra-input"
              />

              <input
                defaultValue={a.image || ""}
                onBlur={e =>
                  updateAttraction(a.id, a.name, a.description, a.location_lat, a.location_lng, a.opening_hours, e.target.value)
                }
                className="extra-input"
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
                Obriši
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
