import { useEffect, useRef, useState } from "react";
import "../styles/MapPage.css";

export default function MapPage() {
  const mapRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [userFavorites, setUserFavorites] = useState([]);

  // ===== FETCH FAVORITES (FROM DB) =====
  const fetchFavorites = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/favorites", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUserFavorites(data.map(f => f.id));
      }
    } catch (err) {
      console.error("Fetch favorites error:", err);
    }
  };

  // ===== TOGGLE FAVORITE =====
  const toggleFavorite = async (id) => {
    const isFav = userFavorites.includes(id);

    await fetch(
      `http://localhost:4000/api/favorites${isFav ? "/" + id : ""}`,
      {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: isFav ? null : JSON.stringify({ attractionId: id }),
      }
    );

    // update state
    setUserFavorites(prev =>
      isFav ? prev.filter(f => f !== id) : [...prev, id]
    );

    // update UI in InfoWindow
    const btn = document.getElementById(`fav-btn-${id}`);
    if (btn) btn.textContent = isFav ? "🤍" : "❤️";
  };

  // expose function for InfoWindow HTML
  useEffect(() => {
    window.toggleFavoriteMap = toggleFavorite;
  }, [userFavorites]);

  useEffect(() => {
    fetchFavorites();

    const loadMaps = () =>
      new Promise(resolve => {
        if (window.google?.maps) return resolve();
        const s = document.createElement("script");
        s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`;
        s.onload = resolve;
        document.head.appendChild(s);
      });

    const initMap = async (pos) => {
      await loadMaps();

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: pos,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const res = await fetch("http://localhost:4000/api/attractions");
      const attractions = await res.json();

      attractions.forEach(a => {
        const marker = new window.google.maps.Marker({
          position: { lat: a.location_lat, lng: a.location_lng },
          map,
        });

        const heart = userFavorites.includes(a.id) ? "❤️" : "🤍";

        const info = new window.google.maps.InfoWindow({
          content: `
            <div style="padding:10px">
              <h3>${a.name}</h3>
              <p>${a.description}</p>
              <button
                id="fav-btn-${a.id}"
                onclick="window.toggleFavoriteMap(${a.id})"
                style="font-size:26px;background:none;border:none;cursor:pointer"
              >${heart}</button>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindowRef.current?.close();
          infoWindowRef.current = info;
          info.open(map, marker);
        });
      });
    };

    navigator.geolocation.getCurrentPosition(
      pos => initMap({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => initMap({ lat: 45.1, lng: 15.2 })
    );
  }, []);

  return (
    <div className="map-page-container">
      <div className="map-page-header">
        <a className="back-home-button" href="/user">
          POVRATAK NA POČETNU
        </a>

        <div style={{ marginRight: "30px", fontWeight: "600" }}>
          ❤️ Favoriti ({userFavorites.length})
        </div>
      </div>

      <div id="map" ref={mapRef}></div>
    </div>
  );
}
