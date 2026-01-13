import React, { useEffect, useState } from "react";
import "../styles/MapPage.css";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("FavoritesPage loaded");

        fetch("http://localhost:4000/api/favorites", {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFavorites(data);
                } else {
                    setFavorites([]);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const removeFavorite = async id => {
        await fetch(`http://localhost:4000/api/favorites/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        setFavorites(favorites => favorites.filter(f => f.id !== id));
    };

    if (loading) {
        return <h2 style={{ textAlign: "center" }}>Loading favorites...</h2>;
    }

    return (
        <>
            {/* HEADER – ISTI KAO NA MAP PAGE, ALI CENTRIRANI GUMBI */}
            <div
                className="map-page-header"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                    paddingTop: "20px",
                }}
            >
                <a className="back-home-button" href="/user">
                    BACK HOME
                </a>

                <a className="back-home-button" href="/map">
                    MAP
                </a>
            </div>

            {/* CONTENT */}
            <div style={{ maxWidth: "800px", margin: "180px auto 50px" }}>
                <h1>My favorites</h1>

                {favorites.length === 0 && <p>No favorites yet.</p>}

                {favorites.map(a => (
                    <div
                        key={a.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            marginBottom: "10px",
                        }}
                    >
                        <h3>{a.name}</h3>
                        <p>{a.description}</p>

                        <button onClick={() => removeFavorite(a.id)}>
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </>
    );

}
