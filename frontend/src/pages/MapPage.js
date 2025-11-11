import { useEffect, useRef } from "react";

export default function App() {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const circleRef = useRef(null);

  // Haversine formula — izračun udaljenosti u km
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

  useEffect(() => {
    // Učitaj Google Maps API
    const loadGoogleMaps = () => {
      return new Promise((resolve) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src =
          "https://maps.googleapis.com/maps/api/js?key=AIzaSyD8KE0YzHUf2UvPPRGCER0fmJS-e70jGkk";
        script.async = true;
        script.defer = true;
        script.onload = async () => {
          // kratka odgoda da se osigura inicijalizacija
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
      });

      // Dohvati znamenitosti s backend API-ja
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

          const info = new window.google.maps.InfoWindow({
            content: `<h3>${a.name}</h3><p>${a.description}</p>`,
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

        const info = new window.google.maps.InfoWindow({
          content: `<h3>${a.name}</h3><p>${a.description}</p><p><strong>Udaljenost: ${distance.toFixed(
            2
          )} km</strong></p>`,
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
  }, []);

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Znamenitosti</h2>
      <div
        id="map"
        ref={mapRef}
        style={{ height: "100vh", width: "100%" }}
      ></div>
    </div>
  );
}
