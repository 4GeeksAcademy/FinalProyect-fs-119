import React, { useState } from "react";

const API = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

export default function CreateRestaurantModal({ show, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    setLoading(true);
    try {
      const user_id = localStorage.getItem("user_id");
      const token = localStorage.getItem("token");
      if (!user_id) throw new Error("No hay user_id en localStorage");

      const res = await fetch(`${API}/api/user/${user_id}/restaurant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          telefono: telefono.trim() || null,
          direccion: direccion.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.error || "Error");

      const newRest = data.restaurante || data.restaurant || data;
      onCreated && onCreated(newRest);
      setName("");
      setTelefono("");
      setDireccion("");
      onClose && onClose();
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={backdropStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={titleStyle}>Nuevo restaurante</div>
        </div>

        <div style={bodyStyle}>
          <input
            className="form-control my-2"
            placeholder="Nombre del restaurante"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />

          <input
            className="form-control my-2"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            style={inputStyle}
          />

          <input
            className="form-control my-2"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            style={inputStyle}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button style={cancelBtnStyle} onClick={onClose} disabled={loading}>Cancelar</button>
            <button style={primaryBtnStyle} onClick={handleSave} disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "linear-gradient(180deg, rgba(44,90,160,0.45), rgba(50,95,173,0.45))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1200,
  padding: 20,
};

const cardStyle = {
  width: 420,
  maxWidth: "100%",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
  overflow: "hidden",
  background: "linear-gradient(180deg, #F7F9FB 0%, #F0E5CF 100%)",
  border: "1px solid rgba(0,0,0,0.06)",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 18px",
  background: "linear-gradient(90deg,#2c5aa0,#325fad)",
};

const titleStyle = {
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 16,
  letterSpacing: 0.3,
};

const bodyStyle = {
  padding: 18,
  background: "transparent",
};

const inputStyle = {
  borderRadius: 8,
  border: "1px solid rgba(75,101,135,0.12)",
  padding: "10px 12px",
  outline: "none",
};

const primaryBtnStyle = {
  backgroundColor: "#F9C784",
  border: "none",
  color: "#4B6587",
  padding: "8px 14px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};

const cancelBtnStyle = {
  backgroundColor: "transparent",
  border: "1px solid rgba(75,101,135,0.12)",
  color: "#21334a",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
};
