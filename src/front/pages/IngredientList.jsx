import React from "react";

export default function IngredientList({ ingredients = [], onSelectIngredient, onDelete }) {
  if (!ingredients || ingredients.length === 0) {
    return <div className="text-muted">No hay ingredientes.</div>;
  }

  return (
    <div className="d-flex flex-column gap-2">
      {ingredients.map((ing) => (
        <div
          key={ing.id || ing._id}
          className="d-flex justify-content-between align-items-center p-2"
          style={{ background: "#fff", borderRadius: 8 }}
        >
          <div
            style={{ cursor: onSelectIngredient ? "pointer" : "default" }}
            onClick={() => onSelectIngredient && onSelectIngredient(ing)}
          >
            <div style={{ fontWeight: 600 }}>{ing.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Precio {ing.price_per_unit} / {ing.unit}
            </div>
          </div>
          {onDelete && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onDelete(ing.id)}
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
