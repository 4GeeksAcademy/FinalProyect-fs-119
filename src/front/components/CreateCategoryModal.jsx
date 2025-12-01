import React, { useState } from "react";

const backdropStyleCat = {
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

const modalStyleCat = {
  background: "#ffffff",
  padding: 24,
  borderRadius: 16,
  width: 420,
  maxWidth: "95%",
  maxHeight: "90%",
  boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
  overflow: "hidden",
};

export default function CreateCategoryModal({ show, onClose, onSave }) {
  const [name, setName] = useState("");
  if (!show) return null;

  const handleSave = () => {
    if (!name.trim()) return alert("Nombre obligatorio");
    onSave && onSave(name.trim());
    setName("");
  };

  return (
    <div style={backdropStyleCat}>
      <div style={modalStyleCat}>
        <div style={{ fontSize: 13, textTransform: "uppercase", color: "#6b7280", marginBottom: 4 }}>
          Crear categoría
        </div>
        <h3 style={{ marginTop: 0, marginBottom: 16, fontWeight: 700 }}>
          Nueva categoría
        </h3>

        <input
          className="form-control my-2"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}