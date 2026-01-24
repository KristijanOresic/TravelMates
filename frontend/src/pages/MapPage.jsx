import { useEffect, useRef, useState, useCallback } from "react";
import "../styles/MapPage.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const customMapStyle = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", stylers: [{ visibility: "simplified" }] },
  { featureType: "landscape", stylers: [{ visibility: "simplified" }] },
  { elementType: "labels", stylers: [{ visibility: "off" }] }
];

export default function App() {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const circleRef = useRef(null);

  const [attractions, setAttractions] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [userPos, setUserPos] = useState({ lat: 45.1, lng: 15.2 });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const isSpeakingRef = useRef(false);
  const currentUtteranceRef = useRef(null);

  const getDistance = useCallback((lat1, lng1, lat2, lng2) => {
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
  }, []);

  const speakText = useCallback((text, attractionId) => {
    if (!('speechSynthesis' in window)) {
      alert('Vaš preglednik ne podržava text-to-speech');
      return;
    }

    const speakerBtn = document.getElementById(`speaker-btn-${attractionId}`);
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (speakerBtn) speakerBtn.textContent = "🔊";
      isSpeakingRef.current = false;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef.current = utterance;
    utterance.lang = 'hr-HR';

    utterance.onstart = () => {
      if (speakerBtn) speakerBtn.textContent = "⏸️";
      isSpeakingRef.current = true;
    };

    utterance.onend = () => {
      if (speakerBtn) speakerBtn.textContent = "🔊";
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const loadGoogleMaps = useCallback(() => {
    return new Promise((resolve) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }, []);

  // --- API POZIVI ---
  const toggleFavorite = useCallback(async (attractionId) => {
    const isFav = userFavorites.includes(attractionId);
    const url = `${BACKEND_URL}/api/attractions/favorites${isFav ? `/${attractionId}` : ""}`;
    const method = isFav ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: isFav ? null : JSON.stringify({ attraction_id: attractionId }),
      });

      if (res.ok) {
        setUserFavorites(prev =>
          isFav ? prev.filter(id => id !== attractionId) : [...prev, attractionId]
        );
        const favBtn = document.getElementById(`fav-btn-${attractionId}`);
        if (favBtn) favBtn.textContent = isFav ? "🤍" : "❤️";
      }
    } catch (err) {
      console.error("Greška kod favorita:", err);
    }
  }, [userFavorites]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [favRes, attRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/attractions/favorites/list`, { credentials: "include" }),
          fetch(`${BACKEND_URL}/api/attractions`, { credentials: "include" })
        ]);

        if (favRes.ok) {
          const favs = await favRes.json();
          setUserFavorites(favs.map(f => f.idAttraction));
        }

        if (attRes.ok) {
          const atts = await attRes.json();
          setAttractions(atts);
        }

        setDataReady(true);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setHasLocationPermission(true);
          },
          () => {}
        );

      } catch (err) {
        console.error("Greška pri učitavanju:", err);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    window.toggleFavoriteMap = toggleFavorite;
    window.speakDescriptionMap = speakText;
  }, [toggleFavorite, speakText]);

  useEffect(() => {
    if (dataReady) {
      const timer = setTimeout(() => {
        setShowMap(true);
      }, 3500); 

      return () => clearTimeout(timer);
    }
  }, [dataReady]);

  useEffect(() => {
    if (!dataReady || !showMap) return;

    const initMap = async () => {
      await loadGoogleMaps();
      if (!mapRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: hasLocationPermission ? 10 : 7,
        center: userPos,
        styles: customMapStyle,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: "greedy"
      });

      if (hasLocationPermission && userPos.lat && userPos.lng) {
        new window.google.maps.Marker({
          position: userPos,
          map,
          title: "Tvoja lokacija",
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });

        circleRef.current = new window.google.maps.Circle({
          center: userPos,
          radius: 40000,
          map,
          fillColor: "#4285F4",
          fillOpacity: 0.1,
          strokeColor: "#4285F4",
          strokeOpacity: 0.5,
          strokeWeight: 2,
        });
      }

      const filteredAttractions = hasLocationPermission
        ? attractions.filter(a => getDistance(userPos.lat, userPos.lng, a.locationLat, a.locationLng) <= 40)
        : attractions;

      filteredAttractions.forEach((a) => {
        const marker = new window.google.maps.Marker({
          position: { lat: a.locationLat, lng: a.locationLng },
          map,
          title: a.nameAttraction,
        });

        const isFavorite = userFavorites.includes(a.idAttraction);
        const heartIcon = isFavorite ? "❤️" : "🤍";
        const distance = getDistance(userPos.lat, userPos.lng, a.locationLat, a.locationLng);

        const info = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 250px;">
              <img src="${a.imageUrl || ""}" alt="${a.nameAttraction}" style="width: 100%; max-width: 250px; height: auto; border-radius: 8px; margin-bottom: 8px;"/>
              <h3 style="margin: 0 0 8px 0;">${a.nameAttraction}</h3>
              <p style="margin: 0 0 8px 0; font-size: 14px;">Radno vrijeme: ${a.workingHours || "Nije dostupno"}</p>
              <p style="margin: 0 0 12px 0; font-size: 14px;">${a.descriptionAttraction}</p>
              ${hasLocationPermission ? `<p style="margin: 0 0 12px 0; font-weight: bold; color: #667eea;"><strong>Udaljenost: ${distance.toFixed(2)} km</strong></p>` : ""}
              <div style="display: flex; gap: 10px; align-items: center;">
                <button id="speaker-btn-${a.idAttraction}" onclick="window.speakDescriptionMap('${a.descriptionAttraction.replace(/'/g, "\\'")}', ${a.idAttraction})" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0;" title="Reproduciraj opis">🔊</button>
                <button id="fav-btn-${a.idAttraction}" onclick="window.toggleFavoriteMap(${a.idAttraction})" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0;" title="Dodaj u favorite">${heartIcon}</button>
              </div>
            </div>`
        });

        marker.addListener("click", () => {
          if (infoWindowRef.current) infoWindowRef.current.close();
          infoWindowRef.current = info;
          info.open(map, marker);
        });

        markersRef.current.push(marker);
      });
    };

    initMap();

    return () => {
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    };
  }, [dataReady, showMap, hasLocationPermission, userPos]);

  return (
    <div className="map-page-container">
      <div className="map-page-header">
        <a className="back-home-button" href="/user">POVRATAK NA POČETNU STRANICU</a>
        <button className="favorites-button" onClick={() => window.location.href = '/favorites'}>
          ❤️ {userFavorites.length}
        </button>
      </div>

      {showMap
        ? <div id="map" ref={mapRef}></div>
        : <div style={{ width: "100%", height: "100%", backgroundColor: "#fbf2e6" }}></div>
      }
    </div>
  );
}
