import React, { useEffect, useState } from "react";
import "../styles/FavoritesPage.css";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/attractions/favorites/list", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setFavorites(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const removeFavorite = async (id) => {
    await fetch(`http://localhost:4000/api/attractions/favorites/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setFavorites(favorites.filter(f => f.id !== id));
  };

  if (loading) return <h2 className="loading">Loading...</h2>;

  return (
    <div className="favorites-container2">
      <h1>❤️ Moji Favoriti</h1>
      
      {favorites.length === 0 ? (
        <p className="no-favorites">Nemate još favorita!</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map(fav => (
            <div key={fav.id} className="favorite-card">
              {fav.image && (
                <img 
                  src={fav.image} 
                  alt={fav.name} 
                  className="favorite-image"
                />
              )}
              <h3>{fav.name}</h3>
              <p className="favorite-description">{fav.description}</p>
              <p className="favorite-hours">
                <strong>Radno vrijeme:</strong> {fav.opening_hours || "Nije dostupno"}
              </p>
              <button 
                onClick={() => removeFavorite(fav.id)}
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
  );
}