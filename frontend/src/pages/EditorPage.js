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
  const [workingHours, setWorkingHours] = useState("");
  const [imageUrl, setImageUrl] = useState("");

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

    if (!name || !description || !locationLat || !locationLng || !workingHours || !imageUrl) {
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
      setError("Geografska dužina mora biti između -180 i 180!");
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
          working_hours: workingHours,
          image_url: imageUrl,
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
      setWorkingHours("");
      setImageUrl("");
      setError("");
    } catch (err) {
      setError("Neuspjelo dodavanje znamenitosti!");
    }
  };

  const updateAttraction = async (attraction, field, value) => {
    const updatedData = {
      name: attraction.nameAttraction,
      description: attraction.descriptionAttraction,
      location_lat: attraction.locationLat,
      location_lng: attraction.locationLng,
      working_hours: attraction.workingHours,
      image_url: attraction.imageUrl,
      [field]: value // Override samo polje koje se mijenja
    };

    try {
      await fetch(`http://localhost:4000/api/attractions/${attraction.idAttraction}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });
      
      // Ažuriraj state
      setAttractions(attractions.map(a => 
        a.idAttraction === attraction.idAttraction 
          ? { ...a, [field === 'name' ? 'nameAttraction' : 
                      field === 'description' ? 'descriptionAttraction' :
                      field === 'location_lat' ? 'locationLat' :
                      field === 'location_lng' ? 'locationLng' :
                      field === 'working_hours' ? 'workingHours' :
                      field === 'image_url' ? 'imageUrl' :
                      field]: value }
          : a
      ));
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

    setAttractions(attractions.filter(a => a.idAttraction !== id));
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
          placeholder="Naziv *"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <textarea
          placeholder="Opis *"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />

        <div className="coords">
          <input
            type="number"
            step="any"
            placeholder="Geografska širina *"
            value={locationLat}
            onChange={e => setLocationLat(e.target.value)}
          />
          <input
            type="number"
            step="any"
            placeholder="Geografska dužina *"
            value={locationLng}
            onChange={e => setLocationLng(e.target.value)}
          />
        </div>

        <input
          placeholder="Radno vrijeme *"
          value={workingHours}
          onChange={e => setWorkingHours(e.target.value)}
        />

        <input
          placeholder="URL slike *"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
        />

        <button>Dodaj</button>
      </form>

      <hr />

      <h2>Znamenitosti ({attractions.length})</h2>

      <div className="attractions-list">
        {attractions.length === 0 ? (
          <p className="empty">Nema dodanih znamenitosti</p>
        ) : (
          attractions.map(a => (
            <div key={a.idAttraction} className="attraction-card">
              <input
                defaultValue={a.nameAttraction}
                onBlur={e => updateAttraction(a, 'name', e.target.value)}
                className="title-input"
              />

              <textarea
                defaultValue={a.descriptionAttraction}
                onBlur={e => updateAttraction(a, 'description', e.target.value)}
                rows={3}
                style={{ resize: 'vertical', width: '98%' }}
              />

              <div className="coords">
                <input
                  type="number"
                  step="any"
                  defaultValue={a.locationLat}
                  onBlur={e => updateAttraction(a, 'location_lat', parseFloat(e.target.value))}
                />
                <input
                  type="number"
                  step="any"
                  defaultValue={a.locationLng}
                  onBlur={e => updateAttraction(a, 'location_lng', parseFloat(e.target.value))}
                />
              </div>

              <input
                placeholder="Radno vrijeme"
                defaultValue={a.workingHours || ""}
                onBlur={e => updateAttraction(a, 'working_hours', e.target.value)}
                className="extra-input"
              />

              <input
                placeholder="URL slike"
                defaultValue={a.imageUrl || ""}
                onBlur={e => updateAttraction(a, 'image_url', e.target.value)}
                className="extra-input"
              />

              <div className="coords-text">
                📍 {a.locationLat}, {a.locationLng}
              </div>

              <button
                className="delete-btn"
                onClick={() => deleteAttraction(a.idAttraction)}
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