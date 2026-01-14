import { useEffect, useRef, useState } from "react";
import "../styles/MapPage.css";

export default function App() {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const circleRef = useRef(null);
  const [favorites, setFavorites] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef(null);

  // TTS funkcija koristeći Web Speech API
  const speakText = (text, attractionId) => {
    // Provjeri da li browser podržava Web Speech API
    if (!('speechSynthesis' in window)) {
      alert('Vaš preglednik ne podržava text-to-speech funkcionalnost');
      return;
    }

    const speakerBtn = document.getElementById(`speaker-btn-${attractionId}`);

    // Ako se već nešto čita, zaustavi
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (speakerBtn) {
        speakerBtn.textContent = "🔊";
      }
      setIsSpeaking(false);
      return;
    }

    // Kreiraj novi SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef.current = utterance;

    // Postavi hrvatski jezik
    utterance.lang = 'hr-HR';
    utterance.rate = 1.0; // Brzina govora (0.1 - 10)
    utterance.pitch = 1.0; // Ton glasa (0 - 2)
    utterance.volume = 1.0; // Glasnoća (0 - 1)

    // Event listeneri
    utterance.onstart = () => {
      if (speakerBtn) {
        speakerBtn.textContent = "⏸️";
      }
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      if (speakerBtn) {
        speakerBtn.textContent = "🔊";
      }
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('TTS greška:', event);
      if (speakerBtn) {
        speakerBtn.textContent = "🔊";
      }
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    // Pokreni TTS
    window.speechSynthesis.speak(utterance);
  };

  // Haversine formula – izračun udaljenosti u km
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Učitaj favoruite korisnika
  const fetchUserFavorites = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/attractions/favorites/list", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUserFavorites(data.map(fav => fav.id || fav.idAttraction));
      }
    } catch (err) {
      console.error("Greška pri učitavanju favorita:", err);
    }
  };

  // Dodaj u favorite
  const addFavorite = async (attractionId) => {
    try {
      const res = await fetch("http://localhost:4000/api/attractions/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ attraction_id: attractionId }),
      });
      if (res.ok) {
        setUserFavorites([...userFavorites, attractionId]);
        // Ažuriraj srce na mapi
        const favBtn = document.getElementById(`fav-btn-${attractionId}`);
        if (favBtn) {
          favBtn.textContent = "❤️";
        }
      } else {
        console.error("Neuspjelo dodavanje u favorite:", res.statusText);
      }
    } catch (err) {
      console.error("Greška pri dodavanju u favorite:", err);
    }
  };

  // Ukloni iz favorita
  const removeFavorite = async (attractionId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/attractions/favorites/${attractionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setUserFavorites(userFavorites.filter(id => id !== attractionId));
        // Ažuriraj srce na mapi
        const favBtn = document.getElementById(`fav-btn-${attractionId}`);
        if (favBtn) {
          favBtn.textContent = "🤍";
        }
      } else {
        console.error("Neuspjelo uklanjanje iz favorita:", res.statusText);
      }
    } catch (err) {
      console.error("Greška pri uklanjanju iz favorita:", err);
    }
  };

  const toggleFavorite = (attractionId) => {
    if (userFavorites.includes(attractionId)) {
      removeFavorite(attractionId);
    } else {
      addFavorite(attractionId);
    }
  };

  // Globalne funkcije za HTML onclick
  useEffect(() => {
    window.toggleFavoriteMap = toggleFavorite;
    window.speakDescriptionMap = speakText;
  }, [userFavorites]);

  useEffect(() => {
    // Učitaj favoruite na početku
    fetchUserFavorites();

    const customMapStyle = [
      {
        "featureType": "poi",
        "stylers": [{ "visibility": "off" }]
      },
      {
        "featureType": "transit",
        "stylers": [{ "visibility": "off" }]
      },
      {
        "featureType": "road",
        "stylers": [{ "visibility": "simplified" }]
      },
      {
        "featureType": "landscape",
        "stylers": [{ "visibility": "simplified" }]
      },
      {
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
      }
    ];

    const loadGoogleMaps = () => {
      return new Promise((resolve) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = async () => {
          await new Promise((r) => setTimeout(r, 300));
          resolve();
        };
        document.head.appendChild(script);
      });
    };

    const initMap = async (position, hasLocation = true) => {
      await loadGoogleMaps();

      if (!mapRef.current) {
        console.error("❌ mapRef još nije dostupan!");
        return;
      }
      if (!window.google || !window.google.maps) {
        console.error("❌ Google Maps nije dostupan!");
        return;
      }

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: hasLocation ? 10 : 7,
        center: position,
        styles: customMapStyle,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: "greedy"
      });

      const response = await fetch("http://localhost:4000/api/attractions");
      const attractions = await response.json();

      if (!hasLocation) {
        // Korisnik nije dozvolio lokaciju → prikaži SVE znamenitosti
        attractions.forEach((a) => {
          const marker = new window.google.maps.Marker({
            position: { lat: a.location_lat, lng: a.location_lng },
            map,
            title: a.name,
          });

          const isFavorite = userFavorites.includes(a.id);
          const heartIcon = isFavorite ? "❤️" : "🤍";

          const info = new window.google.maps.InfoWindow({
            content: `<div style="padding: 10px; max-width: 250px;">
              <img src="${a.image || ""}" alt="${a.name}" style="width: 100%; max-width: 250px; height: auto; border-radius: 8px; margin-bottom: 8px;"/>              <h3 style="margin: 0 0 8px 0;">${a.name}</h3>
              <p style="margin: 0 0 8px 0; font-size: 14px;">Radno vrijeme: ${a.opening_hours || "Nije dostupno"}</p>
              <p style="margin: 0 0 12px 0; font-size: 14px;">${a.description}</p>
              <div style="display: flex; gap: 10px; align-items: center;">
                <button id="speaker-btn-${a.id}" onclick="window.speakDescriptionMap('${a.description.replace(/'/g, "\\'")}', ${a.id})" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0;" title="Reproduciraj opis">
                  🔊
                </button>
                <button id="fav-btn-${a.id}" onclick="window.toggleFavoriteMap(${a.id})" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0;" title="Dodaj u favorite">
                  ${heartIcon}
                </button>
              </div>
            </div>`,
          });

          marker.addListener("click", () => {
            if (infoWindowRef.current) infoWindowRef.current.close();
            infoWindowRef.current = info;
            info.open(map, marker);
          });

          markersRef.current.push(marker);
        });

        return;
      }

      // Ako korisnik dozvoli lokaciju → prikaži njegov marker i krug
      new window.google.maps.Marker({
        position,
        map,
        title: "Tvoja lokacija",
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });

      // Krug 40km
      circleRef.current = new window.google.maps.Circle({
        center: position,
        radius: 40000,
        map,
        fillColor: "#4285F4",
        fillOpacity: 0.1,
        strokeColor: "#4285F4",
        strokeOpacity: 0.5,
        strokeWeight: 2,
      });

      // Filtriraj znamenitosti unutar 40 km
      const nearbyAttractions = attractions.filter((a) => {
        const distance = getDistance(
          position.lat,
          position.lng,
          a.location_lat,
          a.location_lng
        );
        return distance <= 40;
      });

      // Dodaj markere za te znamenitosti
      nearbyAttractions.forEach((a) => {
        const marker = new window.google.maps.Marker({
          position: { lat: a.location_lat, lng: a.location_lng },
          map,
          title: a.name,
        });

        const distance = getDistance(
          position.lat,
          position.lng,
          a.location_lat,
          a.location_lng
        );

        const isFavorite = userFavorites.includes(a.id);
        const heartIcon = isFavorite ? "❤️" : "🤍";

        const info = new window.google.maps.InfoWindow({
          content: `<div style="padding: 10px; max-width: 250px;">
            <img src="${a.image || ""}" alt="${a.name}" style="width: 100%; max-width: 250px; height: auto; border-radius: 8px; margin-bottom: 8px;"/>
            <h3 style="margin: 0 0 8px 0;">${a.name}</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px;">Radno vrijeme: ${a.opening_hours || "Nije dostupno"}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;">${a.description}</p>
            <p style="margin: 0 0 12px 0; font-weight: bold; color: #667eea;"><strong>Udaljenost: ${distance.toFixed(2)} km</strong></p>
            <div style="display: flex; gap: 10px; align-items: center;">
              <button id="speaker-btn-${a.id}" onclick="window.speakDescriptionMap('${a.description.replace(/'/g, "\\'")}', ${a.id})" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0;" title="Reproduciraj opis">
                🔊
              </button>
              <button id="fav-btn-${a.id}" onclick="window.toggleFavoriteMap(${a.id})" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0;" title="Dodaj u favorite">
                ${heartIcon}
              </button>
            </div>
          </div>`,
        });

        marker.addListener("click", () => {
          if (infoWindowRef.current) infoWindowRef.current.close();
          infoWindowRef.current = info;
          info.open(map, marker);
        });

        markersRef.current.push(marker);
      });
    };

    // Dohvati geolokaciju korisnika odmah po učitavanju
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const position = { lat: latitude, lng: longitude };
        initMap(position, true);
      },
      () => {
        // Ako korisnik odbije lokaciju → centar Hrvatske i sve znamenitosti
        const croatiaCenter = { lat: 45.1, lng: 15.2 };
        initMap(croatiaCenter, false);
      }
    );

    // Cleanup funkcija
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="map-page-container"> 
      <div className="map-page-header">
        <a className="back-home-button" href="/user">POVRATAK NA POČETNU STRANICU</a>
        <button className="favorites-button" onClick={() => alert(`Favoriti: ${userFavorites.length}`)}>
          ❤️ {userFavorites.length}
        </button>
      </div>

      <div
        id="map"
        ref={mapRef}
      ></div>
    </div>
  );
}