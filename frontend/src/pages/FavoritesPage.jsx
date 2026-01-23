import React, { useEffect, useState } from "react";
import "../styles/FavoritesPage.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/attractions/favorites/list`, {
      credentials: "include",
    })
      .then(res => {
        console.log("Favorites response status:", res.status);
        if (!res.ok) {
          console.error("Favorites fetch error:", res.statusText);
        }
        return res.json();
      })
      .then(data => {
        console.log("Favorites data:", data);
        setFavorites(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Favorites fetch error:", err);
        setFavorites([]);
        setLoading(false);
      });
  }, []);

  const removeFavorite = async (id) => {
    await fetch(`${BACKEND_URL}/api/attractions/favorites/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setFavorites(favorites.filter(f => f.idAttraction !== id));
  };

  if (loading) return <h2 className="loading">Loading...</h2>;

  return (
    <>
      <div className="favorites-header"><h2>❤️ Moji Favoriti</h2></div>
      <div className="favorites-container2">
        {favorites.length === 0 ? (
          <p className="no-favorites">Nemate još favorita!</p>
        ) : (
          <div className="favorites-grid">
            {favorites.map(fav => (
              <div key={fav.idAttraction} className="favorite-card">
                {fav.imageUrl && (
                  <img 
                    src={fav.imageUrl} 
                    alt={fav.nameAttraction} 
                    className="favorite-image"
                  />
                )}
                <h3>{fav.nameAttraction}</h3>
                <p className="favorite-description">{fav.descriptionAttraction}</p>
                <p className="favorite-hours">
                  <strong>Radno vrijeme:</strong> {fav.workingHours || "Nije dostupno"}
                </p>
                <button 
                  onClick={() => removeFavorite(fav.idAttraction)}
                  className="remove-btn"
                >
                  Ukloni iz favorita
                </button>
              </div>
            ))}
          </div>
        )}
        <a href="/user" className="back-link">← Nazad</a>
      </div>
    </>
  );
}
