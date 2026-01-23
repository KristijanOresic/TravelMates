import React, { useState, useEffect } from "react";
import "../styles/UserPage.css";

export default function UserPage() {
  const [userData, setUserData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/me`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        } else {
          console.error("Neuspješno dohvaćanje korisničkih podataka!");
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju korisničkih podataka:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/attractions/favorites/list`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          // Osiguraj da je data niz
          setFavorites(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju favorita:", err);
        setFavorites([]);
      }
    };

    if (userData) {
      fetchFavorites();
    }
  }, [userData]);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/logout`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        alert("Odjava nije uspjela");
      }
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške prilikom odjave!");
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/attractions/favorites/${favoriteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setFavorites(favorites.filter(fav => fav.idAttraction !== favoriteId));
      } else {
        alert("Greška pri uklanjanju iz favorita!");
      }
    } catch (err) {
      console.error("Greška pri uklanjanju favorita:", err);
    }
  };

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  if (!userData) {
    return (
      <div className="not-logged-in-container">
        <div className="not-logged-in-card">
          <h1>Niste prijavljeni!</h1>
          <p>
            Molimo prijavite se kako biste pristupili ovoj stranici.
          </p>
          <a href="/" className="not-logged-in-link">
            Prijava
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="user-page-header">
        <h2>Moj profil</h2>
      </div>
      <div className="user-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1>{userData?.firstName} {userData?.lastName}</h1>
            <p className="role-badge">{userData?.role}</p>
          </div>

          <div className="profile-info">
            <div className="info-item">
              <label>Email:</label>
              <p>{userData?.email}</p>
            </div>

            <div className="info-item">
              <label>Uloga:</label>
              <p>{userData?.role}</p>
            </div>
          </div>

          <a href="/map" className="map-link">Otvori kartu</a>
        
        <button onClick={handleLogout} className="logout-btn">
          Odjava
        </button>
      </div>

      <div className="favorites-container">
        <h2>Moji omiljeni lokaliteti</h2>
        {favorites && favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map((fav) => (
              <div key={fav.idAttraction} className="favorite-card">
                {(() => {
                  const imgSrc = fav.imageUrl || fav.image_url || fav.photo;
                  return imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={fav.nameAttraction}
                      className="favorite-image"
                    />
                  ) : null;
                })()}
                <h3>{fav.nameAttraction}</h3>
                <p>{fav.descriptionAttraction}</p>
                <button 
                  onClick={() => handleRemoveFavorite(fav.idAttraction)}
                  className="remove-btn"
                >
                  Ukloni iz omiljenih
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-favorites">Nemate omiljenih lokaliteta. Dodajte neke na mapi!</p>
        )}
      </div>
    </div>
    </>
  );
}