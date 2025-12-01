// src/front/v2/components/RestaurantMap.jsx
import React, { useEffect, useState } from "react";
import { Map, Marker, useMapsLibrary } from "@vis.gl/react-google-maps";

export default function RestaurantMap({ address, name }) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");
  const geocodingLibrary = useMapsLibrary("geocoding");

  useEffect(() => {
    setError("");
    setPosition(null);

    if (!address) return;
    if (!geocodingLibrary) return; // aún no ha cargado la librería

    let cancelled = false;

    const geocoder = new geocodingLibrary.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (cancelled) return;

      if (status === "OK" && results && results.length > 0) {
        const loc = results[0].geometry.location;
        setPosition({ lat: loc.lat(), lng: loc.lng() });
      } else {
        console.warn("Geocoding status:", status, "results:", results);
        setError("No se pudo localizar la dirección en el mapa.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [address, geocodingLibrary]);

  // Centro por defecto: Madrid (para no dejar el mapa en medio del océano)
  const center = position || { lat: 40.4168, lng: -3.7038 };

  return (
    <div className="mc-map-wrapper">
      {error && <div className="mc-error small mb-2">{error}</div>}
      <Map
        style={{
          width: "100%",
          height: "240px",
          borderRadius: 12,
          overflow: "hidden",
        }}
        zoom={position ? 16 : 5}
        center={center}
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        {position && (
          <Marker position={position} title={name || address} />
        )}
      </Map>
    </div>
  );
}
