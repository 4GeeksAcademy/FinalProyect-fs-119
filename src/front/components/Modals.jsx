import React, { useState } from "react";


export const CreateCategoryModal = ({ show, onClose, onSave }) => {
  const [name, setName] = useState("");

  if (!show) return null;

  const handleSave = () => {
    onSave(name);
    setName("");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "400px",
          maxWidth: "90%",
        }}
      >
        <h3>Crear Categoría</h3>

        <input
          className="form-control my-2"
          placeholder="Nombre de categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={onClose}>
            Cancelar
          </button>

          <button className="btn btn-primary" onClick={handleSave}>
            Crear
          </button>
        </div>
      </div>
    </div>
  );
};

export const CreateRestaurantModal = ({ show, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  if (!show) return null;

  const handleSave = () => {
    onSave({ name, telefono, direccion });
    setName("");
    setTelefono("");
    setDireccion("");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "400px",
          maxWidth: "90%",
        }}
      >
        <h3>Crear Restaurante</h3>

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

        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={onClose}>
            Cancelar
          </button>

          <button className="btn btn-primary" onClick={handleSave}>
            Crear
          </button>
        </div>
      </div>
    </div>
  );
};