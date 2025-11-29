import React, { useState } from "react";


export const CreateCategoryModal = ({ show, onClose, onSave }) => {
  const [name, setName] = useState("");

  if (!show) return null;

  const handleSave = () => {
    onSave(name);
    setName("");
  };

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
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
    <div style={backdropStyle}>
      <div style={modalStyle}>
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


export const CreateIngredientModal = ({ show, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");

  const UNITS = [
    { value: "g", label: "Gramos (g)" },
    { value: "kg", label: "Kilogramos (kg)" },
    { value: "ml", label: "Mililitros (ml)" },
    { value: "l", label: "Litros (l)" },
    { value: "ud", label: "Unidades (ud)" },
  ];

  if (!show) return null;

  const handleSave = () => {
    if (!name.trim()) return alert("El nombre es obligatorio");
    if (!unit) return alert("Debes seleccionar una unidad válida");
    if (!price || isNaN(price) || Number(price) < 0)
      return alert("Debes ingresar un precio válido");

    onSave({
      name: name.trim(),
      unit,
      price_per_unit: Number(price),
    });

    setName("");
    setPrice("");
    setUnit("");
  };

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <h3 className="mb-3">Crear Ingrediente</h3>

        {name && (
          <div style={previewStyle}>
            <span>{name}</span>
            <span>{price ? `${price} / ${unit}` : "-"}</span>
          </div>
        )}

        <input
          className="form-control mb-2"
          placeholder="Nombre del ingrediente"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="d-flex gap-2 mb-2">
          <input
            className="form-control"
            placeholder="Precio por unidad"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <select
            className="form-control"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="">Unidad</option>
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onClose}>
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




const previewStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 15px",
  marginBottom: "10px",
  borderRadius: "8px",
  backgroundColor: "#F0E5CF", 
  border: "1px solid #e4d5d5ff",
  fontSize: "14px",
  fontWeight: 500,
};


const backdropStyle = {
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
};

const modalStyle = {
  background: "#F0E5CF",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  maxWidth: "90%",
};
