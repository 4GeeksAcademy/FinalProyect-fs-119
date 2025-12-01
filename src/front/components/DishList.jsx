import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

async function fetchJson(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { ok: res.ok, data, res };
}

export function ViewDishModal({ show, onClose, restaurantId, dishId }) {
  const [dish, setDish] = useState(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!show || !dishId) return;
    (async () => {
      const r = await fetchJson(
        `/api/restaurant/${restaurantId}/dishes/${dishId}`
      );
      const d = r.data?.dish || null;
      setDish(d);
      setLines(d?.ingredients || []);
    })();
  }, [show, dishId, restaurantId]);

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{dish ? dish.name : "Cargando plato..."}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {dish && (
          <p>
            Coste del plato: <strong>{dish.cost_price?.toFixed(2)} €</strong>
          </p>
        )}
        {lines.length === 0 && <p>No hay ingredientes.</p>}
        {lines.map((ln) => (
          <div
            key={ln.id}
            className="d-flex justify-content-between border-bottom py-1"
          >
            <span>{ln.ingredient_name}</span>
            <span>
              {ln.gross_weight} {ln.unit} · {ln.line_cost?.toFixed(2)} €
            </span>
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function DishPage({ dishes, restaurantId, onDeleteDish }) {
  const [selectedDish, setSelectedDish] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleSelectDish = (dish) => {
    setSelectedDish(dish);
    setShowViewModal(true);
  };

  if (!dishes || dishes.length === 0)
    return <div className="text-muted">No hay platos.</div>;

  return (
    <>
      <div className="d-flex flex-column gap-2">
        {dishes.map((d) => (
          <div
            key={d.id || d._id}
            className="d-flex justify-content-between align-items-center p-2"
            style={{ background: "#fff", borderRadius: 8 }}
          >
            <div
              style={{ cursor: "pointer" }}
              onClick={() => handleSelectDish(d)}
            >
              <div style={{ fontWeight: 600 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {d.description || ""}
              </div>
            </div>
            <div>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => onDeleteDish && onDeleteDish(d.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ViewDishModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        restaurantId={restaurantId}
        dishId={selectedDish?.id}
        existingIngredients={existingIngredients}
      />
    </>
  );
}
