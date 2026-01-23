import React, { useEffect, useState } from "react";
import "../styles/EditorPage.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

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
        const res = await fetch(`${BACKEND_URL}/me`, { credentials: "include" });
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
    if (!userData || !["editor", "admin"].includes(userData.role)) return;
    fetch(`${BACKEND_URL}/api/attractions`, { credentials: "include" })
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
    try {
      const res = await fetch(`${BACKEND_URL}/api/attractions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name, description, location_lat: lat, location_lng: lng,
          working_hours: openingHours, image_url: image
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Neuspjelo dodavanje znamenitosti!");
        return;
      }
      const newAttraction = await res.json();
      setAttractions([...attractions, newAttraction]);
      setName(""); setDescription(""); setLocationLat(""); setLocationLng("");
      setOpeningHours(""); setImage(""); setError("");
    } catch {
      setError("Neuspjelo dodavanje znamenitosti!");
    }
  };

  const updateAttraction = async (id, name, description, lat, lng, openingHours, image) => {
    try {
      await fetch(`${BACKEND_URL}/api/attractions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, location_lat: parseFloat(lat), location_lng: parseFloat(lng), working_hours: openingHours, image_url: image }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAttraction = async id => {
    if (!window.confirm("Obrisati znamenitost?")) return;
    await fetch(`${BACKEND_URL}/api/attractions/${id}`, { method: "DELETE", credentials: "include" });
    setAttractions(attractions.filter(a => a.idAttraction !== id));
  };

  const logout = async () => {
    await fetch(`${BACKEND_URL}/logout`, { credentials: "include" });
    window.location.href = "/";
  };

  if (loading) return <h2 className="center">Učitavanje...</h2>;
  if (!userData) return <h2 className="center">Niste prijavljeni</h2>;
  if (!["editor", "admin"].includes(userData.role)) return <h2 className="center">Pristup odbijen</h2>;

  return (
    <>
      <div className="editor-header"><h2>Uređivačka ploča</h2></div>
      <div className="editor-container">
        <div className="editor-info-section">
          <h1>Urednik</h1>
          <div className="editor-info">
            <p>Prijavljeni kao <b>{userData.firstName}</b> ({userData.email})</p>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="logout-btn" onClick={logout}>Odjava</button>
        </div>

        <div className="attractions-wrapper">
          <form onSubmit={addAttraction} className="add-form">
            <h2>Dodajte znamenitost</h2>
            <input placeholder="Naziv" value={name} onChange={e => setName(e.target.value)} />
            <textarea placeholder="Opis" value={description} onChange={e => setDescription(e.target.value)} />
            <input placeholder="Radno vrijeme" value={openingHours} onChange={e => setOpeningHours(e.target.value)} />
            <input placeholder="URL slike" value={image} onChange={e => setImage(e.target.value)} />
            <div className="coords">
              <input type="number" step="any" placeholder="Geografska širina" value={locationLat} onChange={e => setLocationLat(e.target.value)} />
              <input type="number" step="any" placeholder="Geografska dužina" value={locationLng} onChange={e => setLocationLng(e.target.value)} />
            </div>
            <button>Dodaj</button>
          </form>

          <div className="attractions-section">
            <h2>Znamenitosti ({attractions.length})</h2>
            <div className="attractions-list">
              {attractions.length === 0 ? (
                <p className="empty">Nema dodanih znamenitosti</p>
              ) : (
                attractions.map(a => (
                  <div key={a.idAttraction} className="attraction-card">
                    <input defaultValue={a.nameAttraction} onBlur={e => updateAttraction(a.idAttraction, e.target.value, a.descriptionAttraction, a.locationLat, a.locationLng, a.workingHours, a.imageUrl)} className="title-input" />
                    <textarea defaultValue={a.descriptionAttraction} onBlur={e => updateAttraction(a.idAttraction, a.nameAttraction, e.target.value, a.locationLat, a.locationLng, a.workingHours, a.imageUrl)} />
                    <input defaultValue={a.workingHours || ""} onBlur={e => updateAttraction(a.idAttraction, a.nameAttraction, a.descriptionAttraction, a.locationLat, a.locationLng, e.target.value, a.imageUrl)} className="extra-input" />
                    <input defaultValue={a.imageUrl || ""} onBlur={e => updateAttraction(a.idAttraction, a.nameAttraction, a.descriptionAttraction, a.locationLat, a.locationLng, a.workingHours, e.target.value)} className="extra-input" />
                    <div className="coords">
                      <input type="number" step="any" defaultValue={a.locationLat} onBlur={e => updateAttraction(a.idAttraction, a.nameAttraction, a.descriptionAttraction, e.target.value, a.locationLng, a.workingHours, a.imageUrl)} />
                      <input type="number" step="any" defaultValue={a.locationLng} onBlur={e => updateAttraction(a.idAttraction, a.nameAttraction, a.descriptionAttraction, a.locationLat, e.target.value, a.workingHours, a.imageUrl)} />
                    </div>
                    <div className="coords-text">📍 {a.locationLat}, {a.locationLng}</div>
                    <button className="delete-btn" onClick={() => deleteAttraction(a.idAttraction)}>Obriši</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
