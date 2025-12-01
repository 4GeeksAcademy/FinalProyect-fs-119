import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

export default function CreateIngredientModal({ show, onClose, onSave }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");

  useEffect(() => {
    if (!show) {
      setName("");
      setPrice("");
      setUnit("");
    }
  }, [show]);

  if (!show) return null;

  const handleSave = () => {
    if (!name.trim()) return alert("Nombre obligatorio");
    if (!unit) return alert("Unidad obligatoria");
    if (!price || isNaN(price)) return alert("Precio inválido");

    onSave &&
      onSave({
        name: name.trim(),
        price_per_unit: Number(price),
        unit,
      });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <div>
          <div
            style={{
              fontSize: 13,
              textTransform: "uppercase",
              color: "#6b7280",
            }}
          >
            Crear ingrediente
          </div>
          <h3 style={{ margin: 0, fontWeight: 700 }}>Nuevo ingrediente</h3>
        </div>
      </Modal.Header>

      <Modal.Body>
        <input
          className="form-control my-2"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="form-control my-2"
          placeholder="Precio por unidad"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <select
          className="form-control my-2"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          <option value="">Selecciona unidad</option>
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="ml">ml</option>
          <option value="l">l</option>
          <option value="ud">ud</option>
        </select>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Crear
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
