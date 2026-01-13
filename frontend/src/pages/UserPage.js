import React, { useEffect, useState } from "react";
import "../styles/UserPage.css";

export default function UserPage() {
  const [userData, setUserData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // === USER DATA ===
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:4000/me", {
          credentials: "include",
        });
        if (res.ok) {
          setUserData(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  // === FAVORITES ===
  const fetchFavorites = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/favorites", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Fetch favorites error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // === REMOVE FAVORITE ===
  const removeFavorite = async (id) => {
    await fetch(`http://localhost:4000/api/favorites/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const handleLogout = async () => {
    await fetch("http://localhost:4000/logout", {
      credentials: "include",
    });
    window.location.href = "/";
  };

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="user-page">
      {/* ===== PROFILE ===== */}
      <div className="profile-container">
        <div className="profile-header">
          <h1>{userData?.firstName} {userData?.lastName}</h1>
          <span className="role-badge">{userData?.role}</span>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <label>Email</label>
            <p>{userData?.email}</p>
          </div>

          <div className="info-item">
            <label>Uloga</label>
            <p>{userData?.role}</p>
          </div>
        </div>

        <a href="/map" className="map-link">Otvori kartu</a>

        <button onClick={handleLogout} className="logout-btn">
          Odjava
        </button>
      </div>

      {/* ===== FAVORITES ===== */}
      <div className="favorites-container">
        <h2>Moji omiljeni lokaliteti</h2>

        {favorites.length === 0 ? (
          <p className="no-favorites">
            Nemate omiljenih lokaliteta. Dodajte ih na mapi ❤️
          </p>
        ) : (
          <div className="favorites-grid">
            {favorites.map(f => (
              <div key={f.id} className="favorite-card">
                <h3>{f.name}</h3>
                <p>{f.description}</p>

                <p className="location">
                  📍 {f.location_lat}, {f.location_lng}
                </p>

                <button
                  className="remove-btn"
                  onClick={() => removeFavorite(f.id)}
                >
                  Ukloni iz omiljenih
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
