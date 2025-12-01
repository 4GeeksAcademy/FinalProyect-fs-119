import React, { useEffect, useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const backdropStyleRest = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(15,23,42,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1500,
};

const modalStyleRest = {
  background: "#ffffff",
  padding: 24,
  borderRadius: 16,
  width: 520,
  maxWidth: "95%",
  maxHeight: "90%",
  boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
  overflow: "hidden",
};

export default function CreateRestaurantModal({ show, onClose, onSave }) {
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  useEffect(() => {
    if (!show) {
      setName("");
      setTelefono("");
      setDireccion("");
      setLat(null);
      setLng(null);
      setLoading(false);
    }
  }, [show]);

  if (!show) return null;

  const handleSave = async () => {
    if (!name.trim()) return alert("Nombre obligatorio");
    const payload = {
      name: name.trim(),
      telefono,
      direccion,
      lat,
      lng,
    };

    if (!onSave) return;

    try {
      setLoading(true);
      const res = await onSave(payload);
      if (res && res.ok) {
        setName("");
        setTelefono("");
        setDireccion("");
        setLat(null);
        setLng(null);
        onClose && onClose();
      } else {
        alert(
          res?.msg || res?.message || "No se pudo crear el restaurante"
        );
      }
    } catch {
      alert("Error creando restaurante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={backdropStyleRest}>
      <div style={modalStyleRest}>
        <div style={{ fontSize: 13, textTransform: "uppercase", color: "#6b7280", marginBottom: 4 }}>
          Crear restaurante
        </div>
        <h3 style={{ marginTop: 0, marginBottom: 16, fontWeight: 700 }}>
          Nuevo restaurante
        </h3>

        <input
          className="form-control my-2"
          placeholder="Nombre del restaurante"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="form-control my-2"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <input
          className="form-control my-2"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />

        <div className="mt-3">
          <label className="form-label" style={{ fontWeight: 600 }}>
            Ubicación
          </label>
          <div style={{ height: 250, borderRadius: 12, overflow: "hidden" }}>
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <Map
                defaultCenter={{ lat: 40.4168, lng: -3.7038 }}
                defaultZoom={13}
                disableDefaultUI={true}
                gestureHandling="greedy"
                onClick={(e) => {
                  const pos = e.detail.latLng;
                  if (!pos) return;
                  setLat(pos.lat);
                  setLng(pos.lng);
                }}
              >
                {lat !== null && lng !== null && (
                  <Marker
                    position={{ lat, lng }}
                    draggable={true}
                    onDragEnd={(e) => {
                      const pos = e.latLng;
                      if (!pos) return;
                      const newLat =
                        typeof pos.lat === "function" ? pos.lat() : pos.lat;
                      const newLng =
                        typeof pos.lng === "function" ? pos.lng() : pos.lng;
                      setLat(newLat);
                      setLng(newLng);
                    }}
                  />
                )}
              </Map>
            </APIProvider>
          </div>
          <small className="text-muted">
            Haz clic en el mapa o arrastra el pin para ajustar la ubicación.
          </small>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => onClose && onClose()}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}